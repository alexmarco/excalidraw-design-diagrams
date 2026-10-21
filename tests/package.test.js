import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillRoot = join(root, 'skills', 'excalidraw-diagram');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const skillPackageJson = JSON.parse(readFileSync(join(skillRoot, 'package.json'), 'utf8'));

test('package.json declares an ESM package requiring Node.js 22.18 or later', () => {
  assert.equal(packageJson.type, 'module');
  assert.equal(packageJson.engines.node, '>=22.18');
});

test('package.json test script runs node:test', () => {
  assert.equal(packageJson.scripts.test, 'node --test');
});

test('the skill package declares the runtime dependencies at exact versions', () => {
  assert.equal(skillPackageJson.private, true);
  assert.equal(skillPackageJson.type, 'module');
  assert.equal(skillPackageJson.engines.node, '>=22.18');
  assert.deepEqual(skillPackageJson.dependencies, { '@excalidraw/utils': '0.1.7', esbuild: '0.28.2', yaml: '2.9.1' });
});

test('the repository root takes the skill dependencies through a workspace instead of repeating them', () => {
  assert.deepEqual(packageJson.workspaces, ['skills/excalidraw-diagram']);
  assert.equal(packageJson.dependencies, undefined);
});

test('no package in the repository depends on Playwright', () => {
  const manifests = [join(root, 'package.json'), join(skillRoot, 'package.json')].filter(existsSync);
  for (const manifestPath of manifests) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const declared = { ...manifest.dependencies, ...manifest.devDependencies };
    assert.equal(declared.playwright, undefined, `${manifestPath} must not depend on playwright`);
  }
});
