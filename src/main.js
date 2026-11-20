document.documentElement.classList.add("js");

const whatsappNumber = "528715188606";
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

function initWhatsAppActions() {
  document.querySelectorAll("[data-whatsapp-action]").forEach((action) => {
    const category = action.dataset.whatsappCategory;
    const message = category
      ? `Hola, quiero información sobre ${category.toLowerCase()} de Energy Watt.`
      : "Hola, me gustaría hablar con un asesor de Energy Watt.";
    action.href = buildWhatsAppUrl(message);
    action.addEventListener("click", () => {
      trackEvent("whatsapp_click", { context: category || action.dataset.whatsappContext || "direct" });
    });
  });
  document.querySelectorAll('a[href^="tel:"]').forEach((action) => {
    action.addEventListener("click", () => trackEvent("call_click"));
  });
  document.querySelectorAll('a[href*="catalogo-energy-watt.pdf"]').forEach((action) => {
    action.addEventListener("click", () => trackEvent("catalog_click"));
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
  const name = form.elements.namedItem("nombre");
  const company = form.elements.namedItem("empresa");
  const service = form.elements.namedItem("servicio");
  const message = form.elements.namedItem("mensaje");
  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector('[type="submit"]');

  if (submit) submit.disabled = false;
  [name, message].forEach((field) => {
    field.addEventListener("input", () => field.setCustomValidity(""));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    name.setCustomValidity(name.value.trim().length >= 2 ? "" : "Escribe tu nombre (al menos 2 caracteres).");
    message.setCustomValidity(message.value.trim().length >= 5 ? "" : "Cuéntanos qué necesitas (al menos 5 caracteres).");
    if (!form.reportValidity()) return;

    const lines = [
      "Hola, me gustaría solicitar información a Energy Watt.",
      `Nombre: ${name.value.trim()}`,
      ...(company.value.trim() ? [`Empresa: ${company.value.trim()}`] : []),
      `Servicio de interés: ${service.value}`,
      "",
      message.value.trim()
    ];
    const url = buildWhatsAppUrl(lines.join("\n"));
    if (status) {
      status.dataset.state = "validated";
      status.textContent = "Mensaje preparado. Revisa el texto y pulsa Enviar dentro de WhatsApp para compartirlo con la tienda.";
    }
    // Count only the handoff; opening WhatsApp does not confirm a sent request.
    trackEvent("whatsapp_click", { context: "contact_form", service: service.value });
    window.location.assign(url);
  });
}

function initHeroAnimation() {
  const stage = document.querySelector("[data-hero-stage]");
  if (!stage || prefersReducedMotion) return;
  const control = stage.querySelector("[data-hero-motion]");
  const label = stage.querySelector("[data-hero-motion-label]");
  const replay = stage.querySelector("[data-hero-replay]");
  const start = () => {
    stage.classList.add("is-energized");
    if (control) control.hidden = false;
    if (replay) replay.hidden = false;
  };
  control?.addEventListener("click", () => {
    const paused = stage.classList.toggle("is-paused");
    const text = paused ? "Reanudar animación" : "Pausar animación";
    control.setAttribute("aria-pressed", String(paused));
    control.setAttribute("aria-label", text + " del logo");
    if (label) label.textContent = text;
  });
  replay?.addEventListener("click", () => {
    stage.classList.remove("is-energized", "is-paused");
    // Commit the reset before restarting the CSS sequence.
    void stage.offsetWidth;
    start();
    control?.setAttribute("aria-pressed", "false");
    control?.setAttribute("aria-label", "Pausar animación del logo");
    if (label) label.textContent = "Pausar animación";
  });
  if (!("IntersectionObserver" in window)) {
    start();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    start();
    observer.disconnect();
  }, { threshold: 0.25 });
  observer.observe(stage);
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
initPdfViewer();
initContactForm();
initHeroAnimation();
initRevealAnimations();
