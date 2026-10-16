import {
  RECOMENDACIONES_CATEGORIA,
  RECOMENDACIONES_GENERALES,
  RESUMEN_PRODUCTOS,
} from "../datos/resumenes";
import type { Producto } from "../tipos";

// Resumen informativo del producto: para qué sirve, indicaciones y
// recomendaciones. Si el producto no tiene resumen propio (por ejemplo, uno
// creado desde el panel), se usa su descripción y las recomendaciones de su
// categoría.
export default function ResumenProducto({ producto }: { producto: Producto }) {
  const info = RESUMEN_PRODUCTOS[producto.id];
  const recomendaciones =
    RECOMENDACIONES_CATEGORIA[producto.category] ?? RECOMENDACIONES_GENERALES;

  const bloques = [
    {
      icono: "bi-info-circle-fill",
      titulo: "Para qué sirve",
      contenido: [
        info?.resumen ||
          producto.description ||
          "Producto veterinario de la clínica.",
      ],
    },
    {
      icono: "bi-clipboard2-check-fill",
      titulo: "Indicaciones",
      contenido: info?.indicaciones ?? [
        `Uso en ${producto.species || "mascotas"}`,
      ],
    },
    {
      icono: "bi-lightbulb-fill",
      titulo: "Recomendaciones",
      contenido: recomendaciones,
    },
  ];

  return (
    <section className="resumen-producto" aria-labelledby="resumen-titulo">
      <h2 id="resumen-titulo">Resumen del producto</h2>
      <div className="row g-3">
        {bloques.map((bloque) => (
          <div key={bloque.titulo} className="col-12 col-md-4">
            <div className="resumen-bloque">
              <h3>
                <i className={`bi ${bloque.icono}`} aria-hidden="true" />
                {bloque.titulo}
              </h3>
              {bloque.contenido.length === 1 ? (
                <p>{bloque.contenido[0]}</p>
              ) : (
                <ul>
                  {bloque.contenido.map((linea) => (
                    <li key={linea}>{linea}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="resumen-aviso">
        <i className="bi bi-exclamation-circle me-1" aria-hidden="true" />
        Información referencial. La dosis y la duración del tratamiento las
        indica siempre el médico veterinario.
      </p>
    </section>
  );
}
