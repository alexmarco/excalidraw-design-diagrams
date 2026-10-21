import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveDesign } from '../skill/scripts/resolve_design.js';
import { restyleDocument } from '../skill/scripts/restyle_excalidraw.js';

const FIXTURE_PATH = fileURLToPath(new URL('./fixtures/sequence/login.excalidraw', import.meta.url));
// Style the fixture with the current base design first, so the tests do not depend on past token values.
const generated = restyleDocument(JSON.parse(readFileSync(FIXTURE_PATH, 'utf8')), resolveDesign()).document;

function tempFile(content) {
  const path = join(mkdtempSync(join(tmpdir(), 'restyle-')), 'DESIGN.md');
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return path;
}

function designFrom(markdown) {
  return resolveDesign({ explicitPath: tempFile(markdown) });
}

test('restyling with the unchanged base design leaves a generated diagram as it is', () => {
  const { document } = restyleDocument(generated, resolveDesign());

  assert.deepEqual(document, generated);
});

test('changing one role color changes only the elements of that role', () => {
  const design = designFrom('---\ncomponents:\n  participant:\n    backgroundColor: "#111111"\n---\n');

  const { document } = restyleDocument(generated, design);

  const originalById = new Map(generated.elements.map((element) => [element.id, element]));
  const changedIds = document.elements
    .filter((element) => JSON.stringify(element) !== JSON.stringify(originalById.get(element.id)))
    .map((element) => element.id);
  const participantHeaders = generated.elements.filter(
    (element) => element.customData.role === 'participant' && element.type === 'rectangle',
  );
  assert.ok(participantHeaders.length > 0);
  assert.deepEqual(
    changedIds.sort(),
    participantHeaders.map((element) => element.id).sort(),
  );
  for (const element of document.elements) {
    if (changedIds.includes(element.id)) {
      assert.equal(element.backgroundColor, '#111111');
    }
  }
});

test('changing the arrowhead of a message role changes only the arrows of that role', () => {
  const design = designFrom('---\ncomponents:\n  message-sync:\n    endArrowhead: bar\n---\n');

  const { document } = restyleDocument(generated, design);

  for (const [original, restyled] of generated.elements.map((element, index) => [element, document.elements[index]])) {
    if (original.customData.role === 'message-sync' && original.type === 'arrow') {
      assert.equal(restyled.endArrowhead, 'bar', `${original.id} keeps the old arrowhead`);
    } else {
      assert.deepEqual(restyled, original);
    }
  }
});

test('elements without a known role are left as they are and reported', () => {
  const handDrawn = { id: 'hand-note', type: 'rectangle', x: 0, y: 0, width: 10, height: 10, strokeColor: '#000000' };
  const unknownRole = { ...handDrawn, id: 'mystery-note', customData: { role: 'mystery' } };
  const input = { ...generated, elements: [...generated.elements, handDrawn, unknownRole] };
  const design = designFrom('---\ncomponents:\n  participant:\n    backgroundColor: "#111111"\n---\n');

  const { document, unstyledIds } = restyleDocument(input, design);

  assert.deepEqual(unstyledIds, ['hand-note', 'mystery-note']);
  assert.deepEqual(document.elements.slice(-2), [handDrawn, unknownRole]);
});

test('restyling keeps geometry, text and bindings', () => {
  const design = designFrom(
    '---\ncomponents:\n  participant:\n    backgroundColor: "#111111"\n  message-sync:\n    endArrowhead: bar\n---\n',
  );
  const KEPT_FIELDS = [
    'id',
    'type',
    'x',
    'y',
    'width',
    'height',
    'points',
    'text',
    'originalText',
    'fontSize',
    'containerId',
    'boundElements',
    'startBinding',
    'endBinding',
    'groupIds',
    'frameId',
    'customData',
  ];

  const { document } = restyleDocument(generated, design);

  assert.equal(document.elements.length, generated.elements.length);
  document.elements.forEach((restyled, index) => {
    for (const field of KEPT_FIELDS) {
      assert.deepEqual(restyled[field], generated.elements[index][field], `${restyled.id} changed ${field}`);
    }
  });
});

test('text elements take the font family of the design and shapes do not', () => {
  const design = designFrom('---\n---\n\n## Diagrams\n\n```yaml\nfontFamily: 2\n```\n');

  const { document } = restyleDocument(generated, design);

  for (const element of document.elements) {
    if (element.type === 'text') {
      assert.equal(element.fontFamily, 2, `${element.id} kept its font`);
    } else {
      assert.equal(element.fontFamily, undefined, `${element.id} got a font`);
    }
  }
});

test('rounded shapes take the corner radius of the design and sharp shapes stay sharp', () => {
  const design = designFrom('---\n---\n\n## Diagrams\n\n```yaml\ncornerRadius: 6\n```\n');
  const shape = (id, roundness) => ({ id, type: 'rectangle', roundness, customData: { role: 'participant' } });
  const document = { elements: [shape('rounded', { type: 3 }), shape('sharp', null)] };

  const { document: restyled } = restyleDocument(document, design);

  assert.deepEqual(restyled.elements[0].roundness, { type: 3, value: 6 });
  assert.equal(restyled.elements[1].roundness, null);
});

test('a role that defines no color or stroke keeps the values the element already has', () => {
  const element = {
    id: 'note',
    type: 'rectangle',
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    strokeColor: '#abcdef',
    strokeStyle: 'dashed',
    strokeWidth: 3,
    fillStyle: 'hachure',
    roughness: 2,
    customData: { role: 'custom' },
  };
  const design = { components: { custom: { backgroundColor: '#111111' } }, diagrams: {} };

  const { document } = restyleDocument({ elements: [element] }, design);

  assert.deepEqual(document.elements[0], { ...element, backgroundColor: '#111111' });
});

test('restyling twice gives the same document', () => {
  const design = designFrom('---\ncomponents:\n  participant:\n    backgroundColor: "#111111"\n---\n');

  const once = restyleDocument(generated, design).document;
  const twice = restyleDocument(once, design).document;

  assert.deepEqual(twice, once);
});

test('a DESIGN.md saved with CRLF line endings restyles the same way', () => {
  const lfDesign = designFrom('---\ncomponents:\n  participant:\n    backgroundColor: "#111111"\n---\n');
  const crlfDesign = designFrom('---\r\ncomponents:\r\n  participant:\r\n    backgroundColor: "#111111"\r\n---\r\n');

  assert.deepEqual(restyleDocument(generated, crlfDesign), restyleDocument(generated, lfDesign));
});
