const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup({ reduced = false, observer = true } = {}) {
  const classes = new Set();
  const attributes = {};
  const listeners = {};
  const label = { textContent: 'Pausar animación' };
  const control = { hidden: true, addEventListener: (name, fn) => { listeners[name] = fn; }, setAttribute: (name, value) => { attributes[name] = value; } };
  const stage = {
    classList: { add: (name) => classes.add(name), toggle(name) { if (classes.has(name)) { classes.delete(name); return false; } classes.add(name); return true; } },
    querySelector: (selector) => selector === '[data-hero-motion]' ? control : label
  };
  let onIntersection;
  let disconnected = false;
  const context = {
    document: { documentElement: { classList: { add() {} } }, querySelector: (selector) => selector === '[data-hero-stage]' ? stage : null, querySelectorAll: () => [], addEventListener() {} },
    window: { matchMedia: () => ({ matches: reduced }), addEventListener() {} },
    Date
  };
  if (observer) {
    context.IntersectionObserver = class {
      constructor(fn) { this.callback = fn; }
      observe(element) { assert.equal(element, stage); onIntersection = this.callback; }
      disconnect() { disconnected = true; }
    };
    context.window.IntersectionObserver = context.IntersectionObserver;
  }
  vm.runInNewContext(fs.readFileSync('src/main.js', 'utf8'), context);
  return { classes, control, attributes, label, listeners, intersect(value) { onIntersection([{ isIntersecting: value }]); }, disconnected: () => disconnected };
}

test('starts only when the hero enters the viewport', () => {
  const app = setup();
  assert.equal(app.classes.has('is-energized'), false);
  app.intersect(false);
  assert.equal(app.classes.has('is-energized'), false);
  app.intersect(true);
  assert.equal(app.classes.has('is-energized'), true);
  assert.equal(app.control.hidden, false);
  assert.equal(app.disconnected(), true);
});

test('pause and resume expose the correct accessible state', () => {
  const app = setup();
  app.intersect(true);
  app.listeners.click();
  assert.equal(app.classes.has('is-paused'), true);
  assert.equal(app.attributes['aria-pressed'], 'true');
  assert.equal(app.label.textContent, 'Reanudar animación');
  app.listeners.click();
  assert.equal(app.classes.has('is-paused'), false);
  assert.equal(app.attributes['aria-pressed'], 'false');
  assert.equal(app.label.textContent, 'Pausar animación');
});

test('reduced motion leaves the static scene and hides the animation control', () => {
  const app = setup({ reduced: true });
  assert.equal(app.classes.has('is-energized'), false);
  assert.equal(app.control.hidden, true);
});

test('starts gracefully when IntersectionObserver is unavailable', () => {
  const app = setup({ observer: false });
  assert.equal(app.classes.has('is-energized'), true);
  assert.equal(app.control.hidden, false);
});
