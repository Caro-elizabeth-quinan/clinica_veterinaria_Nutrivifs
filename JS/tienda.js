
// =========================================================
// TIENDA: CARRITO (LÓGICA)
// =========================================================
// Reglas del carrito:
// 1. No se puede agregar más unidades que el stock disponible.
// 2. Si la cantidad llega a 0, el producto sale del carrito.
// 3. El carrito se guarda en localStorage y se mantiene entre páginas.
// 4. Para pagar hay que iniciar sesión; al pagar se descuenta el stock
//    y se registra una orden (ver carrito-pagina.js).
// 5. Cupón NUTRI10: 10% de descuento sobre el subtotal.
// Cada cambio emite el evento "carrito:cambio" para que las vistas que
// muestran el carrito se actualicen sin depender unas de otras.
// En React: CartContext / hook useCarrito.

const CUPONES = { NUTRI10: 0.1 };

function saveCart() {
  saveToStorage(STORAGE_KEYS.CART, state.cartItems);
}

function getCartQuantity() {
  return state.cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );
}

function getCartSubtotal() {
  return state.cartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
}

function getCartDiscount() {
  return Math.round(getCartSubtotal() * (CUPONES[state.coupon] || 0));
}

function getCartTotal() {
  return getCartSubtotal() - getCartDiscount();
}

function findCartProduct(code) {
  return state.cartItems.find((item) => item.code === String(code));
}

// Guarda el carrito y avisa a las vistas (contador, catálogo, detalle, página del carrito).
function refreshCartViews() {
  saveCart();
  updateCartCounter();
  document.dispatchEvent(new CustomEvent("carrito:cambio"));
}

function addProduct(code, quantity = 1) {
  const product = findProduct(code);
  if (!product || quantity < 1) return false;

  const existing = findCartProduct(product.id);
  const inCart = existing?.quantity || 0;

  if (inCart + quantity > Number(product.stock)) return false;

  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cartItems.push({
      code: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image || IMAGEN_POR_DEFECTO,
      quantity,
    });
  }

  refreshCartViews();
  return true;
}

function changeQuantity(code, amount) {
  const item = findCartProduct(code);
  if (!item) return;

  if (amount > 0 && item.quantity + amount > getStockByCode(code)) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    state.cartItems = state.cartItems.filter(
      (cartItem) => cartItem.code !== item.code,
    );
  }

  refreshCartViews();
}

function removeCartProduct(code) {
  state.cartItems = state.cartItems.filter((item) => item.code !== code);
  refreshCartViews();
}

function clearCart() {
  state.cartItems = [];
  state.coupon = "";
  localStorage.removeItem(STORAGE_KEYS.COUPON);
  refreshCartViews();
}

function updateCartCounter() {
  const totalQuantity = getCartQuantity();

  document.querySelectorAll(".carrito-compras").forEach((link) => {
    link.innerHTML = `Carrito <span class="cart-counter">${totalQuantity}</span>`;
    link.setAttribute("aria-label", `Carrito, ${totalQuantity} productos`);
  });
}

alIniciar(updateCartCounter);

// =========================================================
// TIENDA: PÁGINA DEL CARRITO
// =========================================================
// Listado del carrito, cupón, pago y aviso de confirmación (carrito.html).
// En React: página <Carrito /> con sus componentes de ítem y resumen.

function renderCart() {
  const cartItemsContainer = document.querySelector("[data-cart-items]");
  if (!cartItemsContainer) return;

  const emptyMessage = document.querySelector("[data-cart-empty]");
  const summary = document.querySelector("[data-cart-summary]");
  const isEmpty = state.cartItems.length === 0;

  if (emptyMessage) emptyMessage.hidden = !isEmpty;
  if (summary) summary.hidden = isEmpty;

  cartItemsContainer.innerHTML = state.cartItems
    .map((item) => {
      const product = findProduct(item.code);
      const atLimit = item.quantity >= getStockByCode(item.code);

      return `
        <article class="cart-page-item">
          <img src="${escapeHtml(item.image || IMAGEN_POR_DEFECTO)}" alt="${escapeHtml(item.name)}" />
          <div class="cart-page-item-info">
            <h2><a href="detalle-producto.html?codigo=${encodeURIComponent(item.code)}">${escapeHtml(item.name)}</a></h2>
            <p>${escapeHtml(product?.description || "")}</p>
            <button type="button" class="remove-cart-item" data-action="remove" data-code="${escapeHtml(item.code)}">Eliminar</button>
          </div>
          <div class="cart-page-item-price">
            <strong>${formatPrice(item.price * item.quantity)}</strong>
            <small>${formatPrice(item.price)} c/u</small>
            <div class="cart-quantity-controls" aria-label="Cantidad de ${escapeHtml(item.name)}">
              <button type="button" data-action="decrease" data-code="${escapeHtml(item.code)}" aria-label="Disminuir cantidad">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-action="increase" data-code="${escapeHtml(item.code)}" aria-label="Aumentar cantidad" ${atLimit ? "disabled" : ""}>+</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  const setText = (selector, text) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
  };

  const discount = getCartDiscount();
  const discountRow = document.querySelector("[data-cart-discount-row]");
  if (discountRow) discountRow.hidden = discount === 0;

  setText("[data-cart-subtotal]", formatCurrency(getCartSubtotal()));
  setText("[data-cart-discount]", `- ${formatCurrency(discount)}`);
  setText("[data-cart-total]", formatCurrency(getCartTotal()));
}

function applyCoupon() {
  const input = document.querySelector("[data-coupon-input]");
  const message = document.querySelector("[data-coupon-message]");
  if (!input) return;

  const code = input.value.trim().toUpperCase();

  if (!code) {
    mostrarErrorCampo(input, "Ingresa un cupón.");
    return;
  }

  if (!CUPONES[code]) {
    mostrarErrorCampo(input, "El cupón no existe o ya no está vigente.");
    return;
  }

  mostrarErrorCampo(input, "");
  state.coupon = code;
  localStorage.setItem(STORAGE_KEYS.COUPON, code);
  if (message) {
    message.textContent = `Cupón ${code} aplicado: ${CUPONES[code] * 100}% de descuento.`;
  }
  renderCart();
}

// Descuenta el stock comprado y lo persiste en ADMIN_PRODUCTS (localStorage).
function applyStockDeduction(cartItems) {
  const products = getProducts();

  cartItems.forEach((item) => {
    const product = products.find((entry) => entry.id === item.code);
    if (product) {
      product.stock = Math.max(0, Number(product.stock) - item.quantity);
    }
  });

  saveToStorage(STORAGE_KEYS.ADMIN_PRODUCTS, products);
}

function createOrder() {
  const orders = loadFromStorage(STORAGE_KEYS.ORDERS);

  // El número de orden sale de un contador propio (no del largo de la
  // lista), porque las órdenes enviadas se eliminan y no debe repetirse.
  const numero =
    Math.max(
      Number(localStorage.getItem(STORAGE_KEYS.ORDER_SEQUENCE)) || 0,
      orders.length,
    ) + 1;
  localStorage.setItem(STORAGE_KEYS.ORDER_SEQUENCE, String(numero));

  const order = {
    id: `ORD-${String(numero).padStart(4, "0")}`,
    date: new Date().toISOString(),
    customer: {
      name: `${state.activeProfile.name} ${state.activeProfile.apellido || ""}`.trim(),
      email: state.activeProfile.email,
    },
    items: state.cartItems.map((item) => ({ ...item })),
    subtotal: getCartSubtotal(),
    discount: getCartDiscount(),
    total: getCartTotal(),
    status: "Entrega pendiente",
  };

  orders.push(order);
  saveToStorage(STORAGE_KEYS.ORDERS, orders);
  return order;
}

function handlePayCart() {
  if (state.cartItems.length === 0) {
    showNotice("Agrega al menos un producto antes de pagar.");
    return;
  }

  if (!state.activeProfile) {
    showNotice("Necesitas iniciar sesión para pagar tu compra.", () => {
      window.location.href = "login.html?volver=carrito.html";
    });
    return;
  }

  showNotice(
    `El total de tu compra es ${formatCurrency(getCartTotal())}. ¿Deseas continuar con el pago?`,
    () => {
      const order = createOrder();
      applyStockDeduction(state.cartItems);
      clearCart();
      showNotice(
        `Compra realizada con éxito. Tu número de orden es ${order.id}.`,
      );
    },
  );
}

function showNotice(message, onConfirm = null) {
  const notice = document.querySelector("[data-cart-notice]");
  const messageElement = document.querySelector("[data-cart-notice-message]");
  const confirmButton = document.querySelector("[data-notice-confirm]");
  const cancelButton = document.querySelector("[data-notice-cancel]");
  const closeButton = document.querySelector("[data-notice-close]");

  if (!notice || !messageElement) return;

  messageElement.textContent = message;

  if (confirmButton) {
    confirmButton.hidden = !onConfirm;
    confirmButton.onclick = onConfirm || null;
  }

  if (cancelButton) cancelButton.hidden = !onConfirm;
  if (closeButton) closeButton.hidden = Boolean(onConfirm);

  notice.hidden = false;
}

function initializeCartPage() {
  if (!document.querySelector("[data-cart-items]")) return;

  renderCart();
  document.addEventListener("carrito:cambio", renderCart);

  document.addEventListener("click", (event) => {
    const cartAction = event.target.closest("[data-action]");
    if (!cartAction) return;

    const code = cartAction.dataset.code;
    const action = cartAction.dataset.action;

    if (action === "remove") {
      removeCartProduct(code);
    } else if (action === "increase") {
      changeQuantity(code, 1);
    } else if (action === "decrease") {
      changeQuantity(code, -1);
    }
  });

  const hideNotice = () => {
    const notice = document.querySelector("[data-cart-notice]");
    if (notice) notice.hidden = true;
  };

  document
    .querySelector("[data-notice-close]")
    ?.addEventListener("click", hideNotice);
  document
    .querySelector("[data-notice-cancel]")
    ?.addEventListener("click", hideNotice);
  document
    .querySelector("[data-clear-cart]")
    ?.addEventListener("click", () => clearCart());
  document
    .querySelector("[data-pay-cart]")
    ?.addEventListener("click", handlePayCart);
  document
    .querySelector("[data-coupon-form]")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();
      applyCoupon();
    });
}

alIniciar(initializeCartPage);

// =========================================================
// TIENDA: TARJETAS Y CATÁLOGO DE PRODUCTOS
// =========================================================
// Tarjeta de producto, listado desde el arreglo, controles de cantidad y
// filtros por categoría y precio (productos.html y productos relacionados).
// En React: <ProductCard />, <ProductGrid /> y <Filtros />.

function createProductCard(product) {
  const card = document.createElement("article");
  const url = productDetailUrl(product.id);

  card.className = "product-card";
  card.dataset.codigo = product.id;
  card.dataset.category = product.category;
  card.dataset.stock = product.stock;

  card.innerHTML = `
    <a class="product-image-link" href="${url}">
      <img class="product-image" src="${escapeHtml(product.image || IMAGEN_POR_DEFECTO)}" alt="${escapeHtml(product.name)}">
    </a>
    <div class="product-content">
      <span class="product-category">${escapeHtml(product.category)}</span>
      <h3><a href="${url}">${escapeHtml(product.name)}</a></h3>
      <p>
        ${escapeHtml(product.description || "")}
        ${product.species ? `<br /><small>Especie: ${escapeHtml(product.species)}</small>` : ""}
      </p>
      <div class="product-footer">
        <strong class="product-price">${formatPrice(product.price)}</strong>
        <a class="view-detail-button" href="${url}">Ver detalle</a>
        <button type="button" class="add-cart-button">Agregar al carrito</button>
      </div>
    </div>
  `;

  return card;
}

function renderProductsGrid() {
  const productsGrid = document.querySelector("#products-grid");
  if (!productsGrid) return;

  productsGrid.innerHTML = "";
  getProducts().forEach((product) => {
    productsGrid.appendChild(createProductCard(product));
  });
}

function addStockLabel(card, quantity) {
  const productContent = card.querySelector(".product-content");
  if (!productContent) return;

  let stockLabel = productContent.querySelector(".product-stock");

  if (!stockLabel) {
    stockLabel = document.createElement("p");
    stockLabel.className = "product-stock";
    const footer = productContent.querySelector(".product-footer");
    footer?.before(stockLabel);
  }

  const stock = getStockByCode(card.dataset.codigo);
  stockLabel.textContent =
    stock > 0 ? `Stock disponible: ${stock} unidades` : "Sin stock disponible";
  stockLabel.classList.toggle("out-of-stock", quantity >= stock);
}

function renderProductQuantities() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const footer = card.querySelector(".product-footer");

    if (!footer || footer.querySelector(".product-quantity-controls")) return;

    const quantityControls = document.createElement("div");
    quantityControls.className = "product-quantity-controls";
    quantityControls.innerHTML = `
      <button type="button" data-product-action="decrease" aria-label="Quitar una unidad">−</button>
      <span data-product-quantity>0</span>
      <button type="button" data-product-action="increase" aria-label="Agregar una unidad">+</button>
    `;

    footer.appendChild(quantityControls);
  });
}

function updateProductQuantities() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const code = card.dataset.codigo;
    const quantity = findCartProduct(code)?.quantity || 0;

    const quantityElement = card.querySelector("[data-product-quantity]");
    if (quantityElement) quantityElement.textContent = quantity;

    addStockLabel(card, quantity);

    const increaseButton = card.querySelector(
      '[data-product-action="increase"]',
    );
    const addButton = card.querySelector(".add-cart-button");
    const atStockLimit = quantity >= getStockByCode(code);

    if (increaseButton) increaseButton.disabled = atStockLimit;
    if (addButton) addButton.disabled = atStockLimit;
  });
}

function applyProductFilters() {
  const selectedCategory =
    document.querySelector(".filter-btn.active")?.dataset.category || "todos";
  const selectedPrice =
    document.querySelector("[data-price-filter]")?.value || "todos";

  const cards = document.querySelectorAll("#products-grid .product-card");
  let visibleProducts = 0;

  cards.forEach((card) => {
    const cardCategory = card.dataset.category || "";

    const categoryMatches =
      selectedCategory === "todos" ||
      cardCategory.toLowerCase() === selectedCategory.toLowerCase();

    const price = Number(findProduct(card.dataset.codigo)?.price) || 0;

    let priceMatches = true;

    if (selectedPrice !== "todos") {
      const parts = selectedPrice.split("-");
      const minimum = Number(parts[0]) || 0;

      if (selectedPrice.endsWith("-mas")) {
        priceMatches = price >= minimum;
      } else {
        const maximum = Number(parts[1]) || 0;
        priceMatches = price >= minimum && price <= maximum;
      }
    }

    const isVisible = categoryMatches && priceMatches;
    card.classList.toggle("is-filtered-out", !isVisible);

    if (isVisible) visibleProducts++;
  });

  const result = document.querySelector("[data-filter-result]");
  if (result) {
    result.textContent = `${visibleProducts} producto${
      visibleProducts === 1 ? "" : "s"
    } encontrado${visibleProducts === 1 ? "" : "s"}`;
  }
}

function initializeProductFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const priceFilter = document.querySelector("[data-price-filter]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      applyProductFilters();
    });
  });

  priceFilter?.addEventListener("change", () => {
    applyProductFilters();
  });

  applyProductFilters();
}

// Clics de las tarjetas: "Agregar al carrito" y los botones + / −.
function bindProductCardEvents() {
  document.addEventListener("click", (event) => {
    const addButton = event.target.closest(".product-card .add-cart-button");
    const productAction = event.target.closest("[data-product-action]");

    if (addButton) {
      const card = addButton.closest(".product-card");

      if (addProduct(card.dataset.codigo)) {
        addButton.textContent = "Agregado ✓";
        setTimeout(() => {
          if (document.body.contains(addButton)) {
            addButton.textContent = "Agregar al carrito";
          }
        }, 1200);
      }
      return;
    }

    if (productAction) {
      const card = productAction.closest(".product-card");
      if (!card) return;

      if (productAction.dataset.productAction === "increase") {
        addProduct(card.dataset.codigo);
      } else {
        changeQuantity(card.dataset.codigo, -1);
      }
    }
  });

  document.addEventListener("carrito:cambio", updateProductQuantities);
}

// Prepara las tarjetas que ya están en la página (catálogo o relacionados).
function initializeProductCards() {
  renderProductQuantities();
  updateProductQuantities();
}

alIniciar(() => {
  renderProductsGrid();
  bindProductCardEvents();
  initializeProductCards();
  initializeProductFilters();
});

// =========================================================
// TIENDA: PÁGINA DE DETALLE DE PRODUCTO
// =========================================================
// detalle-producto.html?codigo=ME001. Usa las tarjetas de productos.js para
// los productos relacionados.
// En React: página <DetalleProducto /> con el código en la ruta.

function initializeProductDetailPage() {
  const container = document.querySelector("[data-product-detail]");
  if (!container) return;

  const code = new URLSearchParams(window.location.search).get("codigo");
  const product = findProduct(code);

  if (!product) {
    container.innerHTML = `
      <p class="detail-not-found">
        No encontramos el producto solicitado.
        <a href="productos.html">Volver al catálogo</a>
      </p>
    `;
    return;
  }

  document.title = `${product.name} | Clínica NutriDifs`;

  container.innerHTML = `
    <nav class="breadcrumb" aria-label="Ruta de navegación">
      <a href="index.html">Inicio</a> ›
      <a href="productos.html">Productos</a> ›
      <span>${escapeHtml(product.name)}</span>
    </nav>

    <article class="product-detail" data-detail-code="${escapeHtml(product.id)}">
      <div class="product-detail-image">
        <img src="${escapeHtml(product.image || IMAGEN_POR_DEFECTO)}" alt="${escapeHtml(product.name)}" />
      </div>

      <div class="product-detail-info">
        <span class="product-category">${escapeHtml(product.category)}</span>
        <div class="product-detail-heading">
          <h1>${escapeHtml(product.name)}</h1>
          <strong class="detail-price">${formatPrice(product.price)}</strong>
        </div>
        <p class="detail-description">${escapeHtml(product.description || "Producto veterinario de la clínica.")}</p>
        <ul class="detail-data">
          <li><strong>Código:</strong> ${escapeHtml(product.id)}</li>
          ${product.species ? `<li><strong>Especie:</strong> ${escapeHtml(product.species)}</li>` : ""}
        </ul>
        <p class="detail-stock" data-detail-stock></p>

        <form class="detail-add-form" data-detail-form novalidate>
          <div class="campo-formulario">
            <label for="detail-quantity">Cantidad</label>
            <input type="number" id="detail-quantity" name="cantidad" value="1" min="1" step="1" inputmode="numeric" />
          </div>
          <button type="submit" class="add-cart-button" data-detail-add>Añadir al carrito</button>
          <p class="detail-message" data-detail-message role="status" aria-live="polite"></p>
        </form>
      </div>
    </article>

    <section class="related-products" aria-labelledby="related-title">
      <h2 id="related-title">Productos relacionados</h2>
      <div class="products-grid" data-related-products></div>
    </section>
  `;

  const related = container.querySelector("[data-related-products]");
  getProducts()
    .filter(
      (item) => item.category === product.category && item.id !== product.id,
    )
    .concat(getProducts().filter((item) => item.category !== product.category))
    .slice(0, 4)
    .forEach((item) => related.appendChild(createProductCard(item)));

  const form = container.querySelector("[data-detail-form]");
  const message = container.querySelector("[data-detail-message]");

  const reglas = {
    cantidad: (valor) => {
      const disponible =
        getStockByCode(product.id) -
        (findCartProduct(product.id)?.quantity || 0);

      if (!/^\d+$/.test(String(valor).trim()) || Number(valor) < 1) {
        return "Ingresa una cantidad entera mayor o igual a 1.";
      }
      if (Number(valor) > disponible) {
        return `Solo puedes agregar ${disponible} unidad${disponible === 1 ? "" : "es"} más.`;
      }
      return "";
    },
  };

  activarValidacionEnVivo(form, reglas);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent = "";

    if (!validarFormulario(form, reglas)) return;

    const quantity = Number(form.elements.cantidad.value);

    if (addProduct(product.id, quantity)) {
      message.innerHTML = `Agregaste ${quantity} unidad${quantity === 1 ? "" : "es"} al carrito. <a href="carrito.html">Ver carrito</a>`;
      form.elements.cantidad.value = 1;
    }
  });
}

function updateDetailAvailability() {
  const detail = document.querySelector("[data-detail-code]");
  if (!detail) return;

  const code = detail.dataset.detailCode;
  const stock = getStockByCode(code);
  const inCart = findCartProduct(code)?.quantity || 0;
  const available = stock - inCart;

  const stockLabel = detail.querySelector("[data-detail-stock]");
  if (stockLabel) {
    stockLabel.textContent =
      stock <= 0
        ? "Sin stock disponible"
        : `Stock disponible: ${stock} unidades${inCart ? ` (${inCart} en tu carrito)` : ""}`;
    stockLabel.classList.toggle("out-of-stock", available <= 0);
  }

  const addButton = detail.querySelector("[data-detail-add]");
  if (addButton) addButton.disabled = available <= 0;
}

alIniciar(() => {
  initializeProductDetailPage();
  initializeProductCards();
  updateDetailAvailability();
  document.addEventListener("carrito:cambio", updateDetailAvailability);
});

// =========================================================
// TIENDA: PÁGINA DE INICIO
// =========================================================
// Productos destacados y sección "El equipo" de index.html.
// En React: componentes <ProductosDestacados /> y <Equipo />.

// Productos destacados de la página principal.
function renderFeaturedProducts() {
  const container = document.querySelector("[data-featured-products]");
  if (!container) return;

  container.innerHTML = getProducts()
    .slice(0, 8)
    .map(
      (product) => `
        <article class="featured-product-card">
          <a href="${productDetailUrl(product.id)}">
            <img src="${escapeHtml(product.image || IMAGEN_POR_DEFECTO)}" alt="${escapeHtml(product.name)}" class="product-image" />
          </a>
          <div class="featured-product-info">
            <span>${escapeHtml(product.category)}</span>
            <h3>${escapeHtml(product.name)}</h3>
            <strong class="product-price">${formatPrice(product.price)}</strong>
            <a href="${productDetailUrl(product.id)}">Ver producto</a>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderHomeUsers() {
  const homeUsers = document.querySelector("[data-home-users]");
  if (!homeUsers) return;

  const activeUsers = loadFromStorage(STORAGE_KEYS.ADMIN_USERS).filter(
    (user) => user.status !== "Inactivo",
  );

  homeUsers.innerHTML = activeUsers
    .map((user) => {
      const initials = user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      return `
        <article class="team-card">
          <div class="avatar" aria-hidden="true">${escapeHtml(initials)}</div>
          <h3>${escapeHtml(user.name)}</h3>
          <p class="role">${escapeHtml(user.role || "Equipo clínico")}</p>
          <p class="email">${escapeHtml(user.email)}</p>
        </article>
      `;
    })
    .join("");
}

alIniciar(() => {
  renderFeaturedProducts();
  renderHomeUsers();
});
