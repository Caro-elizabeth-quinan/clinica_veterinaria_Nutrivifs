# Clínica NutriDifs – Frontend React

Tienda virtual y panel de administración de la Clínica NutriDifs, construidos con
**React 19 + TypeScript + Vite + Bootstrap 5 + Bootstrap Icons**. Proyecto académico
DSY1104 – Evaluación Parcial N.° 3: la aplicación consume una **API REST en Spring Boot**
con base de datos MySQL y autenticación JWT.

**Integrantes:** Carolina Quinan · Liza Micele · Benatha Louime

## Requisitos

- Node.js 20.19 o superior
- El **backend** (repositorio aparte) corriendo en `http://localhost:8080`, con MySQL
  encendido. Las instrucciones están en el `LEEME_PRIMERO.txt` del backend.

## Cómo ejecutarlo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # revisa los tipos (tsc) y compila
npm run lint     # revisión estática con oxlint
```

La URL del backend está en `src/api/axiosConfig.ts` (`baseURL`). El backend solo permite
peticiones desde `http://localhost:5173` (CORS).

## Cuentas de prueba

Las crea el backend al iniciar por primera vez.

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | Admin123 |
| Vendedor | vendedor@duoc.cl | Vende123 |
| Cliente | cliente@gmail.com | Cliente1 |

- El registro público (`/registro`) crea solo cuentas de **Cliente**.
- Tras 3 intentos fallidos de inicio de sesión la cuenta queda bloqueada. El Administrador
  la desbloquea desde el panel (Usuarios).
- Cupón de descuento de prueba: `NUTRI10` (10 %).

## Dónde se guardan los datos

| Dato | Dónde |
|---|---|
| Usuarios, roles, productos, categorías, servicios | Base de datos (vía API) |
| Compras (boletas), citas, mensajes de contacto, reseñas | Base de datos (vía API) |
| Token JWT de la sesión | `localStorage` del navegador |
| Carrito y cupón en curso | `localStorage` (aún no es una compra) |

El historial de compras y de citas se consulta al backend, por lo que se mantiene aunque
se cierre sesión o se cambie de dispositivo.

## Permisos por rol

Los permisos se validan en el backend; el frontend solo oculta lo que no corresponde.

| Operación | Administrador | Vendedor | Cliente |
|---|:---:|:---:|:---:|
| Navegar, comprar y ver su historial | ✔ | ✔ | ✔ |
| Ver y editar su perfil (sin cambiar su rol) | ✔ | ✔ | ✔ |
| Reseñar productos (borrar solo la propia) | ✔ | ✔ | ✔ |
| Consultar productos en el panel | ✔ | ✔ | — |
| Crear, editar y eliminar productos | ✔ | — | — |
| CRUD de categorías | ✔ | — | — |
| Ver órdenes | ✔ | ✔ | — |
| Cambiar estado de órdenes | ✔ | — | — |
| Ver citas y mensajes (API) | ✔ | ✔ | — |
| Cambiar estado de citas | ✔ | — | — |
| CRUD de usuarios, desbloqueo y roles | ✔ | — | — |
| Dashboard de reportes | ✔ | — | — |

## Sesión y rutas protegidas

- `login` llama a `POST /auth/login`, guarda el token y lo envía en cada petición mediante
  un interceptor de Axios (`src/api/axiosConfig.ts`).
- La sesión se mantiene al recargar la página mientras exista el token.
- `/perfil` y `/mis-compras` exigen sesión; `/admin/*` exige rol Administrador o Vendedor
  (`PlantillaAdmin`).
- Cerrar sesión borra el token y el estado de la sesión.

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/api/` | Instancia de Axios (URL base e interceptor del token) |
| `src/servicios/` | Llamadas a la API: auth, catálogo, categorías, boletas, citas, usuarios, reseñas |
| `src/tipos.ts` | Interfaces y tipos compartidos (`Producto`, `Perfil`, `Rol`, `Orden`…) |
| `src/datos/` | Textos y datos estáticos del sitio (regiones, preguntas frecuentes, equipo) |
| `src/contexto/` | Estado compartido: sesión y carrito (Context API) |
| `src/hooks/` | `useSesion`, `useCarrito` y `useFormulario` (formularios con validación) |
| `src/componentes/` | Piezas reutilizables: cabecera, pie, plantillas, tarjetas, avatar |
| `src/paginas/` | Una página por ruta de la tienda |
| `src/paginas/admin/` | Panel de administración |
| `src/utils/` | Funciones puras: formato, validaciones, roles, stock |
| `src/estilos/` | CSS propio por página o componente (sobre Bootstrap 5) |
| `public/img/` | Imágenes |

Más detalle sobre las decisiones técnicas en [INFORME.md](INFORME.md).