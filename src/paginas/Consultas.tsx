import BannerPagina from "../componentes/BannerPagina";
import TarjetaServicio from "../componentes/TarjetaServicio";
import { CATEGORIAS_SERVICIO } from "../datos/servicios";

// Listado de servicios por categoría. Cada servicio es una <TarjetaServicio>,
// con su resumen desplegable y el botón "Agendar" (tipo preseleccionado).
export default function Consultas() {
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
                <TarjetaServicio key={servicio.codigo} servicio={servicio} />
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
