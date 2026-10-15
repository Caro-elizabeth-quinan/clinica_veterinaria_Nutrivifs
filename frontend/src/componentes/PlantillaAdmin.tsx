import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useSesion } from "../contexto/SesionContexto";

// Roles (Anexo 1):
//  - Administrador: acceso total.
//  - Vendedor: solo ve la lista y el detalle de productos y de órdenes.
//  - Cliente: solo accede a la tienda (no entra a estas vistas).

const MENU = [
  { ruta: "/admin", texto: "Inicio", soloAdmin: true, exacta: true },
  { ruta: "/admin/productos", texto: "Productos", soloAdmin: false },
  { ruta: "/admin/usuarios", texto: "Usuarios", soloAdmin: true },
  { ruta: "/admin/ordenes", texto: "Órdenes", soloAdmin: false },
  { ruta: "/admin/citas", texto: "Citas", soloAdmin: true },
];

// Rutas que puede ver el Vendedor: listado y detalle de productos, y órdenes.
function permitidaParaVendedor(ruta: string): boolean {
  if (ruta === "/admin/productos" || ruta === "/admin/ordenes") return true;
  return (
    /^\/admin\/productos\/[^/]+$/.test(ruta) &&
    ruta !== "/admin/productos/nuevo"
  );
}

// Estructura del panel: menú lateral y contenido. También protege las rutas.
export default function PlantillaAdmin() {
  const { sesion, cerrarSesion } = useSesion();
  const { pathname } = useLocation();
  const navegar = useNavigate();

  if (!sesion || sesion.role === "Cliente") {
    return <Navigate to="/login" replace />;
  }

  const esAdmin = sesion.role === "Administrador";

  if (!esAdmin && !permitidaParaVendedor(pathname)) {
    return <Navigate to="/admin/productos" replace />;
  }

  const salir = () => {
    cerrarSesion();
    navegar("/");
  };

  return (
    <div className="admin-body">
      <aside className="admin-sidebar">
        <Link className="brand" to="/admin/productos">
          <img className="brand-logo" src="/img/logo.svg" alt="" />
          Clínica NutriDifs
        </Link>
        <p className="admin-sidebar-subtitle">Panel de administración</p>

        <nav aria-label="Menú de administración">
          {MENU.filter((item) => esAdmin || !item.soloAdmin).map((item) => (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              end={item.exacta}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {item.texto}
            </NavLink>
          ))}
          {esAdmin && <Link to="/">Ver tienda</Link>}
          <button type="button" className="admin-logout" onClick={salir}>
            Cerrar sesión
          </button>
        </nav>

        <p className="admin-sidebar-footer">
          {sesion.name} · {sesion.role}
        </p>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
