import { createContext, useContext, useState, type ReactNode } from "react";
import { IMAGEN_POR_DEFECTO } from "../datos/productos";
import { CLAVES, guardar, leerLista } from "../servicios/almacenamiento";
import { buscarProducto, obtenerProductos } from "../servicios/catalogo";
import type { ItemCarrito, Orden, Sesion } from "../tipos";

// Reglas del carrito:
// 1. No se puede agregar más unidades que el stock disponible.
// 2. Si la cantidad llega a 0, el producto sale del carrito.
// 3. El carrito se guarda en localStorage y se mantiene entre páginas.
// 4. Para pagar hay que iniciar sesión; al pagar se descuenta el stock
//    y se registra una orden.
// 5. Cupón NUTRI10: 10% de descuento sobre el subtotal.

const CUPONES: Record<string, number> = { NUTRI10: 0.1 };

interface ValorCarrito {
  items: ItemCarrito[];
  cupon: string;
  cantidadTotal: number;
  subtotal: number;
  descuento: number;
  total: number;
  cantidadDe: (codigo: string) => number;
  agregar: (codigo: string, cantidad?: number) => boolean;
  cambiarCantidad: (codigo: string, variacion: number) => void;
  quitar: (codigo: string) => void;
  vaciar: () => void;
  aplicarCupon: (codigo: string) => boolean;
  pagar: (sesion: Sesion) => Orden;
}

const CarritoContexto = createContext<ValorCarrito | null>(null);

function stockDe(codigo: string): number {
  return Number(buscarProducto(codigo)?.stock) || 0;
}

export function ProveedorCarrito({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>(() =>
    leerLista<ItemCarrito>(CLAVES.CARRITO),
  );
  const [cupon, setCupon] = useState(
    () => localStorage.getItem(CLAVES.CUPON) ?? "",
  );

  const actualizar = (nuevos: ItemCarrito[]) => {
    guardar(CLAVES.CARRITO, nuevos);
    setItems(nuevos);
  };

  const cantidadTotal = items.reduce((suma, item) => suma + item.quantity, 0);
  const subtotal = items.reduce(
    (suma, item) => suma + item.price * item.quantity,
    0,
  );
  const descuento = Math.round(subtotal * (CUPONES[cupon] || 0));
  const total = subtotal - descuento;

  const cantidadDe = (codigo: string) =>
    items.find((item) => item.code === codigo)?.quantity ?? 0;

  const agregar = (codigo: string, cantidad = 1): boolean => {
    const producto = buscarProducto(codigo);
    if (!producto || cantidad < 1) return false;
    if (cantidadDe(codigo) + cantidad > Number(producto.stock)) return false;

    const existe = items.some((item) => item.code === codigo);

    actualizar(
      existe
        ? items.map((item) =>
            item.code === codigo
              ? { ...item, quantity: item.quantity + cantidad }
              : item,
          )
        : [
            ...items,
            {
              code: producto.id,
              name: producto.name,
              price: Number(producto.price) || 0,
              image: producto.image || IMAGEN_POR_DEFECTO,
              quantity: cantidad,
            },
          ],
    );
    return true;
  };

  const cambiarCantidad = (codigo: string, variacion: number) => {
    const actual = cantidadDe(codigo);
    if (!actual) return;
    if (variacion > 0 && actual + variacion > stockDe(codigo)) return;

    actualizar(
      items
        .map((item) =>
          item.code === codigo
            ? { ...item, quantity: item.quantity + variacion }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const quitar = (codigo: string) => {
    actualizar(items.filter((item) => item.code !== codigo));
  };

  const vaciar = () => {
    localStorage.removeItem(CLAVES.CUPON);
    setCupon("");
    actualizar([]);
  };

  const aplicarCupon = (codigo: string): boolean => {
    if (!CUPONES[codigo]) return false;
    localStorage.setItem(CLAVES.CUPON, codigo);
    setCupon(codigo);
    return true;
  };

  // Registra la orden, descuenta el stock comprado y vacía el carrito.
  const pagar = (sesion: Sesion): Orden => {
    const ordenes = leerLista<Orden>(CLAVES.ORDENES);

    // El número sale de un contador propio (no del largo de la lista),
    // porque las órdenes enviadas se eliminan y no debe repetirse.
    const numero =
      Math.max(
        Number(localStorage.getItem(CLAVES.SECUENCIA_ORDEN)) || 0,
        ordenes.length,
      ) + 1;
    localStorage.setItem(CLAVES.SECUENCIA_ORDEN, String(numero));

    const orden: Orden = {
      id: `ORD-${String(numero).padStart(4, "0")}`,
      date: new Date().toISOString(),
      customer: {
        name: `${sesion.name} ${sesion.apellido || ""}`.trim(),
        email: sesion.email,
      },
      items: items.map((item) => ({ ...item })),
      subtotal,
      discount: descuento,
      total,
      status: "Entrega pendiente",
    };
    guardar(CLAVES.ORDENES, [...ordenes, orden]);

    guardar(
      CLAVES.PRODUCTOS,
      obtenerProductos().map((producto) => {
        const comprado = cantidadDe(producto.id);
        return comprado
          ? {
              ...producto,
              stock: Math.max(0, Number(producto.stock) - comprado),
            }
          : producto;
      }),
    );

    vaciar();
    return orden;
  };

  return (
    <CarritoContexto.Provider
      value={{
        items,
        cupon,
        cantidadTotal,
        subtotal,
        descuento,
        total,
        cantidadDe,
        agregar,
        cambiarCantidad,
        quitar,
        vaciar,
        aplicarCupon,
        pagar,
      }}
    >
      {children}
    </CarritoContexto.Provider>
  );
}

export function useCarrito(): ValorCarrito {
  const valor = useContext(CarritoContexto);
  if (!valor)
    throw new Error("useCarrito debe usarse dentro de ProveedorCarrito");
  return valor;
}
