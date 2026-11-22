import BannerPagina from "../componentes/BannerPagina";
import TarjetaServicio from "../componentes/TarjetaServicio";
import { useCategoriasServicio } from "../hooks/useCategoriasServicio";

// Listado de servicios por categoría (GET /api/v1/servicios). Cada servicio es
// una <TarjetaServicio>, con su resumen desplegable y el botón "Agendar".
export default function Consultas() {
  const { categorias, cargando, error } = useCategoriasServicio();

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
        {cargando && <p>Cargando servicios…</p>}
        {error && (
          <p className="text-danger" role="alert">
            {error}
          </p>
        )}

        {categorias.map((categoria) => (
          <section
            key={categoria.id}
            className={categoria.clase}
            aria-labelledby={categoria.id}
          >
            <h2 id={categoria.id}>{categoria.titulo}</h2>

            <div className="services-grid consultas-grid">
              {categoria.servicios.map((servicio) => (
                <TarjetaServicio key={servicio.codigo} servicio={servicio} />
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}