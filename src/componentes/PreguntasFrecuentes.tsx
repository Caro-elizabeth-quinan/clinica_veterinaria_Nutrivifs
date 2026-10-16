import { useState } from "react";
import { Link } from "react-router-dom";
import {
  PREGUNTAS_FRECUENTES,
  TEMAS_PREGUNTAS,
  type TemaPregunta,
} from "../datos/preguntas";
import { CLINICA } from "../datos/sitio";

// Preguntas frecuentes en acordeón: solo una respuesta abierta a la vez, y
// botones para filtrar por tema.
export default function PreguntasFrecuentes() {
  const [tema, setTema] = useState<TemaPregunta | "Todas">("Todas");
  const [abierta, setAbierta] = useState<string | null>(
    PREGUNTAS_FRECUENTES[0].id,
  );

  const visibles =
    tema === "Todas"
      ? PREGUNTAS_FRECUENTES
      : PREGUNTAS_FRECUENTES.filter((item) => item.tema === tema);

  const alternar = (id: string) => setAbierta(abierta === id ? null : id);

  return (
    <section className="home-faq" aria-labelledby="faq-titulo">
      <div className="container">
        <div className="home-users-heading faq-heading">
          <span>PREGUNTAS FRECUENTES</span>
          <h2 id="faq-titulo">¿Tienes dudas? Te ayudamos</h2>
          <p>Respuestas rápidas sobre consultas, compras y tu cuenta.</p>
        </div>

        <div className="faq-temas" role="group" aria-label="Filtrar por tema">
          {(["Todas", ...TEMAS_PREGUNTAS] as const).map((opcion) => (
            <button
              key={opcion}
              type="button"
              className={tema === opcion ? "activo" : undefined}
              aria-pressed={tema === opcion}
              onClick={() => setTema(opcion)}
            >
              {opcion}
            </button>
          ))}
        </div>

        <div className="faq-lista">
          {visibles.map((item) => {
            const estaAbierta = abierta === item.id;
            return (
              <article
                key={item.id}
                className={`faq-item${estaAbierta ? " abierta" : ""}`}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={estaAbierta}
                    aria-controls={`faq-${item.id}`}
                    onClick={() => alternar(item.id)}
                  >
                    <span>{item.pregunta}</span>
                    <i className="bi bi-plus-lg" aria-hidden="true" />
                  </button>
                </h3>
                {estaAbierta && (
                  <div id={`faq-${item.id}`} className="faq-respuesta">
                    <p>{item.respuesta}</p>
                    {item.enlace && (
                      <Link to={item.enlace.ruta}>{item.enlace.texto} →</Link>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <p className="faq-contacto">
          <i className="bi bi-chat-dots-fill" aria-hidden="true" />
          ¿No encontraste tu respuesta? <Link to="/contacto">Escríbenos</Link> o
          llámanos al {CLINICA.telefono}.
        </p>
      </div>
    </section>
  );
}
