import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { useSesion } from "../hooks/useSesion";
import { misComprasApi } from "../servicios/boleta";
import { IMAGEN_POR_DEFECTO } from "../datos/productos";
import type { EstadoOrden, Orden } from "../tipos";
import {
  formatearFecha,
  formatearMoneda,
  formatearPrecio,
} from "../utils/formato";

const ESTADOS: EstadoOrden[] = ["Entrega pendiente", "Listo", "Enviado"];

// Color del estado de la orden (badges de Bootstrap)
const CLASE_ESTADO: Record<string, string> = {
  "Entrega pendiente": "text-bg-warning",
  Listo: "text-bg-info",
  Enviado: "text-bg-success",
};

// Historial de compras del usuario conectado. Los datos vienen del backend
// (GET /api/v1/boletas/mias): el token JWT identifica al usuario.
export default function MisCompras() {
  const { sesion } = useSesion();
  const [compras, setCompras] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [abierta, setAbierta] = useState<string | null>(null);

  useEffect(() => {
    if (!sesion) return;
    async function cargar() {
      try {
        setCompras(await misComprasApi());
      } catch (e) {
        setError(
          axios.isAxiosError(e)
            ? (e.response?.data?.mensaje ??
                "No se pudo conectar con el servidor.")
            : "Error inesperado.",
        );
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [sesion]);

  // Solo usuarios con sesión pueden ver sus compras
  if (!sesion) return <Navigate to="/login" replace />;

  const visibles =
    filtro === "todas"
      ? compras
      : compras.filter((compra) => compra.status === filtro);

  const totalGastado = compras.reduce((suma, compra) => suma + compra.total, 0);
  const totalAhorrado = compras.reduce(
    (suma, compra) => suma + compra.discount,
    0,
  );

  return (
    <main className="container profile-page" aria-labelledby="compras-titulo">
      <span className="admin-eyebrow">MI CUENTA</span>
      <h1 id="compras-titulo" className="mb-2">
        Mis compras
      </h1>
      <p className="text-muted mb-4">
        Revisa el detalle y el estado de entrega de cada compra.
      </p>

      {cargando && (
        <div className="d-flex align-items-center gap-3 py-4" role="status">
          <div className="spinner-border text-primary" aria-hidden="true" />
          <span>Cargando tus compras...</span>
        </div>
      )}

      {error && <p className="alert alert-danger">{error}</p>}

      {!cargando && !error && compras.length === 0 && (
        <div className="alert alert-info">
          Aún no tienes compras registradas.{" "}
          <Link to="/productos">Ir a la tienda</Link>
        </div>
      )}

      {!cargando && !error && compras.length > 0 && (
        <>
          {/* Resumen */}
          <div className="row g-3 mb-4">
            <div className="col-sm-4">
              <div className="profile-card h-100">
                <small className="text-muted">Compras realizadas</small>
                <p className="h3 m-0">{compras.length}</p>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="profile-card h-100">
                <small className="text-muted">Total gastado</small>
                <p className="h3 m-0">{formatearMoneda(totalGastado)}</p>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="profile-card h-100">
                <small className="text-muted">Ahorrado con cupones</small>
                <p className="h3 m-0">{formatearMoneda(totalAhorrado)}</p>
              </div>
            </div>
          </div>

          {/* Filtro por estado */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <label htmlFor="filtro-estado" className="me-2">
              Filtrar por estado:
            </label>
            <select
              id="filtro-estado"
              className="form-select w-auto"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="todas">Todas</option>
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            <span className="text-muted ms-auto">
              {visibles.length} compra{visibles.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Lista de compras (la más reciente primero) */}
          <div className="d-flex flex-column gap-3">
            {visibles.map((compra) => {
              const estaAbierta = abierta === compra.id;
              const unidades = compra.items.reduce(
                (suma, item) => suma + item.quantity,
                0,
              );

              return (
                <article key={compra.id} className="profile-card">
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    <div>
                      <h2 className="h5 m-0">{compra.id}</h2>
                      <small className="text-muted">
                        {formatearFecha(compra.date)} · {unidades} producto
                        {unidades === 1 ? "" : "s"}
                      </small>
                    </div>
                    <span
                      className={`badge rounded-pill ${CLASE_ESTADO[compra.status] ?? "text-bg-secondary"}`}
                    >
                      {compra.status}
                    </span>
                    <strong className="ms-auto h5 m-0">
                      {formatearMoneda(compra.total)}
                    </strong>
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm"
                      aria-expanded={estaAbierta}
                      onClick={() => setAbierta(estaAbierta ? null : compra.id)}
                    >
                      {estaAbierta ? "Ocultar detalle" : "Ver detalle"}
                    </button>
                  </div>

                  {estaAbierta && (
                    <div className="mt-3">
                      <div className="table-responsive">
                        <table className="table align-middle mb-2">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th className="text-center">Cantidad</th>
                              <th className="text-end">Precio</th>
                              <th className="text-end">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {compra.items.map((item) => (
                              <tr key={item.code}>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <img
                                      src={item.image || IMAGEN_POR_DEFECTO}
                                      alt={item.name}
                                      width={48}
                                      height={48}
                                      style={{ objectFit: "cover", borderRadius: 8 }}
                                    />
                                    <div>
                                      <Link to={`/productos/${item.code}`}>
                                        {item.name}
                                      </Link>
                                      <br />
                                      <small className="text-muted">
                                        {item.code}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-end">
                                  {formatearPrecio(item.price)}
                                </td>
                                <td className="text-end">
                                  {formatearPrecio(item.price * item.quantity)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <dl className="d-flex flex-column align-items-end gap-1 m-0">
                        <div>
                          <dt className="d-inline">Subtotal: </dt>
                          <dd className="d-inline">
                            {formatearMoneda(compra.subtotal)}
                          </dd>
                        </div>
                        {compra.discount > 0 && (
                          <div className="text-success">
                            <dt className="d-inline">Descuento (cupón): </dt>
                            <dd className="d-inline">
                              - {formatearMoneda(compra.discount)}
                            </dd>
                          </div>
                        )}
                        <div className="h5 m-0">
                          <dt className="d-inline">Total: </dt>
                          <dd className="d-inline">
                            {formatearMoneda(compra.total)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}