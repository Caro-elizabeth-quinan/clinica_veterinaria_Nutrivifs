# Informe del proyecto – Clínica NutriDifs

**Asignatura:** DSY1104 – Evaluación Parcial N.° 3
**Integrantes:** Carolina Quinan · Liza Micele · Benatha Louime
**Tecnologías:**
- **Frontend:** React 19 · TypeScript · Vite · Bootstrap 5 · Bootstrap Icons · React Router · Axios
- **Backend:** Java 21 · Spring Boot · Spring Security · JWT · Swagger (OpenAPI)
- **Base de datos:** MySQL

## 1. Punto de partida y objetivo

En la Evaluación Parcial N.° 1 construimos la tienda de la Clínica NutriDifs con
HTML, CSS y JavaScript, y en la N.° 2 la migramos a React con TypeScript. En
ambas etapas la información se guardaba en LocalStorage, por lo que las
credenciales y los roles no constituían un sistema de seguridad real.

En esta tercera etapa reemplazamos ese almacenamiento por un **backend en
Spring Boot con base de datos MySQL**, y conectamos el frontend mediante una
**API REST** protegida con **JWT**. Mantuvimos la identidad visual, las
secciones y las reglas de negocio de las etapas anteriores, y agregamos
autenticación, permisos por rol validados en el servidor, historial por
usuario y reportes administrativos con datos reales.

## 2. Arquitectura general

```
Navegador (React, :5173)  ──HTTP/JSON + JWT──▶  API REST (Spring Boot, :8080)  ──JPA──▶  MySQL
```

- El **frontend** nunca guarda usuarios, productos ni transacciones: los pide y
  los envía a la API con Axios.
- El **backend** valida los datos, aplica las reglas de negocio y los permisos
  por rol, y es el único que accede a la base de datos.
- La **base de datos** conserva la información al reiniciar la aplicación.

## 3. Backend (Spring Boot)

### 3.1 Organización

Cada módulo sigue el esquema **model → repository → service → controller**, con
DTOs para la entrada y la salida de datos:

```
cl.duoc.nutrivifs/
├── auth/        Inicio de sesión, registro, renovación de token y /auth/me
├── usuario/     Usuarios y roles (CRUD, perfil propio, desbloqueo de cuentas)
├── producto/    Productos y sus categorías
├── servicio/    Servicios veterinarios y sus categorías
├── boleta/      Compras (boleta y detalle), stock, cupón y estados
├── cita/        Solicitudes de hora veterinaria
├── mensaje/     Mensajes del formulario de contacto
├── resena/      Opiniones de productos
├── reporte/     Indicadores del dashboard administrativo
├── archivo/     Subida de imágenes de productos
├── security/    JWT, filtro de autenticación, permisos por rol y CORS
├── exception/   Manejo central de errores
└── config/      Datos iniciales, Swagger y publicación de /uploads
```

### 3.2 Base de datos

Usamos MySQL con JPA/Hibernate (`ddl-auto=update`): las tablas se crean a partir
de las entidades. Al iniciar, `DatosIniciales` carga roles, usuarios,
categorías, productos y servicios de demostración **solo si las tablas están
vacías**, de modo que los datos se conservan al reiniciar el backend.

| Tabla | Contenido | Relaciones |
|---|---|---|
| `roles` | Administrador, Vendedor, Cliente | — |
| `usuarios` | Datos personales, contraseña cifrada, intentos fallidos y bloqueo | muchos a uno con `roles` |
| `categorias_productos` | Categorías de productos (nombre único) | — |
| `productos` | Precio, stock, stock crítico, imagen | muchos a uno con `categorias_productos` |
| `categorias_servicios` | Categorías de servicios | — |
| `servicios` | Duración, precio, descripción | muchos a uno con `categorias_servicios` |
| `boletas` | Fecha, subtotal, descuento, total y estado | muchos a uno con `usuarios` |
| `detalles_boleta` | Cantidad, precio unitario al momento de la compra, subtotal | muchos a uno con `boletas` y con `productos` |
| `citas` | Solicitudes de hora veterinaria y su estado | — |
| `mensajes` | Mensajes del formulario de contacto | — |
| `resenas` | Puntuación y comentario; una por usuario y producto | restricción única (producto, correo) |

### 3.3 API REST y Swagger

La API expone endpoints GET, POST, PUT, PATCH y DELETE bajo `/api/v1`, con
respuestas en JSON y códigos HTTP apropiados. Está documentada con Swagger:
`http://localhost:8080/swagger-ui.html`. Para probar los endpoints protegidos,
se hace `POST /api/v1/auth/login`, se copia el `token` y se pega en el botón
**Authorize**.

| Módulo | Operaciones principales |
|---|---|
| Autenticación | `POST /auth/login`, `POST /auth/registro`, `POST /auth/refresh`, `GET /auth/me` |
| Usuarios | CRUD, `PUT /usuarios/me` (perfil propio), `PATCH /usuarios/{id}/desbloquear` |
| Productos y servicios | Lectura pública; crear, editar y eliminar solo Administrador; categorías incluidas |
| Boletas | `POST /boletas` (comprar), `GET /boletas/mias`, `GET /boletas`, `PATCH /boletas/{id}/estado` |
| Citas | `POST /citas` (público), `GET /citas/mias`, `GET /citas`, `PATCH /citas/{id}/estado` |
| Mensajes y reseñas | `POST /mensajes`, `GET /mensajes`; reseñas por producto |
| Reportes | `GET /reportes/resumen?periodo=semana\|mes\|anio` |
| Archivos | `POST /archivos/imagen` (solo Administrador, máximo 5 MB) |

### 3.4 Validación y manejo de errores

Los datos que llegan desde el frontend se validan con anotaciones de Bean
Validation (`@Valid`). Un manejador central (`ManejadorErrores`) convierte las
excepciones en respuestas JSON con código, mensaje y fecha:

| Código | Situación |
|---|---|
| 400 | Datos inválidos, JSON mal formado o regla de negocio incumplida |
| 401 | Sin sesión o credenciales incorrectas |
| 403 | Sin permiso para el rol del usuario |
| 404 | Recurso no encontrado |
| 409 | Registros relacionados o duplicados |

## 4. Autenticación y seguridad

- **Inicio de sesión:** `POST /auth/login` valida el correo y la contraseña
  contra los usuarios de la base de datos y entrega un token JWT.
- **Contraseñas:** se almacenan con **BCrypt**; nunca en texto plano ni en las
  respuestas de la API.
- **Token JWT:** se firma con una clave secreta y dura **1 hora**. Un filtro
  (`FiltroJwt`) valida la firma y la vigencia en cada solicitud.
- **Renovación:** `POST /auth/refresh` entrega un token nuevo mientras el actual
  siga vigente.
- **Bloqueo de cuenta:** tras 3 intentos fallidos la cuenta se bloquea; el
  Administrador la desbloquea desde el panel.
- **Roles y permisos:** `SecurityConfig` restringe cada endpoint por rol.

| Rol | Permisos en la API |
|---|---|
| **Público** | Ver productos, servicios y reseñas; registrarse; iniciar sesión; enviar citas y mensajes |
| **Cliente** | Lo anterior, más: comprar, ver sus compras y citas, editar su perfil, reseñar productos |
| **Vendedor** | Lo del Cliente, más: ver todas las órdenes, citas y mensajes |
| **Administrador** | Acceso total: usuarios y roles, productos, servicios y categorías, estados de órdenes y citas, imágenes y reportes |

- **Privacidad entre usuarios:** el backend identifica al cliente por el correo
  contenido en el token, no por un identificador enviado desde el navegador. Un
  usuario solo puede consultar sus propias compras y citas.
- **Secretos:** la conexión a la base de datos y la clave JWT se pueden definir
  con variables de entorno (`DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`).
  Los valores por defecto del repositorio son solo para desarrollo local.
- **CORS:** el backend solo acepta solicitudes del origen del frontend
  (`http://localhost:5173`).

## 5. Reglas de negocio

- **Compra:** el backend valida el stock, lo descuenta y recalcula los precios
  desde la base de datos. Todo ocurre en una transacción: si algo falla, no se
  guarda nada.
- El cupón `NUTRI10` aplica un 10 % de descuento.
- Estados de una orden: Entrega pendiente, Listo y Enviado.
- Estados de una cita: Pendiente, Confirmada y Rechazada; la fecha no puede estar
  en el pasado.
- No se elimina un usuario con compras ni se puede eliminar o cambiar el rol de
  la propia cuenta.
- Una categoría con productos asociados no se puede eliminar.
- Solo se aceptan correos `@duoc.cl`, `@profesor.duoc.cl` o `@gmail.com`.
- La contraseña tiene entre 4 y 10 caracteres y al menos una mayúscula.
- Reseñas: solo con sesión iniciada, de 1 a 5 estrellas y un comentario de 10 a
  300 caracteres; una por usuario y producto. El autor puede borrar la suya y el
  Administrador puede moderar todas.

## 6. Frontend (React)

### 6.1 Organización del proyecto

```
src/
├── api/              Configuración de Axios (URL base, token e interceptores)
├── tipos.ts          Interfaces y tipos compartidos
├── datos/            Textos y datos estáticos del sitio (resúmenes, preguntas
│                     frecuentes, regiones, textos legales)
├── servicios/        Llamadas a la API REST, una por módulo
├── contexto/         Estado global: SesionContexto y CarritoContexto
├── hooks/            useFormulario, useSesion, useCarrito, useCategoriasServicio
├── componentes/      Componentes reutilizables
├── paginas/          Una página por ruta de la tienda
│   └── admin/        Páginas del panel de administración
├── utils/            Funciones puras: validaciones, formato, roles, stock
└── estilos/          CSS propio por sección, aplicado sobre Bootstrap
```

Separamos las responsabilidades en capas. Las **páginas** arman la vista. Los
**componentes** son piezas que se repiten. Los **servicios** son el único lugar
que conoce la API. Las **utilidades** son funciones puras que se pueden probar
sin interfaz. Gracias a esta separación, pasar de LocalStorage a la API solo
exigió cambiar la carpeta `servicios/`, tal como lo habíamos previsto en la
etapa anterior.

Usamos Atomic Design como guía, sin una taxonomía rígida:

- **Piezas pequeñas:** `ErrorCampo`, `BotonEliminar`, `AvatarUsuario`,
  `Estrellas`, `SelectorEstrellas`, `SubirAlInicio`.
- **Bloques compuestos:** `TarjetaProducto`, `TarjetaDestacada`,
  `TarjetaServicio`, `BannerPagina`, `SelectsRegionComuna`, `AlertaStockCritico`,
  `ResumenProducto`, `ResenasProducto`, `HorarioAtencion`,
  `PreguntasFrecuentes`, `DatosClinica`, `EncabezadoPanel`.
- **Estructuras de página:** `Encabezado`, `PiePagina`, `DocumentoLegal` y las
  plantillas `Plantilla` (tienda) y `PlantillaAdmin` (panel), que reciben las
  páginas a través de `<Outlet />` de React Router.

### 6.2 Reutilización, props y TypeScript

- **Componentes reutilizados:**
  - `TarjetaProducto` recibe un `producto: Producto` por props y se usa en todo
    el catálogo.
  - `BannerPagina` cambia su imagen y textos según sus props y se reutiliza en
    Consultas, Productos, Contacto y Agendar.
  - `ErrorCampo` y `SelectsRegionComuna` se comparten entre Registro, Perfil y
    el formulario de usuarios del panel.
  - `DocumentoLegal` arma las páginas de Términos y condiciones y de Política
    de privacidad a partir de sus props.
  - `BotonEliminar` (con confirmación) se usa en productos, usuarios,
    categorías y reseñas.
  - `EncabezadoPanel` es el título común de todas las páginas del panel.
- **Formularios sin duplicación:** el hook `useFormulario<T>` es genérico. Cada
  formulario le entrega sus valores iniciales y un objeto de reglas tipado. Las
  reglas de usuario son las mismas para el registro, el perfil y el panel.
- **Un mismo formulario en tres modos:** `AdminProductoForm` y
  `AdminUsuarioForm` sirven para crear, editar y ver el detalle; la prop
  `soloLectura` y la ruta deciden el modo.
- **TypeScript:**
  - Las interfaces de `tipos.ts` describen los datos (`Producto`, `Categoria`,
    `Perfil`, `Sesion`, `Orden`, `Cita`, `Resena`).
  - `Rol` es una unión de literales (`"Administrador" | "Vendedor" | "Cliente"`),
    de modo que un rol mal escrito es un error de compilación.
  - Los contextos exponen interfaces y todas las props están tipadas.
  - `npm run build` revisa los tipos antes de compilar.

### 6.3 Estado, eventos y renderizado dinámico

- **Estado local (`useState`):** filtros del catálogo, mensajes de los
  formularios, la orden seleccionada, la pregunta frecuente abierta y las
  reseñas del producto (levantadas a la ficha del producto).
- **Estado global (Context API):** `SesionContexto` guarda el usuario conectado y
  `CarritoContexto` guarda los ítems, el cupón y los totales.
- **Listas y filtros:** el catálogo se dibuja con `filter()` y `map()`
  combinando categoría y rango de precio; las tablas del panel usan `map()` con
  `key`; el promedio de las reseñas se calcula con `reduce()`.
- **Renderizado condicional:** los botones y menús cambian según el rol, y hay
  mensajes de carga, de lista vacía y de error.

## 7. Integración frontend–backend

- **Axios:** `api/axiosConfig.ts` define la URL base de la API y un
  **interceptor de solicitud** que agrega el encabezado
  `Authorization: Bearer <token>` cuando hay sesión.
- **Interceptor de respuesta:** si la API responde 401 con una sesión abierta
  (token vencido o inválido), se limpia la sesión y se envía al usuario a
  `/login`. El 401 del propio login no cuenta.
- **Servicios:** cada módulo tiene su archivo en `servicios/` (`auth`, `boleta`,
  `catalogo`, `categorias`, `citas`, `resenas`, `reportes`, `servicios`,
  `usuarios`). Los componentes nunca llaman a Axios directamente.
- **Errores de comunicación:** los mensajes de error del backend (campo
  `mensaje`) se muestran al usuario; si el servidor no responde, se muestra un
  mensaje por defecto.
- **Actualización de la interfaz:** después de crear, editar o eliminar, la
  pantalla vuelve a pedir los datos a la API y se redibuja.
- **Qué queda en LocalStorage:** solo el token JWT, los datos de la sesión, y el
  carrito y el cupón en curso (todavía no son una compra). Usuarios, productos,
  categorías, servicios, compras, citas, mensajes y reseñas se guardan
  únicamente en la base de datos.

## 8. Sesión y protección de rutas

- **Sesión:** `SesionContexto` mantiene el usuario autenticado y sus permisos.
  Al recargar la página, la sesión se recupera solo si el token existe y no ha
  vencido.
- **Renovación:** el frontend renueva el token automáticamente cuando ha pasado
  el 80 % de su vigencia.
- **Cierre de sesión:** borra el token y el estado de autenticación.
- **Rutas protegidas:** `PlantillaAdmin` redirige a `/login` si no hay sesión o
  si el rol es Cliente, aunque la URL se escriba a mano. Las páginas privadas
  de la tienda (`/perfil`, `/mis-compras`) también redirigen.
- **Interfaz según el rol:** el menú y los botones muestran solo lo que el rol
  puede usar.
- **El backend valida siempre los permisos**, de modo que ocultar un botón en
  el frontend nunca es la única barrera.

## 9. Panel de administración, historial y reportes

- **Panel:** el Administrador gestiona usuarios (con cualquier rol), productos,
  categorías, órdenes y citas. Todo se guarda en la base de datos.
- **Historial del cliente:** "Mis compras" y el perfil muestran las compras y
  citas del usuario autenticado, con identificador, fecha, estado y total. Se
  consultan al backend, por lo que se conservan al cerrar sesión o cambiar de
  dispositivo.
- **Dashboard:** `/admin` muestra la cantidad de operaciones, el monto vendido,
  las unidades vendidas, las citas y los 5 productos más vendidos, con filtro
  por semana, mes o año. Los indicadores se calculan con datos reales de la
  base de datos.

## 10. Bootstrap 5 y diseño responsivo

- Bootstrap se importa en `main.tsx` antes de nuestros estilos, para que el CSS
  propio ajuste la identidad visual de la clínica sin perder las utilidades.
- **Navegación:** la cabecera usa `navbar navbar-expand-xl`; en pantallas
  pequeñas el menú se pliega y lo controla un estado de React.
- **Panel:** usa la grilla `container-fluid` / `row`; en móvil el menú lateral
  ocupa todo el ancho y desde tablet pasa a una columna lateral.
- **Formularios y tablas:** `row g-3`, `col-md-6`, `form-control` y
  `form-select`; las tablas van dentro de `table-responsive`.
- **Mensajes e íconos:** `alert` y `badge` para los avisos, y Bootstrap Icons
  para redes sociales, medios de pago, horario y reseñas.
- **Verificación:** revisamos las rutas del sitio en anchos de celular
  (390 px), tablet (768 px) y computador (1366 px) sin desbordes horizontales.

## 11. Cómo ejecutar el proyecto

1. Encender MySQL y crear la base vacía:
   `CREATE DATABASE nutrivifs CHARACTER SET utf8mb4;`
2. Revisar `src/main/resources/application.properties` en el backend (usuario y
   contraseña de MySQL) y ejecutar `NutrivifsApplication` o `./mvnw spring-boot:run`.
3. En el frontend: `npm install` y `npm run dev` (`http://localhost:5173`).
4. Swagger: `http://localhost:8080/swagger-ui.html`.

Cuentas de demostración (las crea el backend al iniciar por primera vez):

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | Admin123 |
| Vendedor | vendedor@duoc.cl | Vende123 |
| Cliente | cliente@gmail.com | Cliente1 |

## 12. Pruebas de integración

Probamos la API en Swagger (CRUD, inicio de sesión, acceso con distintos roles y
sin token) y la aplicación web (persistencia de sesión, rutas protegidas,
compra e historial, privacidad entre usuarios, dashboard, expiración del token y
persistencia tras reiniciar el backend). Los casos, los resultados y las
capturas están en [docs/PRUEBAS_INTEGRACION.md](docs/PRUEBAS_INTEGRACION.md).

## 13. Alcance y limitaciones

- Es un proyecto académico: el backend corre en `localhost` y la configuración
  de CORS y de base de datos está pensada para desarrollo.
- El token JWT se guarda en `localStorage`, lo que es suficiente para esta
  evaluación; en producción convendría usar cookies `HttpOnly` y HTTPS.
- La clave JWT incluida por defecto en el repositorio es solo de desarrollo; en
  un despliegue real se define con la variable `JWT_SECRET`.
- Las imágenes subidas por el Administrador se guardan en la carpeta `uploads`
  del servidor, no en un servicio de almacenamiento externo.