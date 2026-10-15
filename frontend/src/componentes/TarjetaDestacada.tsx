import { Link } from "react-router-dom";
import { IMAGEN_POR_DEFECTO } from "../datos/productos";
import { rutaDetalleProducto } from "../servicios/catalogo";
import type { Producto } from "../tipos";
import { formatearPrecio } from "../utils/formato";

export default function TarjetaDestacada({ producto }: { producto: Producto }) {
  const ruta = rutaDetalleProducto(producto.id);

  return (
    <article className="featured-product-card">
      <Link to={ruta}>
        <img
          src={producto.image || IMAGEN_POR_DEFECTO}
          alt={producto.name}
          className="product-image"
        />
      </Link>
      <div className="featured-product-info">
        <span>{producto.category}</span>
        <h3>{producto.name}</h3>
        <strong className="product-price">
          {formatearPrecio(producto.price)}
        </strong>
        <Link to={ruta}>Ver producto</Link>
      </div>
    </article>
  );
}
