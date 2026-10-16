import { useState } from "react";

// Botón de eliminar con confirmación: el primer clic pregunta, el segundo elimina.
export default function BotonEliminar({
  alEliminar,
}: {
  alEliminar: () => void;
}) {
  const [confirmando, setConfirmando] = useState(false);

  return (
    <button
      type="button"
      className="admin-delete-button"
      onClick={() => (confirmando ? alEliminar() : setConfirmando(true))}
    >
      {confirmando ? "¿Confirmar?" : "Eliminar"}
    </button>
  );
}
