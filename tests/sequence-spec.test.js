import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseSequenceSpec } from '../skill/scripts/sequence_spec.js';

const FIXTURE_PATH = fileURLToPath(new URL('./fixtures/sequence/login.yaml', import.meta.url));
const loginSpec = readFileSync(FIXTURE_PATH, 'utf8');

test('parses participants with their kind, defaulting to participant', () => {
  const spec = parseSequenceSpec(loginSpec);

  assert.deepEqual(
    spec.participants.map(({ id, kind }) => [id, kind]),
    [
      ['user', 'actor'],
      ['web', 'participant'],
      ['api', 'participant'],
      ['db', 'participant'],
    ],
  );
});

test('parses synchronous, asynchronous, return and self messages', () => {
  const spec = parseSequenceSpec(loginSpec);

  const messageKinds = spec.steps.filter((step) => step.messageType).map((step) => step.messageType);

  assert.deepEqual(messageKinds, ['sync', 'async', 'sync', 'sync', 'return', 'return', 'sync', 'return']);
  assert.equal(spec.steps.find((step) => step.type === 'self').participant, 'api');
});
