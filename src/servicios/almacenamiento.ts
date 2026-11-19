import { EQUIPO_INICIAL } from "../datos/cuentas";

// Claves de localStorage. Son las mismas del sitio HTML.
// Productos, usuarios, categorías y órdenes ahora viven en el backend (MySQL);
// aquí quedan el carrito, el cupón, la sesión, las citas, los mensajes,
// las reseñas y el equipo.
export const CLAVES = {
  CARRITO: "carrito",
  CUPON: "carrito-cupon",
  PERFILES: "clinica-nutridifs-profiles",
  SESION: "clinica-nutridifs-session",
  ORDENES: "clinica-nutridifs-orders",
  SECUENCIA_ORDEN: "clinica-nutridifs-order-seq",
  MENSAJES: "clinica-nutridifs-mensajes",
  CITAS: "clinica-nutridifs-citas",
  VERSION_SEMILLA: "clinica-nutridifs-seed",
  PRODUCTOS: "admin-products",
  CATEGORIAS: "clinica-nutridifs-categorias",
  RESENAS: "clinica-nutridifs-resenas",
  EQUIPO: "admin-users",
} as const;

// Versión 7: los datos de la tienda pasaron al backend.
const VERSION_SEMILLA = "7";

export function leerLista<T>(clave: string): T[] {
  try {
    const valor: unknown = JSON.parse(localStorage.getItem(clave) ?? "null");
    return Array.isArray(valor) ? (valor as T[]) : [];
  } catch {
    return [];
  }
}

export function leerObjeto<T>(clave: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(clave) ?? "null") as T | null;
  } catch {
    return null;
  }
}

export function guardar(clave: string, datos: unknown): void {
  localStorage.setItem(clave, JSON.stringify(datos));
}

// Prepara localStorage al abrir el sitio: borra los datos que ahora maneja el
// backend (versiones anteriores) y deja el equipo de la página de inicio.
export function sembrarDatosIniciales(): void {
  if (localStorage.getItem(CLAVES.VERSION_SEMILLA) !== VERSION_SEMILLA) {
    [
      CLAVES.PRODUCTOS,
      CLAVES.PERFILES,
      CLAVES.CATEGORIAS,
      CLAVES.ORDENES,
      CLAVES.SECUENCIA_ORDEN,
      CLAVES.EQUIPO,
    ].forEach((clave) => localStorage.removeItem(clave));
    localStorage.setItem(CLAVES.VERSION_SEMILLA, VERSION_SEMILLA);
  }

  if (leerLista(CLAVES.EQUIPO).length === 0) {
    guardar(CLAVES.EQUIPO, EQUIPO_INICIAL);
  }
}