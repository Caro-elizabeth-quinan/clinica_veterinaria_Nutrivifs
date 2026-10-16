export function formatearMoneda(valor: number): string {
  return `$${Number(valor || 0).toLocaleString("es-CL")}`;
}

// Un producto con precio 0 se considera FREE (regla del Anexo 1).
export function formatearPrecio(valor: number): string {
  return Number(valor) === 0 ? "Gratis" : formatearMoneda(valor);
}

// Iniciales de un nombre, para el avatar del equipo.
export function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatearFecha(fechaIso: string): string {
  return new Date(fechaIso).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
