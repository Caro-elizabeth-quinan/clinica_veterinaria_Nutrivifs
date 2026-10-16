import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useSesion } from "../hooks/useSesion";
import SubirAlInicio from "./SubirAlInicio";

// Roles:
//  - Administrador: acceso total (usuarios, productos, categorías, órdenes, citas).
//  - Vendedor: consulta productos y modifica su stock, ve órdenes y crea
//    usuarios solo con rol Cliente. No administra categorías ni elimina.
//  - Cliente: solo accede a la tienda (no entra a estas vistas).

const MENU = [
  { ruta: "/admin", texto: "Inicio", soloAdmin: true, exacta: true },
  { ruta: "/admin/productos", texto: "Productos", soloAdmin: false },
  { ruta: "/admin/categorias", texto: "Categorías", soloAdmin: true },
  { ruta: "/admin/usuarios", texto: "Usuarios", soloAdmin: false },
  { ruta: "/admin/ordenes", texto: "Órdenes", soloAdmin: false },
  { ruta: "/admin/citas", texto: "Citas", soloAdmin: true },
];

// Rutas del panel permitidas al Vendedor.
/**
 * Lista de patrones de rutas permitidas para el rol de Vendedor.
 * Se utilizan Expresiones Regulares (RegEx) para validar y restringir URLs dinámicas:
 *
 * Símbolos RegEx clave:
 * - ^ / $       : Inicio y fin de la cadena (garantizan coincidencia exacta de la ruta).
 * - \/          : Barra diagonal `/` escapada.
 * - [^/]+       : Representa IDs o slugs dinámicos (1 o más caracteres excepto `/`).
 * - (?!nuevo$)  : Lookahead Negativo; asegura que el parámetro del ID NO sea la palabra "nuevo".
 */
const RUTAS_VENDEDOR = [
  /^\/admin\/productos$/, // listado de productos
  /^\/admin\/productos\/(?!nuevo$)[^/]+$/, // detalle de un producto
  /^\/admin\/productos\/[^/]+\/editar$/, // modificar stock
  /^\/admin\/ordenes$/,
  /^\/admin\/usuarios$/, // listado (solo consulta)
  /^\/admin\/usuarios\/nuevo$/, // crear clientes
  /^\/admin\/usuarios\/(?!nuevo$)[^/]+$/, // detalle de un usuario
];

function permitidaParaVendedor(ruta: string): boolean {
  return RUTAS_VENDEDOR.some((patron) => patron.test(ruta));
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
    // Grilla Bootstrap: en móvil el menú queda arriba (col-12) y desde
    // tablet pasa a ser una columna lateral (col-md-3 / col-xl-2).
    <div className="admin-body container-fluid">
      <div className="row min-vh-100">
        <aside className="admin-sidebar col-12 col-md-3 col-xl-2">
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
            <Link to="/perfil">Mi perfil</Link>
            <Link to="/">Ver tienda</Link>
            <button type="button" className="admin-logout" onClick={salir}>
              Cerrar sesión
            </button>
          </nav>

          <p className="admin-sidebar-footer">
            {sesion.name} · {sesion.role}
          </p>
        </aside>

        <main className="admin-main col-12 col-md-9 col-xl-10">
          <SubirAlInicio />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
