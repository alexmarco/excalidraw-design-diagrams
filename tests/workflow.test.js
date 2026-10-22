import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readRepoFile = (relativePath) => readFileSync(join(root, relativePath), 'utf8');

test('GitHub Actions tests pull requests and pushes to main and develop', () => {
  const workflow = readRepoFile('.github/workflows/ci.yml');

  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /push:/);
  assert.match(workflow, /branches:\s*\[main, develop\]/);
  assert.match(workflow, /node-version:\s*22\.18/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm test/);
});

test('README describes the automated pull request checks', () => {
  const readme = readRepoFile('README.md');

  assert.match(readme, /GitHub Actions/);
  assert.match(readme, /npm test/);
  assert.match(readme, /branch protection must require the `test` job/i);
});

test('AGENTS.md points to README for shared contribution policies', () => {
  const agents = readRepoFile('AGENTS.md');

  assert.match(agents, /README\.md/);
  assert.match(agents, /working rules|contribution policies/i);
});

test('README explains when guide changes require an agent-drawn diagram check', () => {
  const readme = readRepoFile('README.md');

  assert.match(readme, /changing a diagram guide/i);
  assert.match(readme, /draw.*diagram/i);
  assert.match(readme, /checklist/i);
});
