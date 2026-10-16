import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import AvatarUsuario from "../componentes/AvatarUsuario";
import ErrorCampo from "../componentes/ErrorCampo";
import { claseCampo } from "../utils/claseCampo";
import {
  OpcionesComuna,
  OpcionesRegion,
} from "../componentes/SelectsRegionComuna";
import { tieneComunas } from "../utils/regiones";
import { useSesion } from "../hooks/useSesion";
import { useFormulario, type Reglas } from "../hooks/useFormulario";
import { guardarPerfiles, leerPerfiles } from "../servicios/perfiles";
import type { Cita, Perfil as PerfilUsuario } from "../tipos";
import { CLAVES, leerLista } from "../servicios/almacenamiento";
import { fechaHoyLocal } from "../utils/validaciones";
import {
  USUARIO_VACIO,
  crearReglasUsuario,
  type FormularioUsuario,
} from "../utils/reglasUsuario";
import {
  ANIO_MAXIMO_NACIMIENTO,
  PREFIJO_TELEFONO,
  calcularEdad,
  formatearTelefono,
  normalizarEmail,
} from "../utils/validaciones";

// Campos que el usuario puede editar de su propio perfil. El rol, el RUN y
// la contraseña no se modifican aquí.
type CampoPerfil =
  | "name"
  | "apellido"
  | "email"
  | "birthDate"
  | "phone"
  | "region"
  | "comuna"
  | "direccion";

const CAMPOS_SELECT: CampoPerfil[] = ["region", "comuna"];

function crearReglasPerfil(emailActual: string): Reglas<FormularioUsuario> {
  const reglas = crearReglasUsuario({ emailActual });
  return {
    name: reglas.name,
    apellido: reglas.apellido,
    email: reglas.email,
    birthDate: reglas.birthDate,
    phone: reglas.phone,
    region: reglas.region,
    comuna: reglas.comuna,
    direccion: reglas.direccion,
  };
}

function valoresDesde(perfil?: PerfilUsuario): FormularioUsuario {
  if (!perfil) return USUARIO_VACIO;
  return {
    ...USUARIO_VACIO,
    name: perfil.name || "",
    apellido: perfil.apellido || "",
    email: perfil.email,
    birthDate: perfil.birthDate || "",
    phone: perfil.phone || PREFIJO_TELEFONO,
    region: perfil.region || "",
    comuna: perfil.comuna || "",
    direccion: perfil.direccion || "",
  };
}

// Perfil personal: disponible para Administrador, Vendedor y Cliente.
export default function Perfil() {
  const { sesion, iniciarSesion } = useSesion();
  const [perfil, setPerfil] = useState(() =>
    leerPerfiles().find((item) => item.email === sesion?.email),
  );
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);

  const formulario = useFormulario<FormularioUsuario>(
    valoresDesde(perfil),
    crearReglasPerfil(perfil?.email ?? ""),
  );
  const { valores, errores, cambiar, tocar } = formulario;

  if (!sesion) return <Navigate to="/login" replace />;

  if (!perfil) {
    return (
      <main className="container profile-page">
        <p className="alert alert-warning">
          No se encontró la información de tu cuenta.
        </p>
      </main>
    );
  }

  const edad = calcularEdad(perfil.birthDate);
  const hoy = fechaHoyLocal();
  const correoPerfil = perfil.email.trim().toLowerCase();
  const citasFuturas = leerLista<Cita>(CLAVES.CITAS)
    .filter(
      (cita) =>
        cita.correo.trim().toLowerCase() === correoPerfil &&
        cita.estado === "Confirmada" &&
        cita.fecha >= hoy,
    )
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    setExito(false);

    if (!formulario.validarTodo()) {
      setMensaje("Revisa los campos marcados en rojo.");
      return;
    }

    // Se conservan los datos que no se editan aquí (rol, RUN, contraseña…).
    const actualizado: PerfilUsuario = {
      ...perfil,
      name: valores.name.trim(),
      apellido: valores.apellido.trim(),
      email: normalizarEmail(valores.email),
      birthDate: valores.birthDate,
      phone: valores.phone === PREFIJO_TELEFONO ? "" : valores.phone,
      region: valores.region,
      comuna: valores.comuna,
      direccion: valores.direccion.trim(),
    };

    guardarPerfiles(
      leerPerfiles().map((item) =>
        item.email === perfil.email ? actualizado : item,
      ),
    );
    iniciarSesion(actualizado);
    setPerfil(actualizado);
    setExito(true);
    setMensaje("Tus datos se guardaron correctamente.");
  };

  const campo = (nombre: CampoPerfil) => ({
    name: nombre,
    id: `perfil-${nombre}`,
    className: claseCampo(
      errores[nombre],
      CAMPOS_SELECT.includes(nombre) ? "form-select" : "form-control",
    ),
    value: valores[nombre],
    onBlur: () => tocar(nombre),
  });

  return (
    <main className="container profile-page" aria-labelledby="perfil-titulo">
      <span className="admin-eyebrow">MI CUENTA</span>
      <h1 id="perfil-titulo" className="mb-4">
        Mi perfil
      </h1>

      <div className="row g-4">
        {/* Resumen (consultar) */}
        <section className="col-lg-4" aria-label="Resumen del perfil">
          <div className="profile-card text-center h-100">
            <AvatarUsuario nombre={`${perfil.name} ${perfil.apellido}`} />
            <h2 className="h4 mt-3 mb-1">
              {perfil.name} {perfil.apellido}
            </h2>
            <span className="badge rounded-pill text-bg-success mb-3">
              {perfil.role}
            </span>

            <dl className="profile-data text-start">
              <dt>Correo</dt>
              <dd>{perfil.email}</dd>
              <dt>Fecha de nacimiento</dt>
              <dd>
                {perfil.birthDate
                  ? perfil.birthDate.split("-").reverse().join("-")
                  : "Sin informar"}
              </dd>
              <dt>Edad</dt>
              <dd>{edad === null ? "Sin informar" : `${edad} años`}</dd>
              <dt>Dirección</dt>
              <dd>
                {perfil.direccion || "Sin informar"}
                {perfil.comuna && `, ${perfil.comuna}`}
              </dd>
              <dt>Región</dt>
              <dd>{perfil.region || "Sin informar"}</dd>
            </dl>
          </div>
        </section>

        {/* Edición */}
        <section className="col-lg-8" aria-label="Editar perfil">
          <form className="profile-card" noValidate onSubmit={enviar}>
            <h2 className="h5 mb-3">Editar mis datos</h2>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="perfil-name">
                  Nombre
                </label>
                <input
                  type="text"
                  maxLength={50}
                  autoComplete="given-name"
                  {...campo("name")}
                  onChange={(e) => cambiar("name", e.target.value)}
                />
                <ErrorCampo mensaje={errores.name} />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="perfil-apellido">
                  Apellidos
                </label>
                <input
                  type="text"
                  maxLength={100}
                  autoComplete="family-name"
                  {...campo("apellido")}
                  onChange={(e) => cambiar("apellido", e.target.value)}
                />
                <ErrorCampo mensaje={errores.apellido} />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="perfil-email">
                  Correo electrónico
                </label>
                <input
                  type="text"
                  inputMode="email"
                  maxLength={100}
                  autoComplete="email"
                  {...campo("email")}
                  onChange={(e) => cambiar("email", e.target.value)}
                />
                <ErrorCampo mensaje={errores.email} />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="perfil-rol">
                  Rol
                </label>
                <input
                  id="perfil-rol"
                  type="text"
                  className="form-control"
                  value={perfil.role}
                  disabled
                />
                <small className="campo-ayuda">
                  El rol no se puede modificar desde el perfil.
                </small>
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="perfil-birthDate">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  max={`${ANIO_MAXIMO_NACIMIENTO}-12-31`}
                  {...campo("birthDate")}
                  onChange={(e) => cambiar("birthDate", e.target.value)}
                />
                <ErrorCampo mensaje={errores.birthDate} />
                <small className="campo-ayuda">
                  Edad calculada: {calcularEdad(valores.birthDate) ?? "—"}
                  {calcularEdad(valores.birthDate) !== null && " años"}
                </small>
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="perfil-phone">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  maxLength={12}
                  autoComplete="tel"
                  {...campo("phone")}
                  onChange={(e) =>
                    cambiar("phone", formatearTelefono(e.target.value))
                  }
                />
                <ErrorCampo mensaje={errores.phone} />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="perfil-region">
                  Región
                </label>
                <select
                  {...campo("region")}
                  onChange={(e) =>
                    // Al cambiar la región se reinicia la comuna.
                    formulario.reiniciarCampos({
                      region: e.target.value,
                      comuna: "",
                    })
                  }
                >
                  <OpcionesRegion />
                </select>
                <ErrorCampo mensaje={errores.region} />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="perfil-comuna">
                  Comuna
                </label>
                <select
                  {...campo("comuna")}
                  disabled={!tieneComunas(valores.region)}
                  onChange={(e) => cambiar("comuna", e.target.value)}
                >
                  <OpcionesComuna region={valores.region} />
                </select>
                <ErrorCampo mensaje={errores.comuna} />
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="perfil-direccion">
                  Dirección
                </label>
                <input
                  type="text"
                  maxLength={300}
                  autoComplete="street-address"
                  {...campo("direccion")}
                  onChange={(e) => cambiar("direccion", e.target.value)}
                />
                <ErrorCampo mensaje={errores.direccion} />
              </div>
            </div>

            <button type="submit" className="btn-primary mt-4">
              Guardar cambios
            </button>

            {mensaje && (
              <p
                className={`alert mt-3 mb-0 ${exito ? "alert-success" : "alert-danger"}`}
                role="status"
              >
                {mensaje}
              </p>
            )}
          </form>
        </section>
      </div>

      {/* Citas confirmadas asociadas al correo de la cuenta. */}
      <section className="profile-appointments mt-5" aria-labelledby="citas-perfil-titulo">
        <span className="admin-eyebrow">AGENDA</span>
        <h2 id="citas-perfil-titulo" className="h4 mt-2 mb-3">Mis próximas citas</h2>
        {citasFuturas.length === 0 ? (
          <p className="profile-appointments-empty">
            No tienes citas futuras confirmadas por ahora. Cuando el equipo de
            la veterinaria confirme una solicitud, aparecerá aquí.
          </p>
        ) : (
          <div className="profile-appointments-list">
            {citasFuturas.map((cita) => (
              <article className="profile-appointment" key={cita.id}>
                <div className="profile-appointment-date" aria-label={`Fecha: ${cita.fecha}`}>
                  <span>{cita.fecha.split("-")[2]}</span>
                  <small>{cita.fecha.split("-")[1]}/{cita.fecha.split("-")[0]}</small>
                </div>
                <div className="profile-appointment-info">
                  <h3>{cita.tipoConsulta}</h3>
                  <p>
                    <strong>Mascota:</strong> {cita.mascota} · {cita.especie}
                  </p>
                  {cita.motivo && (
                    <p>
                      <strong>Motivo:</strong> {cita.motivo}
                    </p>
                  )}
                </div>
                <span className="profile-appointment-status">Confirmada</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
