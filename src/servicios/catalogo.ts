import { PRODUCTOS_BASE } from "../datos/productos";
import type { Producto } from "../tipos";
import { CLAVES, leerLista } from "./almacenamiento";
import { api } from "../api/axiosConfig";
// Productos guardados: los del arreglo base más los cambios del administrador.
export function obtenerProductos(): Producto[] {
  const guardados = leerLista<Producto>(CLAVES.PRODUCTOS);
  return guardados.length ? guardados : PRODUCTOS_BASE.map((p) => ({ ...p }));
}

export function buscarProducto(codigo: string): Producto | null {
  return obtenerProductos().find((p) => p.id === codigo) ?? null;
}

// Siguiente código libre para un producto nuevo: ME001, ME002… Toma el
// número más alto en uso, así no se repite aunque se eliminen productos.
export function siguienteCodigoProducto(): string {
  const mayor = obtenerProductos().reduce((max, producto) => {
    const numero = /^ME(\d+)$/i.exec(producto.id);
    return numero ? Math.max(max, Number(numero[1])) : max;
  }, 0);
  return `ME${String(mayor + 1).padStart(3, "0")}`;
}

export function rutaDetalleProducto(codigo: string): string {
  return `/productos/${encodeURIComponent(codigo)}`;
}


// ...todo lo anterior queda igual

// ===== API (backend Spring Boot) =====
export async function obtenerProductosApi(): Promise<Producto[]> {
  const respuesta = await api.get<Producto[]>("/productos");
  return respuesta.data;
}

export async function buscarProductoApi(codigo: string): Promise<Producto> {
  const respuesta = await api.get<Producto>(`/productos/${codigo}`);
  return respuesta.data;
}

// Estas tres necesitan token de Administrador
export async function crearProductoApi(producto: Producto): Promise<Producto> {
  const respuesta = await api.post<Producto>("/productos", producto);
  return respuesta.data;
}

export async function actualizarProductoApi(producto: Producto): Promise<Producto> {
  const respuesta = await api.put<Producto>(`/productos/${producto.id}`, producto);
  return respuesta.data;
}

export async function eliminarProductoApi(codigo: string): Promise<void> {
  await api.delete(`/productos/${codigo}`);
}