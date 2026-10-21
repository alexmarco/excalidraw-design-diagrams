import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skillDirectory = join(root, 'skills', 'excalidraw-diagram');
const readText = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

test('json-schema.md documents the image element and the files map', () => {
  const schema = readText(join(skillDirectory, 'references', 'json-schema.md'));

  assert.match(schema, /^- `image`/m);
  assert.match(schema, /^## Images and files$/m);
  for (const field of ['fileId', 'dataURL', 'mimeType', 'status']) {
    assert.match(schema, new RegExp(field), `json-schema.md does not mention ${field}`);
  }
});

test('SKILL.md links the icons guide, which exists', () => {
  const skill = readText(join(skillDirectory, 'SKILL.md'));

  assert.match(skill, /\]\(references\/icons\.md\)/);
  assert.ok(existsSync(join(skillDirectory, 'references', 'icons.md')));
});

test('the icons guide covers when to use icons, fetching, embedding, colors, licences and both checklists', () => {
  const guide = readText(join(skillDirectory, 'references', 'icons.md'));

  for (const heading of ['When to use icons', 'Workflow', 'Placement', 'Licences', 'Communication checklist', 'Visual checklist']) {
    assert.match(guide, new RegExp(`^## ${heading}$`, 'm'), `missing the ${heading} section`);
  }
  for (const topic of [/fetch_icons\.js/, /embedIcon/, /EXCALIDRAW_ICON_CACHE/, /currentColor/, /ISC/, /CC0/, /unmodified/i, /never mandatory|optional/i, /examples\/web-app-icons/]) {
    assert.match(guide, topic, `the icons guide does not cover ${topic}`);
  }
});
