import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCarrito } from "../hooks/useCarrito";
import { useSesion } from "../hooks/useSesion";
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
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarMenu = () => setMenuAbierto(false);

  const salir = () => {
    cerrarMenu();
    cerrarSesion();
    navegar("/");
  };

  return (
    <header className="site-header navbar navbar-expand-xl">
      <div className="container header-content">
        <Link className="navbar-brand brand" to="/" onClick={cerrarMenu}>
          <img className="brand-logo" src="/img/logo.svg" alt="" />
          Clínica NutriDifs
        </Link>

        <button
          type="button"
          className="navbar-toggler"
          aria-controls="menu-principal"
          aria-expanded={menuAbierto}
          aria-label="Abrir o cerrar el menú"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          id="menu-principal"
          className={`collapse navbar-collapse${menuAbierto ? " show" : ""}`}
        >
          <nav
            className="navbar-nav mx-xl-auto"
            aria-label="Navegación principal"
          >
            {ENLACES.map((enlace) => (
              <NavLink
                key={enlace.ruta}
                to={enlace.ruta}
                end={enlace.ruta === "/"}
                className="nav-link"
                onClick={cerrarMenu}
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
                  <Link
                    className="profile-link"
                    to="/perfil"
                    onClick={cerrarMenu}
                  >
                    Mi perfil
                  </Link>
                  {sesion.role !== "Cliente" && (
                    <Link
                      className="profile-link"
                      to={destinoSegunRol(sesion.role)}
                      onClick={cerrarMenu}
                    >
                      Panel
                    </Link>
                  )}
                  <button
                    type="button"
                    className="logout-button"
                    onClick={salir}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="profile-link"
                    to="/login"
                    onClick={cerrarMenu}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    className="profile-link"
                    to="/registro"
                    onClick={cerrarMenu}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </span>

            <Link
              className="carrito-compras"
              to="/carrito"
              aria-label={`Carrito, ${cantidadTotal} productos`}
              onClick={cerrarMenu}
            >
              Carrito <span className="cart-counter">{cantidadTotal}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
