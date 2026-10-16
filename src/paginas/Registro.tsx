import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorCampo from "../componentes/ErrorCampo";
import { claseCampo } from "../utils/claseCampo";
import {
  OpcionesComuna,
  OpcionesRegion,
} from "../componentes/SelectsRegionComuna";
import { tieneComunas } from "../utils/regiones";
import { useSesion } from "../hooks/useSesion";
import { useFormulario } from "../hooks/useFormulario";
import { guardarPerfiles, leerPerfiles } from "../servicios/perfiles";
import type { Perfil } from "../tipos";
import {
  USUARIO_VACIO,
  crearReglasUsuario,
  type FormularioUsuario,
} from "../utils/reglasUsuario";
import {
  fechaMaximaNacimientoLocal,
  PREFIJO_TELEFONO,
  formatearTelefono,
  limpiarRun,
  normalizarEmail,
} from "../utils/validaciones";

// En la tienda todos se registran como Cliente: no se pide el tipo de usuario.
const { role: _sinRol, ...REGLAS } = crearReglasUsuario();

// Campos que se muestran como <select> (usan la clase "form-select").
const CAMPOS_SELECT: (keyof FormularioUsuario)[] = [
  "region",
  "comuna",
  "genero",
];



export default function Registro() {
  const { iniciarSesion } = useSesion();
  const navegar = useNavigate();
  const [mensaje, setMensaje] = useState("");
  const [fechaMaximaNacimiento] = useState(fechaMaximaNacimientoLocal);
  const formulario = useFormulario<FormularioUsuario>(USUARIO_VACIO, REGLAS);
  const { valores, errores, cambiar, tocar } = formulario;

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();

    if (!formulario.validarTodo()) {
      setMensaje("Revisa los campos marcados en rojo.");
      return;
    }

    const perfil: Perfil = {
      run: valores.run.trim().toUpperCase(),
      name: valores.name.trim(),
      apellido: valores.apellido.trim(),
      email: normalizarEmail(valores.email),
      birthDate: valores.birthDate,
      direccion: valores.direccion.trim(),
      region: valores.region,
      comuna: valores.comuna,
      genero: valores.genero,
      phone: valores.phone === PREFIJO_TELEFONO ? "" : valores.phone,
      role: "Cliente",
      password: valores.password,
      failedAttempts: 0,
      locked: false,
    };

    guardarPerfiles([...leerPerfiles(), perfil]);
    iniciarSesion(perfil);
    navegar("/");
  };

  // Atributos comunes de un campo de texto controlado.
  const campo = (
    nombre: Exclude<keyof FormularioUsuario, "aceptaTerminos">,
  ) => ({
    name: nombre,
    className: claseCampo(
      errores[nombre],
      CAMPOS_SELECT.includes(nombre) ? "form-select" : "form-control",
    ),
    value: valores[nombre],
    onBlur: () => tocar(nombre),
  });

  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="auth-eyebrow">NUEVO CLIENTE</span>
        <h1>Registro de usuario</h1>
        <p className="auth-description">
          Regístrate para comprar en la tienda y solicitar atención veterinaria.
        </p>
        <form
          id="standalone-register-form"
          className="auth-form"
          noValidate
          onSubmit={enviar}
        >
          <label htmlFor="reg-run">RUN</label>
          <input
            type="text"
            id="reg-run"
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

          <label htmlFor="reg-name">Nombre</label>
          <input
            type="text"
            id="reg-name"
            autoComplete="given-name"
            maxLength={50}
            {...campo("name")}
            onChange={(e) => cambiar("name", e.target.value)}
          />
          <ErrorCampo mensaje={errores.name} />

          <label htmlFor="reg-apellido">Apellidos</label>
          <input
            type="text"
            id="reg-apellido"
            autoComplete="family-name"
            maxLength={100}
            {...campo("apellido")}
            onChange={(e) => cambiar("apellido", e.target.value)}
          />
          <ErrorCampo mensaje={errores.apellido} />

          <label htmlFor="reg-email">Correo</label>
          <input
            type="text"
            inputMode="email"
            id="reg-email"
            autoComplete="email"
            placeholder="usuario@duoc.cl"
            maxLength={100}
            {...campo("email")}
            onChange={(e) => cambiar("email", e.target.value)}
          />
          <ErrorCampo mensaje={errores.email} />

          <label htmlFor="reg-birth">Fecha de nacimiento</label>
          <input
            type="date"
            id="reg-birth"
            autoComplete="bday"
            max={fechaMaximaNacimiento} 
            {...campo("birthDate")}
            onChange={(e) => cambiar("birthDate", e.target.value)}
          />
          <ErrorCampo mensaje={errores.birthDate} />

          <label htmlFor="reg-phone">Teléfono (opcional)</label>
          <input
            type="tel"
            id="reg-phone"
            autoComplete="tel"
            placeholder="+56934040042"
            maxLength={12}
            {...campo("phone")}
            onChange={(e) =>
              cambiar("phone", formatearTelefono(e.target.value))
            }
          />
          <ErrorCampo mensaje={errores.phone} />

          <label htmlFor="reg-region">Región</label>
          <select
            id="reg-region"
            autoComplete="address-level1"
            {...campo("region")}
            onChange={(e) => {
              // Al cambiar la región se reinicia la comuna.
              formulario.reiniciarCampos({
                region: e.target.value,
                comuna: "",
              });
            }}
          >
            <OpcionesRegion />
          </select>
          <ErrorCampo mensaje={errores.region} />

          <label htmlFor="reg-comuna">Comuna</label>
          <select
            id="reg-comuna"
            autoComplete="address-level2"
            disabled={!tieneComunas(valores.region)}
            {...campo("comuna")}
            onChange={(e) => cambiar("comuna", e.target.value)}
          >
            <OpcionesComuna region={valores.region} />
          </select>
          <ErrorCampo mensaje={errores.comuna} />

          <label htmlFor="reg-direccion">Dirección</label>
          <input
            type="text"
            id="reg-direccion"
            autoComplete="street-address"
            maxLength={300}
            {...campo("direccion")}
            onChange={(e) => cambiar("direccion", e.target.value)}
          />
          <ErrorCampo mensaje={errores.direccion} />

          <label htmlFor="reg-genero">Género</label>
          <select
            id="reg-genero"
            {...campo("genero")}
            onChange={(e) => cambiar("genero", e.target.value)}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            <option value="femenino">Femenino</option>
            <option value="masculino">Masculino</option>
            <option value="otro">Otro</option>
            <option value="prefiero-no-decir">Prefiero no decir</option>
          </select>
          <ErrorCampo mensaje={errores.genero} />

          <label htmlFor="reg-pass">Contraseña</label>
          <input
            type="password"
            id="reg-pass"
            autoComplete="new-password"
            maxLength={10}
            {...campo("password")}
            onChange={(e) => cambiar("password", e.target.value)}
          />
          <ErrorCampo mensaje={errores.password} />
          <small className="campo-ayuda">
            Debe tener entre 4 y 10 caracteres y al menos una mayúscula.
          </small>

          <label htmlFor="reg-confirm-pass">Confirmar contraseña</label>
          <input
            type="password"
            id="reg-confirm-pass"
            autoComplete="new-password"
            maxLength={10}
            {...campo("confirmPassword")}
            onChange={(e) => cambiar("confirmPassword", e.target.value)}
          />
          <ErrorCampo mensaje={errores.confirmPassword} />

          <label className="auth-checkbox">
            <input
              type="checkbox"
              className="form-check-input me-2"
              id="reg-terminos"
              name="aceptaTerminos"
              checked={valores.aceptaTerminos}
              onChange={(e) => cambiar("aceptaTerminos", e.target.checked)}
            />
            <ErrorCampo mensaje={errores.aceptaTerminos} /> Acepto los{" "}
            <Link to="/terminos" target="_blank" rel="noopener noreferrer">
              términos y condiciones
            </Link>{" "}
            de registro.
          </label>

          <button type="submit" className="btn-primary">
            Registrar
          </button>
          <p
            id="standalone-register-message"
            className="profile-message"
            role="status"
          >
            {mensaje}
          </p>
        </form>
        <nav className="auth-links" aria-label="Opciones de cuenta">
          <Link to="/login">Ya tengo una cuenta</Link>
          <Link to="/">Volver al inicio</Link>
        </nav>
      </div>
    </main>
  );
}
