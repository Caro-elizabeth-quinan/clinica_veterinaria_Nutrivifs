import { api } from "../api/axiosConfig";
import type { Categoria } from "../tipos";

// Las categorías de productos están en /api/v1/productos/categorias
// GET (público)
export async function obtenerCategoriasApi(): Promise<Categoria[]> {
  const respuesta = await api.get<Categoria[]>("/productos/categorias");
  return respuesta.data;
}

// Estas tres necesitan token de Administrador
export async function crearCategoriaApi(
  categoria: Categoria,
): Promise<Categoria> {
  const respuesta = await api.post<Categoria>(
    "/productos/categorias",
    categoria,
  );
  return respuesta.data;
}

export async function actualizarCategoriaApi(
  categoria: Categoria,
): Promise<Categoria> {
  const respuesta = await api.put<Categoria>(
    `/productos/categorias/${categoria.id}`,
    categoria,
  );
  return respuesta.data;
}

export async function eliminarCategoriaApi(id: string): Promise<void> {
  await api.delete(`/productos/categorias/${id}`);
}