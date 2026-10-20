import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSequenceSpec } from '../skill/scripts/sequence_spec.js';
import { buildSequenceDocument } from '../skill/scripts/sequence_excalidraw.js';
import { REQUIRED_ROLES, resolveDesign } from '../skill/scripts/resolve_design.js';

const FIXTURE_PATH = fileURLToPath(new URL('./fixtures/sequence/login.yaml', import.meta.url));
const loginSpec = parseSequenceSpec(readFileSync(FIXTURE_PATH, 'utf8'));
const design = resolveDesign();
const document = buildSequenceDocument(loginSpec, design);
const elements = document.elements;
const elementsById = new Map(elements.map((element) => [element.id, element]));

const COMMON_FIELDS = [
  'id',
  'type',
  'x',
  'y',
  'width',
  'height',
  'angle',
  'strokeColor',
  'backgroundColor',
  'fillStyle',
  'strokeWidth',
  'strokeStyle',
  'roughness',
  'opacity',
  'seed',
  'version',
  'versionNonce',
  'isDeleted',
  'groupIds',
  'boundElements',
  'link',
  'locked',
  'roundness',
  'frameId',
  'customData',
];
const TEXT_FIELDS = ['text', 'originalText', 'fontSize', 'fontFamily', 'textAlign', 'verticalAlign', 'containerId'];
const LINEAR_FIELDS = ['points', 'startBinding', 'endBinding', 'startArrowhead', 'endArrowhead'];

function contains(container, inner) {
  return (
    inner.x >= container.x &&
    inner.x + inner.width <= container.x + container.width &&
    inner.y >= container.y &&
    inner.y + inner.height <= container.y + container.height
  );
}

function withRole(role, list = elements) {
  return list.filter((element) => element.customData?.role === role);
}

function arrowsWithRole(role) {
  return withRole(role).filter((element) => element.type === 'arrow');
}

function tempFile(content) {
  const path = join(mkdtempSync(join(tmpdir(), 'sequence-')), 'DESIGN.md');
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return path;
}

test('the document is an Excalidraw file with unique element ids', () => {
  assert.equal(document.type, 'excalidraw');
  assert.equal(document.version, 2);
  assert.equal(new Set(elements.map((element) => element.id)).size, elements.length);
});

test('every element carries the fields Excalidraw needs to open the file', () => {
  for (const element of elements) {
    const requiredFields = [
      ...COMMON_FIELDS,
      ...(element.type === 'text' ? TEXT_FIELDS : []),
      ...(element.type === 'arrow' || element.type === 'line' ? LINEAR_FIELDS : []),
    ];
    for (const field of requiredFields) {
      assert.ok(field in element, `${element.id} is missing ${field}`);
    }
  }
});

test('every binding points to an existing element and is reciprocal', () => {
  for (const element of elements) {
    if (element.type === 'text' && element.containerId) {
      const container = elementsById.get(element.containerId);
      assert.ok(container, `${element.id} is bound to missing ${element.containerId}`);
      assert.ok(
        container.boundElements.some((bound) => bound.type === 'text' && bound.id === element.id),
        `${container.id} does not list ${element.id}`,
      );
    }
    for (const binding of [element.startBinding, element.endBinding]) {
      if (binding) {
        assert.ok(elementsById.has(binding.elementId), `${element.id} binds to missing ${binding.elementId}`);
      }
    }
  }
});

test('every text sits inside the container it is bound to', () => {
  const boundTexts = elements.filter((element) => element.type === 'text' && element.containerId);

  assert.ok(boundTexts.length > 0);
  for (const text of boundTexts) {
    assert.ok(contains(elementsById.get(text.containerId), text), `${text.id} overflows its container`);
  }
});

test('every element has a role that the design defines', () => {
  for (const element of elements) {
    const role = element.customData?.role;
    assert.ok(REQUIRED_ROLES.includes(role), `${element.id} has no design role (${role})`);
  }
});

test('return messages are dashed and every other message is solid', () => {
  const returns = arrowsWithRole('message-return');
  const others = [...arrowsWithRole('message-sync'), ...arrowsWithRole('message-async')];

  assert.equal(returns.length, 3);
  assert.ok(returns.every((arrow) => arrow.strokeStyle === 'dashed'));
  assert.ok(others.every((arrow) => arrow.strokeStyle === 'solid'));
});

test('synchronous and asynchronous messages take their arrowheads from the design', () => {
  assert.ok(arrowsWithRole('message-sync').every((arrow) => arrow.endArrowhead === design.components['message-sync'].endArrowhead));
  assert.ok(arrowsWithRole('message-async').every((arrow) => arrow.endArrowhead === design.components['message-async'].endArrowhead));
});

test('lifelines reach below the last message', () => {
  const messageArrows = [...arrowsWithRole('message-sync'), ...arrowsWithRole('message-async'), ...arrowsWithRole('message-return')];
  const lastMessageY = Math.max(...messageArrows.map((arrow) => arrow.y));

  for (const lifeline of withRole('lifeline')) {
    assert.ok(lifeline.y + lifeline.height > lastMessageY, `${lifeline.id} stops above the last message`);
  }
});

test('the same spec and design always produce the same document', () => {
  assert.deepEqual(buildSequenceDocument(loginSpec, resolveDesign()), document);
});

test('changing a token in DESIGN.md changes the generated colors', () => {
  const explicitPath = tempFile('---\ncolors:\n  blue-500: "#111111"\n---\n');
  const restyled = buildSequenceDocument(loginSpec, resolveDesign({ explicitPath }));

  const participantFills = withRole('participant', restyled.elements)
    .filter((element) => element.type === 'rectangle')
    .map((element) => element.backgroundColor);
  assert.ok(participantFills.length > 0);
  assert.deepEqual([...new Set(participantFills)], ['#111111']);
  assert.notDeepEqual(restyled.elements, document.elements);
});
