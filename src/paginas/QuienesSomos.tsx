import { Link } from "react-router-dom";
import { ListaContacto, MapaClinica } from "../componentes/DatosClinica";

// Documentos legales que se enlazan al final de la página.
const DOCUMENTOS_LEGALES = [
  {
    ruta: "/terminos",
    icono: "bi-file-earmark-text-fill",
    titulo: "Términos y condiciones",
    descripcion:
      "Uso del sitio, cuentas, compras, medios de pago, devoluciones y medicamentos.",
  },
  {
    ruta: "/privacidad",
    icono: "bi-shield-lock-fill",
    titulo: "Política de privacidad",
    descripcion:
      "Qué datos recopilamos, para qué los usamos, dónde se guardan y tus derechos.",
  },
];

// Página "Quiénes somos": historia, misión, visión, valores, equipo,
// ubicación e información legal.
export default function QuienesSomos() {
  return (
    <main>
      <section className="quienes-somos-hero">
        <div className="container quienes-somos-hero-layout">
          <div className="quienes-somos-hero-content">
            <span className="quienes-somos-kicker">Nuestra historia</span>
            <h1>Quiénes somos</h1>
            <p>
              En Clinica NutriDifs cuidamos la salud, el bienestar y la calidad
              de vida de tus mascotas con atención profesional, cercana y
              responsable.
            </p>
          </div>
          <div className="quienes-somos-hero-image">
            <img
              src="/img/perro-gato.jpg"
              alt="Perro y gato en Clínica NutriDifs"
            />
          </div>
        </div>
      </section>
      <section className="about-section">
        <div className="container about-layout">
          <div className="about-intro">
            <h2>Compromiso con el bienestar animal</h2>
            <p>
              Somos una clínica veterinaria dedicada a brindar atención integral
              a cada mascota, con un enfoque humano, profesional y cercano.
              Entendemos que cada animal es un miembro más de la familia y por
              eso cuidamos cada detalle con cariño y responsabilidad.
            </p>
            <p>
              En Clinica NutriDifs combinamos experiencia, ética y amor por los
              animales para ofrecer soluciones seguras, eficaces y orientadas al
              bienestar real de cada paciente.
            </p>
          </div>
          <div className="about-visual">
            <img
              src="/img/cuidado.jpg"
              alt="Equipo de Clinica NutriDifs cuidando con cariño a una mascota"
            />
          </div>
        </div>
      </section>
      <section className="values-section">
        <div className="container">
          <h2>Nuestra misión, visión y valores</h2>
          <div className="values-grid">
            <article className="value-card">
              <img
                className="card-image"
                src="/img/consulta-general.jpg"
                alt="Veterinaria examinando a un perro"
              />
              <h3>Misión</h3>
              <p>
                Brindar atención veterinaria de calidad, con calidez, ética y un
                enfoque preventivo, para mejorar la vida de cada mascota y la
                tranquilidad de sus familias.
              </p>
            </article>
            <article className="value-card">
              <img
                className="card-image"
                src="/img/ecografia.jpg"
                alt="Ecografía a un perro en la clínica"
              />
              <h3>Visión</h3>
              <p>
                Ser una clínica referente en bienestar animal, reconocida por su
                dedicación, confianza y cuidado integral en cada etapa de la
                vida de las mascotas.
              </p>
            </article>
            <article className="value-card">
              <img
                className="card-image"
                src="/img/señales.jpg"
                alt="Veterinaria junto a un gato y un perro"
              />
              <h3>Valores</h3>
              <p>
                Amor por los animales, honestidad, responsabilidad, atención
                personalizada y compromiso con la salud y el bienestar.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="features-section">
        <div className="container">
          <h2>¿Por qué elegirnos?</h2>
          <div className="features-grid">
            <article className="feature-card">
              <span className="feature-card-icon" aria-hidden="true">
                🤝
              </span>
              <h3>Atención personalizada</h3>
              <p>
                Cada mascota recibe un trato cercano y adaptado a sus
                necesidades, hábitos y condición de salud.
              </p>
            </article>
            <article className="feature-card">
              <span className="feature-card-icon" aria-hidden="true">
                🩺
              </span>
              <h3>Equipo comprometido</h3>
              <p>
                Trabajamos con profesionalismo y sensibilidad para cuidar a cada
                animal con responsabilidad y dedicación.
              </p>
            </article>
            <article className="feature-card">
              <span className="feature-card-icon" aria-hidden="true">
                💚
              </span>
              <h3>Bienestar integral</h3>
              <p>
                Promovemos la prevención y el cuidado completo para que tus
                mascotas vivan mejor y más felices.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="team-section">
        <div className="container">
          <h2>Conoce a nuestro equipo</h2>
          <div className="team-grid">
            <article className="team-card">
              <img
                className="card-image"
                src="/img/evaluacion.jpg"
                alt="Veterinario evaluando a un perro"
              />
              <h3>Veterinarios</h3>
              <p>
                Especialistas dedicados a la valoración, diagnóstico y cuidado
                de la salud de tus mascotas con enfoque profesional y humano.
              </p>
            </article>
            <article className="team-card">
              <img
                className="card-image"
                src="/img/consultas.jpg"
                alt="Atención cercana a una mascota y su dueña"
              />
              <h3>Atención</h3>
              <p>
                Un equipo amable y atento que acompaña a cada familia con
                información clara, respeto y buena disposición.
              </p>
            </article>
            <article className="team-card">
              <img
                className="card-image"
                src="/img/procedimiento.jpg"
                alt="Control de salud a un perro"
              />
              <h3>Cuidado integral</h3>
              <p>
                Buscamos crear una experiencia segura y cercana para que tus
                mascotas reciban la atención que merecen.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <div>
              <h2>Tu mascota merece una atención con cariño</h2>
              <p>
                En Clinica NutriDifs estamos para cuidar a tu compañero de
                cuatro patas con responsabilidad, confianza y amor.
              </p>
            </div>
            <Link to="/consultas" className="cta-button">
              Agenda tu consulta
            </Link>
          </div>
        </div>
      </section>
      <section className="location-section" aria-labelledby="location-title">
        <div className="container">
          <div className="location-card">
            <div className="location-info">
              <h2 id="location-title">Dónde encontrarnos</h2>
              <p>Visítanos y recibe atención profesional para tu mascota.</p>
              <ListaContacto />
            </div>
            <div className="location-map">
              <MapaClinica />
            </div>
          </div>
        </div>
      </section>

      <section className="legal-section" aria-labelledby="legal-titulo">
        <div className="container">
          <h2 id="legal-titulo">Información legal</h2>
          <p className="legal-intro">
            Conoce las reglas de uso del sitio y cómo cuidamos tus datos.
          </p>
          <div className="row g-4">
            {DOCUMENTOS_LEGALES.map((documento) => (
              <div key={documento.ruta} className="col-12 col-md-6">
                <Link to={documento.ruta} className="legal-card">
                  <i className={`bi ${documento.icono}`} aria-hidden="true" />
                  <div>
                    <h3>{documento.titulo}</h3>
                    <p>{documento.descripcion}</p>
                    <span>
                      Leer documento{" "}
                      <i className="bi bi-arrow-right" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
