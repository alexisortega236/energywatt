document.documentElement.classList.add("js");

const whatsappNumber = "5215544835265";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const mobileToggle = document.querySelector("[data-mobile-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const yearNode = document.querySelector("[data-year]");

function trackEvent(name, parameters = {}) {
  window.dataLayer?.push({ event: name, ...parameters });
  document.dispatchEvent(new CustomEvent("energywatt:analytics", {
    detail: { name, parameters }
  }));
}

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

function closeMobileMenu() {
  mobileMenu?.classList.add("hidden");
  mobileToggle?.setAttribute("aria-expanded", "false");
  mobileToggle?.setAttribute("aria-label", "Abrir menú");
  document.body.classList.remove("overflow-hidden");
}

function openMobileMenu() {
  mobileMenu?.classList.remove("hidden");
  mobileToggle?.setAttribute("aria-expanded", "true");
  mobileToggle?.setAttribute("aria-label", "Cerrar menú");
  document.body.classList.add("overflow-hidden");
}

function buildWhatsAppUrl(message) {
  const normalizedNumber = whatsappNumber.replace(/\D/g, "");
  if (!normalizedNumber) return "";
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}

function openWhatsAppConversation(message) {
  const url = buildWhatsAppUrl(message);
  if (!url) return false;
  return Boolean(window.open(url, "_blank", "noopener,noreferrer"));
}

function initWhatsAppActions() {
  const hasWhatsApp = Boolean(whatsappNumber.replace(/\D/g, ""));
  const actions = document.querySelectorAll("[data-whatsapp-action]");

  actions.forEach((action) => {
    if (action instanceof HTMLButtonElement) {
      action.disabled = !hasWhatsApp;
      action.setAttribute("aria-disabled", String(!hasWhatsApp));
    }

    if (!hasWhatsApp) return;
    action.addEventListener("click", () => {
      trackEvent("whatsapp_click", {
        context: action.dataset.whatsappCategory || action.dataset.whatsappContext || "direct"
      });
      const message = action.dataset.whatsappProduct
        ? `Hola, quiero información sobre ${action.dataset.whatsappProduct} de Energy Watt.`
        : action.dataset.whatsappCategory
        ? `Hola, quiero cotizar la categoría ${action.dataset.whatsappCategory} de Energy Watt.`
        : action.dataset.whatsappContext === "products"
        ? "Hola, quiero información para cotizar material eléctrico de Energy Watt."
        : "Hola, me gustaría hablar con un asesor de Energy Watt.";
      openWhatsAppConversation(message);
    });
  });
}

function initProductCards() {
  const catalogProducts = [
    { page: 31, eyebrow: "Protección y distribución", title: "Centros de carga QOD", description: "Soluciones para distribución eléctrica residencial y comercial.", category: "Centros de carga QOD", alt: "Centro de carga eléctrico", image: "./public/assets/images/catalog-products/qod-transparent.png" },
    { page: 29, eyebrow: "Canalización", title: "Tubo flexible Liquidtight SLFS", description: "Canalización flexible para proteger y ordenar instalaciones eléctricas.", category: "Tubo flexible Liquidtight SLFS", alt: "Tubo flexible liquidtight para instalación eléctrica", image: "./public/assets/images/catalog-products/liquidtight-transparent.png" },
    { page: 33, eyebrow: "Control", title: "Contactor / SIRIUS", description: "Componentes de control para maniobra y protección de motores y cargas.", category: "Contactor SIRIUS", alt: "Contactor eléctrico para control", image: "./public/assets/images/catalog-products/sirius-transparent.png" },
    { page: 3, eyebrow: "Luminarias", title: "Phoenix", description: "Luminaria LED para vialidades con opciones de potencia y alta eficiencia.", category: "Luminaria Phoenix", alt: "Luminaria LED Phoenix para vialidades", image: "./public/assets/images/catalog-products/phoenix-transparent.png" },
    { page: 7, eyebrow: "Luminarias solares", title: "S7B", description: "Luminarias LED solares para vialidades con distintas potencias y temperaturas de color.", category: "Luminaria solar S7B", alt: "Luminaria LED solar S7B", image: "./public/assets/images/catalog-products/s7b-transparent.png" },
    { page: 30, eyebrow: "Instalación", title: "Conectores y curvas de PVC", description: "Accesorios para canalización y conexión de instalaciones eléctricas.", category: "Conectores y curvas de PVC", alt: "Conectores y curvas de PVC", image: "./public/assets/images/catalog-products/pvc-transparent.png" },
    { page: 34, eyebrow: "Alumbrado público", title: "Fotocontactor", description: "Control automático para sistemas de iluminación exterior y alumbrado público.", category: "Fotocontactor", alt: "Fotocontactor para alumbrado público", image: "./public/assets/images/catalog-products/photocontactor-transparent.png" },
    { page: 8, eyebrow: "Luminarias solares", title: "LD-16 V Series", description: "Luminarias LED solares para vialidades con opciones de potencia de 50 a 200 W.", category: "Luminaria solar LD-16 V", alt: "Luminaria LED solar LD-16 V", image: "./public/assets/images/catalog-products/ld16v-transparent.png" },
    { page: 4, eyebrow: "Alumbrado público", title: "G2E", description: "Luminaria LED pública para vialidades con protección IP66 e IK09.", category: "Luminaria pública G2E", alt: "Luminaria LED pública G2E", image: "./public/assets/images/catalog-products/g2e-transparent.png" },
    { page: 19, eyebrow: "Iluminación industrial", title: "Campana LED industrial H9", description: "Campana LED industrial para espacios de trabajo y naves industriales.", category: "Campana LED industrial H9", alt: "Campana LED industrial H9", image: "./public/assets/images/catalog-products/h9-transparent.png" },
    { page: 14, eyebrow: "Proyectores LED", title: "P5 para grandes alturas", description: "Proyector LED de alta potencia para naves, patios y espacios de gran altura.", category: "Proyector LED P5", alt: "Proyector LED P5 para grandes alturas", image: "./public/assets/images/catalog-products/p5-transparent.png" },
    { page: 61, eyebrow: "Hogar", title: "Tinacos", description: "Capacidades y opciones para almacenamiento de agua en proyectos residenciales.", category: "Tinacos", alt: "Tinacos para hogar", image: "./public/assets/images/catalog-products/tinaco-transparent.png" }
  ];

  document.querySelectorAll(".product-card").forEach((card, index) => {
    const product = catalogProducts[index];
    const eyebrow = card.querySelector(".eyebrow");
    const title = card.querySelector("h3");
    const description = title?.nextElementSibling;
    const quoteButton = card.querySelector("[data-whatsapp-category]");
    if (product) {
      card.dataset.catalogPage = String(product.page);
      if (eyebrow) eyebrow.textContent = product.eyebrow;
      if (title) title.textContent = product.title;
      if (description instanceof HTMLElement) description.textContent = product.description;
      if (quoteButton) quoteButton.dataset.whatsappCategory = product.category;
    }

    const category = quoteButton?.dataset.whatsappCategory;
    const image = card.querySelector("img");
    if (product && image) {
      image.src = product.image;
      image.alt = product.alt;
    }
    card.querySelectorAll("p").forEach((paragraph) => {
      if (paragraph.textContent.trim().startsWith("Ejemplos:")) paragraph.remove();
    });
    const catalogUrl = `./public/assets/catalogo-energy-watt.pdf#page=${product?.page || 1}`;
    card.querySelectorAll('a[href*="catalogo-energy-watt.pdf"]').forEach((link) => {
      link.href = catalogUrl;
      link.textContent = `Ver ficha en catálogo 2026 · página ${product?.page || 1}`;
    });
    if (quoteButton && !card.querySelector('a[href*="catalogo-energy-watt.pdf"]')) {
      const catalogLink = document.createElement("a");
      catalogLink.href = catalogUrl;
      catalogLink.target = "_blank";
      catalogLink.rel = "noopener";
      catalogLink.className = "mt-auto pt-5 text-sm font-bold text-ew-navy underline decoration-ew-green underline-offset-4";
      catalogLink.textContent = `Ver ficha en catálogo 2026 · página ${product?.page || 1}`;
      quoteButton.before(catalogLink);
    }
    card.classList.add("relative");
    if (product && !card.querySelector(".catalog-page-badge")) {
      const pageBadge = document.createElement("span");
      pageBadge.className = "catalog-page-badge";
      pageBadge.textContent = `Catálogo · p. ${product.page}`;
      pageBadge.setAttribute("aria-hidden", "true");
      card.append(pageBadge);
    }
    card.classList.add("cursor-pointer", "focus-visible:outline-2", "focus-visible:outline-offset-4", "focus-visible:outline-ew-green");
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Ver ${product?.title || category || "producto"} en el catálogo 2026`);
    const openCatalog = () => window.open(catalogUrl, "_blank", "noopener,noreferrer");
    card.addEventListener("click", (event) => {
      if (event.target.closest("button, a")) return;
      openCatalog();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openCatalog();
    });
    card.querySelectorAll("[data-whatsapp-category] span").forEach((label) => {
      label.textContent = "Cotizar esta categoría";
    });
  });
}

function initPendingSocialLinks() {
  document.querySelectorAll('a[href="https://www.instagram.com/"], a[href="https://www.facebook.com/"], a[href="https://www.tiktok.com/"], a[href="https://www.linkedin.com/"]').forEach((link) => {
    link.setAttribute("href", "#contacto");
    link.removeAttribute("target");
    link.removeAttribute("rel");
    link.title = "Contactar con Energy Watt";
  });
}

function initCatalogLinks() {
  document.querySelectorAll('a.btn-secondary[href="./catalogo.html"]').forEach((link) => {
    link.href = "./index.html#productos";
  });
}

function initPdfViewer() {
  const frame = document.querySelector("[data-pdf-frame]");
  const gate = document.querySelector("[data-pdf-gate]");
  const loadButton = document.querySelector("[data-pdf-load]");
  if (!frame || !gate || !loadButton) return;

  loadButton.addEventListener("click", () => {
    frame.src = frame.dataset.pdfSrc || "";
    frame.hidden = false;
    gate.hidden = true;
  });
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const phone = form.querySelector("#telefono");
  const email = form.querySelector("#email");
  const status = form.querySelector("[data-form-status]");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const hasPhone = phone?.value.trim().length >= 8;
    const hasEmail = email?.value.trim() && email.checkValidity();
    if (!hasPhone && !hasEmail) {
      const message = "Indica al menos un medio de contacto: teléfono o correo electrónico.";
      phone?.setAttribute("aria-invalid", "true");
      email?.setAttribute("aria-invalid", "true");
      if (status) {
        status.dataset.state = "error";
        status.textContent = message;
      }
      return;
    }
    phone?.removeAttribute("aria-invalid");
    email?.removeAttribute("aria-invalid");
    if (status) {
      status.dataset.state = "validated";
      status.textContent = "Solicitud validada en el navegador. Falta conectar este formulario con el endpoint de recepción.";
    }
  });
}

function initRevealAnimations() {
  const revealNodes = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  revealNodes.forEach((node) => observer.observe(node));
}

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

mobileToggle?.addEventListener("click", () => {
  const isOpen = mobileToggle.getAttribute("aria-expanded") === "true";
  isOpen ? closeMobileMenu() : openMobileMenu();
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => closeMobileMenu());
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMobileMenu();
});

if (yearNode) yearNode.textContent = new Date().getFullYear();

initWhatsAppActions();
initProductCards();
initPendingSocialLinks();
initCatalogLinks();
initPdfViewer();
initContactForm();
initRevealAnimations();
