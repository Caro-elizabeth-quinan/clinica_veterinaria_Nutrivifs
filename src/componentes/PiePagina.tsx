import { Link } from "react-router-dom";
import { CLINICA, MEDIOS_PAGO, REDES_SOCIALES } from "../datos/sitio";

export default function PiePagina() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4 footer-content">
          <div className="col-12 col-md-6 col-lg-4">
            <h2>Clínica NutriDifs</h2>
            <p>Cuidamos la salud y bienestar de tus mascotas.</p>
            <p>Teléfono: {CLINICA.telefono}</p>
            <p className="footer-horario">
              <i className="bi bi-clock-history me-1" aria-hidden="true" />
              Abierto 24/7 · Urgencias sin hora previa
            </p>
            <p>
              <a href={`mailto:${CLINICA.correo}`}>{CLINICA.correo}</a>
            </p>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h2>Integrantes</h2>
            <ul>
              <li>Carolina Quinan</li>
              <li>Liza Micele</li>
              <li>Benatha Louime</li>
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h2>Síguenos</h2>
            <ul className="footer-social">
              {REDES_SOCIALES.map((red) => (
                <li key={red.nombre}>
                  <a href={red.url} target="_blank" rel="noopener noreferrer">
                    <span className="footer-social-icon" aria-hidden="true">
                      <i className={`bi ${red.icono}`} />
                    </span>
                    {red.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 col-lg-4">
            <h2>Medios de pago</h2>
            <ul className="footer-payments">
              {MEDIOS_PAGO.map((medio) => (
                <li key={medio.nombre} title={medio.detalle}>
                  <i className={`bi ${medio.icono} me-1`} aria-hidden="true" />
                  {medio.nombre}
                </li>
              ))}
            </ul>
            <p className="footer-note">
              Efectivo solo al retirar en la clínica.
            </p>
            <h2 className="mt-3">Sección</h2>
            <p>DSY1104 – 2026</p>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© 2026 Clínica NutriDifs. Todos los derechos reservados.</p>
        <span className="footer-legal">
          <Link to="/terminos">Términos y condiciones</Link>
          <Link to="/privacidad">Política de privacidad</Link>
        </span>
      </div>
    </footer>
  );
}
