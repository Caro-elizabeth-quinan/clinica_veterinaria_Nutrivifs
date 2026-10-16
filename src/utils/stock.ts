import type { Producto } from "../tipos";

// Un producto está en stock crítico cuando su stock es igual o inferior al
// stock crítico definido (el campo es opcional).
export function esStockCritico(producto: Producto): boolean {
  return (
    producto.stockCritico !== "" &&
    producto.stockCritico !== null &&
    producto.stockCritico !== undefined &&
    Number(producto.stock) <= Number(producto.stockCritico)
  );
}
