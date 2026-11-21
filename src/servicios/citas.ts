import axios from "axios";
import { api } from "../api/axiosConfig";
import type { Cita, EstadoCita, Mensaje } from "../tipos";

// Datos que se envían al crear una cita (el backend agrega id, estado y fecha de solicitud).
export type DatosCita = Omit<Cita, "id" | "fechaSolicitud" | "estado">;

// POST /api/v1/citas (público)
export async function crearCitaApi(datos: DatosCita): Promise<Cita> {
  const respuesta = await api.post<Cita>("/citas", datos);
  return respuesta.data;
}

// GET /api/v1/citas (Administrador y Vendedor)
export async function listarCitasApi(): Promise<Cita[]> {
  const respuesta = await api.get<Cita[]>("/citas");
  return respuesta.data;
}

// GET /api/v1/citas/mias (usuario con sesión)
export async function misCitasApi(): Promise<Cita[]> {
  const respuesta = await api.get<Cita[]>("/citas/mias");
  return respuesta.data;
}

// PATCH /api/v1/citas/{id}/estado (Administrador). id = "CIT-0001"
export async function cambiarEstadoCitaApi(
  id: string,
  estado: EstadoCita,
): Promise<Cita> {
  const respuesta = await api.patch<Cita>(`/citas/${id}/estado`, { estado });
  return respuesta.data;
}

// POST /api/v1/mensajes (público): formulario de contacto
export async function enviarMensajeApi(
  datos: Omit<Mensaje, "fecha">,
): Promise<void> {
  await api.post("/mensajes", datos);
}

// Mensaje de error del backend (campo "mensaje") o uno por defecto.
export function mensajeDeErrorApi(error: unknown, porDefecto: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.mensaje ?? porDefecto;
  }
  return "Error inesperado.";
}