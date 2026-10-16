import { obtenerProductos } from "../servicios/catalogo";
import { esStockCritico } from "../utils/stock";

// Aviso con los productos que están en o bajo su stock crítico.
export default function AlertaStockCritico() {
  const criticos = obtenerProductos().filter(esStockCritico);
  if (criticos.length === 0) return null;

  return (
    <p className="admin-alert alert alert-warning" role="alert">
      <strong> Stock crítico:</strong> {criticos.length} producto
      {criticos.length === 1 ? "" : "s"} en o bajo su stock crítico:{" "}
      {criticos.map((item) => `${item.name} (${item.stock})`).join(", ")}.
    </p>
  );
}
