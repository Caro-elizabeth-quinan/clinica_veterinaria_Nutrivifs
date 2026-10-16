import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { guardarPerfiles, leerPerfiles } from "../../servicios/perfiles";
import type { Perfil, Rol } from "../../tipos";
import { rolesAsignables } from "../../utils/roles";
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
function crearReglas(
  emailActual: string,
  passwordOpcional: boolean,
): Reglas<FormularioUsuario> {
  const reglas: Reglas<FormularioUsuario> = crearReglasUsuario({
    emailActual,
    passwordOpcional,
  });
  delete reglas.genero;
  delete reglas.aceptaTerminos;
  return reglas;
}

// Campos que se muestran como <select> (usan la clase "form-select").
const CAMPOS_SELECT: (keyof FormularioUsuario)[] = ["role", "region", "comuna"];

// Nuevo, editar y mostrar usuario. "soloLectura" corresponde a "Mostrar".
export default function AdminUsuarioForm({
  soloLectura = false,
}: {
  soloLectura?: boolean;
}) {
  const { email = "" } = useParams();
  const emailActual = normalizarEmail(email);
  const { sesion, iniciarSesion } = useSesion();
  const navegar = useNavigate();
  const usuario = emailActual
    ? leerPerfiles().find((perfil) => perfil.email === emailActual)
    : undefined;
  // El Vendedor solo crea usuarios con rol Cliente (y no edita usuarios).
  const esVendedor = sesion?.role === "Vendedor";
  const roles = rolesAsignables(sesion?.role ?? "Cliente");
  // Nadie puede cambiar su propio rol (tampoco el Administrador).
  const esCuentaPropia = Boolean(usuario) && emailActual === sesion?.email;

  const formulario = useFormulario<FormularioUsuario>(
    usuario
      ? {
          ...USUARIO_VACIO,
          run: usuario.run || "",
          name: usuario.name || "",
          apellido: usuario.apellido || "",
          email: usuario.email,
          birthDate: usuario.birthDate || "",
          phone: usuario.phone || PREFIJO_TELEFONO,
          role: usuario.role || "Cliente",
          region: usuario.region || "",
          comuna: usuario.comuna || "",
          direccion: usuario.direccion || "",
        }
      : { ...USUARIO_VACIO, role: esVendedor ? "Cliente" : "" },
    crearReglas(emailActual, Boolean(usuario)),
  );
  const { valores, errores, cambiar, tocar } = formulario;
  const [mensaje, setMensaje] = useState("");

  if (emailActual && !usuario) {
    return (
      <EncabezadoPanel titulo="Usuario no encontrado">
        <Link className="btn-secondary" to="/admin/usuarios">
          Volver al listado
        </Link>
      </EncabezadoPanel>
    );
  }

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();

    if (!formulario.validarTodo()) {
      setMensaje("Revisa los campos marcados en rojo.");
      return;
    }

    // Segunda barrera: el rol elegido debe estar entre los permitidos.
    if (!(roles as string[]).includes(valores.role)) {
      formulario.fijarError("role", "No tienes permiso para asignar este rol.");
      return;
    }

    const datos: Perfil = {
      // El género y el estado de bloqueo no se editan aquí: se conservan.
      genero: usuario?.genero ?? "",
      failedAttempts: usuario?.failedAttempts ?? 0,
      locked: usuario?.locked ?? false,
      run: valores.run.trim().toUpperCase(),
      name: valores.name.trim(),
      apellido: valores.apellido.trim(),
      email: normalizarEmail(valores.email),
      birthDate: valores.birthDate,
      phone: valores.phone === PREFIJO_TELEFONO ? "" : valores.phone,
      role: valores.role as Rol,
      region: valores.region,
      comuna: valores.comuna,
      direccion: valores.direccion.trim(),
      // Al editar, la contraseña vacía conserva la actual.
      password: valores.password || usuario?.password || "",
    };

    const perfiles = leerPerfiles();
    const indice = perfiles.findIndex((perfil) => perfil.email === emailActual);

    if (indice >= 0) perfiles[indice] = datos;
    else perfiles.push(datos);

    guardarPerfiles(perfiles);

    // Si el administrador edita su propia cuenta, la sesión se actualiza.
    if (usuario && emailActual === sesion?.email) iniciarSesion(datos);

    navegar("/admin/usuarios");
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
          {soloLectura && !esVendedor && (
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
            onChange={(e) => cambiar("email", e.target.value)}
          />
          <ErrorCampo mensaje={errores.email} />
          <small className="campo-ayuda">
            Solo @duoc.cl, @profesor.duoc.cl y @gmail.com.
          </small>
        </label>

        <div className="row g-3">
          <label className="col-md-6">
            Fecha de nacimiento (opcional)
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
            {(soloLectura || esCuentaPropia ? [valores.role] : roles).map(
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
          {esVendedor && !soloLectura && (
            <small className="campo-ayuda">
              Como vendedor solo puedes crear usuarios con rol Cliente.
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

            <button type="submit" className="btn-primary">
              Guardar usuario
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
