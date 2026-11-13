import { useEffect, useState } from "react";
import BannerPagina from "../componentes/BannerPagina";
import TarjetaProducto from "../componentes/TarjetaProducto";
import { obtenerCategoriasApi } from "../servicios/categorias";
import { obtenerProductosApi } from "../servicios/catalogo";
import type { Producto } from "../tipos";

const RANGOS_PRECIO = [
  { valor: "todos", texto: "Todos los precios", min: 0, max: Infinity },
  { valor: "0-5000", texto: "Hasta $5.000", min: 0, max: 5000 },
  { valor: "5001-10000", texto: "$5.001 - $10.000", min: 5001, max: 10000 },
  { valor: "10001-20000", texto: "$10.001 - $20.000", min: 10001, max: 20000 },
  { valor: "20001-mas", texto: "Más de $20.000", min: 20001, max: Infinity },
];

// Catálogo de productos con filtros por categoría y por precio.
export default function Productos() {
  const [categoria, setCategoria] = useState("todos");
  const [rango, setRango] = useState("todos");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Carga productos y categorías desde el backend al abrir la página
  useEffect(() => {
    async function cargarDatos() {
      try {
        const [prods, cats] = await Promise.all([
          obtenerProductosApi(),
          obtenerCategoriasApi(),
        ]);
        setProductos(prods);
        setCategorias(cats.map((c) => c.nombre));
      } catch (e) {
        console.error("Error al cargar productos:", e);
        setError("No se pudo conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  const limites = RANGOS_PRECIO.find((item) => item.valor === rango)!;

  const visibles = productos.filter(
    (producto) =>
      (categoria === "todos" || producto.category === categoria) &&
      producto.price >= limites.min &&
      producto.price <= limites.max,
  );

  return (
    <main>
      <BannerPagina
        variante="productos"
        etiqueta="Tienda veterinaria"
        titulo="Nuestros productos"
        texto="Medicamentos, vacunas, antiparasitarios y suplementos para la salud de tu mascota."
        idTitulo="products-title"
      />

      <section
        className="products-page container"
        aria-labelledby="products-title"
      >
        <div className="filter-section">
          <h2>Filtrar por Categoría</h2>

          <div className="filter-buttons">
            {["todos", ...categorias].map((opcion) => (
              <button
                key={opcion}
                type="button"
                className={`filter-btn${categoria === opcion ? " active" : ""}`}
                onClick={() => setCategoria(opcion)}
              >
                {opcion === "todos" ? "Todos" : opcion}
              </button>
            ))}
          </div>

          <div className="price-filter">
            <label htmlFor="price-filter">Filtrar por precio</label>
            <select
              id="price-filter"
              value={rango}
              onChange={(evento) => setRango(evento.target.value)}
            >
              {RANGOS_PRECIO.map((item) => (
                <option key={item.valor} value={item.valor}>
                  {item.texto}
                </option>
              ))}
            </select>
          </div>

          <p className="filter-result" aria-live="polite">
            {visibles.length} producto{visibles.length === 1 ? "" : "s"}{" "}
            encontrado{visibles.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="products-catalog">
          <div className="catalogo-header">
            <h2>Catálogo Farmacéutico Veterinario</h2>
            <p>
              Encuentra medicamentos, antiparasitarios y vacunas certificadas
              para tus mascotas.
            </p>
          </div>

                   {cargando && (
            <div className="d-flex justify-content-center align-items-center gap-3 py-4" role="status">
              <div className="spinner-border text-primary" aria-hidden="true" />
              <span>Cargando productos...</span>
            </div>
          )}

          {error && <p className="alert alert-danger mt-3">{error}</p>}

          {!cargando && !error && (
            <>
              {/* Grilla Bootstrap: 1 columna en móvil, 2 en tablet y 3 en escritorio. */}
              <div
                className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4"
                id="products-grid"
              >
                {visibles.map((producto) => (
                  <div className="col" key={producto.id}>
                    <TarjetaProducto producto={producto} />
                  </div>
                ))}
              </div>

              {visibles.length === 0 && (
                <p className="alert alert-info mt-3">
                  No hay productos que coincidan con los filtros elegidos.
                </p>
              )}
            </>
          )}
        </div>

        <div className="products-introduction">
          <img
            className="products-introduction-image"
            src="/img/vacunas.jpg"
            alt="Perro recibiendo una vacuna en la clínica"
          />
          <span className="products-label"> Clínica NutriDifs </span>

          <h2 className="products-title">Calidad para quienes más quieres</h2>

          <p>
            En nuestra clínica tenemos los mejores productos para la salud y
            bienestar de tus mascotas, todos de la mejor calidad y con los
            precios más competitivos del mercado.
          </p>

          <p>
            Nuestro catálogo de productos veterinarios incluye medicamentos,
            vacunas, antiparasitarios y suplementos nutricionales seleccionados
            para satisfacer las necesidades de tu compañero peludo.
          </p>

          <div className="products-info">
            <div className="products-info-item">
              <strong>Calidad</strong>
              <span>Productos seleccionados</span>
            </div>
            <div className="products-info-item">
              <strong>Variedad</strong>
              <span>Opciones para tu mascota</span>
            </div>
            <div className="products-info-item">
              <strong>Bienestar</strong>
              <span>Cuidado responsable</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
