import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorCampo from "../componentes/ErrorCampo";
import { claseCampo } from "../utils/claseCampo";
import { useCarrito } from "../hooks/useCarrito";
import { useSesion } from "../hooks/useSesion";
import { IMAGEN_POR_DEFECTO } from "../datos/productos";
import { buscarProducto, rutaDetalleProducto } from "../servicios/catalogo";
import { formatearMoneda, formatearPrecio } from "../utils/formato";

// Aviso que se muestra sobre la página; con "alConfirmar" pide confirmación.
interface Aviso {
  mensaje: string;
  alConfirmar?: () => void;
}

// Página del carrito: ítems, cupón de descuento, resumen y pago.
export default function Carrito() {
  const carrito = useCarrito();
  const { sesion } = useSesion();
  const navegar = useNavigate();

  const [codigoCupon, setCodigoCupon] = useState("");
  const [errorCupon, setErrorCupon] = useState("");
  const [mensajeCupon, setMensajeCupon] = useState("");
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const vacio = carrito.items.length === 0;

  const aplicarCupon = (evento: FormEvent) => {
    evento.preventDefault();
    const codigo = codigoCupon.trim().toUpperCase();
    setMensajeCupon("");

    if (!codigo) {
      setErrorCupon("Ingresa un cupón.");
    } else if (!carrito.aplicarCupon(codigo)) {
      setErrorCupon("El cupón no existe o ya no está vigente.");
    } else {
      setErrorCupon("");
      setMensajeCupon(`Cupón ${codigo} aplicado: 10% de descuento.`);
    }
  };

  const pagar = () => {
    if (vacio) {
      setAviso({ mensaje: "Agrega al menos un producto antes de pagar." });
      return;
    }

    if (!sesion) {
      setAviso({
        mensaje: "Necesitas iniciar sesión para pagar tu compra.",
        alConfirmar: () => navegar("/login?volver=carrito"),
      });
      return;
    }

    setAviso({
      mensaje: `El total de tu compra es ${formatearMoneda(carrito.total)}. ¿Deseas continuar con el pago?`,
      alConfirmar: () => {
        const orden = carrito.pagar(sesion);
        setAviso({
          mensaje: `Compra realizada con éxito. Tu número de orden es ${orden.id}.`,
        });
      },
    });
  };

  return (
    <main>
      <section
        className="container cart-page"
        aria-labelledby="cart-page-title"
      >
        <h1 id="cart-page-title">Mi carrito de compras</h1>

        <div className="row g-4 align-items-start">
          <div className={vacio ? "col-12" : "col-lg-8"}>
            {vacio && (
              <div className="cart-empty-message">
                <img
                  src="/img/ejercicio.jpg"
                  alt="Perro jugando al aire libre"
                />
                <p>Tu carrito está vacío.</p>
                <Link className="btn-primary" to="/productos">
                  Ver productos
                </Link>
              </div>
            )}

            <div className="cart-page-items">
              {carrito.items.map((item) => {
                const producto = buscarProducto(item.code);
                const enLimite =
                  item.quantity >= (Number(producto?.stock) || 0);

                return (
                  <article className="cart-page-item" key={item.code}>
                    <img
                      src={item.image || IMAGEN_POR_DEFECTO}
                      alt={item.name}
                    />
                    <div className="cart-page-item-info">
                      <h2>
                        <Link to={rutaDetalleProducto(item.code)}>
                          {item.name}
                        </Link>
                      </h2>
                      <p>{producto?.description ?? ""}</p>
                      <button
                        type="button"
                        className="remove-cart-item"
                        onClick={() => carrito.quitar(item.code)}
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="cart-page-item-price">
                      <strong>
                        {formatearPrecio(item.price * item.quantity)}
                      </strong>
                      <small>{formatearPrecio(item.price)} c/u</small>
                      <div
                        className="cart-quantity-controls"
                        aria-label={`Cantidad de ${item.name}`}
                      >
                        <button
                          type="button"
                          aria-label="Disminuir cantidad"
                          onClick={() => carrito.cambiarCantidad(item.code, -1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Aumentar cantidad"
                          disabled={enLimite}
                          onClick={() => carrito.cambiarCantidad(item.code, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {!vacio && (
            <div className="col-lg-4">
              <aside className="cart-summary" aria-label="Resumen de la compra">
                <h2>Resumen</h2>
                <dl>
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatearMoneda(carrito.subtotal)}</dd>
                  </div>
                  {carrito.descuento > 0 && (
                    <div>
                      <dt>Descuento</dt>
                      <dd>- {formatearMoneda(carrito.descuento)}</dd>
                    </div>
                  )}
                  <div className="cart-summary-total">
                    <dt>Total</dt>
                    <dd>{formatearMoneda(carrito.total)}</dd>
                  </div>
                </dl>

                <form
                  className="cart-coupon"
                  noValidate
                  onSubmit={aplicarCupon}
                >
                  <label htmlFor="cupon">Ingresa el cupón de descuento</label>
                  <div className="cart-coupon-row">
                    <input
                      type="text"
                      id="cupon"
                      name="cupon"
                      maxLength={20}
                      placeholder="NUTRI10"
                      className={claseCampo(errorCupon)}
                      value={codigoCupon}
                      onChange={(evento) => setCodigoCupon(evento.target.value)}
                    />
                    <ErrorCampo mensaje={errorCupon} />
                    <button type="submit" className="btn-secondary">
                      Aplicar
                    </button>
                  </div>
                  <p className="cart-form-message" role="status">
                    {mensajeCupon}
                  </p>
                </form>

                <button type="button" className="btn-primary" onClick={pagar}>
                  Pagar
                </button>
                <button
                  type="button"
                  className="cart-clear-button"
                  onClick={carrito.vaciar}
                >
                  Vaciar carrito
                </button>
                <Link className="cart-continue" to="/productos">
                  Seguir comprando
                </Link>
              </aside>
            </div>
          )}
        </div>

        {aviso && (
          <div className="cart-notice" role="alertdialog" aria-live="assertive">
            <div className="cart-notice-box">
              <p>{aviso.mensaje}</p>
              <div className="cart-notice-actions">
                {aviso.alConfirmar ? (
                  <>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={aviso.alConfirmar}
                    >
                      Continuar
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setAviso(null)}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setAviso(null)}
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
