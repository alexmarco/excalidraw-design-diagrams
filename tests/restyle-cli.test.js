import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseSequenceSpec } from '../skill/scripts/sequence_spec.js';
import { buildSequenceDocument } from '../skill/scripts/sequence_excalidraw.js';
import { resolveDesign } from '../skill/scripts/resolve_design.js';

const CLI_PATH = fileURLToPath(new URL('../skill/scripts/restyle.js', import.meta.url));
const FIXTURE_PATH = fileURLToPath(new URL('./fixtures/sequence/login.yaml', import.meta.url));
const loginSpec = parseSequenceSpec(readFileSync(FIXTURE_PATH, 'utf8'));

function workspace() {
  return mkdtempSync(join(tmpdir(), 'restyle-cli-'));
}

function writeFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return path;
}

function runCli(args, cwd) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], { cwd, encoding: 'utf8' });
}

function generatedFile(dir) {
  const path = join(dir, 'login.excalidraw');
  writeFile(path, `${JSON.stringify(buildSequenceDocument(loginSpec, resolveDesign()), null, 2)}\n`);
  return path;
}

function participantFill(path, id) {
  return JSON.parse(readFileSync(path, 'utf8')).elements.find((element) => element.id === id).backgroundColor;
}

test('restyles the file in place with the DESIGN.md of the working directory', () => {
  const dir = workspace();
  const filePath = generatedFile(dir);
  writeFile(join(dir, 'DESIGN.md'), '---\ncomponents:\n  participant:\n    backgroundColor: "#111111"\n---\n');

  const result = runCli([filePath], dir);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(participantFill(filePath, 'participant-api'), '#111111');
});

test('uses the DESIGN.md beside the file, whatever the working directory', () => {
  const fileDir = workspace();
  const otherDir = workspace();
  const filePath = generatedFile(fileDir);
  writeFile(join(fileDir, 'DESIGN.md'), '---\ncomponents:\n  participant:\n    backgroundColor: "#111111"\n---\n');

  const result = runCli([filePath], otherDir);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(participantFill(filePath, 'participant-api'), '#111111');
});

test('an explicit --design path wins over the project DESIGN.md', () => {
  const dir = workspace();
  const filePath = generatedFile(dir);
  writeFile(join(dir, 'DESIGN.md'), '---\ncomponents:\n  participant:\n    backgroundColor: "#111111"\n---\n');
  const designPath = writeFile(join(dir, 'custom.md'), '---\ncomponents:\n  participant:\n    backgroundColor: "#222222"\n---\n');

  runCli([filePath, '--design', designPath], dir);

  assert.equal(participantFill(filePath, 'participant-api'), '#222222');
});

test('running restyle twice gives the same file', () => {
  const dir = workspace();
  const filePath = generatedFile(dir);
  writeFile(join(dir, 'DESIGN.md'), '---\ncomponents:\n  participant:\n    backgroundColor: "#111111"\n---\n');

  runCli([filePath], dir);
  const once = readFileSync(filePath, 'utf8');
  runCli([filePath], dir);

  assert.equal(readFileSync(filePath, 'utf8'), once);
});

test('reports how many elements were restyled and which ones were left without a role', () => {
  const dir = workspace();
  const filePath = generatedFile(dir);
  const document = JSON.parse(readFileSync(filePath, 'utf8'));
  document.elements.push({ id: 'hand-note', type: 'rectangle', x: 0, y: 0, width: 10, height: 10 });
  writeFile(filePath, JSON.stringify(document, null, 2));

  const result = runCli([filePath], dir);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Restyled \d+ elements/);
  assert.match(result.stdout, /Left unchanged.*hand-note/);
});

test('a missing file exits with an error and writes nothing', () => {
  const dir = workspace();

  const result = runCli([join(dir, 'missing.excalidraw')], dir);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Error: .*missing\.excalidraw/);
});

test('running without a file exits with a usage message', () => {
  const result = runCli([], workspace());

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: node restyle\.js <file\.excalidraw>/);
});
