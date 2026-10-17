import { products, siteConfig } from "./config.js";

const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#product-search");
const filtersContainer = document.querySelector("#category-filters");
const cartDialog = document.querySelector("#cart-dialog");
const productDialog = document.querySelector("#product-dialog");
const infoDialog = document.querySelector("#info-dialog");
const checkoutFeedback = document.querySelector("#checkout-feedback");
const toast = document.querySelector("#toast");
const storageKey = "fatu-store-cart-v1";
const categories = [...new Set(products.map((product) => product.category))];
let activeCategory = "Todos";
let toastTimer;

const productById = new Map(products.map((product) => [product.id, product]));
const currencyFormatter = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
  maximumFractionDigits: 0,
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function formatPrice(value) {
  return currencyFormatter.format(value);
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
}

function readCart() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new TypeError("O conteúdo guardado no carrinho tem um formato inválido.");
    }
    return Object.fromEntries(
      Object.entries(parsed).filter(([id, quantity]) =>
        productById.has(id) &&
        productById.get(id).availability &&
        Number.isInteger(quantity) &&
        quantity > 0 &&
        quantity <= 99,
      ),
    );
  } catch (error) {
    console.error("Não foi possível recuperar o carrinho guardado.", error);
    notify("Não foi possível recuperar o carrinho guardado. Podes continuar a navegar.");
    return {};
  }
}

let cart = readCart();

function saveCart() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  } catch (error) {
    console.error("Não foi possível guardar o carrinho neste navegador.", error);
    notify("O carrinho funciona nesta sessão, mas não foi possível guardá-lo neste navegador.");
  }
}

function cartCount() {
  return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
}

function cartSubtotal() {
  return Object.entries(cart).reduce((total, [id, quantity]) => {
    const product = productById.get(id);
    return total + (product ? product.price * quantity : 0);
  }, 0);
}

function makeProductCard(product) {
  const unavailable = !product.availability;
  return `<article class="product-card reveal">
    <a class="product-image-link" href="#produto/${encodeURIComponent(product.id)}" aria-label="Ver detalhes de ${escapeHtml(product.name)}">
      <div class="product-image-wrap">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageAlt)}" loading="lazy" />
        <span class="product-demo-tag">Demonstração</span>
        <span class="product-image-arrow" aria-hidden="true">↗</span>
      </div>
    </a>
    <div class="product-info">
      <div class="product-meta"><span>${escapeHtml(product.category)}</span><span class="availability ${unavailable ? "availability--off" : ""}">${unavailable ? "Indisponível" : "Disponível"}</span></div>
      <h3><a href="#produto/${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h3>
      <p>${escapeHtml(product.description)}</p>
      <div class="product-card-bottom"><strong class="product-price">${formatPrice(product.price)}</strong><button class="add-button" type="button" data-add="${escapeHtml(product.id)}" ${unavailable ? "disabled" : ""}><span aria-hidden="true">+</span><span class="sr-only">Adicionar ${escapeHtml(product.name)} ao carrinho</span></button></div>
    </div>
  </article>`;
}

function renderFilters() {
  const options = ["Todos", ...categories];
  filtersContainer.innerHTML = options.map((category) =>
    `<button class="filter-chip ${activeCategory === category ? "is-active" : ""}" type="button" aria-pressed="${activeCategory === category}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`,
  ).join("");
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase(siteConfig.locale);
  const visible = products.filter((product) => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.category} ${product.description}`
      .toLocaleLowerCase(siteConfig.locale)
      .includes(query);
    return matchesCategory && matchesSearch;
  });
  productGrid.innerHTML = visible.length
    ? visible.map(makeProductCard).join("")
    : `<div class="no-results"><span aria-hidden="true">⌕</span><p>Não encontrámos produtos para esta pesquisa.</p><button class="text-link clear-search" type="button">Limpar pesquisa <span aria-hidden="true">↗</span></button></div>`;
  watchImages(productGrid);
  observeReveals(productGrid);
}

function watchImages(root) {
  root.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.removeAttribute("src");
      image.classList.add("image-unavailable");
    }, { once: true });
  });
}

function observeReveals(root = document) {
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  root.querySelectorAll(".reveal:not(.is-visible)").forEach((element) => observer.observe(element));
}

function renderCart() {
  const count = cartCount();
  document.querySelector(".cart-count").textContent = String(count);
  document.querySelector(".cart-trigger").setAttribute("aria-label", `Abrir carrinho, ${count} ${count === 1 ? "artigo" : "artigos"}`);
  document.querySelector(".cart-title-count").textContent = `(${count})`;
  const items = Object.entries(cart).filter(([id]) => productById.has(id));
  document.querySelector("#cart-empty").hidden = items.length > 0;
  document.querySelector("#cart-summary").hidden = items.length === 0;
  document.querySelector("#cart-items").innerHTML = items.map(([id, quantity]) => {
    const product = productById.get(id);
    return `<article class="cart-item">
      <img src="${escapeHtml(product.image)}" alt="" loading="lazy" />
      <div class="cart-item-info"><h3>${escapeHtml(product.name)}</h3><p>${formatPrice(product.price)} / unidade</p>
        <div class="quantity-control" aria-label="Quantidade de ${escapeHtml(product.name)}">
          <button type="button" data-quantity="${escapeHtml(id)}" data-change="-1" aria-label="Diminuir quantidade de ${escapeHtml(product.name)}">−</button>
          <span aria-live="polite">${quantity}</span>
          <button type="button" data-quantity="${escapeHtml(id)}" data-change="1" aria-label="Aumentar quantidade de ${escapeHtml(product.name)}">+</button>
        </div>
      </div>
      <div class="cart-item-end"><strong>${formatPrice(product.price * quantity)}</strong><button class="remove-item" type="button" data-remove="${escapeHtml(id)}">Remover</button></div>
    </article>`;
  }).join("");
  document.querySelector("#cart-subtotal").textContent = formatPrice(cartSubtotal());
  watchImages(document.querySelector("#cart-items"));
}

function addToCart(id) {
  const product = productById.get(id);
  if (!product || !product.availability) {
    notify("Este produto não está disponível para adicionar ao carrinho.");
    return;
  }
  cart[id] = Math.min((cart[id] || 0) + 1, 99);
  saveCart();
  renderCart();
  notify(`${product.name} adicionado ao carrinho.`);
}

function openProduct(id) {
  const product = productById.get(id);
  if (!product) {
    productDialog.close();
    return;
  }
  productDialog.innerHTML = `<button class="icon-button product-dialog-close" type="button" aria-label="Fechar detalhes">×</button>
    <div class="product-detail">
      <div class="product-detail-image"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageAlt)}" /></div>
      <div class="product-detail-copy"><p class="eyebrow eyebrow--green"><span></span> ${escapeHtml(product.category)}</p>
        <span class="product-demo-tag product-demo-tag--inline">Produto de demonstração</span>
        <h2 id="product-dialog-title">${escapeHtml(product.name)}</h2>
        <p>${escapeHtml(product.description)}</p>
        <p class="product-detail-price">${formatPrice(product.price)}</p>
        <p class="product-detail-note">Preço e disponibilidade de demonstração. Confirma os dados reais com a equipa antes de encomendar.</p>
        <button class="button button--green" type="button" data-add="${escapeHtml(product.id)}" ${product.availability ? "" : "disabled"}>Adicionar ao carrinho <span aria-hidden="true">↗</span></button>
      </div>
    </div>`;
  watchImages(productDialog);
  if (!productDialog.open) productDialog.showModal();
}

function setWhatsAppLinks() {
  const number = String(siteConfig.whatsappNumber).replace(/\D/g, "");
  document.querySelectorAll(".whatsapp-link").forEach((link) => {
    if (number) {
      link.href = `https://wa.me/${number}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", "Contactar a empresa pelo WhatsApp (abre numa nova janela)");
    } else {
      link.href = "#contactos";
      link.addEventListener("click", (event) => {
        event.preventDefault();
        notify("Configura o número de WhatsApp em config.js para ativar este contacto.");
      });
    }
  });
}

function renderSocials() {
  const container = document.querySelector("#social-links");
  const validLinks = siteConfig.socialLinks.filter((item) => {
    try {
      const url = new URL(item.url);
      return ["https:", "http:"].includes(url.protocol);
    } catch {
      return false;
    }
  });
  container.innerHTML = validLinks.map((item) =>
    `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(item.label)} (abre numa nova janela)">${escapeHtml(item.label)}</a>`,
  ).join("");
  if (!validLinks.length) container.hidden = true;
}

function renderContact() {
  const emailElement = document.querySelector("#contact-email");
  if (siteConfig.email) {
    const emailLink = document.createElement("a");
    emailLink.href = `mailto:${siteConfig.email}`;
    emailLink.textContent = siteConfig.email;
    emailElement.replaceChildren(emailLink);
  }
  document.querySelector("#contact-location").textContent = siteConfig.location;
}

function setProductHash(id) {
  const newHash = `#produto/${encodeURIComponent(id)}`;
  if (window.location.hash === newHash) openProduct(id);
  else window.location.hash = newHash;
}

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    addToCart(addButton.dataset.add);
    return;
  }
  const clearButton = event.target.closest(".clear-search");
  if (clearButton) {
    searchInput.value = "";
    activeCategory = "Todos";
    renderFilters();
    renderProducts();
  }
});

productGrid.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#produto/"]');
  if (link) {
    event.preventDefault();
    setProductHash(decodeURIComponent(link.hash.slice("#produto/".length)));
  }
});

filtersContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);
document.querySelector(".cart-trigger").addEventListener("click", () => {
  renderCart();
  cartDialog.showModal();
});
document.querySelector(".close-cart").addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("click", (event) => {
  if (event.target.classList.contains("dialog-backdrop")) cartDialog.close();
  const quantityButton = event.target.closest("[data-quantity]");
  if (quantityButton) {
    const id = quantityButton.dataset.quantity;
    const updated = (cart[id] || 0) + Number(quantityButton.dataset.change);
    if (updated <= 0) delete cart[id];
    else cart[id] = Math.min(updated, 99);
    saveCart();
    renderCart();
  }
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    delete cart[removeButton.dataset.remove];
    saveCart();
    renderCart();
  }
});
document.querySelector(".checkout-form").addEventListener("submit", (event) => {
  event.preventDefault();
  checkoutFeedback.textContent = "";
  if (!event.currentTarget.reportValidity()) return;
  if (!Object.keys(cart).length) {
    checkoutFeedback.textContent = "Adiciona pelo menos um produto antes de preparar o pedido.";
    return;
  }
  const number = String(siteConfig.whatsappNumber).replace(/\D/g, "");
  if (!number) {
    checkoutFeedback.textContent = "O envio ainda não está configurado. A equipa precisa de definir o número de WhatsApp em config.js.";
    return;
  }
  const formData = new FormData(event.currentTarget);
  const lines = Object.entries(cart).map(([id, quantity]) => {
    const product = productById.get(id);
    return `• ${product.name} × ${quantity} — ${formatPrice(product.price * quantity)}`;
  });
  const note = String(formData.get("note") || "").trim();
  const message = [
    "Olá! Gostaria de consultar a disponibilidade destes produtos:",
    "",
    ...lines,
    "",
    `Subtotal estimado: ${formatPrice(cartSubtotal())}`,
    `Nome: ${String(formData.get("name")).trim()}`,
    `Contacto: ${String(formData.get("phone")).trim()}`,
    ...(note ? [`Nota: ${note}`] : []),
    "",
    "Sei que este pedido só fica confirmado após resposta da equipa e confirmação do preço, disponibilidade e entrega.",
  ].join("\n");
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  const opened = window.open(url, "_blank");
  if (opened) opened.opener = null;
  checkoutFeedback.textContent = opened
    ? "O WhatsApp foi aberto com o teu pedido preparado. A encomenda não está confirmada até a equipa responder."
    : "O pedido está preparado, mas o navegador bloqueou a nova janela. Usa a ligação abaixo para abrir o WhatsApp.";
  if (!opened) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Abrir o WhatsApp com o pedido";
    checkoutFeedback.append(" ", link);
  }
});

productDialog.addEventListener("click", (event) => {
  if (event.target.closest(".product-dialog-close")) {
    productDialog.close();
    return;
  }
  const addButton = event.target.closest("[data-add]");
  if (addButton) addToCart(addButton.dataset.add);
});
productDialog.addEventListener("click", (event) => {
  if (event.target === productDialog) productDialog.close();
});
productDialog.addEventListener("close", () => {
  if (window.location.hash.startsWith("#produto/")) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
});
window.addEventListener("hashchange", () => {
  if (window.location.hash.startsWith("#produto/")) {
    openProduct(decodeURIComponent(window.location.hash.slice("#produto/".length)));
  } else if (productDialog.open) {
    productDialog.close();
  }
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const feedback = document.querySelector("#newsletter-feedback");
  feedback.textContent = "A newsletter ainda não está ativa. O teu endereço não foi guardado nem enviado.";
});

const policyInformation = {
  deliveries: {
    title: "Entregas e levantamento",
    text: "As zonas, os prazos e os custos de entrega ainda não estão configurados neste site. A equipa deverá confirmar estas opções e a disponibilidade contigo antes de aceitar o pedido.",
  },
  payments: {
    title: "Pagamentos",
    text: "Este site não processa pagamentos e não anuncia métodos de pagamento. O valor final e as opções disponíveis terão de ser confirmados diretamente com a empresa.",
  },
  privacy: {
    title: "Privacidade",
    text: "O carrinho é guardado localmente neste navegador. O formulário de newsletter não envia nem guarda o teu email. Ao preparar um pedido, os dados só são incluídos na mensagem do WhatsApp depois de escolheres enviar; a conversa passa então a ser tratada pelo WhatsApp segundo as respetivas condições de privacidade.",
  },
  sales: {
    title: "Condições de venda",
    text: "Os produtos, preços, fotografias e disponibilidades atuais são exemplos de demonstração. Um pedido enviado pelo WhatsApp é apenas um pedido de informação e não fica confirmado até a equipa validar os artigos, o preço final e os detalhes de entrega.",
  },
};

document.querySelectorAll("[data-info]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const info = policyInformation[link.dataset.info];
    if (!info) return;
    document.querySelector("#info-dialog-title").textContent = info.title;
    document.querySelector("#info-dialog-copy").textContent = info.text;
    infoDialog.showModal();
  });
});
document.querySelector(".info-dialog-close").addEventListener("click", () => infoDialog.close());
infoDialog.addEventListener("click", (event) => {
  if (event.target === infoDialog) infoDialog.close();
});

const menuToggle = document.querySelector(".menu-toggle");
menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  menuToggle.querySelector(".sr-only").textContent = expanded ? "Abrir menu" : "Fechar menu";
  document.querySelector(".primary-nav").classList.toggle("is-open", !expanded);
});
document.querySelectorAll(".primary-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector(".sr-only").textContent = "Abrir menu";
    document.querySelector(".primary-nav").classList.remove("is-open");
  });
});

renderFilters();
renderProducts();
renderCart();
renderContact();
renderSocials();
setWhatsAppLinks();
document.querySelector("#current-year").textContent = String(new Date().getFullYear());
observeReveals();
watchImages(document);

if (window.location.hash.startsWith("#produto/")) {
  openProduct(decodeURIComponent(window.location.hash.slice("#produto/".length)));
}
