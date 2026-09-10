document.documentElement.classList.add("js");

const whatsappNumber = "2227539744";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const mobileToggle = document.querySelector("[data-mobile-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const yearNode = document.querySelector("[data-year]");
const form = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");

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

function getFieldError(field) {
  if (field.validity.valueMissing) return "Completa este campo.";
  if (field.validity.typeMismatch) return "Ingresa un formato válido.";
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

function buildWhatsAppMessage(formData) {
  const type = formData.get("tipo_cliente");
  const name = String(formData.get("nombre") || "").trim();
  const phone = String(formData.get("telefono") || "").trim();
  const message = String(formData.get("mensaje") || "").trim();
  const lines = ["Hola, me gustaría recibir información de Energy Watt.", "", `Nombre: ${name}`];

  if (type === "empresa") {
    const company = String(formData.get("empresa") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const projectType = String(formData.get("tipo_proyecto") || "").trim();
    lines.push(`Empresa: ${company}`, `Teléfono: ${phone}`);
    if (email) lines.push(`Correo: ${email}`);
    if (projectType) lines.push(`Tipo de proyecto: ${projectType}`);
  } else {
    lines.push(`Teléfono: ${phone}`);
  }

  if (message) lines.push("", "Necesito:", message);
  return lines.join("\n");
}

function updateClientFields(type) {
  const isCompany = type === "empresa";

  document.querySelectorAll("[data-client-option]").forEach((option) => {
    const input = option.querySelector('input[name="tipo_cliente"]');
    const isSelected = input?.checked;
    option.classList.toggle("is-selected", isSelected);
    option.classList.toggle("border-ew-green", isSelected);
    option.classList.toggle("bg-ew-green/5", isSelected);
  });

  document.querySelectorAll("[data-company-only]").forEach((container) => {
    container.classList.toggle("hidden", !isCompany);
    container.setAttribute("aria-hidden", String(!isCompany));
  });

  document.querySelectorAll("[data-company-field]").forEach((field) => {
    field.disabled = !isCompany;
    field.required = isCompany && field.dataset.requiredCompany === "true";
    if (!isCompany) setFieldError(field, "");
  });
}

async function submitContactRequest(payload) {
  const opened = openWhatsAppConversation(buildWhatsAppMessage(payload));
  return {
    opened,
    message: opened ? "Se abrió WhatsApp para continuar la conversación." : "No fue posible abrir WhatsApp. Intenta nuevamente más tarde."
  };
}

function initWhatsAppActions() {
  const hasWhatsApp = Boolean(whatsappNumber.replace(/\D/g, ""));
  const actions = document.querySelectorAll("[data-whatsapp-action]");

  actions.forEach((action) => {
    if (action.hasAttribute("data-whatsapp-floating")) action.classList.toggle("hidden", !hasWhatsApp);
    if (action instanceof HTMLButtonElement) {
      action.disabled = !hasWhatsApp;
      action.setAttribute("aria-disabled", String(!hasWhatsApp));
    }

    if (!hasWhatsApp || action.hasAttribute("data-whatsapp-floating") && action.matches("button[type=submit]")) return;
    action.addEventListener("click", () => {
      const message = action.dataset.whatsappContext === "products"
        ? "Hola, quiero información para cotizar productos de Energy Watt."
        : "Hola, me gustaría hablar con un asesor de Energy Watt.";
      openWhatsAppConversation(message);
    });
  });

  const floatingAction = document.querySelector("[data-whatsapp-floating]");
  const avoidTargets = document.querySelectorAll("#contacto, footer");
  if (!hasWhatsApp || !floatingAction || !avoidTargets.length || !("IntersectionObserver" in window)) return;

  const visibility = new Map();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => visibility.set(entry.target, entry.isIntersecting));
    floatingAction.classList.toggle("hidden", [...visibility.values()].some(Boolean));
  }, { threshold: 0.08 });

  avoidTargets.forEach((target) => observer.observe(target));
}

function initClientTypeSelector() {
  const clientTypeInputs = document.querySelectorAll('input[name="tipo_cliente"]');
  if (!clientTypeInputs.length) return;

  clientTypeInputs.forEach((input) => {
    input.addEventListener("change", () => updateClientFields(input.value));
  });

  const selectedType = document.querySelector('input[name="tipo_cliente"]:checked')?.value || "persona";
  updateClientFields(selectedType);
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
    if (formStatus) {
      formStatus.textContent = "";
      formStatus.removeAttribute("data-state");
    }

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
      if (formStatus) {
        formStatus.textContent = "No fue posible procesar la solicitud.";
        formStatus.dataset.state = "error";
      }
      return;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      if (formStatus) {
        formStatus.textContent = "Revisa los campos marcados antes de continuar.";
        formStatus.dataset.state = "error";
      }
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;
    submitButton.disabled = true;
    submitButton.textContent = "Preparando...";
    form.setAttribute("aria-busy", "true");

    try {
      const response = await submitContactRequest(new FormData(form));
      if (formStatus) {
        formStatus.textContent = response.message;
        formStatus.dataset.state = response.opened ? "success" : "error";
      }
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = "No fue posible procesar la solicitud. Intenta nuevamente.";
        formStatus.dataset.state = "error";
      }
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Quiero recibir asesoría";
      form.removeAttribute("aria-busy");
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
initClientTypeSelector();
initFormValidation();
initRevealAnimations();
