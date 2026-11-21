import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AlertaStockCritico from "../../componentes/AlertaStockCritico";
import { useSesion } from "../../hooks/useSesion";
import { obtenerProductosApi } from "../../servicios/catalogo";
import { listarUsuariosApi } from "../../servicios/usuarios";
import { listarBoletasApi } from "../../servicios/boleta";
import { listarCitasApi } from "../../servicios/citas";
import type { Producto } from "../../tipos";

// Inicio del panel (solo Administrador): resumen con datos del backend.
export default function AdminInicio() {
  const { sesion } = useSesion();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalOrdenes, setTotalOrdenes] = useState(0);
  const [citasPendientes, setCitasPendientes] = useState(0);

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
        setCitasPendientes(c.filter((cita) => cita.estado === "Pendiente").length),
      )
      .catch(console.error);
  }, []);

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
            <span>Órdenes</span>
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