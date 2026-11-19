import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import EncabezadoPanel from "../../componentes/EncabezadoPanel";
import ErrorCampo from "../../componentes/ErrorCampo";
import { claseCampo } from "../../utils/claseCampo";
import {
  OpcionesComuna,
  OpcionesRegion,
} from "../../componentes/SelectsRegionComuna";
import { tieneComunas } from "../../utils/regiones";
import { useSesion } from "../../hooks/useSesion";
import { useFormulario, type Reglas } from "../../hooks/useFormulario";
import {
  actualizarUsuarioApi,
  crearUsuarioApi,
  listarUsuariosApi,
  type DatosUsuario,
  type UsuarioApi,
} from "../../servicios/usuarios";
import { ROLES } from "../../utils/roles";
import {
  USUARIO_VACIO,
  crearReglasUsuario,
  type FormularioUsuario,
} from "../../utils/reglasUsuario";
import {
  PREFIJO_TELEFONO,
  formatearTelefono,
  limpiarRun,
  normalizarEmail,
} from "../../utils/validaciones";

// Este formulario no pide género ni aceptación de términos.
function crearReglas(passwordOpcional: boolean): Reglas<FormularioUsuario> {
  const reglas: Reglas<FormularioUsuario> = crearReglasUsuario({
    passwordOpcional,
  });
  delete reglas.genero;
  delete reglas.aceptaTerminos;
  return reglas;
}

// Campos que se muestran como <select> (usan la clase "form-select").
const CAMPOS_SELECT: (keyof FormularioUsuario)[] = ["role", "region", "comuna"];

function mensajeDeError(error: unknown, porDefecto: string): string {
  return axios.isAxiosError(error)
    ? (error.response?.data?.mensaje ?? porDefecto)
    : "Error inesperado.";
}

// Nuevo, editar y mostrar usuario (solo Administrador). "soloLectura" = "Mostrar".
export default function AdminUsuarioForm({
  soloLectura = false,
}: {
  soloLectura?: boolean;
}) {
  const { email = "" } = useParams();
  const emailActual = normalizarEmail(email);
  const { sesion, iniciarSesion } = useSesion();
  const navegar = useNavigate();

  const [usuario, setUsuario] = useState<UsuarioApi | null>(null);
  const [cargando, setCargando] = useState(Boolean(emailActual));
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const formulario = useFormulario<FormularioUsuario>(
    USUARIO_VACIO,
    crearReglas(Boolean(emailActual)),
  );
  const { valores, errores, cambiar, tocar } = formulario;

  // Nadie puede cambiar su propio rol (tampoco el Administrador).
  const esCuentaPropia = Boolean(usuario) && emailActual === sesion?.email;

  // Si es edición o detalle, busca el usuario por su correo (GET /usuarios)
  useEffect(() => {
    if (!emailActual) return;
    async function cargar() {
      try {
        const encontrado = (await listarUsuariosApi()).find(
          (u) => u.email === emailActual,
        );
        if (!encontrado) {
          setNoEncontrado(true);
          return;
        }
        setUsuario(encontrado);
        formulario.reiniciar({
          ...USUARIO_VACIO,
          run: encontrado.run || "",
          name: encontrado.name || "",
          apellido: encontrado.apellido || "",
          email: encontrado.email,
          birthDate: encontrado.birthDate || "",
          phone: encontrado.phone || PREFIJO_TELEFONO,
          role: encontrado.role || "Cliente",
          region: encontrado.region || "",
          comuna: encontrado.comuna || "",
          direccion: encontrado.direccion || "",
        });
      } catch (error) {
        setMensaje(mensajeDeError(error, "No se pudo conectar con el servidor."));
      } finally {
        setCargando(false);
      }
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailActual]);

  if (cargando) {
    return (
      <div className="d-flex align-items-center gap-3 py-4" role="status">
        <div className="spinner-border text-primary" aria-hidden="true" />
        <span>Cargando usuario...</span>
      </div>
    );
  }

  if (noEncontrado) {
    return (
      <EncabezadoPanel titulo="Usuario no encontrado">
        <Link className="btn-secondary" to="/admin/usuarios">
          Volver al listado
        </Link>
      </EncabezadoPanel>
    );
  }

  // POST /usuarios (nuevo) o PUT /usuarios/{id} (editar)
  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (!formulario.validarTodo()) {
      setMensaje("Revisa los campos marcados en rojo.");
      return;
    }

    const datos: DatosUsuario = {
      run: valores.run.trim().toUpperCase(),
      name: valores.name.trim(),
      apellido: valores.apellido.trim(),
      email: usuario ? usuario.email : normalizarEmail(valores.email),
      password: valores.password, // vacía al editar = se conserva
      role: valores.role,
      birthDate: valores.birthDate || null,
      direccion: valores.direccion.trim(),
      region: valores.region,
      comuna: valores.comuna,
      phone: valores.phone === PREFIJO_TELEFONO ? "" : valores.phone,
    };

    setGuardando(true);
    setMensaje("");
    try {
      if (usuario) {
        const actualizado = await actualizarUsuarioApi(usuario.id, datos);
        // Si el administrador edita su propia cuenta, la sesión se actualiza.
        if (esCuentaPropia) iniciarSesion(actualizado);
      } else {
        await crearUsuarioApi(datos);
      }
      navegar("/admin/usuarios");
    } catch (error) {
      // 400: correo o RUN repetido, edad mínima, contraseña inválida, cambiar el propio rol...
      setMensaje(mensajeDeError(error, "No se pudo guardar el usuario."));
    } finally {
      setGuardando(false);
    }
  };

  // Atributos comunes de un campo controlado.
  const campo = (
    nombre: Exclude<keyof FormularioUsuario, "aceptaTerminos">,
  ) => ({
    name: nombre,
    className: claseCampo(
      errores[nombre],
      CAMPOS_SELECT.includes(nombre) ? "form-select" : "form-control",
    ),
    value: valores[nombre],
    disabled: soloLectura,
    onBlur: () => tocar(nombre),
  });

  const titulo = !usuario
    ? "Nuevo usuario"
    : soloLectura
      ? "Detalle del usuario"
      : "Editar usuario";

  return (
    <>
      <EncabezadoPanel etiqueta="USUARIOS" titulo={titulo}>
        <div className="admin-heading-actions">
          {soloLectura && (
            <Link
              className="btn-primary"
              to={`/admin/usuarios/${encodeURIComponent(emailActual)}/editar`}
            >
              Editar
            </Link>
          )}
          <Link className="btn-secondary" to="/admin/usuarios">
            Volver al listado
          </Link>
        </div>
      </EncabezadoPanel>

      <form className="admin-form" noValidate onSubmit={enviar}>
        <label>
          RUN
          <input
            type="text"
            placeholder="19011022K"
            maxLength={9}
            autoComplete="off"
            {...campo("run")}
            onChange={(e) => cambiar("run", limpiarRun(e.target.value))}
          />
          <ErrorCampo mensaje={errores.run} />
          <small className="campo-ayuda">
            Sin puntos ni guion. Ej: 19011022K.
          </small>
        </label>

        <div className="row g-3">
          <label className="col-md-6">
            Nombre
            <input
              type="text"
              maxLength={50}
              {...campo("name")}
              onChange={(e) => cambiar("name", e.target.value)}
            />
            <ErrorCampo mensaje={errores.name} />
          </label>

          <label className="col-md-6">
            Apellidos
            <input
              type="text"
              maxLength={100}
              {...campo("apellido")}
              onChange={(e) => cambiar("apellido", e.target.value)}
            />
            <ErrorCampo mensaje={errores.apellido} />
          </label>
        </div>

        <label>
          Correo
          <input
            type="text"
            inputMode="email"
            placeholder="usuario@duoc.cl"
            maxLength={100}
            {...campo("email")}
            disabled={soloLectura || Boolean(usuario)}
            onChange={(e) => cambiar("email", e.target.value)}
          />
          <ErrorCampo mensaje={errores.email} />
          <small className="campo-ayuda">
            {usuario
              ? "El correo identifica la cuenta y no se puede modificar."
              : "Solo @duoc.cl, @profesor.duoc.cl y @gmail.com."}
          </small>
        </label>

        <div className="row g-3">
          <label className="col-md-6">
            Fecha de nacimiento
            <input
              type="date"
              {...campo("birthDate")}
              onChange={(e) => cambiar("birthDate", e.target.value)}
            />
            <ErrorCampo mensaje={errores.birthDate} />
          </label>

          <label className="col-md-6">
            Teléfono (opcional)
            <input
              type="tel"
              placeholder="+56934040042"
              maxLength={12}
              {...campo("phone")}
              onChange={(e) =>
                cambiar("phone", formatearTelefono(e.target.value))
              }
            />
            <ErrorCampo mensaje={errores.phone} />
          </label>
        </div>

        <label>
          Tipo de usuario
          <select
            {...campo("role")}
            disabled={soloLectura || esCuentaPropia}
            onChange={(e) => cambiar("role", e.target.value)}
          >
            <option value="">-- Selecciona el tipo de usuario --</option>
            {(soloLectura || esCuentaPropia ? [valores.role] : ROLES).map(
              (rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ),
            )}
          </select>
          <ErrorCampo mensaje={errores.role} />
          {esCuentaPropia && !soloLectura && (
            <small className="campo-ayuda">
              No puedes cambiar el rol de tu propia cuenta.
            </small>
          )}
        </label>

        <div className="row g-3">
          <label className="col-md-6">
            Región
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
          </label>

          <label className="col-md-6">
            Comuna
            <select
              {...campo("comuna")}
              disabled={soloLectura || !tieneComunas(valores.region)}
              onChange={(e) => cambiar("comuna", e.target.value)}
            >
              <OpcionesComuna region={valores.region} />
            </select>
            <ErrorCampo mensaje={errores.comuna} />
          </label>
        </div>

        <label>
          Dirección
          <input
            type="text"
            maxLength={300}
            {...campo("direccion")}
            onChange={(e) => cambiar("direccion", e.target.value)}
          />
          <ErrorCampo mensaje={errores.direccion} />
        </label>

        {!soloLectura && (
          <>
            <div className="row g-3">
              <label className="col-md-6">
                Contraseña
                <input
                  type="password"
                  maxLength={10}
                  autoComplete="new-password"
                  {...campo("password")}
                  onChange={(e) => cambiar("password", e.target.value)}
                />
                <ErrorCampo mensaje={errores.password} />
                <small className="campo-ayuda">
                  {usuario
                    ? "Déjala en blanco para conservar la contraseña actual."
                    : "Entre 4 y 10 caracteres y al menos una mayúscula."}
                </small>
              </label>

              <label className="col-md-6">
                Confirmar contraseña
                <input
                  type="password"
                  maxLength={10}
                  autoComplete="new-password"
                  {...campo("confirmPassword")}
                  onChange={(e) => cambiar("confirmPassword", e.target.value)}
                />
                <ErrorCampo mensaje={errores.confirmPassword} />
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar usuario"}
            </button>
            <p className="profile-message" role="status">
              {mensaje}
            </p>
          </>
        )}
      </form>
    </>
  );
}