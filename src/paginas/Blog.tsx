import { Link } from "react-router-dom";

// Listado de artículos del blog.
export default function Blog() {
  return (
    <main>
      <section className="blog-hero">
        <div className="container blog-hero-content">
          <span className="blog-label">Clinica NutriDifs</span>
          <h1>Blog de bienestar animal</h1>
          <p>
            Consejos, información útil y recomendaciones para cuidar mejor a tus
            mascotas en cada etapa de su vida.
          </p>
        </div>
      </section>
      <section className="container blog-main">
        <article className="featured-post">
          <img
            className="featured-image"
            src="/img/dieta-salud.jpg"
            alt="Dieta saludable para perros"
          />
          <div className="featured-content">
            <span className="post-tag">Nutrición</span>
            <h2>Cómo mejorar la alimentación de tu perro según su edad</h2>
            <p>
              La dieta ideal cambia con el crecimiento, la actividad física y el
              estado de salud. Conocer estas diferencias ayuda a prevenir
              problemas digestivos y mantener un peso saludable.
            </p>
            <Link to="/blog/1" className="read-more">
              Leer artículo
            </Link>
          </div>
        </article>
        <article className="featured-video">
          <span className="post-tag">Video recomendado</span>
          <h2>Guía de nutrición esencial para perros y gatos</h2>
          <p>
            Un repaso en video sobre los principios básicos de una alimentación
            correcta para tu mascota, a cargo de especialistas en salud animal.
          </p>
          <div className="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/veXJ8zoQoag"
              title="Alimentación Correcta para Mascotas: Guía de Nutrición Esencial para Perros y Gatos"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture;
              "
              allowFullScreen
            ></iframe>
          </div>
        </article>
        <div className="blog-grid">
          <article className="blog-card">
            <img
              className="blog-card-image"
              src="/img/señales.jpg"
              alt="Señales de alerta en la salud de una mascota"
            />
            <div className="blog-card-content">
              <span className="post-tag">Salud</span>
              <h3>Señales de alarma que no debes ignorar</h3>
              <p>
                Aprende a detectar cambios en el comportamiento, apetito o
                energía de tu mascota.
              </p>
              <Link to="/blog/2">Leer más</Link>
            </div>
          </article>
          <article className="blog-card">
            <img
              className="blog-card-image"
              src="/img/cuidado.jpg"
              alt="Cuidado e higiene del pelaje de una mascota"
            />
            <div className="blog-card-content">
              <span className="post-tag">Higiene</span>
              <h3>Baño y cuidado del pelaje: guía rápida</h3>
              <p>
                Tips para mantener la piel y el pelo sanos sin excesos ni
                irritaciones.
              </p>
              <a href="#">Leer más</a>
            </div>
          </article>
          <article className="blog-card">
            <img
              className="blog-card-image"
              src="/img/vacunas.jpg"
              alt="Vacunación preventiva de una mascota"
            />
            <div className="blog-card-content">
              <span className="post-tag">Prevención</span>
              <h3>Vacunas: ¿cuándo y por qué son esenciales?</h3>
              <p>
                Conoce la importancia del calendario de vacunas para proteger a
                tu mascota.
              </p>
              <a href="#">Leer más</a>
            </div>
          </article>
          <article className="blog-card">
            <img
              className="blog-card-image"
              src="/img/ejercicio.jpg"
              alt="Ejercicio y estimulación mental para mascotas"
            />
            <div className="blog-card-content">
              <span className="post-tag">Bienestar</span>
              <h3>Ejercicio y estimulación mental para gatos y perros</h3>
              <p>
                Actividades sencillas que mejoran su ánimo, salud y relación con
                tu familia.
              </p>
              <a href="#">Leer más</a>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
