import { api } from "../api/axiosConfig";
import type { Resena } from "../tipos";

// GET /api/v1/resenas/producto/{id} (público): de la más reciente a la más antigua
export async function resenasDeProductoApi(
  productoId: string,
): Promise<Resena[]> {
  const respuesta = await api.get<Resena[]>(
    `/resenas/producto/${encodeURIComponent(productoId)}`,
  );
  return respuesta.data;
}

// POST /api/v1/resenas (con sesión): el correo sale del token.
// Cada usuario tiene una reseña por producto: si ya existe, el backend la actualiza.
export async function guardarResenaApi(datos: {
  productoId: string;
  autor: string;
  puntuacion: number;
  comentario: string;
}): Promise<Resena> {
  const respuesta = await api.post<Resena>("/resenas", datos);
  return respuesta.data;
}

// DELETE /api/v1/resenas/{id}: el autor borra la suya; el Administrador cualquiera.
export async function eliminarResenaApi(id: string): Promise<void> {
  await api.delete(`/resenas/${id}`);
}

export function promedio(resenas: Resena[]): number {
  if (resenas.length === 0) return 0;
  const suma = resenas.reduce((total, resena) => total + resena.puntuacion, 0);
  return Math.round((suma / resenas.length) * 10) / 10;
}