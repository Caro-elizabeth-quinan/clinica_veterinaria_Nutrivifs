import { REGIONES_COMUNAS } from "../datos/regiones";

// Indica si la región elegida tiene comunas (para habilitar su select).
export function tieneComunas(region: string): boolean {
  return (REGIONES_COMUNAS[region] ?? []).length > 0;
}
