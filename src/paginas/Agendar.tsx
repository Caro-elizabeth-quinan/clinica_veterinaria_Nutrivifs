import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import BannerPagina from "../componentes/BannerPagina";
import HorarioAtencion from "../componentes/HorarioAtencion";
import { CLINICA, HORARIO_RESUMEN } from "../datos/sitio";
import { CATEGORIAS_SERVICIO } from "../datos/servicios";
import ErrorCampo from "../componentes/ErrorCampo";
import { claseCampo } from "../utils/claseCampo";
import { useFormulario, type Reglas } from "../hooks/useFormulario";
import { CLAVES, guardar, leerLista } from "../servicios/almacenamiento";
import { leerPerfiles } from "../servicios/perfiles";
import { useSesion } from "../hooks/useSesion";
import type { Cita } from "../tipos";
import {
  ANIO_MAXIMO_NACIMIENTO,
  CORREO_AGENDAMIENTO_REGEX,
  MENSAJE_EDAD,
  MENSAJE_TELEFONO,
  PREFIJO_TELEFONO,
  esFechaNacimientoValida,
  esHoyOFutura,
  esTelefonoValido,
  fechaHoyLocal,
  fechaMaximaNacimientoLocal,
  formatearRut,
  formatearTelefono,
  mensajeErrorRut,
} from "../utils/validaciones";

type FormularioCita = {
  nombre: string;
  apellido: string;
  rut: string;
  fechaNacimiento: string;
  correo: string;
  telefono: string;
  mascota: string;
  especie: string;
  otraEspecie: string;
  tipoConsulta: string;
  fecha: string;
  motivo: string;
};

// El formulario utiliza el mismo catálogo que la página de servicios.
const SERVICIOS_DISPONIBLES = CATEGORIAS_SERVICIO.flatMap((categoria) =>
  categoria.servicios.map((servicio) => ({
    codigo: servicio.codigo,
    nombre: servicio.nombre,
    consulta: servicio.consulta,
  })),
);

// Pasos que se muestran sobre el formulario.
const PASOS = [
  {
    icono: "bi-ui-checks",
    titulo: "Completa el formulario",
    texto: "Tus datos, los de tu mascota y el motivo.",
  },
  {
    icono: "bi-telephone-fill",
    titulo: "Te confirmamos la hora",
    texto: "Te contactamos por correo o teléfono.",
  },
  {
    icono: "bi-heart-fill",
    titulo: "Asiste con tu mascota",
    texto: "Si es urgente, ven sin hora: atendemos 24/7.",
  },
];

const SERVICIOS = [
  "Consultas generales y de urgencia",
  "Vacunación y desparasitación",
  "Controles y seguimiento",
  "Atención para aves y conejos",
];

const obligatorio = (mensaje: string) => (valor: string) =>
  valor.trim() ? "" : mensaje;

const REGLAS: Reglas<FormularioCita> = {
  nombre: obligatorio("El nombre es obligatorio."),
  apellido: obligatorio("El apellido es obligatorio."),
  rut: (valor) => mensajeErrorRut(valor),
  fechaNacimiento: (valor) =>
    esFechaNacimientoValida(valor) ? "" : MENSAJE_EDAD,
  correo: (valor) =>
    CORREO_AGENDAMIENTO_REGEX.test(valor)
      ? ""
      : "Correo inválido. Máx. 24 letras/números antes de @, y solo @gmail.com, @duoc.cl o @profesor.duoc.cl.",
  telefono: (valor) => (esTelefonoValido(valor) ? "" : MENSAJE_TELEFONO),
  mascota: obligatorio("El nombre de tu mascota es obligatorio."),
  especie: obligatorio("Selecciona una especie."),
  otraEspecie: (valor, valores) =>
    valores.especie === "otro" && !valor.trim() ? "Escribe la especie." : "",
  tipoConsulta: obligatorio("Selecciona el tipo de consulta."),
  fecha: (valor) =>
    esHoyOFutura(valor)
      ? ""
      : "La fecha preferida no puede ser anterior a hoy.",
  motivo: (valor) =>
    valor.trim().length >= 20
      ? ""
      : "Describe el motivo con al menos 20 caracteres.",
};

// El servicio elegido en Consultas llega como ?consulta= y queda preseleccionado.
function tipoDesdeConsulta(consulta: string): string {
  const servicio = SERVICIOS_DISPONIBLES.find(
    (opcion) =>
      opcion.consulta.toLowerCase() === consulta.toLowerCase() ||
      opcion.codigo.toLowerCase() === consulta.toLowerCase() ||
      opcion.nombre.toLowerCase() === consulta.toLowerCase(),
  );
  return servicio?.codigo ?? "";
}

// Devuelve las especies admitidas por el servicio seleccionado en el catálogo.
function especieAutomatica(codigoServicio: string): string {
  const servicio = SERVICIOS_DISPONIBLES.find(
    (opcion) => opcion.codigo === codigoServicio,
  );
  if (!servicio) return "";

  const detalle = CATEGORIAS_SERVICIO.flatMap((categoria) => categoria.servicios)
    .find((item) => item.codigo === codigoServicio)?.especie.toLowerCase() ?? "";
  const nombre = `${servicio.nombre} ${servicio.consulta}`.toLowerCase();
  const texto = `${detalle} ${nombre}`;

  if (texto.includes("canina") || texto.includes("canino") || texto.includes("perro")) {
    return "Perro";
  }
  if (texto.includes("felina") || texto.includes("felino") || texto.includes("gato")) {
    return "Gato";
  }

  const permitidas = especiesPermitidas(codigoServicio);
  return permitidas.length === 1 ? permitidas[0] : "";
}

function especiesPermitidas(codigoServicio: string): string[] {
  const servicio = SERVICIOS_DISPONIBLES.find((opcion) => opcion.codigo === codigoServicio);
  if (!servicio) return ["Perro", "Gato", "Ave", "Conejo", "otro"];

  const especie = servicio.consulta.toLowerCase();
  // Consulta ave/conejo: no debe permitir elegir perro o gato.
  if (especie.includes("ave / conejo") || especie.includes("ave-conejo")) {
    return ["Ave", "Conejo"];
  }

  const detalle = CATEGORIAS_SERVICIO.flatMap((categoria) => categoria.servicios)
    .find((item) => item.codigo === codigoServicio)?.especie.toLowerCase() ?? "";
  if (detalle.includes("todas")) return ["Perro", "Gato", "Ave", "Conejo", "otro"];

  const permitidas: string[] = [];
  if (detalle.includes("perro") || detalle.includes("perra")) permitidas.push("Perro");
  if (detalle.includes("gato") || detalle.includes("gata")) permitidas.push("Gato");
  if (detalle.includes("ave")) permitidas.push("Ave");
  if (detalle.includes("conejo")) permitidas.push("Conejo");
  return permitidas.length ? permitidas : ["Perro", "Gato", "Ave", "Conejo", "otro"];
}

export default function Agendar() {
  const [parametros] = useSearchParams();
  const { sesion } = useSesion();
  const [mensaje, setMensaje] = useState("");

  // Busca el perfil registrado de la sesión activa. La sesión contiene algunos
  // datos básicos; el perfil completo también incluye RUN y fecha de nacimiento.
  const perfilActual = sesion
    ? leerPerfiles().find(
        (perfil) => perfil.email.toLowerCase() === sesion.email.toLowerCase(),
      )
    : undefined;
  // Fecha mínima del calendario: se calcula una sola vez al abrir la página.
  const [hoy] = useState(fechaHoyLocal);
  const [fechaMaximaNacimiento] = useState(fechaMaximaNacimientoLocal); 

  const inicial: FormularioCita = {
    nombre: perfilActual?.name ?? sesion?.name ?? "",
    apellido: perfilActual?.apellido ?? sesion?.apellido ?? "",
    rut: perfilActual?.run ? formatearRut(perfilActual.run) : "",
    // El registro permite omitir la fecha de nacimiento. Solo se precarga
    // cuando existe en el perfil; si falta, se solicita en este formulario.
    fechaNacimiento: perfilActual?.birthDate ?? sesion?.birthDate ?? "",
    correo: perfilActual?.email ?? sesion?.email ?? "",
    telefono: perfilActual?.phone || sesion?.phone || PREFIJO_TELEFONO,
    mascota: "",
    especie: "",
    otraEspecie: "",
    tipoConsulta: tipoDesdeConsulta(parametros.get("consulta") ?? ""),
    fecha: "",
    motivo: "",
  };

  const formulario = useFormulario<FormularioCita>(inicial, REGLAS);
  const { valores, errores, cambiar, tocar } = formulario;
  const especiesDisponibles = especiesPermitidas(valores.tipoConsulta);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    setMensaje("");
    if (!formulario.validarTodo()) return;

    // La solicitud queda guardada para que el administrador la vea y la
    // confirme en su panel (Citas).
    const citas = leerLista<Cita>(CLAVES.CITAS);
    const cita: Cita = {
      id: `CIT-${String(citas.length + 1).padStart(4, "0")}`,
      fechaSolicitud: new Date().toISOString(),
      nombre: `${valores.nombre.trim()} ${valores.apellido.trim()}`,
      rut: valores.rut,
      correo: valores.correo,
      telefono: valores.telefono,
      mascota: valores.mascota.trim(),
      especie:
        valores.especie === "otro"
          ? valores.otraEspecie.trim()
          : valores.especie,
      tipoConsulta:
        SERVICIOS_DISPONIBLES.find((servicio) => servicio.codigo === valores.tipoConsulta)
          ?.nombre ?? valores.tipoConsulta,
      fecha: valores.fecha,
      motivo: valores.motivo.trim(),
      estado: "Pendiente",
    };
    guardar(CLAVES.CITAS, [...citas, cita]);

    setMensaje(
      `Solicitud ${cita.id} enviada. Nos pondremos en contacto contigo para confirmar.`,
    );
    formulario.reiniciar({ ...inicial, tipoConsulta: "" });
  };

  const campo = (nombre: keyof FormularioCita) => ({
    className: claseCampo(errores[nombre]),
    value: valores[nombre],
    onBlur: () => tocar(nombre),
  });

  return (
    <main>
      <BannerPagina
        variante="agendar"
        etiqueta="Atención veterinaria"
        titulo="Agenda tu consulta"
        texto="Completa tus datos y nos pondremos en contacto contigo para confirmar la hora."
      />

      {/* Fondo de la página: fotografía con una capa de color encima. */}
      <div className="appointment-bg">
        <section className="services-section container appointment-page">
          <ol className="appointment-steps row g-3" aria-label="Cómo agendar">
            {PASOS.map((paso, indice) => (
              <li key={paso.titulo} className="col-12 col-md-4">
                <div className="appointment-step">
                  <span className="appointment-step-icon" aria-hidden="true">
                    <i className={`bi ${paso.icono}`} />
                  </span>
                  <div>
                    <strong>
                      {indice + 1}. {paso.titulo}
                    </strong>
                    <small>{paso.texto}</small>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <HorarioAtencion />

          <div className="appointment-layout">
            <aside className="appointment-info">
              <div className="appointment-info-media">
                <img
                  className="appointment-info-image"
                  src="/img/consulta-general.jpg"
                  alt="Veterinaria examinando a un perro en la consulta"
                />
                <span className="appointment-info-badge">
                  <i className="bi bi-shield-check" aria-hidden="true" />{" "}
                  Atención profesional
                </span>
              </div>
              <h2>Elige la atención que necesitas</h2>
              <p>
                Atendemos perros, gatos y animales pequeños con atención cercana
                y responsable.
              </p>
              <ul className="appointment-services">
                {SERVICIOS.map((servicio) => (
                  <li key={servicio}>
                    <i className="bi bi-check-circle-fill" aria-hidden="true" />
                    {servicio}
                  </li>
                ))}
              </ul>

              <div className="appointment-contact">
                <p>
                  <i className="bi bi-clock-fill" aria-hidden="true" />
                  {HORARIO_RESUMEN}
                </p>
                <p>
                  <i className="bi bi-telephone-fill" aria-hidden="true" />
                  Urgencias 24/7: {CLINICA.telefono}
                </p>
                <p>
                  <i className="bi bi-geo-alt-fill" aria-hidden="true" />
                  {CLINICA.direccion}
                </p>
              </div>
            </aside>

            <form
              className="appointment-form"
              id="appointment-form"
              noValidate
              onSubmit={enviar}
            >
              <div className="appointment-form-header campo-completo">
                <i className="bi bi-calendar2-check" aria-hidden="true" />
                <div>
                  <h2>Solicita tu hora</h2>
                  <p>Todos los campos son obligatorios.</p>
                </div>
              </div>

              <h3 className="appointment-form-section campo-completo">
                <i className="bi bi-person-fill" aria-hidden="true" /> Tus datos
              </h3>
              <div className="campo-formulario">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  autoComplete="given-name"
                  maxLength={100}
                  {...campo("nombre")}
                  onChange={(e) => cambiar("nombre", e.target.value)}
                />
                <ErrorCampo mensaje={errores.nombre} />
              </div>

              <div className="campo-formulario">
                <label htmlFor="apellido">Apellido</label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  autoComplete="family-name"
                  maxLength={100}
                  {...campo("apellido")}
                  onChange={(e) => cambiar("apellido", e.target.value)}
                />
                <ErrorCampo mensaje={errores.apellido} />
              </div>

              <div className="campo-formulario">
                <label htmlFor="rut">RUT (ej: 12.345.678-5)</label>
                <input
                  id="rut"
                  name="rut"
                  type="text"
                  inputMode="text"
                  placeholder="12.345.678-5"
                  maxLength={12}
                  {...campo("rut")}
                  onChange={(e) => cambiar("rut", formatearRut(e.target.value))}
                />
                <ErrorCampo mensaje={errores.rut} />
              </div>

              <div className="campo-formulario">
                <label htmlFor="fecha-nacimiento">Fecha de nacimiento</label>
                <input
                  id="fecha-nacimiento"
                  name="fecha-nacimiento"
                  type="date"
                  autoComplete="bday"
                  max={fechaMaximaNacimiento}
                  {...campo("fechaNacimiento")}
                  onChange={(e) => cambiar("fechaNacimiento", e.target.value)}
                />
                <small className="campo-ayuda">
                  Solo pueden agendar una consulta personas mayores de 14 años.
                </small>
                <ErrorCampo mensaje={errores.fechaNacimiento} />
              </div>

              <div className="campo-formulario">
                <label htmlFor="correo">Correo (ej: usuario@gmail.com)</label>
                <input
                  id="correo"
                  name="correo"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  maxLength={42}
                  placeholder="usuario@duoc.cl"
                  {...campo("correo")}
                  onChange={(e) => cambiar("correo", e.target.value)}
                />
                <ErrorCampo mensaje={errores.correo} />
              </div>

              <div className="campo-formulario">
                <label htmlFor="telefono">Teléfono (ej: +56934020512)</label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+56934020512"
                  maxLength={12}
                  {...campo("telefono")}
                  onChange={(e) =>
                    cambiar("telefono", formatearTelefono(e.target.value))
                  }
                />
                <ErrorCampo mensaje={errores.telefono} />
              </div>

              <h3 className="appointment-form-section campo-completo">
                <i className="bi bi-heart-fill" aria-hidden="true" /> Tu mascota
              </h3>
              <div className="campo-formulario">
                <label htmlFor="mascota">Nombre de tu mascota</label>
                <input
                  id="mascota"
                  name="mascota"
                  type="text"
                  {...campo("mascota")}
                  onChange={(e) => cambiar("mascota", e.target.value)}
                />
                <ErrorCampo mensaje={errores.mascota} />
              </div>

              <div className="campo-formulario">
                <label htmlFor="especie">Especie</label>
                <select
                  id="especie"
                  name="especie"
                  {...campo("especie")}
                  onChange={(e) => cambiar("especie", e.target.value)}
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  {especiesDisponibles.map((especie) => (
                    <option key={especie} value={especie}>
                      {especie === "otro" ? "Otro" : especie}
                    </option>
                  ))}
                </select>
                <ErrorCampo mensaje={errores.especie} />
              </div>

              {valores.especie === "otro" && (
                <div className="campo-formulario campo-completo">
                  <label htmlFor="otra-especie">Escribe la especie</label>
                  <input
                    id="otra-especie"
                    name="otra-especie"
                    type="text"
                    placeholder="Ej: Hurón"
                    {...campo("otraEspecie")}
                    onChange={(e) => cambiar("otraEspecie", e.target.value)}
                  />
                  <ErrorCampo mensaje={errores.otraEspecie} />
                </div>
              )}

              <h3 className="appointment-form-section campo-completo">
                <i className="bi bi-clipboard2-pulse-fill" aria-hidden="true" />{" "}
                La consulta
              </h3>
              <div className="campo-formulario">
                <label htmlFor="tipo-consulta">Tipo de consulta</label>
                <select
                  id="tipo-consulta"
                  name="tipo-consulta"
                  {...campo("tipoConsulta")}
                  onChange={(e) => {
                    const nuevoTipo = e.target.value;
                    // Actualizar los tres campos en una sola operación evita que
                    // una actualización basada en el estado anterior sobrescriba
                    // el servicio recién seleccionado.
                    formulario.reiniciarCampos({
                      tipoConsulta: nuevoTipo,
                      especie: especieAutomatica(nuevoTipo),
                      otraEspecie: "",
                    });
                  }}
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  {CATEGORIAS_SERVICIO.map((categoria) => (
                    <optgroup key={categoria.id} label={categoria.titulo.replace(/^\S+\s*/, "")}>
                      {categoria.servicios.map((servicio) => (
                        <option key={servicio.codigo} value={servicio.codigo}>
                          {servicio.nombre}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ErrorCampo mensaje={errores.tipoConsulta} />
              </div>

              <div className="campo-formulario">
                <label htmlFor="fecha">Fecha preferida</label>
                <input
                  id="fecha"
                  name="fecha"
                  type="date"
                  min={hoy}
                  {...campo("fecha")}
                  onChange={(e) => cambiar("fecha", e.target.value)}
                />
                <ErrorCampo mensaje={errores.fecha} />
              </div>

              <div className="campo-formulario campo-completo">
                <label htmlFor="motivo">
                  Motivo de la consulta (mínimo 20 caracteres)
                </label>
                <textarea
                  id="motivo"
                  name="motivo"
                  rows={5}
                  maxLength={500}
                  placeholder="Describe con detalle lo que le ocurre a tu mascota"
                  {...campo("motivo")}
                  onChange={(e) => cambiar("motivo", e.target.value)}
                />
                <ErrorCampo mensaje={errores.motivo} />
              </div>

              <button type="submit" className="btn-agendar campo-completo">
                <i className="bi bi-send-fill me-2" aria-hidden="true" />
                Solicitar consulta
              </button>
              <p
                id="appointment-message"
                className="campo-completo"
                role="status"
                aria-live="polite"
              >
                {mensaje}
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
