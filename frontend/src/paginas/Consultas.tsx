import { Link, useNavigate } from "react-router-dom";
import BannerPagina from "../componentes/BannerPagina";
import { CATEGORIAS_SERVICIO } from "../datos/servicios";

// Listado de servicios por categoría. "Agendar" lleva al formulario con el
// tipo de consulta preseleccionado.
export default function Consultas() {
  const navegar = useNavigate();
  const rutaAgendar = (consulta: string) =>
    `/agendar?consulta=${encodeURIComponent(consulta)}`;

  return (
    <main>
      <BannerPagina
        variante="consultas"
        etiqueta="Atención veterinaria"
        titulo="Nuestras consultas"
        texto="Conoce nuestros servicios veterinarios, sus precios, duración y especies atendidas."
        idTitulo="consultas-title"
      />

      <section
        className="services-section container"
        aria-labelledby="consultas-title"
      >
        {CATEGORIAS_SERVICIO.map((categoria) => (
          <section
            key={categoria.id}
            className={categoria.clase}
            aria-labelledby={categoria.id}
          >
            <h2 id={categoria.id}>{categoria.titulo}</h2>

            <div className="services-grid consultas-grid">
              {categoria.servicios.map((servicio) => (
                <article className="service-card" key={servicio.codigo}>
                  <img
                    src={servicio.imagen}
                    alt={servicio.alt}
                    className="service-image"
                  />
                  <span className="service-code">{servicio.codigo}</span>
                  <h3>{servicio.nombre}</h3>
                  <p>{servicio.descripcion}</p>
                  <div className="service-details">
                    <span>{servicio.especie}</span>{" "}
                    <span>{servicio.duracion}</span>{" "}
                    <strong>{servicio.precio}</strong>
                  </div>
                  <p className="service-observation">{servicio.observacion}</p>
                  {servicio.enlace ? (
                    <Link
                      className="btn-agendar"
                      to={rutaAgendar(servicio.consulta)}
                    >
                      Agendar
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="btn-agendar"
                      onClick={() => navegar(rutaAgendar(servicio.consulta))}
                    >
                      Agendar
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
