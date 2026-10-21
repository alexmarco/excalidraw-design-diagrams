import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REQUIRED_ROLES, resolveDesign } from '../skills/excalidraw-diagram/scripts/resolve_design.js';

const skillDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'excalidraw-diagram');
const readText = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const design = resolveDesign();

test('the roles of data model diagrams are required and defined in the base design', () => {
  for (const role of ['table-row', 'key-badge', 'relationship']) {
    assert.ok(REQUIRED_ROLES.includes(role), `${role} is not required`);
    assert.ok(design.components[role], `${role} is not defined`);
  }
});

test('table rows are white, key badges stand out from them and relationships are solid structural lines', () => {
  assert.equal(design.components['table-row'].backgroundColor, '#ffffff');
  assert.equal(design.components['table-row'].strokeColor, design.components.structure.strokeColor);
  assert.equal(design.components['key-badge'].textColor, '#ffffff');
  assert.notEqual(design.components['key-badge'].backgroundColor, design.components['table-row'].backgroundColor);
  assert.equal(design.components.relationship.strokeColor, design.components.structure.strokeColor);
  assert.equal(design.components.relationship.strokeStyle ?? 'solid', 'solid');
});

test('SKILL.md lists the data model guide, which has its sections and checklists', () => {
  assert.match(readText(join(skillDirectory, 'SKILL.md')), /\]\(references\/data-model\.md\)/);

  const guide = readText(join(skillDirectory, 'references', 'data-model.md'));
  for (const heading of ['Workflow', 'Layout', 'Keys', 'Relationships', 'Communication checklist', 'Visual checklist']) {
    assert.match(guide, new RegExp(`^## ${heading}$`, 'm'), `missing the ${heading} section`);
  }
  assert.match(guide, /examples\/online-shop-data-model/);
  assert.match(guide, /validate\.js/);
  assert.match(guide, /cardinalit/i);
});
