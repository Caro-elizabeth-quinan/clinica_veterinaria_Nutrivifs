import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCarrito } from "../contexto/CarritoContexto";
import { useSesion } from "../contexto/SesionContexto";
import { destinoSegunRol } from "../utils/roles";

const ENLACES = [
  { ruta: "/", texto: "Inicio" },
  { ruta: "/consultas", texto: "Consultas" },
  { ruta: "/productos", texto: "Productos" },
  { ruta: "/blog", texto: "Blog" },
  { ruta: "/contacto", texto: "Contáctanos" },
  { ruta: "/quienes-somos", texto: "Quiénes somos" },
];

export default function Encabezado() {
  const { sesion, cerrarSesion } = useSesion();
  const { cantidadTotal } = useCarrito();
  const navegar = useNavigate();

  // El Vendedor solo ve en el menú el enlace a productos.
  const enlaces =
    sesion?.role === "Vendedor"
      ? ENLACES.filter((enlace) => enlace.ruta === "/productos")
      : ENLACES;

  const salir = () => {
    cerrarSesion();
    navegar("/");
  };

  return (
    <header className="site-header">
      <div className="container header-content">
        <Link className="brand" to="/">
          <img className="brand-logo" src="/img/logo.svg" alt="" />
          Clínica NutriDifs
        </Link>

        <nav aria-label="Navegación principal">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.ruta}
              to={enlace.ruta}
              end={enlace.ruta === "/"}
            >
              {enlace.texto}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <span className="session-links">
            {sesion ? (
              <>
                <span className="session-name">Hola, {sesion.name}</span>
                <Link className="profile-link" to="/perfil">Mi perfil</Link>
                {sesion.role !== "Cliente" && (
                  <Link
                    className="profile-link"
                    to={destinoSegunRol(sesion.role)}
                  >
                    Panel
                  </Link>
                )}
                <button type="button" className="logout-button" onClick={salir}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link className="profile-link" to="/login">
                  Iniciar sesión
                </Link>
                <Link className="profile-link" to="/registro">
                  Registrarse
                </Link>
              </>
            )}
          </span>

          <Link
            className="carrito-compras"
            to="/carrito"
            aria-label={`Carrito, ${cantidadTotal} productos`}
          >
            Carrito <span className="cart-counter">{cantidadTotal}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
