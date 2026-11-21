import { useState, type FormEvent } from "react";
import BannerPagina from "../componentes/BannerPagina";
import { ListaContacto, MapaClinica } from "../componentes/DatosClinica";
import ErrorCampo from "../componentes/ErrorCampo";
import { claseCampo } from "../utils/claseCampo";
import { useFormulario, type Reglas } from "../hooks/useFormulario";
import { enviarMensajeApi, mensajeDeErrorApi } from "../servicios/citas";
import {
  MENSAJE_DOMINIOS,
  esEmailValido,
  normalizarEmail,
} from "../utils/validaciones";

type FormularioContacto = {
  nombre: string;
  correo: string;
  motivo: string;
  mensaje: string;
};

const VACIO: FormularioContacto = {
  nombre: "",
  correo: "",
  motivo: "",
  mensaje: "",
};

const REGLAS: Reglas<FormularioContacto> = {
  nombre: (valor) => {
    const nombre = valor.trim();
    if (!nombre) return "El nombre es obligatorio.";
    if (nombre.length > 100)
      return "El nombre no puede superar los 100 caracteres.";
    return "";
  },
  correo: (valor) => {
    const correo = valor.trim();
    if (!correo) return "El correo es obligatorio.";
    if (correo.length > 100)
      return "El correo no puede superar los 100 caracteres.";
    if (!esEmailValido(correo)) return MENSAJE_DOMINIOS;
    return "";
  },
  motivo: (valor) => (valor ? "" : "Selecciona un motivo de contacto."),
  mensaje: (valor) => {
    const comentario = valor.trim();
    if (!comentario) return "El comentario es obligatorio.";
    if (comentario.length > 500) {
      return "El comentario no puede superar los 500 caracteres.";
    }
    return "";
  },
};

export default function Contacto() {
  const [confirmacion, setConfirmacion] = useState("");
  const [exito, setExito] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const formulario = useFormulario<FormularioContacto>(VACIO, REGLAS);
  const { valores, errores, cambiar, tocar } = formulario;

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setConfirmacion("");
    if (!formulario.validarTodo()) return;

    // El mensaje se guarda en la base de datos (POST /api/v1/mensajes).
    setEnviando(true);
    try {
      await enviarMensajeApi({
        nombre: valores.nombre.trim(),
        correo: normalizarEmail(valores.correo),
        motivo: valores.motivo,
        comentario: valores.mensaje.trim(),
      });
      setExito(true);
      setConfirmacion(
        "Mensaje enviado correctamente. Te contactaremos pronto.",
      );
      formulario.reiniciar();
    } catch (error) {
      setExito(false);
      setConfirmacion(
        mensajeDeErrorApi(
          error,
          "No se pudo conectar con el servidor. Intenta nuevamente.",
        ),
      );
    } finally {
      setEnviando(false);
    }
  };

  const campo = (nombre: keyof FormularioContacto) => ({
    name: nombre,
    className: claseCampo(errores[nombre]),
    value: valores[nombre],
    onBlur: () => tocar(nombre),
  });

  return (
    <main>
      <BannerPagina
        variante="contacto"
        etiqueta="Estamos para ayudarte"
        titulo="Contáctanos"
        texto="Escríbenos tus dudas, sugerencias o reclamos y te responderemos a la brevedad."
        idTitulo="contacto-title"
      />

      <section
        className="contacto-section container"
        aria-labelledby="contacto-title"
      >
        <div className="contacto-grid">
          <div className="contacto-formulario">
            <form id="form-contacto" noValidate onSubmit={enviar}>
              <div className="campo-formulario">
                <label htmlFor="contacto-nombre">Nombre completo:</label>
                <input
                  type="text"
                  id="contacto-nombre"
                  maxLength={100}
                  autoComplete="name"
                  {...campo("nombre")}
                  onChange={(e) => cambiar("nombre", e.target.value)}
                />
                <ErrorCampo mensaje={errores.nombre} />
              </div>

              <div className="campo-formulario">
                <label htmlFor="contacto-correo">Correo:</label>
                <input
                  type="text"
                  inputMode="email"
                  id="contacto-correo"
                  maxLength={100}
                  autoComplete="email"
                  placeholder="usuario@duoc.cl"
                  {...campo("correo")}
                  onChange={(e) => cambiar("correo", e.target.value)}
                />
                <ErrorCampo mensaje={errores.correo} />
              </div>

              <div className="campo-formulario">
                <label htmlFor="contacto-motivo">Motivo de contacto:</label>
                <select
                  id="contacto-motivo"
                  {...campo("motivo")}
                  onChange={(e) => cambiar("motivo", e.target.value)}
                >
                  <option value="" disabled>
                    Selecciona un motivo...
                  </option>
                  <option value="reclamo">Reclamo / Devolución</option>
                  <option value="consulta">Consulta por información</option>
                  <option value="sugerencia">Sugerencias</option>
                </select>
                <ErrorCampo mensaje={errores.motivo} />
              </div>

              <div className="campo-formulario">
                <label htmlFor="mensaje">Comentario:</label>
                <textarea
                  id="mensaje"
                  maxLength={500}
                  placeholder="Escribe tu consulta (máximo 500 caracteres)..."
                  {...campo("mensaje")}
                  onChange={(e) => cambiar("mensaje", e.target.value)}
                />
                <small className="campo-ayuda">
                  {valores.mensaje.length} / 500 caracteres
                </small>
                <ErrorCampo mensaje={errores.mensaje} />
              </div>

              <button type="submit" className="btn-agendar" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar Mensaje"}
              </button>
              <p
                id="form-contacto-message"
                className={confirmacion ? (exito ? "text-success" : "text-danger") : ""}
                role="status"
                aria-live="polite"
              >
                {confirmacion}
              </p>
            </form>
          </div>

          <div className="contacto-mapa">
            <h3>Nuestra Ubicación</h3>
            <p>
              Encuéntranos en Rancagua, Región del Libertador General Bernardo
              O'Higgins.
            </p>
            <div className="mapa-placeholder">
              <MapaClinica />
            </div>

            <ListaContacto />

            <img
              className="contacto-imagen"
              src="/img/consultas.jpg"
              alt="Veterinaria de la clínica atendiendo a un perro junto a su dueña"
            />
          </div>
        </div>
      </section>
    </main>
  );
}