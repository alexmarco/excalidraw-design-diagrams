import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const adrDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'adr');
const adrFile = readdirSync(adrDirectory).find((name) => name.startsWith('0001-'));
const adr = readFileSync(join(adrDirectory, adrFile ?? ''), 'utf8');

test('ADR 0001 exists', () => {
  assert.ok(adrFile, 'docs/adr/0001-*.md must exist');
});

test('ADR 0001 records the agreed design', () => {
  assert.match(adr, /source of truth/i);
  assert.match(adr, /first draft/i);
  assert.match(adr, /role/);
  assert.match(adr, /restyle/);
  assert.match(adr, /## Diagrams/);
  assert.match(adr, /YAML/);
  assert.match(adr, /explicit path[\s\S]*project[\s\S]*skill base/i);
});

test('ADR 0001 states the out-of-scope items', () => {
  assert.match(adr, /MCP server/);
  assert.match(adr, /bidirectional sync/i);
  assert.match(adr, /Mermaid/);
  assert.match(adr, /automatic layout/i);
});

// Returns the ADR content with CRLF normalized to LF, or an empty string when no file matches the prefix.
function readAdr(prefix) {
  const name = readdirSync(adrDirectory).find((candidate) => candidate.startsWith(prefix));
  return name ? readFileSync(join(adrDirectory, name), 'utf8').replace(/\r\n/g, '\n') : '';
}

const adr2 = readAdr('0002-');

test('ADR 0002 exists', () => {
  assert.ok(adr2, 'docs/adr/0002-*.md must exist');
});

test('ADR 0002 records whether excalidraw.com keeps the element role', () => {
  assert.match(adr2, /excalidraw\.com/);
  assert.match(adr2, /customData/);
  assert.match(adr2, /role/);
});

test('ADR 0002 separates what was verified from what was not', () => {
  assert.match(adr2, /verified/i);
  assert.match(adr2, /not verified/i);
});

test('ADR 0002 describes how to check the finding on a real file', () => {
  assert.match(adr2, /restyle/);
});

const adr3 = readAdr('0003-');

test('ADR 0003 records that agents draw sequence diagrams without a generator', () => {
  assert.ok(adr3, 'docs/adr/0003-*.md must exist');
  assert.match(adr3, /generator/i);
  assert.match(adr3, /validate/);
  assert.match(adr3, /ADR 0001/);
});

test('ADR 0001 points to the ADR that supersedes its first-draft decision', () => {
  assert.match(adr, /superseded by ADR 0003/i);
});

test('ADR 0002 checks a real file without the removed generator', () => {
  assert.doesNotMatch(adr2, /generate_sequence/);
});
