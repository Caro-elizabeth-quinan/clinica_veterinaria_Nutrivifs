// Mensaje de error que se muestra debajo de un campo del formulario.
export default function ErrorCampo({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return <small className="campo-error">{mensaje}</small>;
}

// Clase que marca en rojo el campo con error.
export function claseCampo(mensaje?: string): string | undefined {
  return mensaje ? "campo-invalido" : undefined;
}
