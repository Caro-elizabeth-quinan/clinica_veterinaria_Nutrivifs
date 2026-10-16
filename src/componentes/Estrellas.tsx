interface Props {
  // Valor entre 0 y 5; admite medias estrellas (ej: 4.5).
  valor: number;
  // Texto para lectores de pantalla.
  etiqueta?: string;
}

// Muestra la puntuación con estrellas llenas, medias y vacías.
export default function Estrellas({ valor, etiqueta }: Props) {
  const redondeado = Math.round(valor * 2) / 2;

  return (
    <span
      className="estrellas"
      role="img"
      aria-label={etiqueta ?? `${valor} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((posicion) => {
        const clase =
          redondeado >= posicion
            ? "bi-star-fill"
            : redondeado >= posicion - 0.5
              ? "bi-star-half"
              : "bi-star";
        return (
          <i key={posicion} className={`bi ${clase}`} aria-hidden="true" />
        );
      })}
    </span>
  );
}
