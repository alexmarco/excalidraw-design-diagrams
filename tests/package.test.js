import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

test('package.json declares an ESM package requiring Node.js 22.18 or later', () => {
  assert.equal(packageJson.type, 'module');
  assert.equal(packageJson.engines.node, '>=22.18');
});

test('package.json test script runs node:test', () => {
  assert.equal(packageJson.scripts.test, 'node --test');
});

test('package.json pins the yaml dependency to an exact version', () => {
  assert.match(packageJson.dependencies.yaml, /^\d+\.\d+\.\d+$/);
});
