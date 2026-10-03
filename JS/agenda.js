
// =========================================================
// TIENDA: LISTADO DE CONSULTAS
// =========================================================
// Botones "Agendar" de consultas.html: abren agendar.html con el servicio elegido.
// En React: página <Consultas />.

function initializeConsultas() {
  const modalAgendamiento = document.getElementById("modal-agendamiento");
  const botonesAgendar = document.querySelectorAll(".btn-abrir-modal");
  const botonCerrarModal = document.querySelector(".cerrar-modal");
  const textoServicio = document.getElementById("texto-servicio-seleccionado");
  const formAgendar = document.getElementById("form-agendar");
  const inputFecha = document.getElementById("fecha-cita");

  if (inputFecha) {
    const hoy = new Date().toISOString().split("T")[0];
    inputFecha.setAttribute("min", hoy);
  }

  if (botonesAgendar.length > 0 && modalAgendamiento) {
    botonesAgendar.forEach((boton) => {
      boton.addEventListener("click", () => {
        const servicio = boton.dataset.servicio || "Consulta General";
        if (textoServicio) textoServicio.textContent = `Servicio: ${servicio}`;
        modalAgendamiento.style.display = "block";
      });
    });
  } else if (botonesAgendar.length > 0) {
    botonesAgendar.forEach((boton) => {
      boton.addEventListener("click", () => {
        const consulta = encodeURIComponent(
          boton.dataset.servicio || "general",
        );
        window.open(`agendar.html?consulta=${consulta}`, "_blank", "noopener");
      });
    });
  }

  botonCerrarModal?.addEventListener("click", () => {
    if (modalAgendamiento) modalAgendamiento.style.display = "none";
  });

  if (modalAgendamiento) {
    window.addEventListener("click", (event) => {
      if (event.target === modalAgendamiento) {
        modalAgendamiento.style.display = "none";
      }
    });
  }

  formAgendar?.addEventListener("submit", (event) => {
    event.preventDefault();

    const fechaInput = document.getElementById("fecha-cita");
    const horaInput = document.getElementById("hora-cita");
    const appointmentMessage = document.getElementById("appointment-message");

    fechaInput?.setCustomValidity("");

    if (fechaInput && !isTodayOrFutureDate(fechaInput.value)) {
      fechaInput.setCustomValidity("La fecha no puede ser anterior a hoy.");
    }

    if (!formAgendar.checkValidity()) {
      formAgendar.reportValidity();
      return;
    }

    const fecha = fechaInput?.value;
    const hora = horaInput?.value;

    if (appointmentMessage) {
      appointmentMessage.textContent = `Cita solicitada para el ${fecha} a las ${hora}.`;
    }

    if (modalAgendamiento) modalAgendamiento.style.display = "none";
    formAgendar.reset();
    fechaInput?.setCustomValidity("");
  });
}

alIniciar(initializeConsultas);

// =========================================================
// TIENDA: AGENDAR CONSULTA
// =========================================================
// Formulario de agendar.html: valida, guarda la solicitud y la deja
// disponible para el administrador (admin/admin-citas.js).
// En React: página <Agendar /> con su formulario controlado.

function initializeAppointment() {
  const formulario = document.getElementById("appointment-form");
  const mensaje = document.getElementById("appointment-message");
  const tipoConsulta = document.getElementById("tipo-consulta");
  const especie = document.getElementById("especie");
  const otraEspecieContenedor = document.getElementById(
    "otra-especie-contenedor",
  );
  const otraEspecie = document.getElementById("otra-especie");

  if (
    !formulario ||
    !mensaje ||
    !tipoConsulta ||
    !especie ||
    !otraEspecieContenedor ||
    !otraEspecie
  ) {
    return;
  }

  const actualizarOtraEspecie = () => {
    const mostrar = especie.value === "otro";
    otraEspecieContenedor.hidden = !mostrar;
    otraEspecie.required = mostrar;
    if (!mostrar) otraEspecie.value = "";
  };

  especie.addEventListener("change", actualizarOtraEspecie);
  actualizarOtraEspecie();

  // El calendario de fecha de nacimiento solo permite años 2012 o anteriores.
  const fechaNacimientoInputVivo = formulario.elements["fecha-nacimiento"];
  if (fechaNacimientoInputVivo) {
    fechaNacimientoInputVivo.max = `${ANIO_MAXIMO_NACIMIENTO}-12-31`;
  }

  // Formateo en vivo de RUT y teléfono mientras el usuario escribe.
  const rutInputVivo = formulario.elements["rut"];
  const telefonoInputVivo = formulario.elements["telefono"];

  // Bloquea cualquier tecla que no sea parte de un RUT (0-9, k/K, . y -).
  rutInputVivo?.addEventListener("keydown", (event) => {
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
    if (!/^[0-9kK.\-]$/.test(event.key)) {
      event.preventDefault();
    }
  });

  rutInputVivo?.addEventListener("input", () => {
    rutInputVivo.value = formatearRut(rutInputVivo.value);
  });

  // Al salir del campo se avisa de inmediato si el RUT no es válido.
  rutInputVivo?.addEventListener("blur", () => {
    if (rutInputVivo.value) {
      mostrarErrorCampo(rutInputVivo, mensajeErrorRut(rutInputVivo.value));
    }
  });

  // El prefijo queda fijo por defecto; el usuario solo escribe números.
  if (telefonoInputVivo && !telefonoInputVivo.value) {
    telefonoInputVivo.value = PREFIJO_TELEFONO;
  }

  telefonoInputVivo?.addEventListener("keydown", (event) => {
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

  telefonoInputVivo?.addEventListener("input", () => {
    telefonoInputVivo.value = formatearTelefono(telefonoInputVivo.value);
  });

  // Intercepta la validación nativa de cada campo requerido para mostrar
  // el mensaje de error dentro de la casilla en lugar del tooltip nativo.
  formulario.querySelectorAll("input, select, textarea").forEach((campo) => {
    campo.addEventListener("invalid", (event) => {
      event.preventDefault();
      mostrarErrorCampo(campo, campo.validationMessage);
    });
    // Al corregir el campo se borra también el error personalizado; si no,
    // el navegador sigue considerándolo inválido y bloquea el envío.
    const limpiarError = () => {
      campo.setCustomValidity("");
      mostrarErrorCampo(campo, "");
    };
    campo.addEventListener("input", limpiarError);
    campo.addEventListener("change", limpiarError);
  });

  const consultaNormalizada = (
    new URLSearchParams(window.location.search).get("consulta") || ""
  ).toLowerCase();

  if (consultaNormalizada.includes("urgencia")) {
    tipoConsulta.value = "urgencia";
  } else if (
    consultaNormalizada.includes("vacuna") ||
    consultaNormalizada.includes("antirrabica") ||
    consultaNormalizada.includes("felina") ||
    consultaNormalizada.includes("canina")
  ) {
    tipoConsulta.value = "vacunacion";
  } else if (consultaNormalizada.includes("desparas")) {
    tipoConsulta.value = "desparasitacion";
  } else if (consultaNormalizada.includes("general")) {
    tipoConsulta.value = "general";
  }

  const validarAgendamiento = () => {
    const rutInput = formulario.elements["rut"];
    const fechaNacimientoInput = formulario.elements["fecha-nacimiento"];
    const correoInput = formulario.elements["correo"];
    const telefonoInput = formulario.elements["telefono"];
    const fechaInput = formulario.elements["fecha"];

    [
      rutInput,
      fechaNacimientoInput,
      correoInput,
      telefonoInput,
      fechaInput,
    ].forEach((campo) => campo.setCustomValidity(""));

    const errorRut = mensajeErrorRut(rutInput.value);
    if (errorRut) {
      rutInput.setCustomValidity(errorRut);
      return rutInput;
    }

    if (!isValidBirthDate(fechaNacimientoInput.value)) {
      fechaNacimientoInput.setCustomValidity(
        `Debes haber nacido el año ${ANIO_MAXIMO_NACIMIENTO} o antes (mínimo 14 años).`,
      );
      return fechaNacimientoInput;
    }

    if (!CORREO_AGENDAMIENTO_REGEX.test(correoInput.value)) {
      correoInput.setCustomValidity(
        "Correo inválido. Máx. 24 letras/números antes de @, y solo @gmail.com, @duoc.cl o @profesor.duoc.cl.",
      );
      return correoInput;
    }

    if (!TELEFONO_AGENDAMIENTO_REGEX.test(telefonoInput.value)) {
      telefonoInput.setCustomValidity(
        `Teléfono inválido. Escribe 8 o 9 números después de ${PREFIJO_TELEFONO}. Ej: ${PREFIJO_TELEFONO}934020512.`,
      );
      return telefonoInput;
    }

    if (!isTodayOrFutureDate(fechaInput.value)) {
      fechaInput.setCustomValidity(
        "La fecha preferida no puede ser anterior a hoy.",
      );
      return fechaInput;
    }

    return null;
  };

  formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    const campoInvalido = validarAgendamiento();

    if (campoInvalido || !formulario.checkValidity()) {
      formulario.reportValidity();
      return;
    }

    limpiarErroresCampos(formulario);

    // La solicitud se guarda en localStorage para que el administrador la
    // vea y la confirme en su panel (admin-citas.html).
    const valor = (nombre) => formulario.elements[nombre].value.trim();
    const citas = loadFromStorage(STORAGE_KEYS.APPOINTMENTS);
    const cita = {
      id: `CIT-${String(citas.length + 1).padStart(4, "0")}`,
      fechaSolicitud: new Date().toISOString(),
      nombre: `${valor("nombre")} ${valor("apellido")}`,
      rut: valor("rut"),
      correo: valor("correo"),
      telefono: valor("telefono"),
      mascota: valor("mascota"),
      especie: especie.value === "otro" ? valor("otra-especie") : especie.value,
      tipoConsulta:
        tipoConsulta.options[tipoConsulta.selectedIndex].textContent.trim(),
      fecha: valor("fecha"),
      motivo: valor("motivo"),
      estado: "Pendiente",
    };

    citas.push(cita);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, citas);

    mensaje.textContent = `Solicitud ${cita.id} enviada. Nos pondremos en contacto contigo para confirmar.`;
    formulario.reset();
    actualizarOtraEspecie();
    if (telefonoInputVivo) telefonoInputVivo.value = PREFIJO_TELEFONO;
  });
}

alIniciar(initializeAppointment);

// =========================================================
// TIENDA: FORMULARIO DE CONTACTO
// =========================================================
// En React: página <Contacto /> con su formulario controlado.

function initializeContactPage() {
  const formulario = document.querySelector("#form-contacto");
  if (!formulario) return;

  const feedback = document.querySelector("#form-contacto-message");

  const reglas = {
    nombre: (valor) => {
      const nombre = valor.trim();
      if (!nombre) return "El nombre es obligatorio.";
      if (nombre.length > 100)
        return "El nombre no puede superar los 100 caracteres.";
      return "";
    },
    correo: (valor) => {
      const correo = valor.trim();
      if (!correo) return "El correo es obligatorio.";
      if (correo.length > 100)
        return "El correo no puede superar los 100 caracteres.";
      if (!isValidEmail(correo)) {
        return "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.";
      }
      return "";
    },
    motivo: (valor) => (valor ? "" : "Selecciona un motivo de contacto."),
    mensaje: (valor) => {
      const comentario = valor.trim();
      if (!comentario) return "El comentario es obligatorio.";
      if (comentario.length > 500)
        return "El comentario no puede superar los 500 caracteres.";
      return "";
    },
  };

  activarValidacionEnVivo(formulario, reglas);

  // Contador de caracteres del comentario (sugerencia dinámica).
  const contador = document.querySelector("[data-contador-mensaje]");
  formulario.elements.mensaje.addEventListener("input", () => {
    if (contador) {
      contador.textContent = `${formulario.elements.mensaje.value.length} / 500 caracteres`;
    }
  });

  formulario.addEventListener("submit", (event) => {
    event.preventDefault();
    if (feedback) feedback.textContent = "";

    if (!validarFormulario(formulario, reglas)) return;

    // Los mensajes quedan guardados de manera interna (localStorage).
    const mensajes = loadFromStorage(STORAGE_KEYS.MESSAGES);
    mensajes.push({
      fecha: new Date().toISOString(),
      nombre: formulario.elements.nombre.value.trim(),
      correo: normalizeEmail(formulario.elements.correo.value),
      motivo: formulario.elements.motivo.value,
      comentario: formulario.elements.mensaje.value.trim(),
    });
    saveToStorage(STORAGE_KEYS.MESSAGES, mensajes);

    if (feedback) {
      feedback.textContent =
        "Mensaje enviado correctamente. Te contactaremos pronto.";
    }

    formulario.reset();
    if (contador) contador.textContent = "0 / 500 caracteres";
  });
}

alIniciar(initializeContactPage);
