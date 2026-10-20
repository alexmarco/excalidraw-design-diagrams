import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CLI_PATH = fileURLToPath(new URL('../skill/scripts/generate_sequence.js', import.meta.url));
const FIXTURE_PATH = fileURLToPath(new URL('./fixtures/sequence/login.yaml', import.meta.url));
const loginYaml = readFileSync(FIXTURE_PATH, 'utf8');

function workspace() {
  return mkdtempSync(join(tmpdir(), 'sequence-cli-'));
}

function writeFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return path;
}

function runCli(args, cwd) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], { cwd, encoding: 'utf8' });
}

test('generates a .excalidraw file beside the spec', () => {
  const dir = workspace();
  const specPath = writeFile(join(dir, 'login.yaml'), loginYaml);

  const result = runCli([specPath], dir);

  assert.equal(result.status, 0, result.stderr);
  const generated = JSON.parse(readFileSync(join(dir, 'login.excalidraw'), 'utf8'));
  assert.equal(generated.type, 'excalidraw');
});

test('writes to the path given with --output', () => {
  const dir = workspace();
  const specPath = writeFile(join(dir, 'login.yaml'), loginYaml);
  const outputPath = join(dir, 'out', 'flow.excalidraw');

  const result = runCli([specPath, '--output', outputPath], dir);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(existsSync(outputPath));
});

test('uses the DESIGN.md of the working directory when no --design is given', () => {
  const dir = workspace();
  const specPath = writeFile(join(dir, 'login.yaml'), loginYaml);
  writeFile(join(dir, 'DESIGN.md'), '---\ncolors:\n  blue-500: "#111111"\n---\n');

  runCli([specPath], dir);

  const generated = JSON.parse(readFileSync(join(dir, 'login.excalidraw'), 'utf8'));
  const participantHeader = generated.elements.find((element) => element.id === 'participant-api');
  assert.equal(participantHeader.backgroundColor, '#111111');
});

test('an explicit --design path wins over the project DESIGN.md', () => {
  const dir = workspace();
  const specPath = writeFile(join(dir, 'login.yaml'), loginYaml);
  writeFile(join(dir, 'DESIGN.md'), '---\ncolors:\n  blue-500: "#111111"\n---\n');
  const designPath = writeFile(join(dir, 'custom.md'), '---\ncolors:\n  blue-500: "#222222"\n---\n');

  runCli([specPath, '--design', designPath], dir);

  const generated = JSON.parse(readFileSync(join(dir, 'login.excalidraw'), 'utf8'));
  assert.equal(generated.elements.find((element) => element.id === 'participant-api').backgroundColor, '#222222');
});

test('refuses to overwrite an existing .excalidraw because it is the source of truth', () => {
  const dir = workspace();
  const specPath = writeFile(join(dir, 'login.yaml'), loginYaml);
  const existingPath = writeFile(join(dir, 'login.excalidraw'), '{"edited": true}');

  const result = runCli([specPath], dir);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /login\.excalidraw already exists/);
  assert.equal(readFileSync(existingPath, 'utf8'), '{"edited": true}');
});

test('an invalid spec exits with an error that names the problem and writes nothing', () => {
  const dir = workspace();
  const specPath = writeFile(join(dir, 'broken.yaml'), loginYaml.replace('to: db', 'to: dbb'));

  const result = runCli([specPath], dir);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown participant "dbb" in step 6/);
  assert.equal(existsSync(join(dir, 'broken.excalidraw')), false);
});

test('running without a spec path exits with a usage message', () => {
  const result = runCli([], workspace());

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: node generate_sequence\.js <spec\.yaml>/);
});
