import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveDesign } from '../skill/scripts/resolve_design.js';

const BASE_PATH = fileURLToPath(new URL('../skill/DESIGN.md', import.meta.url));
const baseMarkdown = readFileSync(BASE_PATH, 'utf8');

function writeFixture(markdown) {
  const path = join(mkdtempSync(join(tmpdir(), 'design-')), 'DESIGN.md');
  writeFileSync(path, markdown);
  return path;
}

test('a reference to a token that does not exist fails', () => {
  const basePath = writeFixture(baseMarkdown.replace('"{colors.navy}"', '"{colors.nvy}"'));

  assert.throws(() => resolveDesign({ basePath }), /colors\.nvy/);
});

test('a circular reference fails instead of recursing forever', () => {
  const basePath = writeFixture(baseMarkdown.replace('  white: "#ffffff"', '  white: "{colors.white}"'));

  assert.throws(() => resolveDesign({ basePath }), /circular/i);
});

test('a design without a required role fails', () => {
  const basePath = writeFixture(baseMarkdown.replace('\n  frame:\n', '\n  frame-old:\n'));

  assert.throws(() => resolveDesign({ basePath }), /frame/);
});
