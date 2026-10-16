import { Link } from "react-router-dom";

// Artículo 1 del blog.
export default function ArticuloBlog1() {
  return (
    <main>
      <article className="container blog-detail">
        <nav className="breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Inicio</Link> › <Link to="/blog">Blog</Link> ›{" "}
          <span>Cómo mejorar la alimentación de tu perro según su edad</span>
        </nav>
        <span className="post-tag">Nutrición</span>
        <h1>Cómo mejorar la alimentación de tu perro según su edad</h1>
        <p className="blog-detail-meta">
          Equipo Clínica NutriDifs · 12 de abril de 2026
        </p>
        <img
          className="blog-detail-image"
          src="/img/dieta-salud.jpg"
          alt="Dieta saludable para perros"
        />
        <p>
          La dieta ideal de un perro no es la misma durante toda su vida. Cambia
          con el crecimiento, el nivel de actividad física y el estado de salud.
          Conocer estas diferencias ayuda a prevenir problemas digestivos,
          mantener un peso saludable y alargar los años de buena calidad de
          vida.
        </p>
        <h2>Cachorros (hasta 12 meses)</h2>
        <p>
          Un cachorro crece rápido y necesita más energía y proteína por kilo
          que un adulto. Lo recomendable es un alimento formulado para
          cachorros, repartido en tres o cuatro raciones diarias. Las razas
          grandes requieren fórmulas específicas para que huesos y
          articulaciones se desarrollen a un ritmo adecuado.
        </p>
        <h2>Adultos (1 a 7 años)</h2>
        <p>
          En esta etapa el objetivo es mantener el peso. Dos raciones al día,
          medidas según la tabla del alimento y ajustadas a la actividad de tu
          perro, suelen ser suficientes. Los premios no deberían superar el 10%
          de las calorías diarias.
        </p>
        <h2>Seniors (desde los 7 años)</h2>
        <p>
          El metabolismo baja y aparecen molestias articulares. Un alimento
          senior, con menos calorías y con suplementos como omega 3 o
          condroitina, ayuda a mantenerlo activo. Es un buen momento para hacer
          un control veterinario cada seis meses.
        </p>
        <h2>Señales de que la dieta no está funcionando</h2>
        <ul className="custom-list">
          <li>
            <span>✓</span> Aumento o pérdida de peso sin explicación.
          </li>
          <li>
            <span>✓</span> Pelaje opaco o caída excesiva de pelo.
          </li>
          <li>
            <span>✓</span> Deposiciones blandas o vómitos frecuentes.
          </li>
          <li>
            <span>✓</span> Baja de energía o desinterés por la comida.
          </li>
        </ul>
        <p>
          Si notas alguna de estas señales, agenda una{" "}
          <Link to="/consultas">consulta general</Link> para revisar la dieta
          con uno de nuestros veterinarios.
        </p>
        <div className="blog-detail-footer">
          <Link to="/blog" className="btn-secondary">
            ← Volver al blog
          </Link>{" "}
          <Link to="/blog/2" className="btn-primary">
            Siguiente: Señales de alarma
          </Link>
        </div>
      </article>
    </main>
  );
}
