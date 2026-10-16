import { Link } from "react-router-dom";
import type { SeccionTerminos } from "../datos/sitio";
import BannerPagina from "./BannerPagina";

interface Props {
  titulo: string;
  texto: string;
  fecha: string;
  secciones: SeccionTerminos[];
  // Enlace al otro documento legal (términos ↔ privacidad).
  relacionado: { texto: string; ruta: string };
}

// Plantilla de los documentos legales (Términos y condiciones y Política de
// privacidad): banner, índice lateral y secciones. El índice y el contenido
// salen del mismo arreglo de secciones.
export default function DocumentoLegal({
  titulo,
  texto,
  fecha,
  secciones,
  relacionado,
}: Props) {
  return (
    <main>
      <BannerPagina
        variante="contacto"
        etiqueta="Información legal"
        titulo={titulo}
        texto={texto}
        idTitulo="documento-titulo"
      />

      <section
        className="container terminos-page"
        aria-labelledby="documento-titulo"
      >
        <div className="row g-4">
          {/* <aside> y no <nav>: el estilo global de nav es para el menú. */}
          <aside className="col-12 col-lg-3" aria-label={`Índice de ${titulo}`}>
            <div className="terminos-indice">
              <h2 className="h6">Contenido</h2>
              <ol>
                {secciones.map((seccion) => (
                  <li key={seccion.id}>
                    <a href={`#${seccion.id}`}>
                      {seccion.titulo.replace(/^\d+\.\s*/, "")}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div className="col-12 col-lg-9">
            <div className="terminos-contenido">
              <p className="terminos-fecha">Última actualización: {fecha}</p>

              {secciones.map((seccion) => (
                <section key={seccion.id} id={seccion.id}>
                  <h2>{seccion.titulo}</h2>
                  {seccion.parrafos.map((parrafo) => (
                    <p key={parrafo.slice(0, 40)}>{parrafo}</p>
                  ))}
                </section>
              ))}

              <p className="alert alert-light mb-0">
                Sitio desarrollado como proyecto académico (DSY1104). Las
                compras y los pagos son simulados.
              </p>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <Link to={relacionado.ruta} className="btn-primary">
                  {relacionado.texto}
                </Link>
                <Link to="/" className="btn-secondary">
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
