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
