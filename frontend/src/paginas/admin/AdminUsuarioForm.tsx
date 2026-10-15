import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ErrorCampo, { claseCampo } from "../../componentes/ErrorCampo";
import {
  OpcionesComuna,
  OpcionesRegion,
  tieneComunas,
} from "../../componentes/SelectsRegionComuna";
import { useSesion } from "../../contexto/SesionContexto";
import { useFormulario, type Reglas } from "../../hooks/useFormulario";
import { guardarPerfiles, leerPerfiles } from "../../servicios/perfiles";
import type { Perfil, Rol } from "../../tipos";
import {
  ROLES,
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
      : USUARIO_VACIO,
    crearReglas(emailActual, Boolean(usuario)),
  );
  const { valores, errores, cambiar, tocar } = formulario;
  const [mensaje, setMensaje] = useState("");

  if (emailActual && !usuario) {
    return (
      <div className="admin-heading">
        <h1>Usuario no encontrado</h1>
        <Link className="btn-secondary" to="/admin/usuarios">
          Volver al listado
        </Link>
      </div>
    );
  }

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();

    if (!formulario.validarTodo()) {
      setMensaje("Revisa los campos marcados en rojo.");
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
    className: claseCampo(errores[nombre]),
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
      <div className="admin-heading">
        <div>
          <span className="admin-eyebrow">USUARIOS</span>
          <h1>{titulo}</h1>
        </div>
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
      </div>

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

        <div className="admin-form-row">
          <label>
            Nombre
            <input
              type="text"
              maxLength={50}
              {...campo("name")}
              onChange={(e) => cambiar("name", e.target.value)}
            />
            <ErrorCampo mensaje={errores.name} />
          </label>

          <label>
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

        <div className="admin-form-row">
          <label>
            Fecha de nacimiento (opcional)
            <input
              type="date"
              {...campo("birthDate")}
              onChange={(e) => cambiar("birthDate", e.target.value)}
            />
            <ErrorCampo mensaje={errores.birthDate} />
          </label>

          <label>
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
            onChange={(e) => cambiar("role", e.target.value)}
          >
            <option value="">-- Selecciona el tipo de usuario --</option>
            {ROLES.map((rol) => (
              <option key={rol} value={rol}>
                {rol}
              </option>
            ))}
          </select>
          <ErrorCampo mensaje={errores.role} />
        </label>

        <div className="admin-form-row">
          <label>
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

          <label>
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
            <div className="admin-form-row">
              <label>
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

              <label>
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
