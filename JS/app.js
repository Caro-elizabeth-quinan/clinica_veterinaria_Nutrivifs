
// =========================================================
// NÚCLEO: ARRANQUE
// =========================================================
// Cada módulo registra su función de inicio con alIniciar(). app.js las
// ejecuta en orden cuando el DOM está listo, después de preparar los datos
// y la sesión. Así cada página solo carga los módulos que necesita.
// En React: cada inicializador equivale al useEffect de montaje de un componente.

const inicializadores = [];

function alIniciar(inicializador) {
  inicializadores.push(inicializador);
}

// =========================================================
// NÚCLEO: ESTADO Y LOCALSTORAGE
// =========================================================
// Claves de localStorage, estado compartido de la página y funciones de
// lectura/escritura.
// En React: "state" pasa a un Context (o store) y estas funciones a un servicio.

const STORAGE_KEYS = {
  CART: "carrito",
  LEGACY_CART: "clinica-nutridifs-cart",
  COUPON: "carrito-cupon",
  PROFILES: "clinica-nutridifs-profiles",
  SESSION: "clinica-nutridifs-session",
  ORDERS: "clinica-nutridifs-orders",
  ORDER_SEQUENCE: "clinica-nutridifs-order-seq",
  MESSAGES: "clinica-nutridifs-mensajes",
  APPOINTMENTS: "clinica-nutridifs-citas",
  SEED_VERSION: "clinica-nutridifs-seed",
  ADMIN_PRODUCTS: "admin-products",
  ADMIN_USERS: "admin-users",
};

const SEED_VERSION = "3";

const state = {
  cartItems: [],
  profiles: [],
  activeProfile: null,
  coupon: "",
};

function loadFromStorage(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadCart() {
  let saved =
    localStorage.getItem(STORAGE_KEYS.CART) ||
    localStorage.getItem(STORAGE_KEYS.LEGACY_CART);

  if (!saved) return [];

  try {
    const cart = JSON.parse(saved);
    if (!Array.isArray(cart)) return [];

    return cart
      .filter((item) => item && Number(item.quantity) > 0)
      .map((item) => ({
        code: String(item.code || item.id || ""),
        name: item.name || "Producto",
        price: Number(item.price) || 0,
        image: item.image || "",
        quantity: Number(item.quantity) || 1,
      }))
      .filter((item) => item.code);
  } catch (error) {
    console.error("Error cargando carrito:", error);
    return [];
  }
}

function loadProfiles() {
  return loadFromStorage(STORAGE_KEYS.PROFILES);
}

function loadSession() {
  try {
    const session = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SESSION) || "null",
    );
    return session?.email ? session : null;
  } catch {
    return null;
  }
}

function initializeState() {
  state.cartItems = loadCart();
  state.profiles = loadProfiles();
  state.activeProfile = loadSession();
  state.coupon = localStorage.getItem(STORAGE_KEYS.COUPON) || "";
}

// =========================================================
// NÚCLEO: FORMATO Y REGLAS BÁSICAS
// =========================================================
// Funciones puras (sin DOM) para dar formato y validar valores: moneda, texto
// seguro, correo, contraseña, RUT, teléfono y fechas.
// En React: se importan tal cual como utilidades.

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString("es-CL")}`;
}

// Un producto con precio 0 se considera FREE (regla del Anexo 1).
function formatPrice(value) {
  return Number(value) === 0 ? "Gratis" : formatCurrency(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;

  const normalized = normalizeEmail(email);
  // Estos son los dominios aceptados por los formularios de la clínica.
  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

  return emailRegex.test(normalized);
}

// Contraseña: entre 4 y 10 caracteres (Anexo 1) y al menos una mayúscula
// (regla adicional del equipo).
function isValidPassword(password) {
  const value = String(password || "");
  return value.length >= 4 && value.length <= 10 && /[A-Z]/.test(value);
}

const CORREO_AGENDAMIENTO_REGEX =
  /^[A-Za-z0-9]{1,24}@(gmail\.com|profesor\.duoc\.cl|duoc\.cl)$/;

const RUT_FORMATO_REGEX = /^\d{1,2}\.\d{3}\.\d{3}-[0-9K]$/;

function normalizeRut(rut) {
  return String(rut || "")
    .replace(/[.\-\s]/g, "")
    .toUpperCase();
}

// Formatea en vivo mientras se escribe: 12.345.678-5
// La K solo es válida como dígito verificador (último carácter): si se
// escribe en otra posición se descarta.
function formatearRut(valor) {
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

// Devuelve el mensaje de error de un RUT, o "" si es válido. Solo se revisa
// el formato (12.345.678-5): el dígito verificador no se calcula, por lo
// que se acepta cualquier combinación de números.
function mensajeErrorRut(valor) {
  if (!RUT_FORMATO_REGEX.test(valor)) {
    return "RUT incompleto. Debe tener 7 u 8 números y un dígito verificador (0-9 o K), con el formato 12.345.678-5.";
  }
  return "";
}

// Teléfono: prefijo fijo del país + 8 o 9 números. Para atender desde otro
// país basta con cambiar PREFIJO_TELEFONO (ej: "+54").
const PREFIJO_TELEFONO = "+56";

const TELEFONO_AGENDAMIENTO_REGEX = new RegExp(
  `^\\${PREFIJO_TELEFONO}\\d{8,9}$`,
);

// Mantiene el prefijo fijo y deja solo los números que escribe el usuario,
// aunque escriba antes del prefijo o borre una parte de él.
function formatearTelefono(valor) {
  let resto = String(valor || "");

  if (resto.includes(PREFIJO_TELEFONO)) {
    resto = resto.replace(PREFIJO_TELEFONO, "");
  } else {
    // Prefijo incompleto (ej: "+5"): se descarta el trozo que quedó.
    for (let largo = PREFIJO_TELEFONO.length - 1; largo > 0; largo--) {
      if (resto.startsWith(PREFIJO_TELEFONO.slice(0, largo))) {
        resto = resto.slice(largo);
        break;
      }
    }
  }

  return PREFIJO_TELEFONO + resto.replace(/\D/g, "").slice(0, 9);
}

const ANIO_MAXIMO_NACIMIENTO = 2012; // Nacido este año o antes = 14+ años.

function isValidBirthDate(fechaNacimiento) {
  if (!fechaNacimiento) return false;

  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return false;

  return nacimiento.getFullYear() <= ANIO_MAXIMO_NACIMIENTO;
}

function isTodayOrFutureDate(dateValue) {
  if (!dateValue) return false;

  const selected = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(selected.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selected.getTime() >= today.getTime();
}

// =========================================================
// NÚCLEO: VALIDACIÓN DE FORMULARIOS EN TIEMPO REAL
// =========================================================
// "reglas" es un objeto { nombreDelCampo: (valor, formulario) => mensaje }.
// Cada regla devuelve el mensaje de error, o "" si el campo es válido.
// El mensaje se muestra bajo el campo con mostrarErrorCampo().
// En React: las reglas se reutilizan; mostrar el error pasa al estado del formulario.

// Muestra/oculta el mensaje de error dentro de la propia casilla
// (en vez de depender solo del tooltip nativo del navegador).
function mostrarErrorCampo(campo, mensaje) {
  if (!campo) return;
  // Si el campo está envuelto en ".campo-formulario" (agendar consulta), el
  // mensaje se agrega dentro de ese contenedor. Si no (ej: formulario de
  // registro, sin ese contenedor), se agrega justo debajo del propio campo.
  const contenedor = campo.closest(".campo-formulario");
  let error = contenedor
    ? contenedor.querySelector(".campo-error")
    : campo.nextElementSibling?.classList?.contains("campo-error")
      ? campo.nextElementSibling
      : null;

  if (mensaje && !error) {
    error = document.createElement("small");
    error.className = "campo-error";
    if (contenedor) {
      contenedor.appendChild(error);
    } else {
      campo.insertAdjacentElement("afterend", error);
    }
  }

  if (error) error.textContent = mensaje || "";
  campo.classList.toggle("campo-invalido", Boolean(mensaje));
}

function limpiarErroresCampos(formulario) {
  formulario.querySelectorAll(".campo-error").forEach((el) => el.remove());
  formulario
    .querySelectorAll(".campo-invalido")
    .forEach((el) => el.classList.remove("campo-invalido"));
}

function validarCampo(form, nombre, reglas) {
  const campo = form.elements[nombre];
  if (!campo || !reglas[nombre]) return true;

  const valor = campo.type === "checkbox" ? campo.checked : campo.value;
  const mensaje = reglas[nombre](valor, form) || "";

  mostrarErrorCampo(campo, mensaje);
  return !mensaje;
}

function validarFormulario(form, reglas) {
  let valido = true;

  Object.keys(reglas).forEach((nombre) => {
    if (!validarCampo(form, nombre, reglas)) valido = false;
  });

  if (!valido) form.querySelector(".campo-invalido")?.focus();
  return valido;
}

function activarValidacionEnVivo(form, reglas) {
  form.noValidate = true;

  Object.keys(reglas).forEach((nombre) => {
    const campo = form.elements[nombre];
    if (!campo) return;

    ["input", "change", "blur"].forEach((evento) => {
      campo.addEventListener(evento, () => validarCampo(form, nombre, reglas));
    });
  });
}

// =========================================================
// NÚCLEO: CATÁLOGO DE PRODUCTOS
// =========================================================
// Acceso a los productos guardados (los del arreglo base más los cambios
// del administrador).
// En React: servicio/hook de productos (useProductos).

function getProducts() {
  const stored = loadFromStorage(STORAGE_KEYS.ADMIN_PRODUCTS);
  return stored.length ? stored : PRODUCTOS_BASE.map((item) => ({ ...item }));
}

function findProduct(code) {
  return getProducts().find((item) => item.id === String(code)) || null;
}

function getStockByCode(code) {
  const product = findProduct(code);
  return product ? Number(product.stock) || 0 : 0;
}

function productDetailUrl(code) {
  return `detalle-producto.html?codigo=${encodeURIComponent(code)}`;
}

// =========================================================
// NÚCLEO: DATOS INICIALES
// =========================================================
// Deja en localStorage los productos, las cuentas de demostración y el
// equipo la primera vez que se abre el sitio (o cuando cambia SEED_VERSION).

function sembrarDatosIniciales() {
  // Al cambiar SEED_VERSION se vuelven a sembrar los datos base.
  const seedDesactualizado =
    localStorage.getItem(STORAGE_KEYS.SEED_VERSION) !== SEED_VERSION;

  if (seedDesactualizado) {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USERS);
    localStorage.setItem(STORAGE_KEYS.SEED_VERSION, SEED_VERSION);
  }

  // PRODUCTOS INICIALES (desde el arreglo PRODUCTOS_BASE)
  if (
    seedDesactualizado ||
    loadFromStorage(STORAGE_KEYS.ADMIN_PRODUCTS).length === 0
  ) {
    saveToStorage(STORAGE_KEYS.ADMIN_PRODUCTS, PRODUCTOS_BASE);
  }

  // CUENTAS INICIALES (se agregan solo si el correo aún no existe)
  const profiles = loadFromStorage(STORAGE_KEYS.PROFILES);
  let profilesChanged = false;

  CUENTAS_INICIALES.forEach((cuenta) => {
    if (profiles.some((item) => item.email === cuenta.email)) return;

    profiles.push({
      birthDate: "",
      direccion: "Av. San Marcos 123",
      genero: "prefiero-no-decir",
      phone: "",
      region: "Libertador General Bernardo O'Higgins",
      comuna: "Rancagua",
      failedAttempts: 0,
      locked: false,
      ...cuenta,
    });
    profilesChanged = true;
  });

  if (profilesChanged) saveToStorage(STORAGE_KEYS.PROFILES, profiles);

  // EQUIPO (sección "El equipo" de la home)
  if (loadFromStorage(STORAGE_KEYS.ADMIN_USERS).length === 0) {
    saveToStorage(STORAGE_KEYS.ADMIN_USERS, EQUIPO_INICIAL);
  }
}

// =========================================================
// PUNTO DE ENTRADA
// =========================================================
// Cuando el DOM está listo (y ya cargaron todos los archivos JS) se preparan
// los datos y la sesión, y luego se ejecutan los inicializadores que
// registró cada archivo con alIniciar().

document.addEventListener("DOMContentLoaded", () => {
  sembrarDatosIniciales();
  initializeState();
  aplicarPermisosDeRol();
  renderProfile();
  inicializadores.forEach((inicializador) => inicializador());
});
