import { HORARIOS, HORARIO_RESUMEN, TELEFONO_URGENCIAS } from "../datos/sitio";

// se agrego un apartado de atencion de 24 para generalizar las atenciones de ufergencias
//  todas las atenciones tienen que estar en el horario de atencion, y si no lo estan, se tiene que mostrar un mensaje de error
export default function HorarioAtencion() {
  // "tel:" no admite espacios.
  const telefono = TELEFONO_URGENCIAS.replace(/\s/g, "");

  return (
    <section className="horario-atencion" aria-labelledby="horario-titulo">
      <div className="row g-4 align-items-center">
        <div className="col-12 col-lg-5">
          <span className="horario-estado">
            <span className="horario-punto" aria-hidden="true" /> Abierto ahora
          </span>
          <div className="horario-titulo">
            <span className="horario-247" aria-hidden="true">
              24/7
            </span>
            <div>
              <h2 id="horario-titulo">Horario de atención</h2>
              <p>{HORARIO_RESUMEN}, incluidos feriados.</p>
            </div>
          </div>
          <a className="horario-llamar" href={`tel:${telefono}`}>
            <i className="bi bi-telephone-forward-fill" aria-hidden="true" />
            Urgencias: {TELEFONO_URGENCIAS}
          </a>
        </div>

        <div className="col-12 col-lg-7">
          <ul className="row g-3 horario-bloques">
            {HORARIOS.map((bloque) => (
              <li key={bloque.titulo} className="col-12 col-md-4">
                <div className="horario-bloque">
                  <i className={`bi ${bloque.icono}`} aria-hidden="true" />
                  <strong>{bloque.titulo}</strong>
                  <span className="horario-dias">{bloque.dias}</span>
                  <small>{bloque.detalle}</small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
