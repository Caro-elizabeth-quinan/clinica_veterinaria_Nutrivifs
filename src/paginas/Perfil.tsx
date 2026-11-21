import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
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
import {
  actualizarMiPerfilApi,
  obtenerMiPerfilApi,
} from "../servicios/usuarios";
import { misComprasApi } from "../servicios/boleta";
import { misCitasApi } from "../servicios/citas";
import type { Cita, Orden, Perfil as PerfilUsuario } from "../tipos";
import { formatearMoneda } from "../utils/formato";
import {
  USUARIO_VACIO,
  crearReglasUsuario,
  type FormularioUsuario,
} from "../utils/reglasUsuario";
import {
  ANIO_MAXIMO_NACIMIENTO,
  PREFIJO_TELEFONO,
  calcularEdad,
  fechaHoyLocal,
  formatearTelefono,
} from "../utils/validaciones";

// Campos que el usuario puede editar de su propio perfil. El rol, el RUN,
// el correo y la contraseña no se modifican aquí.
type CampoPerfil =
  | "name"
  | "apellido"
  | "birthDate"
  | "phone"
  | "region"
  | "comuna"
  | "direccion";

const CAMPOS_SELECT: CampoPerfil[] = ["region", "comuna"];

const reglasBase = crearReglasUsuario();
const REGLAS_PERFIL: Reglas<FormularioUsuario> = {
  name: reglasBase.name,
  apellido: reglasBase.apellido,
  birthDate: reglasBase.birthDate,
  phone: reglasBase.phone,
  region: reglasBase.region,
  comuna: reglasBase.comuna,
  direccion: reglasBase.direccion,
};

function valoresDesde(perfil?: PerfilUsuario | null): FormularioUsuario {
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

function mensajeDeError(error: unknown): string {
  return axios.isAxiosError(error)
    ? (error.response?.data?.mensaje ?? "No se pudo conectar con el servidor.")
    : "Error inesperado.";
}

// Perfil personal: disponible para Administrador, Vendedor y Cliente.
export default function Perfil() {
  const { sesion, iniciarSesion } = useSesion();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [compras, setCompras] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const formulario = useFormulario<FormularioUsuario>(
    USUARIO_VACIO,
    REGLAS_PERFIL,
  );
  const { valores, errores, cambiar, tocar } = formulario;
  const [citas, setCitas] = useState<Cita[]>([]);

  // Citas del usuario desde el backend (GET /citas/mias)
  useEffect(() => {
    if (!sesion) return;
    misCitasApi().then(setCitas).catch(() => setCitas([]));
  }, [sesion]);

  // Carga el perfil (GET /auth/me) y las compras (GET /boletas/mias) desde el backend
  useEffect(() => {
    if (!sesion) return;
    async function cargar() {
      try {
        const [datos, misCompras] = await Promise.all([
          obtenerMiPerfilApi(),
          misComprasApi(),
        ]);
        setPerfil(datos);
        setCompras(misCompras);
        formulario.reiniciarCampos(valoresDesde(datos));
      } catch (error) {
        setErrorCarga(mensajeDeError(error));
      } finally {
        setCargando(false);
      }
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion?.email]);

  if (!sesion) return <Navigate to="/login" replace />;

  if (cargando) {
    return (
      <main className="container profile-page">
        <div className="d-flex align-items-center gap-3 py-5" role="status">
          <div className="spinner-border text-primary" aria-hidden="true" />
          <span>Cargando tu perfil...</span>
        </div>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main className="container profile-page">
        <p className="alert alert-warning">
          {errorCarga || "No se encontró la información de tu cuenta."}
        </p>
      </main>
    );
  }

  const edad = calcularEdad(perfil.birthDate);
  const hoy = fechaHoyLocal();
  const correoPerfil = perfil.email.trim().toLowerCase();
  const citasFuturas = citas
    .filter(
      (cita) =>
        cita.correo.trim().toLowerCase() === correoPerfil &&
        cita.estado === "Confirmada" &&
        cita.fecha >= hoy,
    )
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  // Guarda los cambios en el backend (PUT /usuarios/me)
  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setExito(false);

    if (!formulario.validarTodo()) {
      setMensaje("Revisa los campos marcados en rojo.");
      return;
    }

    setGuardando(true);
    try {
      const actualizado = await actualizarMiPerfilApi({
        run: perfil.run || "",
        name: valores.name.trim(),
        apellido: valores.apellido.trim(),
        email: perfil.email,
        birthDate: valores.birthDate || null,
        direccion: valores.direccion.trim(),
        region: valores.region,
        comuna: valores.comuna,
        phone: valores.phone === PREFIJO_TELEFONO ? "" : valores.phone,
      });
      setPerfil(actualizado);
      iniciarSesion(actualizado); // actualiza el nombre en el encabezado
      setExito(true);
      setMensaje("Tus datos se guardaron correctamente.");
    } catch (error) {
      setMensaje(mensajeDeError(error));
    } finally {
      setGuardando(false);
    }
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
                  id="perfil-email"
                  type="text"
                  className="form-control"
                  value={perfil.email}
                  disabled
                />
                <small className="campo-ayuda">
                  El correo identifica tu cuenta y no se puede modificar.
                </small>
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

            <button
              type="submit"
              className="btn-primary mt-4"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
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

      {/* Historial de compras guardado en el backend */}
      <section className="profile-appointments mt-5" aria-labelledby="compras-perfil-titulo">
        <span className="admin-eyebrow">TIENDA</span>
        <h2 id="compras-perfil-titulo" className="h4 mt-2 mb-3">Mis compras</h2>
        {compras.length === 0 ? (
          <p className="profile-appointments-empty">
            Aún no tienes compras registradas.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Fecha</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((orden) => (
                  <tr key={orden.id}>
                    <td>{orden.id}</td>
                    <td>{new Date(orden.date).toLocaleDateString("es-CL")}</td>
                    <td>
                      {orden.items
                        .map((item) => `${item.name} x${item.quantity}`)
                        .join(", ")}
                    </td>
                    <td>{formatearMoneda(orden.total)}</td>
                    <td>{orden.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Citas confirmadas asociadas al correo de la cuenta (vienen del backend). */}
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