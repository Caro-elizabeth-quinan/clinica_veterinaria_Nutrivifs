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
