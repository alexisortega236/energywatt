document.documentElement.classList.add("js");

const whatsappNumber = "528717240933";
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
initPdfViewer();
initContactForm();
initRevealAnimations();
