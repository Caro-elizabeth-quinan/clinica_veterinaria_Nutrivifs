interface Props {
  // Define la fotografía de fondo: consultas, productos, contacto o agendar.
  variante: "consultas" | "productos" | "contacto" | "agendar";
  etiqueta: string;
  titulo: string;
  texto: string;
  idTitulo?: string;
}

// Franja superior con fotografía que abre varias páginas de la tienda.
export default function BannerPagina(props: Props) {
  return (
    <section className={`page-banner page-banner--${props.variante}`}>
      <div className="container">
        <span className="page-banner-kicker">{props.etiqueta}</span>
        <h1 id={props.idTitulo}>{props.titulo}</h1>
        <p>{props.texto}</p>
      </div>
    </section>
  );
}
