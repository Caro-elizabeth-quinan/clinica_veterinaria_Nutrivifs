import { api } from "../api/axiosConfig";
import type { ItemCarrito, Orden } from "../tipos";

// POST /api/v1/boletas: solo se envía código y cantidad; el backend calcula precios
export async function comprarApi(items: ItemCarrito[], cupon: string): Promise<Orden> {
  const respuesta = await api.post<Orden>("/boletas", {
    items: items.map((item) => ({ codigo: item.code, cantidad: item.quantity })),
    cupon: cupon || null,
  });
  return respuesta.data;
}

// GET /api/v1/boletas/mias: historial del cliente (para Perfil)
export async function misComprasApi(): Promise<Orden[]> {
  const respuesta = await api.get<Orden[]>("/boletas/mias");
  return respuesta.data;
}