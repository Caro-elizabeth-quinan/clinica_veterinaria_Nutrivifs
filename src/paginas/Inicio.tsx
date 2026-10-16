import { Link } from "react-router-dom";
import PreguntasFrecuentes from "../componentes/PreguntasFrecuentes";
import TarjetaDestacada from "../componentes/TarjetaDestacada";
import { CLAVES, leerLista } from "../servicios/almacenamiento";
import { obtenerProductos } from "../servicios/catalogo";
import type { IntegranteEquipo } from "../tipos";
import { iniciales } from "../utils/formato";

const BENEFICIOS = [
  { icono: "🐾", texto: "Atención profesional para tu mascota" },
  { icono: "💊", texto: "Medicamentos y vacunas certificadas" },
  { icono: "🛡️", texto: "Equipamiento moderno y seguro" },
  { icono: "🏠", texto: "Atención a domicilio" },
  { icono: "🔒", texto: "Compra segura" },
];

const SERVICIOS_DOMICILIO = [
  "Consulta veterinaria a domicilio",
  "Toma de muestras",
  "Aplicación de medicamentos",
  "Atención personalizada para tu mascota",
];

export default function Inicio() {
  const destacados = obtenerProductos().slice(0, 8);
  const equipo = leerLista<IntegranteEquipo>(CLAVES.EQUIPO).filter(
    (integrante) => integrante.status !== "Inactivo",
  );

  return (
    <main>
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="container home-hero-content">
          <div className="home-hero-text">
            <span className="home-hero-kicker">
              Bienvenidos a Clínica NutriDifs
            </span>

            <h1 id="hero-title">
              Todo lo que tu mascota <em>merece</em>
            </h1>

            <p>
              Atención veterinaria, medicamentos, vacunas y suplementos para
              perros y gatos. Porque su salud también es la nuestra.
            </p>

            <div className="hero-buttons">
              <Link to="/productos" className="btn-primary">
                Ver productos &rarr;
              </Link>
              <Link to="/consultas" className="btn-secondary">
                Agenda tu hora
              </Link>
            </div>
          </div>
        </div>

        <ul className="container home-hero-features">
          {BENEFICIOS.map((beneficio) => (
            <li key={beneficio.texto}>
              <span className="benefit-icon" aria-hidden="true">
                {beneficio.icono}
              </span>
              {beneficio.texto}
            </li>
          ))}
        </ul>
      </section>

      <section className="featured-products">
        <div className="container">
          <div className="products-heading">
            <div>
              <span> TIENDA VETERINARIA </span>
              <h2>Productos destacados</h2>
            </div>
            <Link to="/productos" className="btn-ver-todos">
              Ver todos los productos
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
            {destacados.map((producto) => (
              <div className="col" key={producto.id}>
                <TarjetaDestacada producto={producto} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container home-banner" aria-labelledby="banner-title">
        <div className="home-banner-text">
          <h2 id="banner-title">Mascotas felices, familias más felices</h2>
          <Link to="/quienes-somos" className="home-banner-link">
            Conoce más &rarr;
          </Link>
        </div>
      </section>

      <section className="home-care">
        <div className="container home-care-content">
          <div className="home-care-image">
            <img
              src="/img/procedimiento.jpg"
              alt="Veterinario realizando atención a domicilio"
            />
          </div>

          <div className="home-care-text">
            <span className="home-care-label"> ATENCIÓN A DOMICILIO </span>

            <h2>La atención que tu mascota necesita, sin salir de casa</h2>

            <p>
              Sabemos que trasladar a tu mascota puede ser estresante. Por eso,
              llevamos nuestros servicios veterinarios hasta tu hogar,
              entregando una atención cómoda, segura y personalizada.
            </p>

            <ul className="custom-list">
              {SERVICIOS_DOMICILIO.map((servicio) => (
                <li key={servicio}>
                  <span>✓</span>
                  {servicio}
                </li>
              ))}
            </ul>

            <Link to="/contacto" className="btn-primary">
              Solicitar atención
            </Link>
          </div>
        </div>
      </section>

      <section className="home-users" aria-labelledby="home-users-title">
        <div className="container">
          <div className="home-users-heading">
            <span> EL EQUIPO </span>
            <h2 id="home-users-title">
              Personas que hacen posible nuestra atención
            </h2>
            <p>Conoce a los integrantes activos de Clínica NutriDifs.</p>
          </div>

          <div className="home-users-grid row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 justify-content-center">
            {equipo.map((integrante) => (
              <div className="col" key={integrante.id}>
                <article className="team-card h-100">
                  {integrante.foto ? (
                    <img
                      className="avatar avatar-foto"
                      src={integrante.foto}
                      alt={`Foto de ${integrante.name}`}
                    />
                  ) : (
                    <div className="avatar" aria-hidden="true">
                      {iniciales(integrante.name)}
                    </div>
                  )}
                  <h3>{integrante.name}</h3>
                  <p className="role">{integrante.role || "Equipo clínico"}</p>
                  <p className="email">{integrante.email}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PreguntasFrecuentes />
    </main>
  );
}
