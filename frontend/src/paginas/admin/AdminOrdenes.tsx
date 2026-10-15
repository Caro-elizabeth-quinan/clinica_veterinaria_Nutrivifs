import { useState } from "react";
import { useSesion } from "../../contexto/SesionContexto";
import { CLAVES, guardar, leerLista } from "../../servicios/almacenamiento";
import type { EstadoOrden, Orden } from "../../tipos";
import {
  formatearFecha,
  formatearMoneda,
  formatearPrecio,
} from "../../utils/formato";

// Estados de entrega de una orden. Solo el Administrador puede cambiarlos;
// el Vendedor únicamente los ve.
const ESTADOS: EstadoOrden[] = ["Entrega pendiente", "Listo", "Enviado"];

const CLASE_ESTADO: Record<EstadoOrden, string> = {
  "Entrega pendiente": "admin-status",
  Listo: "admin-status admin-status-listo",
  Enviado: "admin-status admin-status-confirmada",
};

// Las órdenes antiguas se guardaron como "Pendiente".
function estadoDe(orden: Orden): EstadoOrden {
  return (ESTADOS as string[]).includes(orden.status)
    ? (orden.status as EstadoOrden)
    : "Entrega pendiente";
}

export default function AdminOrdenes() {
  const { sesion } = useSesion();
  const esAdmin = sesion?.role === "Administrador";
  const [ordenes, setOrdenes] = useState(() =>
    leerLista<Orden>(CLAVES.ORDENES),
  );
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");

  const detalle = ordenes.find((orden) => orden.id === detalleId);

  const cambiarEstado = (orden: Orden, estado: EstadoOrden) => {
    // Una orden enviada ya está cerrada: se retira del listado para que
    // no se acumulen.
    const nuevas =
      estado === "Enviado"
        ? ordenes.filter((item) => item.id !== orden.id)
        : ordenes.map((item) =>
            item.id === orden.id ? { ...item, status: estado } : item,
          );

    guardar(CLAVES.ORDENES, nuevas);
    setOrdenes(nuevas);
    setDetalleId(null);
    setAviso(
      estado === "Enviado"
        ? `Orden ${orden.id} enviada: se retiró del listado.`
        : "",
    );
  };

  return (
    <>
      <div className="admin-heading">
        <div>
          <span className="admin-eyebrow">VENTAS</span>
          <h1>Órdenes</h1>
        </div>
      </div>

      {ordenes.length === 0 && (
        <p className="admin-lead">
          Aún no hay órdenes. Se registran cuando un cliente paga su carrito.
        </p>
      )}

      {aviso && (
        <p className="admin-alert" role="status">
          {aviso}
        </p>
      )}

      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">N° orden</th>
              <th scope="col">Fecha</th>
              <th scope="col">Cliente</th>
              <th scope="col">Total</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {[...ordenes].reverse().map((orden) => {
              const estado = estadoDe(orden);

              return (
                <tr key={orden.id}>
                  <td>{orden.id}</td>
                  <td>{formatearFecha(orden.date)}</td>
                  <td>
                    {orden.customer.name}
                    <br />
                    <small>{orden.customer.email}</small>
                  </td>
                  <td>{formatearMoneda(orden.total)}</td>
                  <td>
                    <span className={CLASE_ESTADO[estado]}>{estado}</span>
                  </td>
                  <td className="admin-actions">
                    <button
                      type="button"
                      className="admin-edit-button"
                      onClick={() => setDetalleId(orden.id)}
                    >
                      Ver detalle
                    </button>
                    {esAdmin &&
                      ESTADOS.filter((item) => item !== estado).map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="admin-edit-button admin-status-button"
                          onClick={() => cambiarEstado(orden, item)}
                        >
                          {item}
                        </button>
                      ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {detalle && (
        <section className="admin-order-detail">
          <div className="admin-heading">
            <h2>Detalle de la orden {detalle.id}</h2>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setDetalleId(null)}
            >
              &larr; Volver al listado
            </button>
          </div>
          <p>
            <strong>Cliente:</strong> {detalle.customer.name} (
            {detalle.customer.email})
            <br />
            <strong>Fecha:</strong> {formatearFecha(detalle.date)} ·{" "}
            <strong>Estado:</strong> {estadoDe(detalle)}
          </p>
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalle.items.map((item) => (
                  <tr key={item.code}>
                    <td>{item.code}</td>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatearPrecio(item.price)}</td>
                    <td>{formatearPrecio(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="admin-order-total">
            Subtotal: {formatearMoneda(detalle.subtotal)} · Descuento:{" "}
            {formatearMoneda(detalle.discount)} ·{" "}
            <strong>Total: {formatearMoneda(detalle.total)}</strong>
          </p>
        </section>
      )}
    </>
  );
}
