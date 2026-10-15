import { Link } from "react-router-dom";

// Artículo 2 del blog.
export default function ArticuloBlog2() {
  return (
    <main>
      <article className="container blog-detail">
        <nav className="breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Inicio</Link> › <Link to="/blog">Blog</Link> ›{" "}
          <span>Señales de alarma que no debes ignorar</span>
        </nav>
        <span className="post-tag">Salud</span>
        <h1>Señales de alarma que no debes ignorar</h1>
        <p className="blog-detail-meta">
          Equipo Clínica NutriDifs · 5 de abril de 2026
        </p>
        <img
          className="blog-detail-image"
          src="/img/señales.jpg"
          alt="Señales de alerta en la salud de una mascota"
        />
        <p>
          Las mascotas no pueden decirnos qué les duele, pero su cuerpo y su
          conducta entregan pistas. Detectarlas a tiempo marca la diferencia
          entre un tratamiento simple y una urgencia. Estas son las señales que,
          en nuestra experiencia, más conviene consultar.
        </p>
        <h2>1. Cambios en el apetito o en la sed</h2>
        <p>
          Dejar de comer por más de un día, o tomar mucha más agua de lo
          habitual, puede indicar desde un problema dental hasta una enfermedad
          renal o diabetes.
        </p>
        <h2>2. Pérdida de energía</h2>
        <p>
          Si tu mascota duerme más, evita jugar o se esconde, algo le molesta.
          En gatos, esconderse es una de las señales más frecuentes de dolor.
        </p>
        <h2>3. Vómitos o diarrea frecuentes</h2>
        <p>
          Un episodio aislado no suele ser grave. Si se repite por más de 24
          horas, o viene acompañado de sangre o decaimiento, requiere atención
          el mismo día.
        </p>
        <h2>4. Cojera o dificultad para moverse</h2>
        <p>
          Rechazar las escaleras, levantarse con esfuerzo o lamerse una pata de
          forma insistente son señales de dolor articular o de una lesión.
        </p>
        <h2>5. Cambios en el comportamiento</h2>
        <p>
          Agresividad repentina, desorientación o maullidos y ladridos fuera de
          lo normal merecen una evaluación, sobre todo en animales mayores.
        </p>
        <p>
          Ante cualquiera de estas señales, solicita una{" "}
          <Link to="/consultas">consulta de urgencia</Link> o escríbenos desde
          la página de <Link to="/contacto">contacto</Link>.
        </p>
        <div className="blog-detail-footer">
          <Link to="/blog" className="btn-secondary">
            ← Volver al blog
          </Link>{" "}
          <Link to="/blog/1" className="btn-primary">
            Siguiente: Alimentación según la edad
          </Link>
        </div>
      </article>
    </main>
  );
}
