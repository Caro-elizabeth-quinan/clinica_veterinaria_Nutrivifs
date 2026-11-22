import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AlertaStockCritico from "../../componentes/AlertaStockCritico";
import { useSesion } from "../../hooks/useSesion";
import { obtenerProductosApi } from "../../servicios/catalogo";
import { listarUsuariosApi } from "../../servicios/usuarios";
import { listarBoletasApi } from "../../servicios/boleta";
import { listarCitasApi } from "../../servicios/citas";
import { mensajeDeErrorApi } from "../../servicios/citas";
import {
  obtenerResumenApi,
  type Periodo,
  type ResumenReporte,
} from "../../servicios/reportes";
import type { Producto } from "../../tipos";

const PERIODOS: { valor: Periodo; texto: string }[] = [
  { valor: "semana", texto: "Últimos 7 días" },
  { valor: "mes", texto: "Mes en curso" },
  { valor: "anio", texto: "Año en curso" },
];

const formatoPesos = (monto: number) =>
  `$${monto.toLocaleString("es-CL")}`;

// Inicio del panel (solo Administrador): resumen con datos del backend.
export default function AdminInicio() {
  const { sesion } = useSesion();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalOrdenes, setTotalOrdenes] = useState(0);
  const [citasPendientes, setCitasPendientes] = useState(0);

  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [resumen, setResumen] = useState<ResumenReporte | null>(null);
  const [errorResumen, setErrorResumen] = useState("");

  // GET /productos, /usuarios, /boletas y /citas. Si una falla, las demás se muestran igual.
  useEffect(() => {
    obtenerProductosApi().then(setProductos).catch(console.error);
    listarUsuariosApi()
      .then((u) => setTotalUsuarios(u.length))
      .catch(console.error);
    listarBoletasApi()
      .then((o) => setTotalOrdenes(o.length))
      .catch(console.error);
    listarCitasApi()
      .then((c) =>
        setCitasPendientes(
          c.filter((cita) => cita.estado === "Pendiente").length,
        ),
      )
      .catch(console.error);
  }, []);

  // GET /reportes/resumen: se vuelve a pedir cada vez que cambia el período
  useEffect(() => {
    let vigente = true;
    obtenerResumenApi(periodo)
      .then((datos) => {
        if (!vigente) return;
        setResumen(datos);
        setErrorResumen("");
      })
      .catch((e) => {
        if (vigente) {
          setErrorResumen(
            mensajeDeErrorApi(e, "No se pudieron cargar los indicadores."),
          );
        }
      });
    return () => {
      vigente = false;
    };
  }, [periodo]);

  // Mientras llega la respuesta del período elegido no se muestran números viejos
  const datos = resumen?.periodo === periodo ? resumen : null;

  return (
    <>
      <span className="admin-eyebrow">PANEL DE ADMINISTRACIÓN</span>
      <h1>¡Hola, {sesion?.name}!</h1>
      <p className="admin-lead">
        Desde aquí gestionas los productos, los usuarios y las órdenes de la
        tienda.
      </p>

      <AlertaStockCritico productos={productos} />

      <section
        className="admin-stats row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3"
        aria-label="Resumen"
      >
        <div className="col">
          <article className="h-100">
            <span>Productos</span>
            <strong>{productos.length}</strong>
          </article>
        </div>
        <div className="col">
          <article className="h-100">
            <span>Usuarios</span>
            <strong>{totalUsuarios}</strong>
          </article>
        </div>
        <div className="col">
          <article className="h-100">
            <span>Órdenes (total)</span>
            <strong>{totalOrdenes}</strong>
          </article>
        </div>
        <div className="col">
          <article className="h-100">
            <span>Citas pendientes</span>
            <strong>{citasPendientes}</strong>
          </article>
        </div>
      </section>

      <section aria-label="Reportes de ventas" className="mt-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h2 className="m-0">Reportes</h2>
          <div>
            <label htmlFor="periodo" className="visually-hidden">
              Período del reporte
            </label>
            <select
              id="periodo"
              className="form-select"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as Periodo)}
            >
              {PERIODOS.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.texto}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorResumen && (
          <p className="alert alert-danger" role="alert">
            {errorResumen}
          </p>
        )}

        {!errorResumen && !datos && <p>Cargando indicadores…</p>}

        {datos && (
          <>
            <p className="admin-lead">
              Del {datos.desde} al {datos.hasta}
            </p>

            <div
              className="admin-stats row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3"
              aria-label="Indicadores del período"
            >
              <div className="col">
                <article className="h-100">
                  <span>Órdenes realizadas</span>
                  <strong>{datos.totalOperaciones}</strong>
                </article>
              </div>
              <div className="col">
                <article className="h-100">
                  <span>Monto vendido</span>
                  <strong>{formatoPesos(datos.montoTotal)}</strong>
                </article>
              </div>
              <div className="col">
                <article className="h-100">
                  <span>Unidades vendidas</span>
                  <strong>{datos.unidadesVendidas}</strong>
                </article>
              </div>
              <div className="col">
                <article className="h-100">
                  <span>Citas solicitadas / confirmadas</span>
                  <strong>
                    {datos.citasSolicitadas} / {datos.citasConfirmadas}
                  </strong>
                </article>
              </div>
            </div>

            <h3 className="mt-4">Productos más vendidos</h3>
            {datos.masSolicitados.length === 0 ? (
              <p>No hay ventas en este período.</p>
            ) : (
              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Producto</th>
                      <th>Unidades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.masSolicitados.map((p, i) => (
                      <tr key={p.nombre}>
                        <td>{i + 1}</td>
                        <td>{p.nombre}</td>
                        <td>{p.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      <section className="admin-quick-access">
        <h2>Accesos rápidos</h2>
        <div>
          <Link className="btn-primary" to="/admin/productos/nuevo">
            Nuevo producto
          </Link>
          <Link className="btn-primary" to="/admin/usuarios/nuevo">
            Nuevo usuario
          </Link>
          <Link className="btn-secondary" to="/admin/productos">
            Ver productos
          </Link>
          <Link className="btn-secondary" to="/admin/categorias">
            Ver categorías
          </Link>
          <Link className="btn-secondary" to="/admin/usuarios">
            Ver usuarios
          </Link>
          <Link className="btn-secondary" to="/admin/ordenes">
            Ver órdenes
          </Link>
          <Link className="btn-secondary" to="/admin/citas">
            Ver citas
          </Link>
        </div>
      </section>
    </>
  );
}