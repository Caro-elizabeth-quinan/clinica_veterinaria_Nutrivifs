import type { Reglas } from "../hooks/useFormulario";
import { leerPerfiles } from "../servicios/perfiles";
import { ROLES } from "./roles";
import {
  MENSAJE_DOMINIOS,
  MENSAJE_EDAD,
  MENSAJE_TELEFONO,
  PREFIJO_TELEFONO,
  esEmailValido,
  esFechaNacimientoValida,
  esPasswordValida,
  esTelefonoValido,
  normalizarEmail,
} from "./validaciones";

// Campos del formulario de usuario. El registro de la tienda y el
// "Nuevo/Editar usuario" del administrador usan los mismos (Anexo 1).
export type FormularioUsuario = {
  run: string;
  name: string;
  apellido: string;
  email: string;
  birthDate: string;
  phone: string;
  region: string;
  comuna: string;
  direccion: string;
  genero: string;
  role: string;
  password: string;
  confirmPassword: string;
  aceptaTerminos: boolean;
};

export const USUARIO_VACIO: FormularioUsuario = {
  run: "",
  name: "",
  apellido: "",
  email: "",
  birthDate: "",
  phone: PREFIJO_TELEFONO,
  region: "",
  comuna: "",
  direccion: "",
  genero: "",
  role: "",
  password: "",
  confirmPassword: "",
  aceptaTerminos: false,
};

interface Opciones {
  // Correo del usuario que se está editando, para no marcarlo como
  // duplicado contra sí mismo.
  emailActual?: string;
  // Al editar, la contraseña vacía conserva la actual.
  passwordOpcional?: boolean;
}

export function crearReglasUsuario(
  opciones: Opciones = {},
): Required<Reglas<FormularioUsuario>> {
  const { emailActual = "", passwordOpcional = false } = opciones;
  const otrosPerfiles = () =>
    leerPerfiles().filter((perfil) => perfil.email !== emailActual);

  return {
    run: (valor) => {
      const run = valor.trim().toUpperCase();
      if (!run) return "El RUN es obligatorio.";
      if (!/^\d+[0-9K]$/.test(run)) {
        return "Ingresa el RUN sin puntos ni guion. Ej: 19011022K.";
      }
      if (run.length < 7 || run.length > 9) {
        return "El RUN debe tener entre 7 y 9 caracteres.";
      }
      if (otrosPerfiles().some((perfil) => perfil.run === run)) {
        return "Ya existe un usuario con este RUN.";
      }
      return "";
    },
    name: (valor) => {
      const nombre = valor.trim();
      if (!nombre) return "El nombre es obligatorio.";
      if (nombre.length > 50)
        return "El nombre no puede superar los 50 caracteres.";
      return "";
    },
    apellido: (valor) => {
      const apellido = valor.trim();
      if (!apellido) return "Los apellidos son obligatorios.";
      if (apellido.length > 100) {
        return "Los apellidos no pueden superar los 100 caracteres.";
      }
      return "";
    },
    email: (valor) => {
      const email = normalizarEmail(valor);
      if (!email) return "El correo es obligatorio.";
      if (email.length > 100)
        return "El correo no puede superar los 100 caracteres.";
      if (!esEmailValido(email)) return MENSAJE_DOMINIOS;
      if (otrosPerfiles().some((perfil) => perfil.email === email)) {
        return "Ese correo ya está registrado.";
      }
      return "";
    },
    // Opcional; si se informa, debe cumplir la edad mínima.
    birthDate: (valor) =>
      !valor || esFechaNacimientoValida(valor) ? "" : MENSAJE_EDAD,
    phone: (valor) =>
      !valor || valor === PREFIJO_TELEFONO || esTelefonoValido(valor)
        ? ""
        : MENSAJE_TELEFONO,
    region: (valor) => (valor ? "" : "Selecciona una región."),
    comuna: (valor) => (valor ? "" : "Selecciona una comuna."),
    direccion: (valor) => {
      const direccion = valor.trim();
      if (!direccion) return "La dirección es obligatoria.";
      if (direccion.length > 300) {
        return "La dirección no puede superar los 300 caracteres.";
      }
      return "";
    },
    genero: (valor) => (valor ? "" : "Selecciona una opción."),
    role: (valor) =>
      (ROLES as string[]).includes(valor)
        ? ""
        : "Selecciona el tipo de usuario.",
    password: (valor) => {
      if (!valor && passwordOpcional) return "";
      if (!valor) return "La contraseña es obligatoria.";
      if (!esPasswordValida(valor)) {
        return "Debe tener entre 4 y 10 caracteres y al menos una mayúscula.";
      }
      return "";
    },
    confirmPassword: (valor, valores) =>
      valor === valores.password
        ? ""
        : "La confirmación de contraseña no coincide.",
    aceptaTerminos: (aceptado) =>
      aceptado ? "" : "Debes aceptar los términos y condiciones.",
  };
}
