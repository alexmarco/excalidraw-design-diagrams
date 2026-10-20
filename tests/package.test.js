import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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

test('renderer dependencies are pinned to the approved exact versions', () => {
  assert.equal(packageJson.dependencies['@excalidraw/utils'], '0.1.7');
  assert.equal(packageJson.dependencies.esbuild, '0.28.2');
});

test('no package in the repository depends on Playwright', () => {
  const manifests = [join(root, 'package.json'), join(root, 'skill', 'references', 'package.json')].filter(existsSync);
  for (const manifestPath of manifests) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const declared = { ...manifest.dependencies, ...manifest.devDependencies };
    assert.equal(declared.playwright, undefined, `${manifestPath} must not depend on playwright`);
  }
});

test('package.json pins the yaml dependency to an exact version', () => {
  assert.match(packageJson.dependencies.yaml, /^\d+\.\d+\.\d+$/);
});
