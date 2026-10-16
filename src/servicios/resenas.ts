import type { Resena } from "../tipos";
import { CLAVES, guardar, leerLista } from "./almacenamiento";

function todas(): Resena[] {
  return leerLista<Resena>(CLAVES.RESENAS);
}

// Reseñas de un producto, de la más reciente a la más antigua.
export function resenasDeProducto(productoId: string): Resena[] {
  return todas()
    .filter((resena) => resena.productoId === productoId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

// Cada usuario tiene una reseña por producto: si ya existe, se reemplaza.
export function guardarResena(resena: Resena): void {
  const resto = todas().filter(
    (item) =>
      !(item.productoId === resena.productoId && item.email === resena.email),
  );
  guardar(CLAVES.RESENAS, [...resto, resena]);
}

export function eliminarResena(id: string): void {
  guardar(
    CLAVES.RESENAS,
    todas().filter((resena) => resena.id !== id),
  );
}

export function promedio(resenas: Resena[]): number {
  if (resenas.length === 0) return 0;
  const suma = resenas.reduce((total, resena) => total + resena.puntuacion, 0);
  return Math.round((suma / resenas.length) * 10) / 10;
}
