import type { Categoria } from "../tipos";
import { CLAVES, guardar, leerLista } from "./almacenamiento";
import { obtenerProductos } from "./catalogo";

export function obtenerCategorias(): Categoria[] {
  return leerLista<Categoria>(CLAVES.CATEGORIAS);
}

export function guardarCategorias(categorias: Categoria[]): void {
  guardar(CLAVES.CATEGORIAS, categorias);
}

// Nombres de las categorías, para selects y filtros.
export function nombresCategorias(): string[] {
  return obtenerCategorias().map((categoria) => categoria.nombre);
}

export function contarProductos(nombreCategoria: string): number {
  return obtenerProductos().filter(
    (producto) => producto.category === nombreCategoria,
  ).length;
}

// Al renombrar una categoría, sus productos pasan al nuevo nombre para que
// la tienda y los filtros sigan siendo coherentes.
export function renombrarEnProductos(anterior: string, nuevo: string): void {
  if (anterior === nuevo) return;
  guardar(
    CLAVES.PRODUCTOS,
    obtenerProductos().map((producto) =>
      producto.category === anterior
        ? { ...producto, category: nuevo }
        : producto,
    ),
  );
}

// Siguiente código libre: CAT01, CAT02…
export function siguienteIdCategoria(categorias: Categoria[]): string {
  const mayor = categorias.reduce(
    (max, categoria) => Math.max(max, Number(categoria.id.slice(3)) || 0),
    0,
  );
  return `CAT${String(mayor + 1).padStart(2, "0")}`;
}
