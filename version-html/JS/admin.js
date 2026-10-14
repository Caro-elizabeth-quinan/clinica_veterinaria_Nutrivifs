// =========================================================
// ADMIN: BASE (PERMISOS, MENÚ E INICIO)
// =========================================================
// Roles (Anexo 1):
//  - Administrador: acceso total.
//  - Vendedor: solo ve la lista y el detalle de productos y de órdenes.
//  - Cliente: solo accede a la tienda (no entra a estas vistas).
// Cada vista del administrador registra su inicio con alIniciarAdmin(); solo
// se ejecuta si el rol puede ver la página.


function adminRole() {
  return state.activeProfile?.role || "Cliente";
}

function isAdmin() {
  return adminRole() === "Administrador";
}

function adminParams() {
  return new URLSearchParams(window.location.search);
}

// Protege la vista: devuelve false (y redirige) si el rol no puede verla.
function guardAdminPage() {
  const role = adminRole();

  if (!state.activeProfile || role === "Cliente") {
    window.location.replace("login.html");
    return false;
  }

  const soloAdministrador = document.body.dataset.adminOnly === "true";
  const formularioEnModoVer =
    document.body.dataset.adminOnly === "editar" &&
    adminParams().get("modo") === "ver";

  if (
    role === "Vendedor" &&
    (soloAdministrador ||
      (document.body.dataset.adminOnly === "editar" && !formularioEnModoVer))
  ) {
    window.location.replace("admin-productos.html");
    return false;
  }

  return true;
}

function renderAdminMenu() {
  const role = adminRole();

  document.querySelectorAll("[data-admin-nav] a").forEach((link) => {
    // Los accesos que el rol no tiene no aparecen en el menú.
    if (link.dataset.roles && !link.dataset.roles.split(",").includes(role)) {
      link.remove();
      return;
    }

    link.classList.toggle(
      "active",
      link.dataset.section === document.body.dataset.adminSection,
    );
  });

  const userLabel = document.querySelector("[data-admin-user]");
  if (userLabel) {
    userLabel.textContent = `${state.activeProfile.name} · ${role}`;
  }

  // Los botones de crear/editar/eliminar solo existen para el Administrador.
  if (!isAdmin()) {
    document
      .querySelectorAll("[data-admin-action]")
      .forEach((element) => element.remove());
  }
}

function isCriticalStock(product) {
  return (
    product.stockCritico !== "" &&
    product.stockCritico !== null &&
    product.stockCritico !== undefined &&
    Number(product.stock) <= Number(product.stockCritico)
  );
}

function renderCriticalAlert() {
  const alert = document.querySelector("[data-critical-alert]");
  if (!alert) return;

  const critical = getProducts().filter(isCriticalStock);
  alert.hidden = critical.length === 0;
  alert.innerHTML = `
    <strong>⚠ Stock crítico:</strong>
    ${critical.length} producto${critical.length === 1 ? "" : "s"} en o bajo su stock crítico:
    ${critical.map((item) => `${escapeHtml(item.name)} (${item.stock})`).join(", ")}.
  `;
}

function initializeAdminHome() {
  const greeting = document.querySelector("[data-admin-greeting]");
  if (!greeting) return;

  greeting.textContent = `¡Hola, ${state.activeProfile.name}!`;

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };

  setText("[data-stat-products]", getProducts().length);
  setText("[data-stat-users]", loadProfiles().length);
  setText("[data-stat-orders]", loadFromStorage(STORAGE_KEYS.ORDERS).length);
  setText(
    "[data-stat-appointments]",
    loadFromStorage(STORAGE_KEYS.APPOINTMENTS).filter(
      (cita) => cita.estado === "Pendiente",
    ).length,
  );
}

const inicializadoresAdmin = [];

function alIniciarAdmin(inicializador) {
  inicializadoresAdmin.push(inicializador);
}

alIniciar(() => {
  if (!guardAdminPage()) return;

  renderAdminMenu();
  renderCriticalAlert();
  initializeAdminHome();
  inicializadoresAdmin.forEach((inicializador) => inicializador());
  document.body.classList.add("admin-ready");
});

// =========================================================
// ADMIN: MANTENEDOR DE PRODUCTOS
// =========================================================
// Listado, nuevo, editar y mostrar producto.
// En React: páginas <AdminProductos /> y <AdminProductoForm />.

const MAX_IMAGE_BYTES = 300 * 1024;

function renderAdminProducts() {
  const tbody = document.querySelector("[data-admin-products]");
  if (!tbody) return;

  tbody.innerHTML = getProducts()
    .map((product) => {
      const code = encodeURIComponent(product.id);

      return `
        <tr>
          <td>${escapeHtml(product.id)}</td>
          <td>${escapeHtml(product.name)}</td>
          <td>${escapeHtml(product.category)}</td>
          <td>${formatPrice(product.price)}</td>
          <td>
            ${escapeHtml(product.stock)}
            ${isCriticalStock(product) ? '<span class="admin-badge-critical">Stock crítico</span>' : ""}
          </td>
          <td class="admin-actions">
            <a class="admin-edit-button" href="admin-producto-form.html?codigo=${code}&modo=ver">Ver</a>
            ${
              isAdmin()
                ? `<a class="admin-edit-button" href="admin-producto-form.html?codigo=${code}">Editar</a>
                   <button type="button" class="admin-delete-button" data-delete-product="${escapeHtml(product.id)}">Eliminar</button>`
                : ""
            }
          </td>
        </tr>
      `;
    })
    .join("");

  renderCriticalAlert();
}

function initializeAdminProducts() {
  const tbody = document.querySelector("[data-admin-products]");
  if (!tbody) return;

  renderAdminProducts();

  tbody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-product]");
    if (!button) return;

    // Primer clic pide confirmación; el segundo elimina.
    if (button.dataset.confirm !== "true") {
      button.dataset.confirm = "true";
      button.textContent = "¿Confirmar?";
      return;
    }

    saveToStorage(
      STORAGE_KEYS.ADMIN_PRODUCTS,
      getProducts().filter((item) => item.id !== button.dataset.deleteProduct),
    );
    renderAdminProducts();
  });
}

function crearReglasProducto(codigoActual, imagenInput) {
  return {
    id: (valor) => {
      const codigo = valor.trim();
      if (!codigo) return "El código es obligatorio.";
      if (codigo.length < 3)
        return "El código debe tener al menos 3 caracteres.";
      if (
        codigo !== codigoActual &&
        getProducts().some(
          (item) => item.id.toLowerCase() === codigo.toLowerCase(),
        )
      ) {
        return "Ya existe un producto con este código.";
      }
      return "";
    },
    name: (valor) => {
      const nombre = valor.trim();
      if (!nombre) return "El nombre es obligatorio.";
      if (nombre.length > 100)
        return "El nombre no puede superar los 100 caracteres.";
      return "";
    },
    description: (valor) =>
      valor.trim().length > 500
        ? "La descripción no puede superar los 500 caracteres."
        : "",
    price: (valor) => {
      const precio = valor.trim().replace(",", ".");
      if (!precio) return "El precio es obligatorio.";
      if (!/^\d+(\.\d+)?$/.test(precio)) {
        return "Ingresa un número mayor o igual a 0 (puede tener decimales).";
      }
      return "";
    },
    stock: (valor) => {
      const stock = valor.trim();
      if (!stock) return "El stock es obligatorio.";
      if (!/^\d+$/.test(stock))
        return "El stock debe ser un número entero mayor o igual a 0.";
      return "";
    },
    stockCritico: (valor) => {
      const critico = valor.trim();
      if (critico && !/^\d+$/.test(critico)) {
        return "El stock crítico debe ser un número entero mayor o igual a 0.";
      }
      return "";
    },
    category: (valor) => (valor ? "" : "Selecciona una categoría."),
    image: () => {
      const file = imagenInput.files?.[0];
      if (!file) return "";
      if (!file.type.startsWith("image/"))
        return "El archivo debe ser una imagen.";
      if (file.size > MAX_IMAGE_BYTES)
        return "La imagen no puede superar los 300 KB.";
      return "";
    },
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function initializeProductForm() {
  const form = document.querySelector("[data-product-form]");
  if (!form) return;

  const params = adminParams();
  const codigoActual = params.get("codigo") || "";
  const soloLectura = params.get("modo") === "ver";
  const producto = codigoActual ? findProduct(codigoActual) : null;
  const title = document.querySelector("[data-form-title]");
  const message = document.querySelector("[data-form-message]");
  const preview = document.querySelector("[data-image-preview]");
  const stockAlert = document.querySelector("[data-stock-alert]");

  form.elements.category.innerHTML =
    '<option value="">-- Selecciona la categoría --</option>' +
    CATEGORIAS_PRODUCTO.map(
      (item) =>
        `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`,
    ).join("");

  if (codigoActual && !producto) {
    form.hidden = true;
    title.textContent = "Producto no encontrado";
    return;
  }

  // Alerta en vivo cuando el stock es igual o inferior al stock crítico.
  const actualizarAlertaStock = () => {
    const stock = form.elements.stock.value.trim();
    const critico = form.elements.stockCritico.value.trim();
    stockAlert.hidden = !(
      /^\d+$/.test(stock) &&
      /^\d+$/.test(critico) &&
      Number(stock) <= Number(critico)
    );
  };

  if (producto) {
    title.textContent = soloLectura
      ? "Detalle del producto"
      : "Editar producto";
    ["id", "name", "description", "price", "stock", "category"].forEach(
      (campo) => {
        form.elements[campo].value = producto[campo] ?? "";
      },
    );
    form.elements.stockCritico.value = producto.stockCritico ?? "";
    form.elements.id.readOnly = true;

    if (producto.image) {
      preview.src = producto.image;
      preview.hidden = false;
    }
  }

  actualizarAlertaStock();
  form.elements.stock.addEventListener("input", actualizarAlertaStock);
  form.elements.stockCritico.addEventListener("input", actualizarAlertaStock);

  if (soloLectura) {
    form
      .querySelectorAll("input, select, textarea")
      .forEach((campo) => (campo.disabled = true));
    form.querySelector("[type='submit']").remove();
    form.elements.image.closest("label").hidden = true;

    const editLink = document.querySelector("[data-edit-link]");
    if (editLink && isAdmin()) {
      editLink.href = `admin-producto-form.html?codigo=${encodeURIComponent(codigoActual)}`;
      editLink.hidden = false;
    }
    return;
  }

  const reglas = crearReglasProducto(codigoActual, form.elements.image);
  activarValidacionEnVivo(form, reglas);

  form.elements.image.addEventListener("change", async () => {
    const file = form.elements.image.files?.[0];
    if (file && !reglas.image()) {
      preview.src = await readFileAsDataUrl(file);
      preview.hidden = false;
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validarFormulario(form, reglas)) {
      message.textContent = "Revisa los campos marcados en rojo.";
      return;
    }

    const file = form.elements.image.files?.[0];
    const critico = form.elements.stockCritico.value.trim();

    const datos = {
      id: form.elements.id.value.trim(),
      name: form.elements.name.value.trim(),
      description: form.elements.description.value.trim(),
      species: producto?.species || "",
      price: Number(form.elements.price.value.trim().replace(",", ".")),
      stock: Number(form.elements.stock.value),
      stockCritico: critico === "" ? "" : Number(critico),
      category: form.elements.category.value,
      image: file ? await readFileAsDataUrl(file) : producto?.image || "",
    };

    const productos = getProducts();
    const index = productos.findIndex((item) => item.id === codigoActual);

    if (index >= 0) {
      productos[index] = datos;
    } else {
      productos.push(datos);
    }

    saveToStorage(STORAGE_KEYS.ADMIN_PRODUCTS, productos);
    window.location.href = "admin-productos.html";
  });
}

alIniciarAdmin(() => {
  initializeAdminProducts();
  initializeProductForm();
});

// =========================================================
// ADMIN: MANTENEDOR DE USUARIOS
// =========================================================
// Listado, nuevo, editar y mostrar usuario. Las reglas de validación son
// las mismas del registro (usuarios/reglas-usuario.js).
// En React: páginas <AdminUsuarios /> y <AdminUsuarioForm />.

function renderAdminUsers() {
  const tbody = document.querySelector("[data-admin-users]");
  if (!tbody) return;

  tbody.innerHTML = loadProfiles()
    .map((user) => {
      const email = encodeURIComponent(user.email);
      const esSesionActual = user.email === state.activeProfile.email;

      return `
        <tr>
          <td>${escapeHtml(user.run || "—")}</td>
          <td>${escapeHtml(`${user.name} ${user.apellido || ""}`)}</td>
          <td>${escapeHtml(user.email)}</td>
          <td>${escapeHtml(user.role || "Cliente")}</td>
          <td>${escapeHtml(user.comuna || "—")}</td>
          <td class="admin-actions">
            <a class="admin-edit-button" href="admin-usuario-form.html?email=${email}&modo=ver">Ver</a>
            <a class="admin-edit-button" href="admin-usuario-form.html?email=${email}">Editar</a>
            ${
              esSesionActual
                ? ""
                : `<button type="button" class="admin-delete-button" data-delete-user="${escapeHtml(user.email)}">Eliminar</button>`
            }
          </td>
        </tr>
      `;
    })
    .join("");
}

function initializeAdminUsers() {
  const tbody = document.querySelector("[data-admin-users]");
  if (!tbody) return;

  renderAdminUsers();

  tbody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-user]");
    if (!button) return;

    if (button.dataset.confirm !== "true") {
      button.dataset.confirm = "true";
      button.textContent = "¿Confirmar?";
      return;
    }

    saveToStorage(
      STORAGE_KEYS.PROFILES,
      loadProfiles().filter((item) => item.email !== button.dataset.deleteUser),
    );
    renderAdminUsers();
  });
}

function initializeUserForm() {
  const form = document.querySelector("[data-user-form]");
  if (!form) return;

  const params = adminParams();
  const emailActual = normalizeEmail(params.get("email") || "");
  const soloLectura = params.get("modo") === "ver";
  const usuario = emailActual
    ? loadProfiles().find((item) => item.email === emailActual)
    : null;
  const title = document.querySelector("[data-form-title]");
  const message = document.querySelector("[data-form-message]");

  if (emailActual && !usuario) {
    form.hidden = true;
    title.textContent = "Usuario no encontrado";
    return;
  }

  if (usuario) {
    title.textContent = soloLectura ? "Detalle del usuario" : "Editar usuario";

    [
      "run",
      "name",
      "apellido",
      "email",
      "birthDate",
      "direccion",
      "region",
    ].forEach((campo) => {
      form.elements[campo].value = usuario[campo] || "";
    });
    form.elements.role.value = usuario.role || "Cliente";
    form.elements.phone.value = usuario.phone || PREFIJO_TELEFONO;
    updateComunaOptions(usuario.region, form.elements.comuna);
    form.elements.comuna.value = usuario.comuna || "";

    const passwordHelp = document.querySelector("[data-password-help]");
    if (passwordHelp) {
      passwordHelp.textContent =
        "Déjala en blanco para conservar la contraseña actual.";
    }
  }

  if (soloLectura) {
    form
      .querySelectorAll("input, select")
      .forEach((campo) => (campo.disabled = true));
    form.querySelector("[type='submit']").remove();
    form
      .querySelectorAll("[data-password-field]")
      .forEach((campo) => (campo.hidden = true));

    const editLink = document.querySelector("[data-edit-link]");
    if (editLink) {
      editLink.href = `admin-usuario-form.html?email=${encodeURIComponent(emailActual)}`;
      editLink.hidden = false;
    }
    return;
  }

  const reglas = crearReglasUsuario({
    emailActual,
    passwordOpcional: Boolean(usuario),
  });
  activarValidacionEnVivo(form, reglas);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validarFormulario(form, reglas)) {
      message.textContent = "Revisa los campos marcados en rojo.";
      return;
    }

    const perfiles = loadProfiles();
    const index = perfiles.findIndex((item) => item.email === emailActual);
    const nuevaPassword = form.elements.password.value;

    const leidos = leerUsuarioDesdeFormulario(form);
    delete leidos.genero; // Este formulario no pide género: se conserva el guardado.

    const datos = {
      ...(usuario || { genero: "", failedAttempts: 0, locked: false }),
      ...leidos,
      password: nuevaPassword || usuario?.password,
    };

    if (index >= 0) {
      perfiles[index] = datos;
    } else {
      perfiles.push(datos);
    }

    saveToStorage(STORAGE_KEYS.PROFILES, perfiles);

    // Si el administrador edita su propia cuenta, la sesión se actualiza.
    if (emailActual === state.activeProfile.email) startSession(datos);

    window.location.href = "admin-usuarios.html";
  });
}

alIniciarAdmin(() => {
  initializeAdminUsers();
  initializeUserForm();
});

// =========================================================
// ADMIN: ÓRDENES
// =========================================================
// Listado, detalle y estado de entrega de las órdenes de compra.
// En React: página <AdminOrdenes />.

function initializeAdminOrders() {
  const tbody = document.querySelector("[data-admin-orders]");
  if (!tbody) return;

  const orders = loadFromStorage(STORAGE_KEYS.ORDERS);
  const empty = document.querySelector("[data-orders-empty]");
  const detail = document.querySelector("[data-order-detail]");

  if (empty) empty.hidden = orders.length > 0;

  // Estados de entrega de una orden. Solo el Administrador puede cambiarlos;
  // el Vendedor únicamente los ve.
  const ESTADOS_ORDEN = ["Entrega pendiente", "Listo", "Enviado"];
  const claseEstado = {
    "Entrega pendiente": "admin-status",
    Listo: "admin-status admin-status-listo",
    Enviado: "admin-status admin-status-confirmada",
  };
  // Las órdenes antiguas se guardaron como "Pendiente".
  const estadoDe = (order) =>
    ESTADOS_ORDEN.includes(order.status) ? order.status : "Entrega pendiente";

  const renderOrders = () => {
    tbody.innerHTML = orders
      .slice()
      .reverse()
      .map((order) => {
        const id = escapeHtml(order.id);
        const estado = estadoDe(order);

        return `
        <tr>
          <td>${id}</td>
          <td>${escapeHtml(formatDate(order.date))}</td>
          <td>${escapeHtml(order.customer.name)}<br /><small>${escapeHtml(order.customer.email)}</small></td>
          <td>${formatCurrency(order.total)}</td>
          <td><span class="${claseEstado[estado]}">${estado}</span></td>
          <td class="admin-actions">
            <a class="admin-edit-button" href="#detalle-orden" data-view-order="${id}">Ver detalle</a>
            ${
              isAdmin()
                ? ESTADOS_ORDEN.filter((item) => item !== estado)
                    .map(
                      (item) =>
                        `<a class="admin-edit-button admin-status-button" href="#" data-order-status="${item}" data-order-id="${id}">${item}</a>`,
                    )
                    .join("")
                : ""
            }
          </td>
        </tr>
      `;
      })
      .join("");
  };

  renderOrders();

  // "Volver al listado": cierra el detalle y vuelve a la tabla de órdenes.
  detail?.addEventListener("click", (event) => {
    if (!event.target.closest("[data-close-order]")) return;

    detail.hidden = true;
    detail.innerHTML = "";
    tbody.closest(".admin-table-wrap").scrollIntoView({ block: "start" });
  });

  tbody.addEventListener("click", (event) => {
    const control = event.target.closest("[data-order-status]");
    if (!control) return;
    event.preventDefault();

    const order = orders.find((item) => item.id === control.dataset.orderId);
    if (!order) return;

    const notice = document.querySelector("[data-orders-notice]");

    if (control.dataset.orderStatus === "Enviado") {
      // Una orden enviada ya está cerrada: se retira del listado para que
      // no se acumulen.
      orders.splice(orders.indexOf(order), 1);
      if (notice) {
        notice.textContent = `Orden ${order.id} enviada: se retiró del listado.`;
        notice.hidden = false;
      }
    } else {
      order.status = control.dataset.orderStatus;
      if (notice) notice.hidden = true;
    }

    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    renderOrders();
    if (empty) empty.hidden = orders.length > 0;
    if (detail) detail.hidden = true;
  });

  tbody.addEventListener("click", (event) => {
    const link = event.target.closest("[data-view-order]");
    if (!link) return;

    const order = orders.find((item) => item.id === link.dataset.viewOrder);
    if (!order || !detail) return;

    detail.hidden = false;
    detail.innerHTML = `
      <div class="admin-heading">
        <h2>Detalle de la orden ${escapeHtml(order.id)}</h2>
        <button type="button" class="btn-secondary" data-close-order>
          &larr; Volver al listado
        </button>
      </div>
      <p>
        <strong>Cliente:</strong> ${escapeHtml(order.customer.name)} (${escapeHtml(order.customer.email)})<br />
        <strong>Fecha:</strong> ${escapeHtml(formatDate(order.date))} ·
        <strong>Estado:</strong> ${escapeHtml(estadoDe(order))}
      </p>
      <div class="admin-table-wrap">
        <table>
          <thead>
            <tr><th>Código</th><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
                  <tr>
                    <td>${escapeHtml(item.code)}</td>
                    <td>${escapeHtml(item.name)}</td>
                    <td>${item.quantity}</td>
                    <td>${formatPrice(item.price)}</td>
                    <td>${formatPrice(item.price * item.quantity)}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <p class="admin-order-total">
        Subtotal: ${formatCurrency(order.subtotal)} ·
        Descuento: ${formatCurrency(order.discount)} ·
        <strong>Total: ${formatCurrency(order.total)}</strong>
      </p>
    `;
  });
}

alIniciarAdmin(initializeAdminOrders);

// =========================================================
// ADMIN: CITAS
// =========================================================
// Solicitudes recibidas desde "Agenda tu consulta": confirmar, rechazar o reabrir.
// En React: página <AdminCitas />.

function renderAdminAppointments() {
  const tbody = document.querySelector("[data-admin-appointments]");
  if (!tbody) return;

  const citas = loadFromStorage(STORAGE_KEYS.APPOINTMENTS);
  const empty = document.querySelector("[data-appointments-empty]");
  if (empty) empty.hidden = citas.length > 0;

  tbody.innerHTML = citas
    .slice()
    .reverse()
    .map((cita) => {
      const id = escapeHtml(cita.id);
      const estado = escapeHtml(cita.estado);

      return `
        <tr>
          <td>${id}</td>
          <td>
            ${escapeHtml(cita.nombre)}<br />
            <small>${escapeHtml(cita.rut)} · ${escapeHtml(cita.correo)} · ${escapeHtml(cita.telefono)}</small>
          </td>
          <td>${escapeHtml(cita.mascota)}<br /><small>${escapeHtml(cita.especie)}</small></td>
          <td>${escapeHtml(cita.tipoConsulta)}<br /><small>${escapeHtml(cita.motivo)}</small></td>
          <td>${escapeHtml(cita.fecha.split("-").reverse().join("-"))}</td>
          <td><span class="admin-status admin-status-${estado.toLowerCase()}">${estado}</span></td>
          <td class="admin-actions">
            ${
              cita.estado === "Pendiente"
                ? `<a class="admin-edit-button" href="#" data-appointment-status="Confirmada" data-appointment-id="${id}">Confirmar</a>
                   <button type="button" class="admin-delete-button" data-appointment-status="Rechazada" data-appointment-id="${id}">Rechazar</button>`
                : `<a class="admin-edit-button" href="#" data-appointment-status="Pendiente" data-appointment-id="${id}">Reabrir</a>`
            }
          </td>
        </tr>
      `;
    })
    .join("");
}

function initializeAdminAppointments() {
  const tbody = document.querySelector("[data-admin-appointments]");
  if (!tbody) return;

  renderAdminAppointments();

  tbody.addEventListener("click", (event) => {
    const control = event.target.closest("[data-appointment-status]");
    if (!control) return;
    event.preventDefault();

    const citas = loadFromStorage(STORAGE_KEYS.APPOINTMENTS);
    const cita = citas.find(
      (item) => item.id === control.dataset.appointmentId,
    );
    if (!cita) return;

    cita.estado = control.dataset.appointmentStatus;
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, citas);
    renderAdminAppointments();
  });
}

alIniciarAdmin(initializeAdminAppointments);
