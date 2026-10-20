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

const participants = [
  { id: 'user', label: 'User', kind: 'actor' },
  { id: 'api', label: 'API' },
];

function specText(sequence) {
  return JSON.stringify({ participants, sequence });
}

test('a message to an unknown participant fails and names it', () => {
  const text = specText([{ from: 'user', to: 'usr', text: 'Hi' }]);

  assert.throws(() => parseSequenceSpec(text), /unknown participant "usr".*step 1/i);
});

test('a frame that is never closed fails and names the frame', () => {
  const text = specText([{ frame: 'alt', text: 'ok' }, { from: 'user', to: 'api', text: 'Hi' }]);

  assert.throws(() => parseSequenceSpec(text), /frame "alt".*step 1.*never closed/i);
});
