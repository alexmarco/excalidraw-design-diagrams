import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readRepoFile = (relativePath) => readFileSync(join(root, relativePath), 'utf8');

test('README.md covers purpose, commands and working rules', () => {
  const readme = readRepoFile('README.md');

  assert.match(readme, /npm test/);
  assert.match(readme, /test-first/i);
  assert.match(readme, /Conventional Commits/);
  assert.match(readme, /GitFlow/);
  assert.match(readme, /dependenc/i);
});

test('README.md documents usage and the manual skill install', () => {
  const readme = readRepoFile('README.md').replace(/\r\n/g, '\n');

  assert.match(readme, /^## Usage$/m);
  assert.match(readme, /generate_sequence\.js/);
  assert.match(readme, /render_excalidraw\.js/);
  assert.match(readme, /restyle\.js/);
  assert.match(readme, /^## Install the skill manually$/m);
  assert.match(readme, /\.claude[\\/]skills/);
});

test('the manual install runs npm install at the repository root and warns that copying skill/ alone fails', () => {
  const readme = readRepoFile('README.md').replace(/\r\n/g, '\n');
  const installSection = readme.slice(readme.indexOf('## Install the skill manually'), readme.indexOf('## Working rules'));

  assert.match(installSection, /npm install` at the repository root/);
  assert.match(installSection, /copying `skill\/` alone does not work/);
});

test('AGENTS.md covers commands and working rules for agents', () => {
  const agents = readRepoFile('AGENTS.md');

  assert.match(agents, /npm test/);
  assert.match(agents, /test-first/i);
  assert.match(agents, /Conventional Commits/);
  assert.match(agents, /GitFlow/);
  assert.match(agents, /dependenc/i);
});
