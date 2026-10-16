import { iniciales } from "../utils/formato";

interface Props {
  nombre: string;
  // Tamaño en píxeles del círculo.
  tamano?: number;
}

// Avatar genérico: círculo con las iniciales del usuario.
export default function AvatarUsuario({ nombre, tamano = 96 }: Props) {
  return (
    <div
      className="avatar-usuario rounded-circle d-flex align-items-center justify-content-center mx-auto"
      style={{ width: tamano, height: tamano, fontSize: tamano / 2.6 }}
      aria-hidden="true"
    >
      {iniciales(nombre) || "?"}
    </div>
  );
}
