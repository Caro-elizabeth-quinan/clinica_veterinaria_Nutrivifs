import { Link } from "react-router-dom";

// Ruta que no existe.
export default function NoEncontrada() {
  return (
    <main>
      <section className="page-banner page-banner--productos">
        <div className="container">
          <span className="page-banner-kicker">Error 404</span>
          <h1>Página no encontrada</h1>
          <p>La dirección que buscas no existe o cambió de lugar.</p>
        </div>
      </section>

      <section className="container" style={{ padding: "2rem 0 4rem" }}>
        <Link to="/" className="btn-primary">
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
