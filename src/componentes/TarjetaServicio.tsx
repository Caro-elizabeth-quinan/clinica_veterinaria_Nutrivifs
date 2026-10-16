import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RESUMEN_SERVICIOS } from "../datos/resumenes";
import type { Servicio } from "../tipos";

// Tarjeta de un servicio de la página Consultas. "Ver qué incluye" muestra
// u oculta un breve resumen (estado local de cada tarjeta).
export default function TarjetaServicio({ servicio }: { servicio: Servicio }) {
  const navegar = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const resumen = RESUMEN_SERVICIOS[servicio.codigo];
  const rutaAgendar = `/agendar?consulta=${encodeURIComponent(servicio.consulta)}`;
  const idDetalle = `incluye-${servicio.codigo}`;

  return (
    <article className="service-card">
      <img src={servicio.imagen} alt={servicio.alt} className="service-image" />
      <span className="service-code">{servicio.codigo}</span>
      <h3>{servicio.nombre}</h3>
      <p>{servicio.descripcion}</p>
      <div className="service-details">
        <span>{servicio.especie}</span> <span>{servicio.duracion}</span>{" "}
        <strong>{servicio.precio}</strong>
      </div>
      <p className="service-observation">{servicio.observacion}</p>

      {resumen && (
        <>
          <button
            type="button"
            className="service-toggle"
            aria-expanded={abierto}
            aria-controls={idDetalle}
            onClick={() => setAbierto(!abierto)}
          >
            {abierto ? "Ocultar resumen" : "Ver qué incluye"}
            <i
              className={`bi bi-chevron-down${abierto ? " girado" : ""}`}
              aria-hidden="true"
            />
          </button>
          {abierto && (
            <div id={idDetalle} className="service-resumen">
              <p>{resumen.resumen}</p>
              <ul>
                {resumen.incluye.map((item) => (
                  <li key={item}>
                    <i className="bi bi-check2" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {servicio.enlace ? (
        <Link className="btn-agendar" to={rutaAgendar}>
          Agendar
        </Link>
      ) : (
        <button
          type="button"
          className="btn-agendar"
          onClick={() => navegar(rutaAgendar)}
        >
          Agendar
        </button>
      )}
    </article>
  );
}
