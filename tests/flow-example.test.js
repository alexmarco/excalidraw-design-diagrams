import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDesign, resolveDesign } from '../skills/excalidraw-diagram/scripts/resolve_design.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const exampleDirectory = join(root, 'examples', 'ci-cd-pipeline');
const readText = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

test('the CI/CD example DESIGN.md defines only colors and the font family', () => {
  const override = parseDesign(readText(join(exampleDirectory, 'DESIGN.md')));
  const tokenKeys = Object.keys(override.tokens).filter((key) => !['version', 'name'].includes(key));

  assert.deepEqual(tokenKeys, ['colors']);
  assert.deepEqual(Object.keys(override.diagrams), ['fontFamily']);
});

test('the CI/CD example redefines every color name of the base design, so no role keeps a base color', () => {
  const baseColors = parseDesign(readText(join(root, 'skills', 'excalidraw-diagram', 'DESIGN.md'))).tokens.colors;
  const overrideColors = parseDesign(readText(join(exampleDirectory, 'DESIGN.md'))).tokens.colors;

  assert.deepEqual(Object.keys(overrideColors).sort(), Object.keys(baseColors).sort());
});

test('every other token of the CI/CD example resolves from the base design', () => {
  const base = resolveDesign();
  const design = resolveDesign({ projectDir: exampleDirectory });

  assert.notEqual(design.diagrams.fontFamily, base.diagrams.fontFamily);
  assert.deepEqual({ ...design.diagrams, fontFamily: undefined }, { ...base.diagrams, fontFamily: undefined });
  assert.deepEqual(Object.keys(design.components), Object.keys(base.components));
  for (const [role, component] of Object.entries(base.components)) {
    for (const token of ['strokeStyle', 'endArrowhead']) {
      assert.equal(design.components[role][token], component[token], `${role}.${token} differs from the base`);
    }
  }
});

test('start, end, decision and error stay distinguishable in the corporate palette', () => {
  const { components } = resolveDesign({ projectDir: exampleDirectory });
  const looks = ['start', 'end', 'decision', 'error'].map(
    (role) => `${components[role].backgroundColor}/${components[role].strokeColor}`,
  );

  assert.equal(new Set(looks).size, 4, looks.join(' '));
});

test('the CI/CD example folder holds the diagram and its renders', () => {
  for (const extension of ['excalidraw', 'png', 'svg']) {
    assert.ok(existsSync(join(exampleDirectory, `ci-cd-pipeline.${extension}`)), `missing .${extension}`);
  }
});

test('the example diagram uses the flow roles', () => {
  const document = JSON.parse(readText(join(exampleDirectory, 'ci-cd-pipeline.excalidraw')));
  const roles = new Set(document.elements.map((element) => element.customData.role));

  for (const role of ['start', 'end', 'decision', 'primary', 'error', 'error-return', 'message-sync']) {
    assert.ok(roles.has(role), `the example does not use ${role}`);
  }
});
