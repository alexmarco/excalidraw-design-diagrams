import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillDirectory = join(root, 'skill');

// Normalizes line endings so the assertions hold for CRLF working copies on Windows.
const readText = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const lineCount = (text) => text.split('\n').filter((line) => line.trim() !== '').length;

function localLinks(markdown) {
  return [...markdown.matchAll(/\]\(([^)\s]+)\)/g)]
    .map((match) => match[1])
    .filter((target) => !/^(https?:|#|mailto:)/.test(target));
}

test('SKILL.md is a short index: frontmatter plus under 80 non-empty lines', () => {
  const skill = readText(join(skillDirectory, 'SKILL.md'));

  assert.match(skill, /^---\nname: excalidraw-diagram\ndescription: .+\n---\n/);
  assert.ok(lineCount(skill) < 80, `SKILL.md has ${lineCount(skill)} non-empty lines`);
});

test('SKILL.md links the sequence guide and every local link resolves', () => {
  const skill = readText(join(skillDirectory, 'SKILL.md'));

  assert.match(skill, /\]\(references\/sequence\.md\)/);
  for (const target of localLinks(skill)) {
    assert.ok(existsSync(join(skillDirectory, target)), `SKILL.md links to missing ${target}`);
  }
});

test('SKILL.md documents the restyle, validate and render commands and no generator', () => {
  const skill = readText(join(skillDirectory, 'SKILL.md'));

  assert.match(skill, /restyle\.js/);
  assert.match(skill, /validate\.js/);
  assert.match(skill, /render_excalidraw\.js/);
  assert.doesNotMatch(skill, /generate_sequence/);
});

test('SKILL.md does not repeat the sequence checklist', () => {
  const skill = readText(join(skillDirectory, 'SKILL.md'));

  assert.doesNotMatch(skill, /^\s*- \[ \]/m);
});

test('no skill document points to the old color palette or Playwright flow', () => {
  const documents = [
    join(skillDirectory, 'SKILL.md'),
    ...readdirSync(join(skillDirectory, 'references'))
      .filter((name) => name.endsWith('.md'))
      .map((name) => join(skillDirectory, 'references', name)),
  ];

  for (const document of documents) {
    assert.doesNotMatch(readText(document), /color-palette|playwright/i, `${document} still points to the old flow`);
  }
});

test('the sequence guide teaches drawing the file directly, with layout and frame rules', () => {
  const guide = readText(join(skillDirectory, 'references', 'sequence.md'));

  assert.match(guide, /^## Layout$/m);
  assert.match(guide, /^## Frames$/m);
  assert.match(guide, /validate\.js/);
  assert.match(guide, /padding/);
  assert.match(guide, /examples\/oauth-pkce/);
  assert.doesNotMatch(guide, /generate_sequence/);
});

test('every local link in the reference guides resolves inside the skill', () => {
  const referencesDirectory = join(skillDirectory, 'references');
  for (const name of readdirSync(referencesDirectory).filter((file) => file.endsWith('.md'))) {
    for (const target of localLinks(readText(join(referencesDirectory, name)))) {
      const resolved = join(referencesDirectory, target.replace(/#.*$/, ''));
      assert.ok(existsSync(resolved), `${name} links to missing ${target}`);
      assert.ok(resolved.startsWith(skillDirectory), `${name} links outside the skill: ${target}`);
    }
  }
});

test('the sequence guide has a communication checklist', () => {
  const guide = readText(join(skillDirectory, 'references', 'sequence.md'));
  const start = guide.search(/^## Communication checklist$/m);

  assert.notEqual(start, -1, 'missing the Communication checklist section');
  const items = guide.slice(start).split('\n').filter((line) => /^- \[ \]/.test(line)).join('\n');
  for (const topic of [/title/i, /number/i, /note/i, /zone/i, /error/i]) {
    assert.match(items, topic, `the communication checklist does not cover ${topic}`);
  }
});

test('the sequence guide has a visual checklist with the required items', () => {
  const guide = readText(join(skillDirectory, 'references', 'sequence.md'));
  const checklistStart = guide.search(/^## Visual checklist$/m);

  assert.notEqual(checklistStart, -1, 'missing the Visual checklist section');
  const items = guide
    .slice(checklistStart)
    .split('\n')
    .filter((line) => /^- \[ \]/.test(line));
  assert.ok(items.some((item) => /clipped/i.test(item)), 'missing the clipped text item');
  assert.ok(items.some((item) => /arrows? reach/i.test(item)), 'missing the arrows reach item');
  assert.ok(items.some((item) => /dashed/i.test(item) && /return/i.test(item)), 'missing the dashed returns item');
  assert.ok(items.some((item) => /lifelines? span/i.test(item)), 'missing the lifelines span item');
});

test('SKILL.md lists the architecture guide in its types table', () => {
  const skill = readText(join(skillDirectory, 'SKILL.md'));

  assert.match(skill, /\| Architecture \|.*\]\(references\/architecture\.md\)/);
});

test('the architecture guide covers layout, labels, bindings and both checklists', () => {
  const guide = readText(join(skillDirectory, 'references', 'architecture.md'));

  for (const heading of ['Workflow', 'Layout', 'Arrows', 'Communication checklist', 'Visual checklist']) {
    assert.match(guide, new RegExp(`^## ${heading}$`, 'm'), `missing the ${heading} section`);
  }
  assert.match(guide, /startBinding/);
  assert.match(guide, /protocol/i);
  assert.match(guide, /examples\/web-app-architecture/);
});
