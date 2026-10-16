import { CLINICA, HORARIO_RESUMEN } from "../datos/sitio";

// Piezas de "dónde estamos" que comparten Contacto y Quiénes somos.

// Dirección, teléfono y horario de la clínica.
export function ListaContacto() {
  const datos = [
    { icono: "📍", texto: CLINICA.direccion },
    { icono: "📞", texto: CLINICA.telefono },
    { icono: "🕘", texto: `${HORARIO_RESUMEN} · Urgencias 24/7` },
  ];

  return (
    <ul className="contacto-datos">
      {datos.map((dato) => (
        <li key={dato.icono}>
          <span aria-hidden="true">{dato.icono}</span> {dato.texto}
        </li>
      ))}
    </ul>
  );
}

// Mapa de Google con la ubicación de la clínica.
export function MapaClinica() {
  return (
    <iframe
      title={`Ubicación de ${CLINICA.nombre} en Google Maps`}
      src={CLINICA.mapa}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    ></iframe>
  );
}
