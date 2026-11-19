import type { Producto } from "../tipos";
import { esStockCritico } from "../utils/stock";

// Aviso con los productos que están en o bajo su stock crítico.
// Recibe los productos que la página ya cargó desde el backend.
export default function AlertaStockCritico({
  productos = [],
}: {
  productos?: Producto[];
}) {
  const criticos = productos.filter(esStockCritico);
  if (criticos.length === 0) return null;

  return (
    <p className="admin-alert alert alert-warning" role="alert">
      <strong> Stock crítico:</strong> {criticos.length} producto
      {criticos.length === 1 ? "" : "s"} en o bajo su stock crítico:{" "}
      {criticos.map((item) => `${item.name} (${item.stock})`).join(", ")}.
    </p>
  );
}