
// =========================================================
// USUARIOS: SESIÓN Y ROLES
// =========================================================
// Inicio y cierre de sesión, datos de la sesión en la cabecera y permisos
// por rol (Administrador, Vendedor, Cliente).
// En React: AuthContext + componente de cabecera + rutas protegidas.

const ROLES = ["Administrador", "Vendedor", "Cliente"];

// Página de inicio según el rol (Anexo 1: roles asociados al sistema).
function destinoSegunRol(role) {
  if (role === "Administrador") return "admin.html";
  if (role === "Vendedor") return "admin-productos.html";
  return "index.html";
}

// Muestra en la cabecera "Iniciar sesión / Registrarse" o los datos de la
// sesión activa. (Se llama renderProfile porque app.js la invoca al cargar.)
function renderProfile() {
  document.querySelectorAll("[data-session-links]").forEach((contenedor) => {
    const perfil = state.activeProfile;

    if (!perfil) {
      contenedor.innerHTML = `
        <a class="profile-link" href="login.html">Iniciar sesión</a>
        <a class="profile-link" href="registro.html">Registrarse</a>
      `;
      return;
    }

    const role = perfil.role || "Cliente";

    contenedor.innerHTML = `
      <span class="session-name">Hola, ${escapeHtml(perfil.name)}</span>
      ${role !== "Cliente" ? `<a class="profile-link" href="${destinoSegunRol(role)}">Panel</a>` : ""}
      <button type="button" class="logout-button" data-profile-logout>Cerrar sesión</button>
    `;
  });
}

function startSession(profile) {
  state.activeProfile = {
    name: profile.name,
    apellido: profile.apellido || "",
    email: profile.email,
    role: profile.role || "Cliente",
    birthDate: profile.birthDate || "",
    phone: profile.phone || "",
  };

  saveToStorage(STORAGE_KEYS.SESSION, state.activeProfile);
  renderProfile();
}

function logoutProfile() {
  state.activeProfile = null;
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  window.location.href = "index.html";
}

function aplicarPermisosDeRol() {
  const user = state.activeProfile;
  const currentPath = window.location.pathname.toLowerCase();
  const currentPage = currentPath.split("/").pop() || "index.html";

  // Si el usuario no tiene rol definido en su registro, asume que es "Cliente"
  const rolActual = user ? user.role || "Cliente" : "Invitado";

  // 1. Control de Rutas (Redirección forzada)
  if (rolActual === "Vendedor") {
    // El Vendedor solo puede ver productos (lista y detalle) y órdenes.
    const paginasPermitidas = [
      "productos.html",
      "detalle-producto.html",
      "admin-productos.html",
      "admin-producto-form.html",
      "admin-ordenes.html",
      "login.html",
    ];

    if (
      !paginasPermitidas.includes(currentPage) &&
      currentPage !== "" &&
      currentPage !== "index.html"
    ) {
      window.location.replace("admin-productos.html");
      return;
    }
  }

  // 2. Renderizado Condicional Automático (Sin modificar los HTML)
  document.querySelectorAll(".site-header nav a").forEach((enlace) => {
    const destino = enlace.getAttribute("href") || "";

    if (rolActual === "Vendedor") {
      // Oculta del menú cualquier link que no sea productos u órdenes
      if (
        !destino.includes("productos.html") &&
        !destino.includes("ordenes.html")
      ) {
        enlace.style.display = "none";
      }
    }
  });
}

// Botón "Cerrar sesión" (cabecera de la tienda y menú del administrador).
alIniciar(() => {
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-profile-logout]")) logoutProfile();
  });
});

// =========================================================
// USUARIOS: SELECTS DE REGIÓN Y COMUNA
// =========================================================
// Al cambiar la región se actualizan las comunas disponibles.
// En React: componente <RegionComunaSelect />.

function updateComunaOptions(region, comunaSelect) {
  if (!comunaSelect) return;

  const comunas = REGIONES_COMUNAS[region] || [];

  comunaSelect.innerHTML = comunas.length
    ? '<option value="">-- Selecciona la comuna --</option>' +
      comunas
        .map(
          (c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`,
        )
        .join("")
    : '<option value="">Selecciona primero una región</option>';

  comunaSelect.disabled = comunas.length === 0;
}

function initializeRegionComunaSelects() {
  document.querySelectorAll("[data-region-select]").forEach((regionSelect) => {
    if (regionSelect.dataset.populated === "true") return;

    regionSelect.innerHTML =
      '<option value="">-- Selecciona la región --</option>' +
      Object.keys(REGIONES_COMUNAS)
        .map(
          (region) =>
            `<option value="${escapeHtml(region)}">${escapeHtml(region)}</option>`,
        )
        .join("");
    regionSelect.dataset.populated = "true";

    const comunaSelect = regionSelect
      .closest("form")
      ?.querySelector("[data-comuna-select]");

    updateComunaOptions(regionSelect.value, comunaSelect);

    regionSelect.addEventListener("change", () => {
      updateComunaOptions(regionSelect.value, comunaSelect);
    });
  });
}

alIniciar(initializeRegionComunaSelects);

// =========================================================
// USUARIOS: REGLAS DE VALIDACIÓN
// =========================================================
// Reglas compartidas por el registro de la tienda y el "Nuevo/Editar usuario"
// del administrador (Anexo 1), más el formateo en vivo de RUN y teléfono.

function crearReglasUsuario(opciones = {}) {
  const { emailActual = "", passwordOpcional = false } = opciones;
  const otrosPerfiles = () =>
    loadProfiles().filter((item) => item.email !== emailActual);

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
      if (otrosPerfiles().some((item) => item.run === run)) {
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
      if (apellido.length > 100)
        return "Los apellidos no pueden superar los 100 caracteres.";
      return "";
    },
    email: (valor) => {
      const email = normalizeEmail(valor);
      if (!email) return "El correo es obligatorio.";
      if (email.length > 100)
        return "El correo no puede superar los 100 caracteres.";
      if (!isValidEmail(email)) {
        return "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.";
      }
      if (otrosPerfiles().some((item) => item.email === email)) {
        return "Ese correo ya está registrado.";
      }
      return "";
    },
    birthDate: (valor) => {
      // Opcional; si se informa, debe cumplir la edad mínima.
      if (!valor) return "";
      if (!isValidBirthDate(valor)) {
        return `Debes haber nacido el año ${ANIO_MAXIMO_NACIMIENTO} o antes (mínimo 14 años).`;
      }
      return "";
    },
    phone: (valor) => {
      if (!valor || valor === PREFIJO_TELEFONO) return "";
      if (!TELEFONO_AGENDAMIENTO_REGEX.test(valor)) {
        return `Teléfono inválido. Escribe 8 o 9 números después de ${PREFIJO_TELEFONO}. Ej: ${PREFIJO_TELEFONO}934020512.`;
      }
      return "";
    },
    region: (valor) => (valor ? "" : "Selecciona una región."),
    comuna: (valor) => (valor ? "" : "Selecciona una comuna."),
    direccion: (valor) => {
      const direccion = valor.trim();
      if (!direccion) return "La dirección es obligatoria.";
      if (direccion.length > 300)
        return "La dirección no puede superar los 300 caracteres.";
      return "";
    },
    genero: (valor) => (valor ? "" : "Selecciona una opción."),
    role: (valor) =>
      ROLES.includes(valor) ? "" : "Selecciona el tipo de usuario.",
    password: (valor) => {
      if (!valor && passwordOpcional) return "";
      if (!valor) return "La contraseña es obligatoria.";
      if (!isValidPassword(valor)) {
        return "Debe tener entre 4 y 10 caracteres y al menos una mayúscula.";
      }
      return "";
    },
    confirmPassword: (valor, form) =>
      valor === form.elements.password.value
        ? ""
        : "La confirmación de contraseña no coincide.",
    aceptaTerminos: (aceptado) =>
      aceptado ? "" : "Debes aceptar los términos y condiciones.",
  };
}

// Arma el objeto usuario a partir de un formulario de registro/mantenedor.
function leerUsuarioDesdeFormulario(form) {
  const valor = (nombre) => String(form.elements[nombre]?.value || "").trim();
  const phone = valor("phone");

  return {
    run: valor("run").toUpperCase(),
    name: valor("name"),
    apellido: valor("apellido"),
    email: normalizeEmail(valor("email")),
    birthDate: valor("birthDate"),
    direccion: valor("direccion"),
    region: valor("region"),
    comuna: valor("comuna"),
    genero: valor("genero"),
    phone: phone === PREFIJO_TELEFONO ? "" : phone,
    role: valor("role") || "Cliente",
  };
}

// Aplica a los formularios de usuario (registro y mantenedor del
// administrador) el mismo formateo en vivo que ya usa "Agendar consulta".
// Los mensajes de error los entrega la validación en tiempo real
// (crearReglasUsuario, en auth.js).
function initializeRegisterForms() {
  document
    .querySelectorAll("#standalone-register-form, [data-user-form]")
    .forEach((formulario) => {
      const fechaNacimientoInput = formulario.elements["birthDate"];
      if (fechaNacimientoInput) {
        fechaNacimientoInput.max = `${ANIO_MAXIMO_NACIMIENTO}-12-31`;
      }

      const telefonoInput = formulario.elements["phone"];
      if (telefonoInput && !telefonoInput.value) {
        telefonoInput.value = PREFIJO_TELEFONO;
      }

      telefonoInput?.addEventListener("keydown", (event) => {
        const teclasPermitidas = [
          "Backspace",
          "Delete",
          "Tab",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
        ];
        if (teclasPermitidas.includes(event.key)) return;
        if (!/^[0-9]$/.test(event.key)) {
          event.preventDefault();
        }
      });

      telefonoInput?.addEventListener("input", () => {
        telefonoInput.value = formatearTelefono(telefonoInput.value);
      });

      // El RUN se escribe sin puntos ni guion: solo números y K.
      const runInput = formulario.elements["run"];
      runInput?.addEventListener("input", () => {
        runInput.value = runInput.value
          .toUpperCase()
          .replace(/[^0-9K]/g, "")
          .slice(0, 9);
      });
    });
}

alIniciar(initializeRegisterForms);

// =========================================================
// USUARIOS: PÁGINA DE INICIO DE SESIÓN
// =========================================================
// En React: página/componente <Login />.

function initializeLoginPage() {
  const form = document.querySelector("[data-standalone-login]");
  if (!form) return;

  const message = document.querySelector("#standalone-login-message");

  const reglas = {
    email: (valor) => {
      const email = normalizeEmail(valor);
      if (!email) return "El correo es obligatorio.";
      if (email.length > 100)
        return "El correo no puede superar los 100 caracteres.";
      if (!isValidEmail(email)) {
        return "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.";
      }
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

  activarValidacionEnVivo(form, reglas);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (message) message.textContent = "";

    if (!validarFormulario(form, reglas)) return;

    const email = normalizeEmail(form.elements.email.value);
    const password = form.elements.password.value;

    state.profiles = loadProfiles();
    const profile = state.profiles.find((item) => item.email === email);

    if (!profile) {
      mostrarErrorCampo(
        form.elements.email,
        "No existe una cuenta registrada con este correo.",
      );
      return;
    }

    const cuentaBloqueada =
      "Cuenta bloqueada por 3 intentos fallidos. Contacta a soporte para restablecerla.";

    if (profile.locked) {
      mostrarErrorCampo(form.elements.password, cuentaBloqueada);
      return;
    }

    if (profile.password !== password) {
      profile.failedAttempts = (profile.failedAttempts || 0) + 1;
      // Después del tercer intento fallido la cuenta queda bloqueada.
      if (profile.failedAttempts >= 3) profile.locked = true;
      saveToStorage(STORAGE_KEYS.PROFILES, state.profiles);

      mostrarErrorCampo(
        form.elements.password,
        profile.locked
          ? cuentaBloqueada
          : "La contraseña no coincide con esta cuenta.",
      );
      return;
    }

    profile.failedAttempts = 0;
    saveToStorage(STORAGE_KEYS.PROFILES, state.profiles);
    startSession(profile);

    if (message) message.textContent = "Sesión iniciada correctamente.";

    // Administrador y Vendedor entran al panel; el Cliente vuelve a la tienda
    // (o al carrito, si venía de intentar pagar).
    const role = profile.role || "Cliente";
    const volver = new URLSearchParams(window.location.search).get("volver");

    window.location.href =
      role === "Cliente" && volver === "carrito.html"
        ? "carrito.html"
        : destinoSegunRol(role);
  });
}

alIniciar(initializeLoginPage);

// =========================================================
// USUARIOS: PÁGINA DE REGISTRO
// =========================================================
// En React: página/componente <Registro />.

function initializeRegisterPage() {
  const form = document.querySelector("[data-standalone-register]");
  if (!form) return;

  const message = document.querySelector("#standalone-register-message");
  const reglas = crearReglasUsuario();
  delete reglas.role; // En la tienda todos se registran como Cliente.

  activarValidacionEnVivo(form, reglas);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validarFormulario(form, reglas)) {
      if (message) message.textContent = "Revisa los campos marcados en rojo.";
      return;
    }

    const profile = {
      ...leerUsuarioDesdeFormulario(form),
      role: "Cliente",
      password: form.elements.password.value,
      failedAttempts: 0,
      locked: false,
    };

    state.profiles = loadProfiles();
    state.profiles.push(profile);
    saveToStorage(STORAGE_KEYS.PROFILES, state.profiles);
    startSession(profile);
    window.location.href = "index.html";
  });
}

alIniciar(initializeRegisterPage);
