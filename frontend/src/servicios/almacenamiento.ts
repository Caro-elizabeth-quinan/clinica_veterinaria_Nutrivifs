import { CUENTAS_INICIALES, EQUIPO_INICIAL } from "../datos/cuentas";
import { PRODUCTOS_BASE } from "../datos/productos";
import type { Perfil } from "../tipos";

// Claves de localStorage. Son las mismas del sitio HTML, así que los datos
// guardados sirven para las dos versiones.
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
  EQUIPO: "admin-users",
} as const;

const VERSION_SEMILLA = "3";

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

// Deja en localStorage los productos, las cuentas de demostración y el
// equipo la primera vez que se abre el sitio (o cuando cambia la versión).
export function sembrarDatosIniciales(): void {
  const semillaDesactualizada =
    localStorage.getItem(CLAVES.VERSION_SEMILLA) !== VERSION_SEMILLA;

  if (semillaDesactualizada) {
    localStorage.removeItem(CLAVES.EQUIPO);
    localStorage.setItem(CLAVES.VERSION_SEMILLA, VERSION_SEMILLA);
  }

  if (semillaDesactualizada || leerLista(CLAVES.PRODUCTOS).length === 0) {
    guardar(CLAVES.PRODUCTOS, PRODUCTOS_BASE);
  }

  // Las cuentas iniciales se agregan solo si el correo aún no existe.
  const perfiles = leerLista<Perfil>(CLAVES.PERFILES);
  let cambiaron = false;

  CUENTAS_INICIALES.forEach((cuenta) => {
    if (perfiles.some((perfil) => perfil.email === cuenta.email)) return;

    perfiles.push({
      birthDate: "",
      direccion: "Av. San Marcos 123",
      genero: "prefiero-no-decir",
      phone: "",
      region: "Libertador General Bernardo O'Higgins",
      comuna: "Rancagua",
      failedAttempts: 0,
      locked: false,
      ...cuenta,
    });
    cambiaron = true;
  });

  if (cambiaron) guardar(CLAVES.PERFILES, perfiles);

  if (leerLista(CLAVES.EQUIPO).length === 0) {
    guardar(CLAVES.EQUIPO, EQUIPO_INICIAL);
  }
}
