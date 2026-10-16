import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCarrito } from "../hooks/useCarrito";
import { IMAGEN_POR_DEFECTO } from "../datos/productos";
import { rutaDetalleProducto } from "../servicios/catalogo";
import type { Producto } from "../tipos";
import { formatearPrecio } from "../utils/formato";

// Tarjeta del catálogo: imagen, datos, stock, "Agregar al carrito" y los
// botones + / − para ajustar la cantidad.
export default function TarjetaProducto({ producto }: { producto: Producto }) {
  const { cantidadDe, agregar, cambiarCantidad } = useCarrito();
  const [recienAgregado, setRecienAgregado] = useState(false);

  const ruta = rutaDetalleProducto(producto.id);
  const stock = Number(producto.stock) || 0;
  const cantidad = cantidadDe(producto.id);
  const sinCupo = cantidad >= stock;

  // "Agregado ✓" se muestra por un momento después de agregar.
  useEffect(() => {
    if (!recienAgregado) return;
    const temporizador = setTimeout(() => setRecienAgregado(false), 1200);
    return () => clearTimeout(temporizador);
  }, [recienAgregado]);

  const agregarUno = () => {
    if (agregar(producto.id)) setRecienAgregado(true);
  };

  return (
    <article className="product-card h-100">
      <Link className="product-image-link" to={ruta}>
        <img
          className="product-image"
          src={producto.image || IMAGEN_POR_DEFECTO}
          alt={producto.name}
        />
      </Link>
      <div className="product-content">
        <span className="product-category">{producto.category}</span>
        <h3>
          <Link to={ruta}>{producto.name}</Link>
        </h3>
        <p>
          {producto.description}
          {producto.species && (
            <>
              <br />
              <small>Especie: {producto.species}</small>
            </>
          )}
        </p>
        <p className={`product-stock${sinCupo ? " out-of-stock" : ""}`}>
          {stock > 0
            ? `Stock disponible: ${stock} unidades`
            : "Sin stock disponible"}
        </p>
        <div className="product-footer">
          <strong className="product-price">
            {formatearPrecio(producto.price)}
          </strong>
          <Link className="view-detail-button" to={ruta}>
            Ver detalle
          </Link>
          <button
            type="button"
            className="add-cart-button"
            disabled={sinCupo}
            onClick={agregarUno}
          >
            {recienAgregado ? "Agregado ✓" : "Agregar al carrito"}
          </button>
          <div className="product-quantity-controls">
            <button
              type="button"
              aria-label="Quitar una unidad"
              onClick={() => cambiarCantidad(producto.id, -1)}
            >
              −
            </button>
            <span>{cantidad}</span>
            <button
              type="button"
              aria-label="Agregar una unidad"
              disabled={sinCupo}
              onClick={() => agregar(producto.id)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
