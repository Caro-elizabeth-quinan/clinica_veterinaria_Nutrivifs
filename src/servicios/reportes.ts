import { api } from "../api/axiosConfig";

export type Periodo = "semana" | "mes" | "anio";

export type ProductoTop = { nombre: string; cantidad: number };

// Igual que ResumenDTO del backend
export type ResumenReporte = {
  periodo: Periodo;
  desde: string;
  hasta: string;
  totalOperaciones: number;
  montoTotal: number;
  unidadesVendidas: number;
  citasSolicitadas: number;
  citasConfirmadas: number;
  masSolicitados: ProductoTop[];
};

// GET /api/v1/reportes/resumen?periodo=semana|mes|anio (solo Administrador)
export async function obtenerResumenApi(
  periodo: Periodo,
): Promise<ResumenReporte> {
  const respuesta = await api.get<ResumenReporte>("/reportes/resumen", {
    params: { periodo },
  });
  return respuesta.data;
}