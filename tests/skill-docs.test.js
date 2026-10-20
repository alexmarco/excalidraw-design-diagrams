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

test('SKILL.md documents the generate, render and restyle commands', () => {
  const skill = readText(join(skillDirectory, 'SKILL.md'));

  assert.match(skill, /generate_sequence\.js/);
  assert.match(skill, /render_excalidraw\.js/);
  assert.match(skill, /restyle\.js/);
});

test('SKILL.md does not repeat the sequence checklist', () => {
  const skill = readText(join(skillDirectory, 'SKILL.md'));

  assert.doesNotMatch(skill, /^\s*- \[ \]/m);
});

test('no skill document points to the old color palette or Playwright flow', () => {
  const documents = [
    join(skillDirectory, 'SKILL.md'),
    ...readdirSync(join(skillDirectory, 'references'))
      .filter((name) => name.endsWith('.md') && name !== 'color-palette.md')
      .map((name) => join(skillDirectory, 'references', name)),
  ];

  for (const document of documents) {
    assert.doesNotMatch(readText(document), /color-palette|playwright/i, `${document} still points to the old flow`);
  }
});

test('the sequence guide describes the spec format', () => {
  const guide = readText(join(skillDirectory, 'references', 'sequence.md'));

  assert.match(guide, /^## Spec format$/m);
  for (const key of ['participants', 'sequence', 'from', 'to', 'self', 'activate', 'deactivate', 'frame', 'else', 'end']) {
    assert.match(guide, new RegExp(`\`${key}\``), `the spec format does not mention ${key}`);
  }
  assert.match(guide, /generate_sequence\.js/);
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
