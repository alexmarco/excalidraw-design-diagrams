import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillDirectory = join(root, 'skill');
const examplesDirectory = join(skillDirectory, 'examples');
const NOT_GUIDES = ['README.md', 'element-templates.md', 'json-schema.md'];

const readText = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const guideNames = readdirSync(join(skillDirectory, 'references')).filter(
  (name) => name.endsWith('.md') && !NOT_GUIDES.includes(name),
);
const exampleNames = readdirSync(examplesDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

function typesTable() {
  const skill = readText(join(skillDirectory, 'SKILL.md'));
  const start = skill.search(/^\| Type \|/m);
  assert.notEqual(start, -1, 'SKILL.md has no types table');
  return skill.slice(start).split('\n\n')[0];
}

function galleryRow(readme, name) {
  return readme.split('\n').find((line) => line.startsWith('|') && line.includes(`(skill/examples/${name}/)`));
}

test('every guide in the references folder is linked from the SKILL.md types table', () => {
  const table = typesTable();

  for (const name of guideNames) {
    assert.ok(table.includes(`](references/${name})`), `the types table does not link ${name}`);
  }
});

test('every guide linked from the types table exists', () => {
  for (const [, target] of typesTable().matchAll(/\]\((references\/[^)]+)\)/g)) {
    assert.ok(existsSync(join(skillDirectory, target)), `the types table links to missing ${target}`);
  }
});

test('every example folder is listed in the examples index', () => {
  const index = readText(join(examplesDirectory, 'README.md'));

  for (const name of exampleNames) {
    assert.ok(index.includes(`[${name}](${name}/)`), `the examples index does not list ${name}`);
  }
});

test('every example folder is in the README gallery with its image, type and style', () => {
  const readme = readText(join(root, 'README.md'));
  const index = readText(join(examplesDirectory, 'README.md'));

  for (const name of exampleNames) {
    const row = galleryRow(readme, name);
    assert.ok(row, `the README gallery does not list ${name}`);
    assert.ok(row.includes(`skill/examples/${name}/${name}.png`), `${name}: the gallery row has no image`);
    const indexRow = index.split('\n').find((line) => line.includes(`[${name}](${name}/)`));
    const [type, style] = indexRow.split('|').slice(-3, -1).map((cell) => cell.trim());
    assert.ok(row.includes(type), `${name}: the gallery type differs from the index (${type})`);
    assert.ok(row.includes(style), `${name}: the gallery style differs from the index (${style})`);
  }
});

test('no guide makes opening its example mandatory', () => {
  for (const name of guideNames) {
    const guide = readText(join(skillDirectory, 'references', name));
    assert.doesNotMatch(guide, /open its PNG before drawing/i, `${name} mandates opening the example`);
  }
});

test('the README names the base style, the complete overrides and the partial override, with links', () => {
  const readme = readText(join(root, 'README.md'));

  for (const name of ['concept-rag', 'web-app-architecture']) {
    assert.match(readme, new RegExp(`complete override[^\\n]*\\(skill/examples/${name}/DESIGN\\.md\\)`, 'i'), name);
  }
  assert.match(readme, /partial override[^\n]*\(skill\/examples\/ci-cd-pipeline\/DESIGN\.md\)/i);
  assert.match(readme, /base style[^\n]*\(skill\/examples\/oauth-pkce\/\)/i);
});

test('SKILL.md makes the example optional, mentions --design in the steps and describes the merge', () => {
  const skill = readText(join(skillDirectory, 'SKILL.md'));
  const workflow = skill.slice(skill.search(/^## Workflow$/m), skill.search(/^## Diagram types$/m));

  assert.doesNotMatch(workflow, /Done when you have read the whole guide and opened its example/);
  assert.match(workflow, /example[^\n]*optional|optional[^\n]*example/i);
  assert.match(workflow, /--design/);
  assert.doesNotMatch(skill, /the first that exists/);
  assert.match(skill, /token by token/);
});
