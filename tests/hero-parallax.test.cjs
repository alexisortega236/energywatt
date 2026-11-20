const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup({ hover = true, reduced = false } = {}) {
  const properties = {};
  const heroEvents = {};
  const windowEvents = {};
  const frames = [];
  let scheduled = 0;
  let stageTop = 100;
  function classList() {
    const set = new Set();
    return { add: (name) => set.add(name), contains: (name) => set.has(name), toggle(name, force) { const next = force ?? !set.has(name); next ? set.add(name) : set.delete(name); return next; } };
  }
  const control = { hidden: true, addEventListener(name, fn) { this[name] = fn; }, setAttribute() {} };
  const label = { textContent: '' };
  const hero = {
    classList: classList(), style: { setProperty: (name, value) => { properties[name] = value; } },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 900 }),
    addEventListener: (name, fn) => { heroEvents[name] = fn; }
  };
  const stage = {
    classList: classList(), closest: () => hero,
    querySelector: (selector) => selector === '[data-hero-motion]' ? control : label,
    getBoundingClientRect: () => ({ top: stageTop, bottom: stageTop + 600, height: 600 })
  };
  const context = {
    document: { documentElement: { classList: { add() {} } }, querySelector: (selector) => selector === '[data-hero-stage]' ? stage : null, querySelectorAll: () => [], addEventListener() {} },
    window: {
      innerHeight: 800,
      matchMedia: (query) => ({ matches: query.includes('reduced-motion') ? reduced : hover }),
      addEventListener: (name, fn) => { windowEvents[name] = fn; },
      requestAnimationFrame: (fn) => { frames.push(fn); return ++scheduled; }
    }, Date
  };
  vm.runInNewContext(fs.readFileSync('src/main.js', 'utf8'), context);
  return { properties, heroEvents, windowEvents, control, stage, hero, scheduled: () => scheduled, moveStage: (top) => { stageTop = top; }, flush() { while (frames.length) frames.shift()(); } };
}

test('scroll updates bounded depth and batches events into one animation frame', () => {
  const app = setup({ hover: false });
  app.flush();
  assert.equal(parseFloat(app.properties['--hero-scroll']), 0);
  const scheduled = app.scheduled();
  app.moveStage(-100);
  for (let i = 0; i < 10; i++) app.windowEvents.scroll();
  assert.equal(app.scheduled(), scheduled + 1);
  app.flush();
  assert.ok(parseFloat(app.properties['--hero-scroll']) > 0);
  assert.ok(parseFloat(app.properties['--hero-scroll']) <= 70);
});

test('mouse controls foreground tilt and leaving resets pointer displacement', () => {
  const app = setup();
  app.flush();
  app.heroEvents.pointermove({ pointerType: 'mouse', clientX: 1200, clientY: 900 });
  app.flush();
  assert.ok(parseFloat(app.properties['--hero-pointer-x']) > 0);
  assert.ok(parseFloat(app.properties['--hero-rotate-y']) <= 4);
  app.heroEvents.pointerleave();
  app.flush();
  assert.equal(parseFloat(app.properties['--hero-pointer-x']), 0);
  assert.equal(parseFloat(app.properties['--hero-pointer-y']), 0);
});

test('mobile uses scroll without reacting to touch pointer movement', () => {
  const app = setup({ hover: false });
  app.flush();
  const before = app.scheduled();
  app.heroEvents.pointermove({ pointerType: 'touch', clientX: 500, clientY: 500 });
  assert.equal(app.scheduled(), before);
  app.moveStage(-100);
  app.windowEvents.scroll();
  app.flush();
  assert.ok(parseFloat(app.properties['--hero-scroll']) > 0);
});

test('pause freezes parallax and both foreground and full-hero background', () => {
  const app = setup();
  app.flush();
  const before = JSON.stringify(app.properties);
  app.control.click();
  app.moveStage(-150);
  app.windowEvents.scroll();
  app.flush();
  assert.equal(JSON.stringify(app.properties), before);
  assert.ok(app.stage.classList.contains('is-paused'));
  assert.ok(app.hero.classList.contains('is-paused'));
  app.control.click();
  app.windowEvents.scroll();
  app.flush();
  assert.notEqual(JSON.stringify(app.properties), before);
});

test('reduced motion does not schedule parallax or expose the pause control', () => {
  const app = setup({ reduced: true });
  assert.equal(app.scheduled(), 0);
  assert.equal(app.control.hidden, true);
  assert.equal(app.heroEvents.pointermove, undefined);
});
