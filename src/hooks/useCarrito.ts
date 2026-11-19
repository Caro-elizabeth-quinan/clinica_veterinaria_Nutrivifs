import { createContext, useContext } from "react";
import type { ItemCarrito, Orden, Producto } from "../tipos";

// Contexto del carrito y su hook. El proveedor (ProveedorCarrito) está en
// contexto/CarritoContexto.tsx; aquí solo va lo que no es un componente, para
// que el Fast Refresh de Vite funcione en ese archivo.
export interface ValorCarrito {
  items: ItemCarrito[];
  cupon: string;
  cantidadTotal: number;
  subtotal: number;
  descuento: number;
  total: number;
  cantidadDe: (codigo: string) => number;
  productoDe: (codigo: string) => Producto | null;
  agregar: (codigo: string, cantidad?: number) => boolean;
  cambiarCantidad: (codigo: string, variacion: number) => void;
  quitar: (codigo: string) => void;
  vaciar: () => void;
  aplicarCupon: (codigo: string) => boolean;
  pagar: () => Promise<Orden>;
}

export const CarritoContexto = createContext<ValorCarrito | null>(null);

export function useCarrito(): ValorCarrito {
  const valor = useContext(CarritoContexto);
  if (!valor)
    throw new Error("useCarrito debe usarse dentro de ProveedorCarrito");
  return valor;
}