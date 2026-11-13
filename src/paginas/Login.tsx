import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import ErrorCampo from "../componentes/ErrorCampo";
import { claseCampo } from "../utils/claseCampo";
import { useSesion } from "../hooks/useSesion";
import { useFormulario, type Reglas } from "../hooks/useFormulario";
import { loginApi } from "../servicios/auth";
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

export default function Login() {
  const { iniciarSesion } = useSesion();
  const navegar = useNavigate();
  const [parametros] = useSearchParams();
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const formulario = useFormulario<FormularioLogin>(
    { email: "", password: "" },
    REGLAS,
  );
  const { valores, errores } = formulario;

  // Valida en el front y luego autentica contra el backend (POST /auth/login).
  // El backend revisa la contraseña con BCrypt, cuenta los intentos fallidos
  // y bloquea la cuenta al tercero; si todo está bien devuelve el JWT.
  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setMensaje("");
    if (!formulario.validarTodo()) return;

    setEnviando(true);
    try {
      const perfil = await loginApi(
        normalizarEmail(valores.email),
        valores.password,
      );
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
    } catch (error) {
      // 401: correo/contraseña incorrectos o cuenta bloqueada (mensaje del backend)
      const texto = axios.isAxiosError(error)
        ? (error.response?.data?.mensaje ??
          "No se pudo conectar con el servidor.")
        : "Error inesperado.";
      formulario.fijarError("password", texto);
    } finally {
      setEnviando(false);
    }
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
          <button className="auth-button" type="submit" disabled={enviando}>
            {enviando ? "Ingresando..." : "Iniciar sesión"}
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