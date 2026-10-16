// este es el mensaje de error que se muestra debajo de un campo del formulario.
// (claseCampo, que marca el campo en rojo, está en utils/claseCampo.ts)
export default function ErrorCampo({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return <small className="campo-error">{mensaje}</small>;
}
