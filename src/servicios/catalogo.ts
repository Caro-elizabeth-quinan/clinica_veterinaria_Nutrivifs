import { api } from "../api/axiosConfig";
import type { Producto } from "../tipos";

export function rutaDetalleProducto(codigo: string): string {
  return `/productos/${encodeURIComponent(codigo)}`;
}

// ===== API (backend Spring Boot) =====
// GET /api/v1/productos (público)
export async function obtenerProductosApi(): Promise<Producto[]> {
  const respuesta = await api.get<Producto[]>("/productos");
  return respuesta.data;
}

// GET /api/v1/productos/{codigo} (público)
export async function buscarProductoApi(codigo: string): Promise<Producto> {
  const respuesta = await api.get<Producto>(`/productos/${codigo}`);
  return respuesta.data;
}

// Estas tres necesitan token de Administrador
export async function crearProductoApi(producto: Producto): Promise<Producto> {
  const respuesta = await api.post<Producto>("/productos", producto);
  return respuesta.data;
}

export async function actualizarProductoApi(
  producto: Producto,
): Promise<Producto> {
  const respuesta = await api.put<Producto>(
    `/productos/${producto.id}`,
    producto,
  );
  return respuesta.data;
}

export async function eliminarProductoApi(codigo: string): Promise<void> {
  await api.delete(`/productos/${codigo}`);
}