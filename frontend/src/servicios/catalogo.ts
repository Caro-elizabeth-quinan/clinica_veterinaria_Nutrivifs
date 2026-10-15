import { PRODUCTOS_BASE } from "../datos/productos";
import type { Producto } from "../tipos";
import { CLAVES, leerLista } from "./almacenamiento";

// Productos guardados: los del arreglo base más los cambios del administrador.
export function obtenerProductos(): Producto[] {
  const guardados = leerLista<Producto>(CLAVES.PRODUCTOS);
  return guardados.length ? guardados : PRODUCTOS_BASE.map((p) => ({ ...p }));
}

export function buscarProducto(codigo: string): Producto | null {
  return obtenerProductos().find((p) => p.id === codigo) ?? null;
}

export function rutaDetalleProducto(codigo: string): string {
  return `/productos/${encodeURIComponent(codigo)}`;
}
