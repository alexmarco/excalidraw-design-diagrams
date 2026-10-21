import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolveDesign } from '../skill/scripts/resolve_design.js';
import { validateDocument } from '../skill/scripts/validate_excalidraw.js';

const design = resolveDesign();
const PADDING = design.diagrams.padding;

function shape(id, role, x, y, width, height, extra = {}) {
  return { id, type: 'rectangle', x, y, width, height, roughness: 0, customData: { role }, ...extra };
}

function text(id, role, x, y, width, height, extra = {}) {
  return { id, type: 'text', x, y, width, height, fontFamily: 5, roughness: 0, customData: { role }, ...extra };
}

function line(id, role, x, y, dx, dy) {
  return { id, type: 'line', x, y, width: Math.abs(dx), height: Math.abs(dy), points: [[0, 0], [dx, dy]], roughness: 0, customData: { role } };
}

function problemsOf(elements) {
  return validateDocument({ type: 'excalidraw', elements }, design);
}

function messages(elements) {
  return problemsOf(elements).map(({ id, message }) => `${id}: ${message}`);
}

test('a clean document has no problems', () => {
  assert.deepEqual(problemsOf([shape('box', 'primary', 0, 0, 100, 50)]), []);
});

test('the real example fixture has no structural problems', () => {
  const fixture = JSON.parse(readFileSync(fileURLToPath(new URL('./fixtures/sequence/login.excalidraw', import.meta.url)), 'utf8'));

  const structural = validateDocument(fixture, design).filter(({ kind }) => kind === 'structure');

  assert.deepEqual(structural, []);
});

test('duplicate ids are reported', () => {
  assert.match(messages([shape('a', 'primary', 0, 0, 10, 10), shape('a', 'primary', 50, 0, 10, 10)]).join('\n'), /a: duplicate id/);
});

test('references to missing elements are reported', () => {
  const found = messages([
    text('label', 'text-on-light', 0, 0, 10, 10, { containerId: 'ghost' }),
    shape('box', 'primary', 50, 50, 10, 10, { boundElements: [{ type: 'text', id: 'missing' }] }),
    { id: 'link', type: 'arrow', x: 0, y: 100, width: 10, height: 0, points: [[0, 0], [10, 0]], roughness: 0, customData: { role: 'message-sync' }, startBinding: { elementId: 'nowhere' } },
  ]).join('\n');

  assert.match(found, /label: containerId points to missing element ghost/);
  assert.match(found, /box: boundElements points to missing element missing/);
  assert.match(found, /link: startBinding points to missing element nowhere/);
});

test('elements without a role of the design are reported', () => {
  const found = messages([
    shape('no-role', undefined, 0, 0, 10, 10),
    shape('unknown', 'banana', 50, 0, 10, 10),
  ]).join('\n');

  assert.match(found, /no-role: has no role/);
  assert.match(found, /unknown: role banana is not in the design/);
});

test('roughness and font family must be values Excalidraw offers', () => {
  const found = messages([
    shape('rough', 'primary', 0, 0, 10, 10, { roughness: 0.5 }),
    text('font', 'title', 50, 0, 10, 10, { fontFamily: 4 }),
  ]).join('\n');

  assert.match(found, /rough: roughness 0.5 is not 0, 1 or 2/);
  assert.match(found, /font: fontFamily 4 is not an Excalidraw font/);
});

test('text over an activation bar is reported', () => {
  assert.match(
    messages([shape('bar', 'activation', 100, 0, 14, 200), text('label', 'text-on-light', 60, 50, 80, 20)]).join('\n'),
    /label: overlaps activation bar/,
  );
});

test('text crossing the edge of a frame is reported, text inside it is not', () => {
  const frame = shape('alt', 'frame', 100, 100, 300, 200);

  assert.match(messages([frame, text('across', 'text-on-light', 80, 150, 60, 20)]).join('\n'), /across: crosses the edge of frame alt/);
  assert.equal(messages([frame, text('inside', 'text-on-light', 100 + PADDING, 150, 60, 20)]).length, 0);
});

test('overlapping texts are reported', () => {
  assert.match(
    messages([text('first', 'body', 0, 0, 100, 20), text('second', 'body', 50, 10, 100, 20)]).join('\n'),
    /second: overlaps text first/,
  );
});

test('a lifeline through text is reported unless a label background covers the text', () => {
  const lifeline = line('life', 'lifeline', 100, 0, 0, 300);
  const label = text('label', 'text-on-light', 60, 100, 80, 20);

  assert.match(messages([lifeline, label]).join('\n'), /label: a lifeline crosses it without a label background/);
  assert.equal(messages([lifeline, shape('label-bg', 'label-background', 56, 98, 88, 24), label]).length, 0);
});

test('content closer than the padding to the edge of its zone is reported', () => {
  const zone = shape('device', 'zone', 0, 0, 400, 300);
  const found = messages([zone, shape('user', 'actor', 4, 60, 100, 50)]).join('\n');

  assert.match(found, new RegExp(`user: closer than ${PADDING}px to the edge of zone device`));
  assert.equal(messages([zone, shape('user', 'actor', PADDING, 60, 100, 50)]).length, 0);
});

test('the frame tag and frame texts may sit in the frame corner', () => {
  const frame = shape('alt', 'frame', 100, 100, 300, 200);

  assert.deepEqual(
    messages([frame, shape('alt-tag', 'frame-tag', 100, 100, 56, 26), text('alt-tag-text', 'frame-tag', 110, 103, 30, 20)]),
    [],
  );
});
