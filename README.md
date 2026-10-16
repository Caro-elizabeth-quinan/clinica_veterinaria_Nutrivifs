# Clínica NutriDifs – Frontend React

Tienda virtual de la Clínica NutriDifs migrada desde HTML, CSS y JavaScript a
**React + TypeScript + Vite + Bootstrap 5 + Bootstrap Icons**. Proyecto académico DSY1104 –
Evaluación Parcial N.° 2 (simulación exclusivamente frontend con LocalStorage).

**Integrantes:** Carolina Quinan · Liza Micele · Benatha Louime

## Cómo ejecutarlo

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # revisa los tipos (tsc) y compila
npm run lint     # revisión estática con oxlint
```

## Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | Admin123 |
| Vendedor | vendedor@duoc.cl | Vende123 |
| Cliente | cliente@gmail.com | Cliente1 |

El registro público (`/registro`) crea solo cuentas de **Cliente**.
Tras 3 intentos fallidos de inicio de sesión, la cuenta queda bloqueada.
Para volver a los datos iniciales (por ejemplo, si se bloquea una cuenta de
prueba), borra el LocalStorage del sitio: F12 → Application → Local Storage.

## Permisos por rol

| Operación | Administrador | Vendedor | Cliente |
|---|:---:|:---:|:---:|
| Navegar y comprar en la tienda | ✔ | ✔ | ✔ |
| Ver y editar su perfil (sin cambiar su rol) | ✔ | ✔ | ✔ |
| Consultar productos en el panel | ✔ | ✔ | — |
| Modificar stock | ✔ | ✔ | — |
| Crear, editar y eliminar productos | ✔ | — | — |
| CRUD de categorías | ✔ | — | — |
| Consultar usuarios | ✔ | ✔ | — |
| Crear usuarios | Cualquier rol | Solo Cliente | — |
| Editar y eliminar usuarios | ✔ | — | — |
| Ver órdenes | ✔ | ✔ | — |
| Cambiar estado de órdenes y gestionar citas | ✔ | — | — |

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/tipos.ts` | Interfaces y tipos compartidos (`Producto`, `Perfil`, `Rol`, `Orden`…) |
| `src/datos/` | Datos base: productos, categorías, regiones, cuentas de prueba |
| `src/servicios/` | Acceso a LocalStorage, catálogo, categorías y perfiles |
| `src/contexto/` | Estado compartido: sesión y carrito (Context API) |
| `src/hooks/` | `useFormulario`: formularios controlados con validación |
| `src/componentes/` | Piezas reutilizables: cabecera, pie, plantillas, tarjetas, avatar |
| `src/paginas/` | Una página por ruta de la tienda |
| `src/paginas/admin/` | Panel de administración |
| `src/utils/` | Funciones puras: formato, validaciones, roles, stock |
| `src/estilos/` | CSS propio por página o componente (sobre Bootstrap 5) |
| `public/img/` | Imágenes |

Más detalle sobre la migración y las decisiones técnicas en [INFORME.md](INFORME.md).
