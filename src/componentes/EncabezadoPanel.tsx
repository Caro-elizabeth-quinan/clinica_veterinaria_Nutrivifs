import type { ReactNode } from "react";

interface Props {
  // Texto pequeño sobre el título (ej: "MANTENEDOR").
  etiqueta?: string;
  titulo: string;
  // Botones o enlaces que van a la derecha del título.
  children?: ReactNode;
}

// Encabezado común de las páginas del panel de administración.
export default function EncabezadoPanel({ etiqueta, titulo, children }: Props) {
  return (
    <div className="admin-heading">
      <div>
        {etiqueta && <span className="admin-eyebrow">{etiqueta}</span>}
        <h1>{titulo}</h1>
      </div>
      {children}
    </div>
  );
}
