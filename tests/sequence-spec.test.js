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

const message = { from: 'user', to: 'api', text: 'Hi' };

test('a self message, activation or deactivation of an unknown participant fails and names it', () => {
  assert.throws(() => parseSequenceSpec(specText([{ self: 'apii', text: 'x' }])), /unknown participant "apii" in step 1/i);
  assert.throws(() => parseSequenceSpec(specText([{ activate: 'apii' }])), /unknown participant "apii" in step 1/i);
  assert.throws(
    () => parseSequenceSpec(specText([message, { activate: 'api' }, { deactivate: 'apii' }])),
    /unknown participant "apii" in step 3/i,
  );
});

test('an unknown message type fails and names it', () => {
  const text = specText([{ from: 'user', to: 'api', text: 'Hi', type: 'asynch' }]);

  assert.throws(() => parseSequenceSpec(text), /unknown message type "asynch" in step 1/i);
});

test('a duplicate participant id fails and names it', () => {
  const text = JSON.stringify({ participants: [...participants, { id: 'api' }], sequence: [message] });

  assert.throws(() => parseSequenceSpec(text), /duplicate participant "api"/i);
});

test('an unknown frame kind fails and names it', () => {
  assert.throws(() => parseSequenceSpec(specText([{ frame: 'par' }, message, { end: 'par' }])), /unknown frame "par" in step 1/i);
});

test('an else outside an alt frame fails and names the step', () => {
  const text = specText([{ frame: 'loop' }, message, { else: 'other' }, message, { end: 'loop' }]);

  assert.throws(() => parseSequenceSpec(text), /"else" in step 3.*alt/i);
});

test('an end that does not match the innermost open frame fails and names both steps', () => {
  const text = specText([{ frame: 'alt' }, message, { end: 'loop' }]);

  assert.throws(() => parseSequenceSpec(text), /"alt".*step 1.*"loop".*step 3/i);
});

test('an end without an open frame fails and names the step', () => {
  assert.throws(() => parseSequenceSpec(specText([message, { end: 'alt' }])), /"alt" in step 2 has no open frame/i);
});

test('a frame without messages fails and names it', () => {
  assert.throws(() => parseSequenceSpec(specText([{ frame: 'opt' }, { end: 'opt' }])), /"opt".*step 1.*no messages/i);
});

test('a deactivation without an activation fails and names the step', () => {
  assert.throws(() => parseSequenceSpec(specText([message, { deactivate: 'api' }])), /"api" in step 2.*no open activation/i);
});

test('an activation that is never closed fails and names the step', () => {
  assert.throws(
    () => parseSequenceSpec(specText([message, { activate: 'api' }, message])),
    /activation of "api" in step 2 is never closed/i,
  );
});
