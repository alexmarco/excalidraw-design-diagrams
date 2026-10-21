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
  assert.match(readme, /validate\.js/);
  assert.doesNotMatch(readme, /generate_sequence/);
  assert.match(readme, /examples\/oauth-pkce/);
  assert.match(readme, /render_excalidraw\.js/);
  assert.match(readme, /restyle\.js/);
  assert.match(readme, /^## Install the skill manually$/m);
  assert.match(readme, /\.claude[\\/]skills/);
});

test('README.md documents the install with npx skills add and the first-run dependency step', () => {
  const readme = readRepoFile('README.md').replace(/\r\n/g, '\n');
  const installSection = readme.slice(readme.indexOf('## Install the skill'), readme.indexOf('## Install the skill manually'));

  assert.match(installSection, /npx skills add alexmarco\/excalidraw-design-diagrams --skill excalidraw-diagram/);
  assert.match(installSection, / -g\b/);
  assert.match(installSection, /--copy/);
  assert.match(installSection, /npm install --omit=dev/);
  assert.match(installSection, /npx skills update/);
});

test('the manual install copies the skill folder and installs its dependencies there', () => {
  const readme = readRepoFile('README.md').replace(/\r\n/g, '\n');
  const installSection = readme.slice(readme.indexOf('## Install the skill manually'), readme.indexOf('## Working rules'));

  assert.match(installSection, /npm install --omit=dev/);
  assert.doesNotMatch(installSection, /repository root/);
});

test('SKILL.md documents the first-run dependency install in one place', () => {
  const skill = readRepoFile('skills/excalidraw-diagram/SKILL.md');

  assert.match(skill, /npm install --omit=dev/);
});

test('AGENTS.md covers commands and working rules for agents', () => {
  const agents = readRepoFile('AGENTS.md');

  assert.match(agents, /npm test/);
  assert.match(agents, /test-first/i);
  assert.match(agents, /Conventional Commits/);
  assert.match(agents, /GitFlow/);
  assert.match(agents, /dependenc/i);
});
