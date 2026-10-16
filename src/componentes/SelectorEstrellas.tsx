import { useState } from "react";

interface Props {
  valor: number;
  alCambiar: (valor: number) => void;
  invalido?: boolean;
}

const TEXTOS = ["", "Malo", "Regular", "Bueno", "Muy bueno", "Excelente"];

// Selector de 1 a 5 estrellas. Al pasar el mouse se previsualiza la
// puntuación (estado "resaltado") sin cambiar el valor elegido.
export default function SelectorEstrellas({
  valor,
  alCambiar,
  invalido,
}: Props) {
  const [resaltado, setResaltado] = useState(0);
  const mostrado = resaltado || valor;

  return (
    <div
      className={`selector-estrellas${invalido ? " selector-invalido" : ""}`}
      role="radiogroup"
      aria-label="Puntuación"
      onMouseLeave={() => setResaltado(0)}
    >
      {[1, 2, 3, 4, 5].map((estrella) => (
        <button
          key={estrella}
          type="button"
          role="radio"
          aria-checked={valor === estrella}
          aria-label={`${estrella} estrella${estrella === 1 ? "" : "s"}`}
          className={estrella <= mostrado ? "activa" : undefined}
          onMouseEnter={() => setResaltado(estrella)}
          onClick={() => alCambiar(estrella)}
        >
          <i
            className={`bi ${estrella <= mostrado ? "bi-star-fill" : "bi-star"}`}
            aria-hidden="true"
          />
        </button>
      ))}
      <span className="selector-texto">{TEXTOS[mostrado]}</span>
    </div>
  );
}
