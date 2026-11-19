import { useEffect, useState, type ReactNode } from "react";
import { IMAGEN_POR_DEFECTO } from "../datos/productos";
import { CLAVES, guardar, leerLista } from "../servicios/almacenamiento";
import { obtenerProductosApi } from "../servicios/catalogo";
import { comprarApi } from "../servicios/boleta";
import { CarritoContexto } from "../hooks/useCarrito";
import type { ItemCarrito, Orden, Producto } from "../tipos";

// Reglas del carrito:
// 1. No se puede agregar más unidades que el stock disponible (stock leído del backend).
// 2. Si la cantidad llega a 0, el producto sale del carrito.
// 3. Los ítems y el cupón se guardan en localStorage y se mantienen entre páginas.
// 4. Para pagar hay que iniciar sesión; el backend (POST /boletas) registra la orden,
//    valida y descuenta el stock y aplica el cupón.
// 5. Cupón NUTRI10: 10% de descuento sobre el subtotal (el backend lo vuelve a validar).

const CUPONES: Record<string, number> = { NUTRI10: 0.1 };

export function ProveedorCarrito({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>(() =>
    leerLista<ItemCarrito>(CLAVES.CARRITO),
  );
  const [cupon, setCupon] = useState(
    () => localStorage.getItem(CLAVES.CUPON) ?? "",
  );
  // Productos del backend: se usan para conocer el stock real
  const [productos, setProductos] = useState<Producto[]>([]);

  const cargarProductos = async () => {
    try {
      setProductos(await obtenerProductosApi());
    } catch (error) {
      console.error("No se pudieron cargar los productos del carrito:", error);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const productoDe = (codigo: string): Producto | null =>
    productos.find((producto) => producto.id === codigo) ?? null;

  const stockDe = (codigo: string): number =>
    Number(productoDe(codigo)?.stock) || 0;

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
    const producto = productoDe(codigo);
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

  // Envía la compra al backend (POST /api/v1/boletas). El backend calcula precios,
  // valida y descuenta el stock y devuelve la orden con su número (ORD-0001).
  // Si falla (sin stock, sesión vencida), lanza el error para que la página lo muestre.
  const pagar = async (): Promise<Orden> => {
    const orden = await comprarApi(items, cupon);
    vaciar();
    await cargarProductos(); // stock actualizado después de la compra
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
        productoDe,
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