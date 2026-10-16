import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ErrorCampo from "../componentes/ErrorCampo";
import { claseCampo } from "../utils/claseCampo";
import { useSesion } from "../hooks/useSesion";
import { useFormulario, type Reglas } from "../hooks/useFormulario";
import { guardarPerfiles, leerPerfiles } from "../servicios/perfiles";
import { destinoSegunRol } from "../utils/roles";
import {
  MENSAJE_DOMINIOS,
  esEmailValido,
  normalizarEmail,
} from "../utils/validaciones";

type FormularioLogin = { email: string; password: string };

const REGLAS: Reglas<FormularioLogin> = {
  email: (valor) => {
    const email = normalizarEmail(valor);
    if (!email) return "El correo es obligatorio.";
    if (email.length > 100)
      return "El correo no puede superar los 100 caracteres.";
    if (!esEmailValido(email)) return MENSAJE_DOMINIOS;
    return "";
  },
  password: (valor) => {
    if (!valor) return "La contraseña es obligatoria.";
    if (valor.length < 4 || valor.length > 10) {
      return "La contraseña debe tener entre 4 y 10 caracteres.";
    }
    return "";
  },
};

const CUENTA_BLOQUEADA =
  "Cuenta bloqueada por 3 intentos fallidos. Contacta a soporte para restablecerla.";

export default function Login() {
  const { iniciarSesion } = useSesion();
  const navegar = useNavigate();
  const [parametros] = useSearchParams();
  const [mensaje, setMensaje] = useState("");
  const formulario = useFormulario<FormularioLogin>(
    { email: "", password: "" },
    REGLAS,
  );
  const { valores, errores } = formulario;

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    setMensaje("");
    if (!formulario.validarTodo()) return;

    const email = normalizarEmail(valores.email);
    const perfiles = leerPerfiles();
    const perfil = perfiles.find((item) => item.email === email);

    if (!perfil) {
      formulario.fijarError(
        "email",
        "No existe una cuenta registrada con este correo.",
      );
      return;
    }

    if (perfil.locked) {
      formulario.fijarError("password", CUENTA_BLOQUEADA);
      return;
    }

    if (perfil.password !== valores.password) {
      perfil.failedAttempts = (perfil.failedAttempts || 0) + 1;
      // Después del tercer intento fallido la cuenta queda bloqueada.
      if (perfil.failedAttempts >= 3) perfil.locked = true;
      guardarPerfiles(perfiles);

      formulario.fijarError(
        "password",
        perfil.locked
          ? CUENTA_BLOQUEADA
          : "La contraseña no coincide con esta cuenta.",
      );
      return;
    }

    perfil.failedAttempts = 0;
    guardarPerfiles(perfiles);
    iniciarSesion(perfil);
    setMensaje("Sesión iniciada correctamente.");

    // Administrador y Vendedor entran al panel; el Cliente vuelve a la tienda
    // (o al carrito, si venía de intentar pagar).
    const rol = perfil.role || "Cliente";
    navegar(
      rol === "Cliente" && parametros.get("volver") === "carrito"
        ? "/carrito"
        : destinoSegunRol(rol),
    );
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <img
          className="auth-logo"
          src="/img/logo.svg"
          alt="Logo de Clínica NutriDifs"
        />
        <Link className="auth-brand" to="/">
          Clínica NutriDifs
        </Link>
        <p className="auth-kicker">Acceso de clientes</p>
        <h1 className="auth-title">Iniciar sesión</h1>
        <p className="auth-subtitle">
          Ingresa para continuar con tus compras y reservas.
        </p>
        <form
          id="standalone-login-form"
          className="auth-form"
          noValidate
          onSubmit={enviar}
        >
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="usuario@duoc.cl"
            maxLength={100}
            className={claseCampo(errores.email, "form-control")}
            value={valores.email}
            onChange={(evento) =>
              formulario.cambiar("email", evento.target.value)
            }
            onBlur={() => formulario.tocar("email")}
          />
          <ErrorCampo mensaje={errores.email} />
          <small className="campo-ayuda">
            Correos permitidos: @duoc.cl, @profesor.duoc.cl y @gmail.com.
          </small>

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            maxLength={10}
            className={claseCampo(errores.password, "form-control")}
            value={valores.password}
            onChange={(evento) =>
              formulario.cambiar("password", evento.target.value)
            }
            onBlur={() => formulario.tocar("password")}
          />
          <ErrorCampo mensaje={errores.password} />
          <small className="campo-ayuda">Entre 4 y 10 caracteres.</small>

          <p
            id="standalone-login-message"
            className="auth-message"
            aria-live="polite"
          >
            {mensaje}
          </p>
          <button className="auth-button" type="submit">
            Iniciar sesión
          </button>
        </form>
        <nav className="auth-links" aria-label="Opciones de acceso">
          <Link to="/registro">Crear una cuenta</Link>
          <Link to="/">Volver al inicio</Link>
        </nav>
      </div>
    </main>
  );
}
