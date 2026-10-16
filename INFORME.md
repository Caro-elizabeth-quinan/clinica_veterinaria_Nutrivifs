# Informe de migración – Clínica NutriDifs

**Asignatura:** DSY1104 – Evaluación Parcial N.° 2
**Integrantes:** Carolina Quinan · Liza Micele · Benatha Louime
**Tecnologías:** React 19 · TypeScript · Vite · Bootstrap 5 · Bootstrap Icons · React Router · LocalStorage

## 1. Punto de partida y objetivo

En la Evaluación Parcial N.° 1 construimos la tienda de la Clínica NutriDifs con
HTML, CSS y JavaScript: páginas estáticas que manipulaban el DOM directamente y
guardaban la información en LocalStorage. En esta etapa migramos el sitio
completo a React con TypeScript. Mantuvimos sus secciones y reglas de negocio,
y agregamos la administración por roles, el perfil personal y el diseño
responsivo con Bootstrap 5.

## 2. Cómo hicimos la migración

Migramos por etapas, manteniendo el sitio funcionando en cada una:

1. Base del proyecto con Vite + React + TypeScript, cabecera, pie e Inicio.
2. Páginas de contenido: Quiénes somos, Blog y sus artículos.
3. Tienda: catálogo con filtros, detalle de producto y carrito.
4. Usuarios: inicio de sesión, registro, sesión y roles.
5. Consultas, agendamiento de citas y contacto.
6. Panel de administración: productos, usuarios, órdenes y citas.
7. Ampliación: categorías, perfil personal, permisos del vendedor y Bootstrap 5.
8. Mejoras de la tienda: reseñas de productos, resúmenes de productos y
   servicios, preguntas frecuentes, horario 24/7, redes sociales, medios de pago,
   Términos y condiciones y Política de privacidad.

Mantuvimos las **mismas claves de LocalStorage** del sitio original
(`carrito`, `clinica-nutridifs-profiles`, `admin-products`, etc.), así que los
datos del sitio HTML siguen sirviendo en la versión React.

Cada `document.querySelector` + `innerHTML` del sitio original pasó a ser estado
de React (`useState`) y JSX. Ninguna pantalla manipula el DOM directamente: las
interacciones cambian el estado y React vuelve a dibujar la interfaz.

## 3. Organización del proyecto

```
src/
├── tipos.ts          Interfaces y tipos compartidos
├── datos/            Datos iniciales (productos, categorías, regiones, cuentas,
│                     resúmenes, preguntas frecuentes, textos legales)
├── servicios/        Lectura y escritura en LocalStorage
├── contexto/         Estado global: SesionContexto y CarritoContexto
├── hooks/            useFormulario (formularios + validación), useSesion y useCarrito
├── componentes/      Componentes reutilizables
├── paginas/          Una página por ruta de la tienda
│   └── admin/        Páginas del panel de administración
├── utils/            Funciones puras: validaciones, formato, roles, stock
└── estilos/          CSS propio por sección, aplicado sobre Bootstrap
```

Los archivos de `componentes/` y `contexto/` exportan solo componentes; las
funciones y hooks compartidos (`claseCampo`, `tieneComunas`, `useSesion`,
`useCarrito`) viven en `utils/` y `hooks/`. Así funciona el Fast Refresh de
Vite y el linter queda sin avisos.

Separamos las responsabilidades en capas. Las **páginas** arman la vista. Los
**componentes** son piezas que se repiten. Los **servicios** son el único lugar
que conoce LocalStorage. Las **utilidades** son funciones puras que se pueden
probar sin interfaz. Así, cambiar la forma de guardar los datos (por ejemplo,
pasar a una API) solo afectaría a `servicios/`.

Usamos Atomic Design como guía, sin una taxonomía rígida:

- **Piezas pequeñas:** `ErrorCampo`, `BotonEliminar`, `AvatarUsuario`,
  `Estrellas`, `SelectorEstrellas`, `SubirAlInicio`.
- **Bloques compuestos:** `TarjetaProducto`, `TarjetaDestacada`,
  `TarjetaServicio`, `BannerPagina`, `SelectsRegionComuna`, `AlertaStockCritico`,
  `ResumenProducto`, `ResenasProducto`, `HorarioAtencion`,
  `PreguntasFrecuentes`, `DatosClinica` (`ListaContacto` y `MapaClinica`),
  `EncabezadoPanel`.
- **Estructuras de página:** `Encabezado`, `PiePagina`, `DocumentoLegal` y las
  plantillas `Plantilla` (tienda) y `PlantillaAdmin` (panel), que reciben las
  páginas a través de `<Outlet />` de React Router.

## 4. Reutilización, props y TypeScript

- **Componentes reutilizados:**
  - `TarjetaProducto` recibe un `producto: Producto` por props y se usa en todo
    el catálogo.
  - `BannerPagina` cambia su imagen y textos según sus props (`variante`,
    `titulo`, `texto`) y se reutiliza en Consultas, Productos, Contacto y Agendar.
  - `ErrorCampo` y `SelectsRegionComuna` se comparten entre Registro, Perfil y
    el formulario de usuarios del panel.
  - `DocumentoLegal` arma las páginas de Términos y condiciones y de Política
    de privacidad: cada una solo le entrega por props su título, sus secciones
    y el enlace al otro documento.
  - `Estrellas` muestra una puntuación (con medias estrellas) junto al título
    del producto, en el resumen de reseñas y en cada reseña.
  - `BotonEliminar` (con confirmación) se usa en productos, usuarios,
    categorías y reseñas.
  - `EncabezadoPanel` es el título común de todas las páginas del panel
    (etiqueta + título + acciones como `children`).
  - `ListaContacto` y `MapaClinica` muestran la dirección, el teléfono y el
    mapa en Contacto y Quiénes somos.
- **Datos en un solo lugar:** la constante `CLINICA` (`datos/sitio.ts`) guarda
  nombre, dirección, teléfono, correo y mapa; el pie, la agenda, las preguntas
  frecuentes y los textos legales la leen en vez de repetir los valores. Los
  roles están solo en `ROLES` (`utils/roles.ts`).
- **Sin código repetido:** revisamos el proyecto con herramientas de análisis
  (knip para código sin uso, jscpd para duplicados) y eliminamos las reglas CSS
  que se pisaban entre sí. El código duplicado restante es menor al 1 %.
- **Formularios sin duplicación:** el hook `useFormulario<T>` es genérico. Cada
  formulario le entrega sus valores iniciales y un objeto de reglas tipado
  (`Reglas<T>`). Las reglas de usuario (`crearReglasUsuario`) son las mismas
  para el registro, el perfil y el panel.
- **Un mismo formulario en tres modos:** `AdminProductoForm` y
  `AdminUsuarioForm` se usan para crear, editar y ver el detalle. La prop
  `soloLectura` y la ruta deciden el modo.
- **TypeScript:**
  - Las interfaces de `tipos.ts` describen los datos (`Producto`, `Categoria`,
    `Perfil`, `Sesion`, `Orden`, `Cita`, `Resena`). Los datos del sitio
    también están tipados (`RedSocial`, `MedioPago`, `BloqueHorario`,
    `SeccionTerminos`, `PreguntaFrecuente`, `ResumenProducto`).
  - `Rol` es una unión de literales (`"Administrador" | "Vendedor" | "Cliente"`),
    de modo que un rol mal escrito es un error de compilación.
  - Los contextos exponen interfaces (`ValorCarrito`, `ValorSesion`) y todas
    las props están tipadas.
  - No usamos `any`, y `npm run build` revisa los tipos antes de compilar.

## 5. Estado, eventos y renderizado dinámico

- **Estado local (`useState`):**
  - Los filtros de categoría y precio del catálogo.
  - La categoría que se está editando.
  - El detalle de la orden seleccionada.
  - Los mensajes de los formularios.
  - La pregunta frecuente abierta y el tema elegido.
  - El resumen desplegable de cada servicio ("Ver qué incluye").
  - Las reseñas del producto. Este estado está "levantado" a la ficha del
    producto, porque lo usan el promedio junto al título y la sección de
    reseñas, que lo actualiza al publicar o eliminar.
- **Estado global (Context API):**
  - `SesionContexto` guarda el usuario conectado.
  - `CarritoContexto` guarda los ítems, el cupón y los totales. Al agregar un
    producto desde una tarjeta, el contador de la cabecera se actualiza al
    instante.
- **Listas y filtros:**
  - El catálogo se dibuja con `filter()` y `map()` combinando categoría y rango
    de precio.
  - Las tablas del panel usan `map()` con `key` (código del producto, correo
    del usuario, número de la orden).
  - Las reseñas se filtran por número de estrellas y su promedio se calcula
    con `reduce()`. Las preguntas frecuentes se filtran por tema.
- **Renderizado condicional:**
  - Los botones y menús cambian según el rol.
  - La alerta de stock crítico aparece cuando corresponde.
  - Hay mensajes para listas vacías y para errores de validación.

## 6. Roles y reglas de negocio

| Rol | Puede |
|---|---|
| **Administrador** | CRUD de usuarios (asignando cualquier rol), productos y categorías; gestionar órdenes y citas. |
| **Vendedor** | Consultar productos y modificar solo su stock; ver órdenes; consultar usuarios y crear usuarios **solo con rol Cliente**. No administra categorías ni elimina productos. |
| **Cliente** | Usar la tienda: comprar, agendar, contactar. |

Los tres roles pueden navegar, comprar y editar su perfil. El registro público
crea únicamente clientes.

Las restricciones se aplican en tres niveles:

1. **Rutas:** `PlantillaAdmin` redirige si el rol no tiene permiso para la URL,
   aunque se escriba a mano.
2. **Interfaz:** cada rol solo ve los botones y opciones que puede usar.
3. **Guardado:** la función `rolesAsignables()` vuelve a comprobar el rol antes
   de crear un usuario, y el formulario del vendedor guarda únicamente el stock.

Reglas de negocio conservadas de la primera evaluación:

- No se puede comprar más unidades que el stock disponible.
- Al pagar se descuenta el stock y se registra una orden.
- El cupón `NUTRI10` aplica un 10% de descuento.
- Se avisa cuando un producto llega a su stock crítico.
- La cuenta se bloquea tras 3 intentos fallidos de inicio de sesión.
- Solo se aceptan correos `@duoc.cl`, `@profesor.duoc.cl` o `@gmail.com`.
- La contraseña debe tener entre 4 y 10 caracteres.
- Validación de RUN y teléfono, con región y comuna dependientes.

Al renombrar una categoría, sus productos se actualizan. Una categoría con
productos asociados no se puede eliminar.

El **perfil personal** muestra:

- Nombre completo y avatar genérico con las iniciales.
- Fecha de nacimiento y la edad calculada a partir de ella.
- Correo, dirección y región.
- El rol, como campo bloqueado: no se puede cambiar. En el panel, nadie puede
  cambiar el rol de su propia cuenta.

Funcionalidades agregadas sobre la tienda original:

- **Reseñas de productos:** solo con sesión iniciada, de 1 a 5 estrellas y un
  comentario de 10 a 300 caracteres. Hay una reseña por usuario y producto (al
  volver se edita), el autor puede borrar la suya y el Administrador modera
  todas.
- **Resumen de productos y servicios:** cada producto muestra para qué sirve,
  sus indicaciones y recomendaciones según su categoría. Cada servicio tiene un
  resumen desplegable con lo que incluye.
- **Códigos automáticos:** al crear un producto o una categoría, el código
  siguiente (`ME023`, `CAT10`…) se asigna solo y no se puede repetir.
- **Horario 24/7 y urgencias**, **preguntas frecuentes** en el Inicio,
  **redes sociales** y **medios de pago** en el pie de página.
- **Términos y condiciones y Política de privacidad**, enlazados desde el pie,
  el registro y Quiénes somos.

## 7. Bootstrap 5 y diseño responsivo

- Bootstrap se importa en `main.tsx` antes de nuestros estilos, para que el CSS
  propio ajuste la identidad visual de la clínica sin perder las utilidades de
  Bootstrap.
- **Navegación:** la cabecera usa `navbar navbar-expand-xl`. En pantallas
  pequeñas el menú se pliega, y lo abre y cierra un estado de React, sin el
  JavaScript de Bootstrap.
- **Panel:** usa la grilla `container-fluid` / `row`.
  - En móvil, el menú lateral ocupa todo el ancho arriba (`col-12`).
  - Desde tablet pasa a una columna lateral (`col-md-3`, `col-xl-2`).
- **Perfil y formularios:** usan `row g-3`, `col-md-6` y las clases
  `form-control` y `form-select`.
- **Tablas:** van dentro de `table-responsive` para no desbordar en celulares.
- **Mensajes:** se muestran con `alert` y `badge`.
- **Íconos:** usamos Bootstrap Icons (`bi bi-…`) para las redes sociales, los
  medios de pago, el horario, las reseñas y las secciones de formularios.
- **Verificación:** revisamos las 24 rutas del sitio en anchos de celular
  (390 px), tablet (768 px) y computador (1366 px) sin desbordes horizontales.

## 8. Alcance y limitaciones

Es una simulación académica exclusivamente frontend. Las credenciales y el
control de roles viven en LocalStorage del navegador, así que no constituyen un
sistema de seguridad real. En un sistema productivo, la autenticación y la
validación de permisos deberían hacerse en un backend (por ejemplo, un
microservicio con Spring Boot y JWT). Nuestra separación por capas en
`servicios/` facilita ese cambio.
