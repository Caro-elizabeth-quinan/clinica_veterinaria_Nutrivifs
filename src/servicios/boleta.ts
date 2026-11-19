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

// GET /api/v1/boletas: todas las órdenes (Administrador y Vendedor)
export async function listarBoletasApi(): Promise<Orden[]> {
  const respuesta = await api.get<Orden[]>("/boletas");
  return respuesta.data;
}

// PATCH /api/v1/boletas/{id}/estado (solo Administrador). id = "ORD-0001"
export async function cambiarEstadoBoletaApi(id: string, estado: string): Promise<Orden> {
  const respuesta = await api.patch<Orden>(`/boletas/${id}/estado`, { estado });
  return respuesta.data;
}