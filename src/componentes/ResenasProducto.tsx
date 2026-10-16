import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useSesion } from "../hooks/useSesion";
import { useFormulario, type Reglas } from "../hooks/useFormulario";
import {
  eliminarResena,
  guardarResena,
  promedio,
  resenasDeProducto,
} from "../servicios/resenas";
import type { Resena } from "../tipos";
import { formatearFecha } from "../utils/formato";
import BotonEliminar from "./BotonEliminar";
import ErrorCampo from "./ErrorCampo";
import { claseCampo } from "../utils/claseCampo";
import Estrellas from "./Estrellas";
import SelectorEstrellas from "./SelectorEstrellas";

interface Props {
  productoId: string;
  // Las reseñas viven en el componente padre (la ficha del producto) porque
  // el promedio también se muestra junto al título.
  resenas: Resena[];
  alCambiar: (resenas: Resena[]) => void;
}

type FormularioResena = { puntuacion: string; comentario: string };

const MIN_COMENTARIO = 10;
const MAX_COMENTARIO = 300;

const REGLAS: Reglas<FormularioResena> = {
  puntuacion: (valor) =>
    Number(valor) >= 1 && Number(valor) <= 5 ? "" : "Elige de 1 a 5 estrellas.",
  comentario: (valor) => {
    const texto = valor.trim();
    if (texto.length < MIN_COMENTARIO) {
      return `Escribe al menos ${MIN_COMENTARIO} caracteres.`;
    }
    if (texto.length > MAX_COMENTARIO) {
      return `Máximo ${MAX_COMENTARIO} caracteres.`;
    }
    return "";
  },
};

// Sección de reseñas del detalle de producto: resumen, filtro por
// estrellas, formulario y listado.
export default function ResenasProducto({
  productoId,
  resenas,
  alCambiar,
}: Props) {
  const { sesion } = useSesion();
  const propia = resenas.find((resena) => resena.email === sesion?.email);

  const formulario = useFormulario<FormularioResena>(
    {
      puntuacion: propia ? String(propia.puntuacion) : "0",
      comentario: propia?.comentario ?? "",
    },
    REGLAS,
  );
  const { valores, errores, cambiar, tocar } = formulario;
  const [filtro, setFiltro] = useState(0); // 0 = todas
  const [mensaje, setMensaje] = useState("");

  const recargar = () => alCambiar(resenasDeProducto(productoId));

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    setMensaje("");
    if (!sesion || !formulario.validarTodo()) return;

    guardarResena({
      id: propia?.id ?? `RES-${Date.now()}`,
      productoId,
      email: sesion.email,
      autor: `${sesion.name} ${sesion.apellido.charAt(0)}.`.trim(),
      puntuacion: Number(valores.puntuacion),
      comentario: valores.comentario.trim(),
      fecha: new Date().toISOString(),
    });
    recargar();
    setMensaje(propia ? "Tu reseña se actualizó." : "¡Gracias por tu reseña!");
  };

  const borrar = (resena: Resena) => {
    eliminarResena(resena.id);
    recargar();
    if (resena.email === sesion?.email) {
      formulario.reiniciar({ puntuacion: "0", comentario: "" });
      setMensaje("Tu reseña se eliminó.");
    }
  };

  const visibles =
    filtro === 0
      ? resenas
      : resenas.filter((resena) => resena.puntuacion === filtro);

  // Cantidad de reseñas por estrella, de 5 a 1 (para las barras).
  const distribucion = [5, 4, 3, 2, 1].map((estrellas) => ({
    estrellas,
    cantidad: resenas.filter((resena) => resena.puntuacion === estrellas)
      .length,
  }));

  const esAdmin = sesion?.role === "Administrador";

  return (
    <section className="resenas" aria-labelledby="resenas-titulo">
      <h2 id="resenas-titulo">
        <i className="bi bi-chat-square-quote me-2" aria-hidden="true" />
        Reseñas de clientes
      </h2>

      <div className="row g-4">
        {/* Resumen y formulario */}
        <div className="col-12 col-lg-5">
          <div className="resenas-resumen">
            <div className="resenas-promedio">
              <strong>
                {resenas.length ? promedio(resenas).toFixed(1) : "—"}
              </strong>
              <div>
                <Estrellas valor={promedio(resenas)} />
                <span>
                  {resenas.length} reseña{resenas.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <ul className="resenas-barras">
              {distribucion.map(({ estrellas, cantidad }) => (
                <li key={estrellas}>
                  <button
                    type="button"
                    className={filtro === estrellas ? "activo" : undefined}
                    disabled={cantidad === 0}
                    onClick={() =>
                      setFiltro(filtro === estrellas ? 0 : estrellas)
                    }
                    aria-label={`Ver reseñas de ${estrellas} estrellas (${cantidad})`}
                  >
                    <span>{estrellas} ★</span>
                    <span className="resenas-barra">
                      <span
                        style={{
                          width: `${resenas.length ? (cantidad / resenas.length) * 100 : 0}%`,
                        }}
                      />
                    </span>
                    <span>{cantidad}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {sesion ? (
            <form className="resenas-form" noValidate onSubmit={enviar}>
              <h3>{propia ? "Edita tu reseña" : "Escribe tu reseña"}</h3>
              <label>Tu puntuación</label>
              <SelectorEstrellas
                valor={Number(valores.puntuacion)}
                alCambiar={(valor) => cambiar("puntuacion", String(valor))}
                invalido={Boolean(errores.puntuacion)}
              />
              <ErrorCampo mensaje={errores.puntuacion} />

              <label htmlFor="resena-comentario">Comentario</label>
              <textarea
                id="resena-comentario"
                rows={4}
                maxLength={MAX_COMENTARIO}
                placeholder="¿Qué te pareció el producto?"
                className={claseCampo(errores.comentario, "form-control")}
                value={valores.comentario}
                onChange={(e) => cambiar("comentario", e.target.value)}
                onBlur={() => tocar("comentario")}
              />
              <small className="campo-ayuda">
                {valores.comentario.trim().length} / {MAX_COMENTARIO} caracteres
              </small>
              <ErrorCampo mensaje={errores.comentario} />

              <button type="submit" className="btn-primary mt-2">
                {propia ? "Actualizar reseña" : "Publicar reseña"}
              </button>
              {mensaje && (
                <p className="alert alert-success mt-3 mb-0" role="status">
                  {mensaje}
                </p>
              )}
            </form>
          ) : (
            <p className="resenas-login">
              <Link to="/login">Inicia sesión</Link> para dejar tu reseña.
            </p>
          )}
        </div>

        {/* Listado */}
        <div className="col-12 col-lg-7">
          {filtro !== 0 && (
            <p className="resenas-filtro">
              Mostrando reseñas de {filtro} estrella{filtro === 1 ? "" : "s"}.{" "}
              <button type="button" onClick={() => setFiltro(0)}>
                Ver todas
              </button>
            </p>
          )}

          {visibles.length === 0 ? (
            <p className="resenas-vacio">
              Este producto aún no tiene reseñas. ¡Sé el primero en opinar!
            </p>
          ) : (
            <ul className="resenas-lista">
              {visibles.map((resena) => (
                <li key={resena.id} className="resena">
                  <div className="resena-cabecera">
                    <span className="resena-avatar" aria-hidden="true">
                      {resena.autor.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <strong>{resena.autor}</strong>
                      <small>{formatearFecha(resena.fecha)}</small>
                    </div>
                    <Estrellas valor={resena.puntuacion} />
                  </div>
                  <p>{resena.comentario}</p>
                  {/* El autor puede borrar la suya; el Administrador modera todas. */}
                  {(esAdmin || resena.email === sesion?.email) && (
                    <BotonEliminar alEliminar={() => borrar(resena)} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
