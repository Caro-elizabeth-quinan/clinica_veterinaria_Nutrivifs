import type { Categoria } from "../tipos";
import { CLAVES, guardar, leerLista } from "./almacenamiento";
import { obtenerProductos } from "./catalogo";
import { api } from "../api/axiosConfig";

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

export function siguienteIdCategoria(categorias: Categoria[]): string {
  const mayor = categorias.reduce(
    (max, categoria) => Math.max(max, Number(categoria.id.slice(3)) || 0),
    0,
  );
  return `CAT${String(mayor + 1).padStart(2, "0")}`;
}

// En el backend las categorías están en /api/v1/productos/categorias

export async function obtenerCategoriasApi(): Promise<Categoria[]> {
  const respuesta = await api.get<Categoria[]>("/productos/categorias");
  return respuesta.data;
}

// Estas tres necesitan de Administrador
export async function crearCategoriaApi(categoria: Categoria): Promise<Categoria> {
  const respuesta = await api.post<Categoria>("/productos/categorias", categoria);
  return respuesta.data;
}

export async function actualizarCategoriaApi(categoria: Categoria): Promise<Categoria> {
  const respuesta = await api.put<Categoria>(`/productos/categorias/${categoria.id}`, categoria);
  return respuesta.data;
}

export async function eliminarCategoriaApi(id: string): Promise<void> {
  await api.delete(`/productos/categorias/${id}`);
}