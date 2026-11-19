const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup(values = {}, valid = true) {
  const fields = Object.fromEntries(Object.entries({ nombre: 'Ana Pérez', empresa: '', servicio: 'Minisplits', mensaje: 'Quisiera una cotización.', ...values }).map(([key, value]) => [key, {
    value, error: '', listeners: {},
    setCustomValidity(message) { this.error = message; },
    addEventListener(name, fn) { this.listeners[name] = fn; }
  }]));
  const status = { dataset: {}, textContent: '' };
  const button = { disabled: true };
  const listeners = {};
  const events = [];
  const destinations = [];
  const form = {
    elements: { namedItem: (name) => fields[name] },
    querySelector: (selector) => selector === '[data-form-status]' ? status : button,
    addEventListener: (name, fn) => { listeners[name] = fn; },
    reportValidity: () => valid && !Object.values(fields).some((field) => field.error)
  };
  const context = {
    document: {
      documentElement: { classList: { add() {} } },
      querySelector: (selector) => selector === '[data-contact-form]' ? form : null,
      querySelectorAll: () => [],
      addEventListener() {}, dispatchEvent(event) { events.push(event.detail); }
    },
    window: { matchMedia: () => ({ matches: true }), addEventListener() {}, location: { assign(url) { destinations.push(url); } } },
    CustomEvent: class { constructor(name, options) { this.detail = options.detail; } },
    Date, encodeURIComponent
  };
  vm.runInNewContext(fs.readFileSync('src/main.js', 'utf8'), context);
  return { fields, status, button, events, destinations, submit() { let prevented = false; listeners.submit({ preventDefault() { prevented = true; } }); assert.ok(prevented); } };
}

test('prepares a message for the store, without requiring company, telephone or email', () => {
  const app = setup();
  assert.equal(app.button.disabled, false);
  app.submit();
  const url = new URL(app.destinations[0]);
  assert.equal(url.origin + url.pathname, 'https://wa.me/528715188606');
  const message = url.searchParams.get('text');
  assert.match(message, /Nombre: Ana Pérez/);
  assert.match(message, /Servicio de interés: Minisplits/);
  assert.match(message, /Quisiera una cotización\./);
  assert.doesNotMatch(message, /Empresa:/);
  assert.equal(app.fields.mensaje.value, 'Quisiera una cotización.');
  assert.match(app.status.textContent, /pulsa Enviar dentro de WhatsApp/);
  assert.doesNotMatch(app.status.textContent, /solicitud enviada/i);
});

test('encodes company names, accents, special characters and multiline messages', () => {
  const app = setup({ nombre: '  José Núñez  ', empresa: ' Luz & Energía + Norte ', mensaje: '¿Tienen cable #12?\nNecesito 20 m & conectores.' });
  app.submit();
  const message = new URL(app.destinations[0]).searchParams.get('text');
  assert.match(message, /Nombre: José Núñez\nEmpresa: Luz & Energía \+ Norte/);
  assert.ok(message.endsWith('¿Tienen cable #12?\nNecesito 20 m & conectores.'));
  assert.equal(app.events.length, 1);
  assert.equal(app.events[0].name, 'whatsapp_click');
  assert.equal(app.events[0].parameters.context, 'contact_form');
  assert.doesNotMatch(JSON.stringify(app.events), /José|Núñez|conectores|Luz &/);
});

test('does not navigate or track a handoff when native form validation fails', () => {
  const app = setup({ servicio: '' }, false);
  app.submit();
  assert.equal(app.destinations.length, 0);
  assert.equal(app.events.length, 0);
});

test('rejects whitespace-only names and messages and allows correction', () => {
  const app = setup({ nombre: '   ', mensaje: '     ' });
  app.submit();
  assert.equal(app.destinations.length, 0);
  assert.ok(app.fields.nombre.error);
  assert.ok(app.fields.mensaje.error);
  app.fields.nombre.value = 'Ana';
  app.fields.mensaje.value = 'Busco material eléctrico.';
  app.fields.nombre.listeners.input();
  app.fields.mensaje.listeners.input();
  app.submit();
  assert.equal(app.destinations.length, 1);
});
