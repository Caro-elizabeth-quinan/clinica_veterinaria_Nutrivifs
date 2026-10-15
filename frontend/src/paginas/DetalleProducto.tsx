import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorCampo, { claseCampo } from "../componentes/ErrorCampo";
import TarjetaProducto from "../componentes/TarjetaProducto";
import { useCarrito } from "../contexto/CarritoContexto";
import { IMAGEN_POR_DEFECTO } from "../datos/productos";
import { buscarProducto, obtenerProductos } from "../servicios/catalogo";
import { formatearPrecio } from "../utils/formato";

// Detalle de un producto (/productos/ME001): datos, cantidad a agregar y
// productos relacionados.
export default function DetalleProducto() {
  const { codigo = "" } = useParams();
  const { cantidadDe, agregar } = useCarrito();
  const [cantidad, setCantidad] = useState("1");
  const [error, setError] = useState("");
  const [agregadas, setAgregadas] = useState(0);

  const producto = buscarProducto(codigo);

  if (!producto) {
    return (
      <main>
        <section className="container product-detail-page">
          <p className="detail-not-found">
            No encontramos el producto solicitado.{" "}
            <Link to="/productos">Volver al catálogo</Link>
          </p>
        </section>
      </main>
    );
  }

  const stock = Number(producto.stock) || 0;
  const enCarrito = cantidadDe(producto.id);
  const disponible = stock - enCarrito;

  const validar = (valor: string): string => {
    if (!/^\d+$/.test(valor.trim()) || Number(valor) < 1) {
      return "Ingresa una cantidad entera mayor o igual a 1.";
    }
    if (Number(valor) > disponible) {
      return `Solo puedes agregar ${disponible} unidad${disponible === 1 ? "" : "es"} más.`;
    }
    return "";
  };

  const cambiar = (valor: string) => {
    setCantidad(valor);
    setError(validar(valor));
    setAgregadas(0);
  };

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    const mensaje = validar(cantidad);
    setError(mensaje);
    if (mensaje) return;

    if (agregar(producto.id, Number(cantidad))) {
      setAgregadas(Number(cantidad));
      setCantidad("1");
    }
  };

  const productos = obtenerProductos();
  const relacionados = [
    ...productos.filter(
      (item) => item.category === producto.category && item.id !== producto.id,
    ),
    ...productos.filter((item) => item.category !== producto.category),
  ].slice(0, 4);

  return (
    <main>
      <section className="container product-detail-page">
        <nav className="breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Inicio</Link> › <Link to="/productos">Productos</Link> ›{" "}
          <span>{producto.name}</span>
        </nav>

        <article className="product-detail">
          <div className="product-detail-image">
            <img
              src={producto.image || IMAGEN_POR_DEFECTO}
              alt={producto.name}
            />
          </div>

          <div className="product-detail-info">
            <span className="product-category">{producto.category}</span>
            <div className="product-detail-heading">
              <h1>{producto.name}</h1>
              <strong className="detail-price">
                {formatearPrecio(producto.price)}
              </strong>
            </div>
            <p className="detail-description">
              {producto.description || "Producto veterinario de la clínica."}
            </p>
            <ul className="detail-data">
              <li>
                <strong>Código:</strong> {producto.id}
              </li>
              {producto.species && (
                <li>
                  <strong>Especie:</strong> {producto.species}
                </li>
              )}
            </ul>
            <p
              className={`detail-stock${disponible <= 0 ? " out-of-stock" : ""}`}
            >
              {stock <= 0
                ? "Sin stock disponible"
                : `Stock disponible: ${stock} unidades${enCarrito ? ` (${enCarrito} en tu carrito)` : ""}`}
            </p>

            <form className="detail-add-form" noValidate onSubmit={enviar}>
              <div className="campo-formulario">
                <label htmlFor="detail-quantity">Cantidad</label>
                <input
                  type="number"
                  id="detail-quantity"
                  name="cantidad"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  className={claseCampo(error)}
                  value={cantidad}
                  onChange={(evento) => cambiar(evento.target.value)}
                />
                <ErrorCampo mensaje={error} />
              </div>
              <button
                type="submit"
                className="add-cart-button"
                disabled={disponible <= 0}
              >
                Añadir al carrito
              </button>
              <p className="detail-message" role="status" aria-live="polite">
                {agregadas > 0 && (
                  <>
                    Agregaste {agregadas} unidad{agregadas === 1 ? "" : "es"} al
                    carrito. <Link to="/carrito">Ver carrito</Link>
                  </>
                )}
              </p>
            </form>
          </div>
        </article>

        <section className="related-products" aria-labelledby="related-title">
          <h2 id="related-title">Productos relacionados</h2>
          <div className="products-grid">
            {relacionados.map((item) => (
              <TarjetaProducto key={item.id} producto={item} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
