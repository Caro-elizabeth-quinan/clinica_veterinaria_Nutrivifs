import { useState, type FormEvent } from "react";
import BannerPagina from "../componentes/BannerPagina";
import ErrorCampo, { claseCampo } from "../componentes/ErrorCampo";
import { useFormulario, type Reglas } from "../hooks/useFormulario";
import { CLAVES, guardar, leerLista } from "../servicios/almacenamiento";
import type { Mensaje } from "../tipos";
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
  const formulario = useFormulario<FormularioContacto>(VACIO, REGLAS);
  const { valores, errores, cambiar, tocar } = formulario;

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    setConfirmacion("");
    if (!formulario.validarTodo()) return;

    // Los mensajes quedan guardados de manera interna (localStorage).
    guardar(CLAVES.MENSAJES, [
      ...leerLista<Mensaje>(CLAVES.MENSAJES),
      {
        fecha: new Date().toISOString(),
        nombre: valores.nombre.trim(),
        correo: normalizarEmail(valores.correo),
        motivo: valores.motivo,
        comentario: valores.mensaje.trim(),
      },
    ]);

    setConfirmacion("Mensaje enviado correctamente. Te contactaremos pronto.");
    formulario.reiniciar();
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

              <button type="submit" className="btn-agendar">
                Enviar Mensaje
              </button>
              <p id="form-contacto-message" role="status" aria-live="polite">
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
              <iframe
                title="Ubicación de Clinica NutriDifs en Google Maps"
                src="https://www.google.com/maps?q=Clinica+NutriDifs+Chile&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              ></iframe>
            </div>

            <ul className="contacto-datos">
              <li>
                <span aria-hidden="true">📍</span> Av. San Marcos 123, Rancagua
              </li>
              <li>
                <span aria-hidden="true">📞</span> +56 9 4567 8910
              </li>
              <li>
                <span aria-hidden="true">🕘</span> Lunes a sábado, 9:00 a 19:00
                h
              </li>
            </ul>

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
