import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CLI_PATH = fileURLToPath(new URL('../skills/excalidraw-diagram/scripts/validate.js', import.meta.url));

function diagramFile(elements) {
  const path = join(mkdtempSync(join(tmpdir(), 'validate-cli-')), 'diagram.excalidraw');
  writeFileSync(path, JSON.stringify({ type: 'excalidraw', version: 2, elements }));
  return path;
}

function runCli(path) {
  return spawnSync(process.execPath, [CLI_PATH, path], { encoding: 'utf8' });
}

const box = (id) => ({ id, type: 'rectangle', x: 0, y: 0, width: 10, height: 10, roughness: 0, customData: { role: 'primary' } });

test('a valid file exits with 0 and says so', () => {
  const result = runCli(diagramFile([box('a')]));

  assert.equal(result.status, 0);
  assert.match(result.stdout, /No problems found/);
});

test('an invalid file exits with 1 and lists each problem with its element id', () => {
  const result = runCli(diagramFile([box('a'), box('a')]));

  assert.equal(result.status, 1);
  assert.match(result.stdout, /a: duplicate id/);
});

test('a missing file argument prints the usage', () => {
  const result = spawnSync(process.execPath, [CLI_PATH], { encoding: 'utf8' });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: node validate\.js <file\.excalidraw>/);
});
