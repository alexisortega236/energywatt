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
  const categoryImages = {
    "Luminarias industriales y antiexplosivas": {
      src: "https://images.unsplash.com/photo-1771205868774-45ca5709680f?auto=format&fit=crop&w=1200&q=80",
      alt: "Luminaria industrial de techo con protección metálica"
    },
    "Generación solar industrial y habitacional": {
      src: "https://images.unsplash.com/photo-1786543001631-2f3d7414c841?auto=format&fit=crop&w=1200&q=80",
      alt: "Paneles solares instalados en un edificio"
    },
    "Aires acondicionados": {
      src: "https://images.unsplash.com/photo-1566917064245-1c6bff30dbf1?auto=format&fit=crop&w=1200&q=80",
      alt: "Unidad exterior de aire acondicionado instalada en un muro"
    }
  };

  document.querySelectorAll(".product-card").forEach((card) => {
    const category = card.querySelector("[data-whatsapp-category]")?.dataset.whatsappCategory;
    const image = card.querySelector("img");
    if (categoryImages[category] && image) {
      image.src = categoryImages[category].src;
      image.alt = categoryImages[category].alt;
    }
    card.querySelectorAll("p").forEach((paragraph) => {
      if (paragraph.textContent.trim().startsWith("Ejemplos:")) paragraph.remove();
    });
    const quoteButton = card.querySelector("[data-whatsapp-category]");
    if (quoteButton && !card.querySelector('a[href*="catalogo-energy-watt.pdf"]')) {
      const catalogLink = document.createElement("a");
      catalogLink.href = "./public/assets/catalogo-energy-watt.pdf";
      catalogLink.target = "_blank";
      catalogLink.rel = "noopener";
      catalogLink.className = "mt-auto pt-5 text-sm font-bold text-ew-navy underline decoration-ew-green underline-offset-4";
      catalogLink.textContent = "Ver ficha en catálogo PDF";
      quoteButton.before(catalogLink);
    }
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
    link.setAttribute("aria-label", `${link.getAttribute("aria-label")} (URL pendiente)`);
    link.title = "URL oficial pendiente de actualización";
  });
}

function initCatalogLinks() {
  document.querySelectorAll('a.btn-secondary[href="./catalogo.html"]').forEach((link) => {
    link.href = "./index.html#productos";
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
      status.dataset.state = "demo";
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
initContactForm();
initRevealAnimations();
