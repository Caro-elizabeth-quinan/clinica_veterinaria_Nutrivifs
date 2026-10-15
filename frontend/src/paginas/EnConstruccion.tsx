import { Link } from "react-router-dom";

// Página temporal para las rutas que todavía no se migran a React.
export default function EnConstruccion({ titulo }: { titulo: string }) {
  return (
    <main>
      <section className="page-banner page-banner--productos">
        <div className="container">
          <span className="page-banner-kicker">En migración</span>
          <h1>{titulo}</h1>
          <p>Esta vista aún no se migra a React. Llegará en un próximo paso.</p>
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
