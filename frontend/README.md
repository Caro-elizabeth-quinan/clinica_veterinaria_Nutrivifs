# Clínica NutriDifs – Frontend React

Migración a React (Vite + TypeScript) del sitio HTML que está en la carpeta superior.

## Cómo ejecutarlo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # compila y revisa los tipos
```

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/datos/` | Arreglos base: productos, regiones, cuentas de prueba |
| `src/servicios/` | localStorage, datos iniciales y catálogo |
| `src/contexto/` | Estado compartido: sesión y carrito |
| `src/componentes/` | Piezas reutilizables: cabecera, pie, tarjetas |
| `src/paginas/` | Una página por ruta |
| `src/estilos/` | CSS del sitio, un archivo por página o componente |
| `src/utils/` | Funciones puras de formato |
| `public/img/` | Imágenes |

## Avance de la migración

- [x] Paso 1: base del proyecto, cabecera, pie e Inicio
- [x] Paso 2: páginas de contenido (Quiénes somos, Blog y detalles)
- [x] Paso 3: tienda (Productos, Detalle, Carrito)
- [x] Paso 4: usuarios (Login, Registro, sesión y roles)
- [x] Paso 5: Consultas, Agendar y Contacto
- [x] Paso 6: panel de administración
