// Reglas básicas de validación y formato (sin DOM), compartidas por los
// formularios de la tienda y del administrador.

export function normalizarEmail(email: string): string {
  return String(email || "")
    .trim()
    .toLowerCase();
}

// Dominios aceptados por los formularios de la clínica.
export function esEmailValido(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(
    normalizarEmail(email),
  );
}

export const MENSAJE_DOMINIOS =
  "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.";

// Contraseña: entre 4 y 10 caracteres (Anexo 1) y al menos una mayúscula
// (regla adicional del equipo).
export function esPasswordValida(password: string): boolean {
  return (
    password.length >= 4 && password.length <= 10 && /[A-Z]/.test(password)
  );
}

// Correo de "Agenda tu consulta": máx. 24 letras/números antes de la @.
export const CORREO_AGENDAMIENTO_REGEX =
  /^[A-Za-z0-9]{1,24}@(gmail\.com|profesor\.duoc\.cl|duoc\.cl)$/;

// ---------------------------------------------------------
// RUT
// ---------------------------------------------------------

const RUT_FORMATO_REGEX = /^\d{1,2}\.\d{3}\.\d{3}-[0-9K]$/;

// Formatea mientras se escribe: 12.345.678-5. La K solo es válida como
// dígito verificador (último carácter).
export function formatearRut(valor: string): string {
  const crudo = String(valor || "")
    .toUpperCase()
    .replace(/[^0-9K]/g, "");

  const terminaEnK = crudo.endsWith("K");
  const digitos = crudo.replace(/K/g, "");
  const limpio = (terminaEnK ? digitos.slice(0, 8) + "K" : digitos).slice(0, 9);

  if (limpio.length <= 1) return limpio;

  const dv = limpio.slice(-1);
  const cuerpo = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${cuerpo}-${dv}`;
}

// Solo se revisa el formato: el dígito verificador no se calcula.
export function mensajeErrorRut(valor: string): string {
  if (!RUT_FORMATO_REGEX.test(valor)) {
    return "RUT incompleto. Debe tener 7 u 8 números y un dígito verificador (0-9 o K), con el formato 12.345.678-5.";
  }
  return "";
}

// RUN de usuario: sin puntos ni guion, solo números y K.
export function limpiarRun(valor: string): string {
  return valor
    .toUpperCase()
    .replace(/[^0-9K]/g, "")
    .slice(0, 9);
}

// ---------------------------------------------------------
// TELÉFONO
// ---------------------------------------------------------

// Prefijo fijo del país + 8 o 9 números. Para atender desde otro país basta
// con cambiar PREFIJO_TELEFONO (ej: "+54").
export const PREFIJO_TELEFONO = "+56";

const TELEFONO_REGEX = new RegExp(`^\\${PREFIJO_TELEFONO}\\d{8,9}$`);

export function esTelefonoValido(valor: string): boolean {
  return TELEFONO_REGEX.test(valor);
}

export const MENSAJE_TELEFONO = `Teléfono inválido. Escribe 8 o 9 números después de ${PREFIJO_TELEFONO}. Ej: ${PREFIJO_TELEFONO}934020512.`;

// Mantiene el prefijo fijo y deja solo los números que escribe el usuario,
// aunque escriba antes del prefijo o borre una parte de él.
export function formatearTelefono(valor: string): string {
  let resto = String(valor || "");

  if (resto.includes(PREFIJO_TELEFONO)) {
    resto = resto.replace(PREFIJO_TELEFONO, "");
  } else {
    for (let largo = PREFIJO_TELEFONO.length - 1; largo > 0; largo--) {
      if (resto.startsWith(PREFIJO_TELEFONO.slice(0, largo))) {
        resto = resto.slice(largo);
        break;
      }
    }
  }

  return PREFIJO_TELEFONO + resto.replace(/\D/g, "").slice(0, 9);
}

// ---------------------------------------------------------
// FECHAS
// ---------------------------------------------------------

export const ANIO_MAXIMO_NACIMIENTO = 2012; // Nacido este año o antes = 14+ años.

export function esFechaNacimientoValida(fecha: string): boolean {
  if (!fecha) return false;
  const nacimiento = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return false;
  return nacimiento.getFullYear() <= ANIO_MAXIMO_NACIMIENTO;
}

export const MENSAJE_EDAD = `Debes haber nacido el año ${ANIO_MAXIMO_NACIMIENTO} o antes (mínimo 14 años).`;

export function esHoyOFutura(fecha: string): boolean {
  if (!fecha) return false;
  const elegida = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(elegida.getTime())) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return elegida.getTime() >= hoy.getTime();
}
