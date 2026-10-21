import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveDesign } from '../skill/scripts/resolve_design.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const exampleDirectory = join(root, 'skill', 'examples', 'concept-rag');
const readText = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const diagram = () => JSON.parse(readText(join(exampleDirectory, 'concept-rag.excalidraw')));

test('the concept example brings a whiteboard design: handwritten font, strong roughness, round corners', () => {
  const { diagrams } = resolveDesign({ projectDir: exampleDirectory });

  assert.equal(diagrams.roughness, 2);
  assert.equal(diagrams.fontFamily, 1);
  assert.ok(diagrams.cornerRadius >= 24, `cornerRadius ${diagrams.cornerRadius} is not very round`);
});

test('the concept example draws the model steps with the ai role', () => {
  const aiBoxes = diagram().elements.filter((element) => element.customData?.role === 'ai');

  assert.ok(aiBoxes.length >= 2, 'expected the embedding and generation steps to use the ai role');
});

test('the concept example renders the handwritten font in the SVG and keeps the canvas background', () => {
  const svg = readText(join(exampleDirectory, 'concept-rag.svg'));
  const { diagrams } = resolveDesign({ projectDir: exampleDirectory });

  assert.match(svg, /font-family="Virgil/);
  assert.ok(existsSync(join(exampleDirectory, 'concept-rag.png')));
  assert.equal(diagram().appState.viewBackgroundColor, diagrams.viewBackgroundColor);
});

test('the concept guide is listed in SKILL.md and covers grouping, reading order, text size and the ai role', () => {
  const skill = readText(join(root, 'skill', 'SKILL.md'));
  const guide = readText(join(root, 'skill', 'references', 'concept.md'));

  assert.match(skill, /\]\(references\/concept\.md\)/);
  for (const heading of [/^## Layout$/m, /^## Communication checklist$/m, /^## Visual checklist$/m]) {
    assert.match(guide, heading);
  }
  for (const topic of [/group/i, /reading order/i, /words/i, /`ai`/, /examples\/concept-rag/]) {
    assert.match(guide, topic);
  }
});
