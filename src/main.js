const siteConfig = {
  phone: "Ej. +52 000 000 0000",
  email: "Ej. ventas@energywatt.mx",
  address: "Ej. Calle, numero, colonia, ciudad, estado",
  hours: "Ej. Lunes a viernes, 9:00 a.m. - 6:00 p.m.",
  whatsappNumber: "5210000000000",
  whatsappMessage: "Hola ENERGY WATT Mexico, quiero solicitar una cotizacion.",
  social: {
    linkedin: "#",
    facebook: "#",
    instagram: "#"
  }
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const mobileToggle = document.querySelector("[data-mobile-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const yearNode = document.querySelector("[data-year]");
const form = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const whatsappLink = document.querySelector("[data-whatsapp]");

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

function closeMobileMenu() {
  mobileMenu?.classList.add("hidden");
  mobileToggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("overflow-hidden");
}

function openMobileMenu() {
  mobileMenu?.classList.remove("hidden");
  mobileToggle?.setAttribute("aria-expanded", "true");
  document.body.classList.add("overflow-hidden");
}

function getFieldError(field) {
  if (field.validity.valueMissing) return "Completa este campo.";
  if (field.validity.typeMismatch) return "Ingresa un formato valido.";
  if (field.validity.patternMismatch) return "Revisa el formato solicitado.";
  if (field.validity.tooShort) return `Ingresa al menos ${field.minLength} caracteres.`;
  return "";
}

function setFieldError(field, message) {
  const errorNode = document.getElementById(`${field.id}-error`);
  if (!errorNode) return;
  errorNode.textContent = message;
  field.setAttribute("aria-invalid", message ? "true" : "false");
}

async function submitContactRequest(payload) {
  /*
    Conecta aqui un proveedor real:
    - Formspree: fetch("https://formspree.io/f/ID", { method: "POST", body: payload })
    - Web3Forms: agrega access_key y envia a https://api.web3forms.com/submit
    - EmailJS: llama su SDK desde este punto si el cliente lo autoriza
    - Endpoint propio: fetch("/api/contacto", { method: "POST", body: payload })
  */
  return {
    demo: true,
    message: "Modo demostracion: la solicitud fue validada, pero aun no se envio porque falta conectar un endpoint real."
  };
}

function initFormValidation() {
  if (!form) return;

  form.addEventListener("input", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return;
    if (!field.willValidate) return;
    setFieldError(field, field.validity.valid ? "" : getFieldError(field));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "";

    const fields = Array.from(form.querySelectorAll("input, textarea, select"));
    const honeypot = form.querySelector('input[name="website"]');
    let firstInvalid = null;

    fields.forEach((field) => {
      if (!field.willValidate) return;
      const message = field.validity.valid ? "" : getFieldError(field);
      setFieldError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });

    if (honeypot?.value) {
      formStatus.textContent = "No fue posible procesar la solicitud.";
      return;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      formStatus.textContent = "Revisa los campos marcados antes de continuar.";
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Validando...";

    const response = await submitContactRequest(new FormData(form));
    formStatus.textContent = response.message;
    submitButton.disabled = false;
    submitButton.textContent = "Enviar solicitud";
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

if (whatsappLink) {
  whatsappLink.href = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;
}

document.querySelectorAll("[data-config]").forEach((node) => {
  const key = node.getAttribute("data-config");
  if (key && siteConfig[key]) node.textContent = siteConfig[key];
});

initFormValidation();
initRevealAnimations();
