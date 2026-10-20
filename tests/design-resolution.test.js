import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveDesign } from '../skill/scripts/resolve_design.js';

const BASE_PATH = fileURLToPath(new URL('../skill/DESIGN.md', import.meta.url));
const baseMarkdown = readFileSync(BASE_PATH, 'utf8');
const baseDesign = resolveDesign({ basePath: BASE_PATH });

function writeFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return path;
}

function tempDirectory() {
  return mkdtempSync(join(tmpdir(), 'design-'));
}

function colorsOnlyDesign(colors) {
  return ['---', 'colors:', ...Object.entries(colors).map(([name, value]) => `  ${name}: "${value}"`), '---', ''].join('\n');
}

test('a reference to a token that does not exist fails', () => {
  const basePath = writeFile(join(tempDirectory(), 'DESIGN.md'), baseMarkdown.replace('"{colors.navy}"', '"{colors.nvy}"'));

  assert.throws(() => resolveDesign({ basePath }), /colors\.nvy/);
});

test('a circular reference fails instead of recursing forever', () => {
  const basePath = writeFile(
    join(tempDirectory(), 'DESIGN.md'),
    baseMarkdown.replace('  white: "#ffffff"', '  white: "{colors.white}"'),
  );

  assert.throws(() => resolveDesign({ basePath }), /circular/i);
});

test('a design without a required role fails', () => {
  const basePath = writeFile(join(tempDirectory(), 'DESIGN.md'), baseMarkdown.replace('\n  frame:\n', '\n  frame-old:\n'));

  assert.throws(() => resolveDesign({ basePath }), /frame/);
});

test('an explicit design path wins over the project file', () => {
  const projectDir = tempDirectory();
  writeFile(join(projectDir, 'DESIGN.md'), colorsOnlyDesign({ 'blue-500': '#111111' }));
  const explicitPath = writeFile(join(tempDirectory(), 'custom.md'), colorsOnlyDesign({ 'blue-500': '#000000' }));

  const design = resolveDesign({ explicitPath, projectDir });

  assert.equal(design.components.primary.backgroundColor, '#000000');
});

test('the project file wins over the base design', () => {
  const projectDir = tempDirectory();
  writeFile(join(projectDir, 'DESIGN.md'), colorsOnlyDesign({ 'blue-500': '#111111' }));

  const design = resolveDesign({ projectDir });

  assert.equal(design.components.primary.backgroundColor, '#111111');
});

test('a project file in docs/ is used when the project root has none', () => {
  const projectDir = tempDirectory();
  writeFile(join(projectDir, 'docs', 'DESIGN.md'), colorsOnlyDesign({ 'blue-500': '#222222' }));

  const design = resolveDesign({ projectDir });

  assert.equal(design.components.primary.backgroundColor, '#222222');
});

test('the project file at the root wins over the one in docs/', () => {
  const projectDir = tempDirectory();
  writeFile(join(projectDir, 'DESIGN.md'), colorsOnlyDesign({ 'blue-500': '#111111' }));
  writeFile(join(projectDir, 'docs', 'DESIGN.md'), colorsOnlyDesign({ 'blue-500': '#222222' }));

  const design = resolveDesign({ projectDir });

  assert.equal(design.components.primary.backgroundColor, '#111111');
});

test('a project file that defines only colors inherits roles and diagram tokens from the base', () => {
  const projectDir = tempDirectory();
  writeFile(join(projectDir, 'DESIGN.md'), colorsOnlyDesign({ 'blue-500': '#111111' }));

  const design = resolveDesign({ projectDir });

  assert.equal(design.components.start.backgroundColor, baseDesign.components.start.backgroundColor);
  assert.deepEqual(design.components.frame, baseDesign.components.frame);
  assert.deepEqual(design.diagrams, baseDesign.diagrams);
});

test('a project file without a Diagrams block resolves', () => {
  const projectDir = tempDirectory();
  writeFile(join(projectDir, 'DESIGN.md'), colorsOnlyDesign({ 'blue-500': '#111111' }));

  assert.doesNotThrow(() => resolveDesign({ projectDir }));
});

test('a project Diagrams block overrides only the tokens it defines', () => {
  const projectDir = tempDirectory();
  writeFile(
    join(projectDir, 'DESIGN.md'),
    ['# Project', '', '## Diagrams', '', '```yaml', 'roughness: 1', '```', ''].join('\n'),
  );

  const design = resolveDesign({ projectDir });

  assert.equal(design.diagrams.roughness, 1);
  assert.equal(design.diagrams.strokeWidth, baseDesign.diagrams.strokeWidth);
});

test('an explicit design path that does not exist fails', () => {
  const explicitPath = join(tempDirectory(), 'missing.md');

  assert.throws(() => resolveDesign({ explicitPath }), /missing\.md/);
});
