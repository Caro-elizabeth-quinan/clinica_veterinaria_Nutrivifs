import { Link } from "react-router-dom";
import AlertaStockCritico from "../../componentes/AlertaStockCritico";
import { useSesion } from "../../hooks/useSesion";
import { CLAVES, leerLista } from "../../servicios/almacenamiento";
import { obtenerProductos } from "../../servicios/catalogo";
import { leerPerfiles } from "../../servicios/perfiles";
import type { Cita } from "../../tipos";

export default function AdminInicio() {
  const { sesion } = useSesion();
  const citasPendientes = leerLista<Cita>(CLAVES.CITAS).filter(
    (cita) => cita.estado === "Pendiente",
  ).length;

  return (
    <>
      <span className="admin-eyebrow">PANEL DE ADMINISTRACIÓN</span>
      <h1>¡Hola, {sesion?.name}!</h1>
      <p className="admin-lead">
        Desde aquí gestionas los productos, los usuarios y las órdenes de la
        tienda.
      </p>

      <AlertaStockCritico />

      <section
        className="admin-stats row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3"
        aria-label="Resumen"
      >
        <div className="col">
          <article className="h-100">
            <span>Productos</span>
            <strong>{obtenerProductos().length}</strong>
          </article>
        </div>
        <div className="col">
          <article className="h-100">
            <span>Usuarios</span>
            <strong>{leerPerfiles().length}</strong>
          </article>
        </div>
        <div className="col">
          <article className="h-100">
            <span>Órdenes</span>
            <strong>{leerLista(CLAVES.ORDENES).length}</strong>
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
