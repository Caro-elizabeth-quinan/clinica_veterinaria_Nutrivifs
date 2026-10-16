// este verifica si hay un error en una de las partes del formulario:
// agrega un borde rojo más "is-invalid", que marca el campo como inválido.
// Está en utils y no en ErrorCampo.tsx porque un archivo de componentes solo
// debe exportar componentes para que funcione el Fast Refresh de Vite.
export function claseCampo(mensaje?: string, base = ""): string | undefined {
  const clases = [base, mensaje ? "campo-invalido is-invalid" : ""]
    .filter(Boolean)
    .join(" ");
  return clases || undefined;
}
