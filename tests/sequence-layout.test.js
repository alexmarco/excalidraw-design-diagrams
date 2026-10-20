import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseSequenceSpec } from '../skill/scripts/sequence_spec.js';
import { layoutSequence } from '../skill/scripts/sequence_layout.js';

const FIXTURE_PATH = fileURLToPath(new URL('./fixtures/sequence/login.yaml', import.meta.url));
const layout = layoutSequence(parseSequenceSpec(readFileSync(FIXTURE_PATH, 'utf8')));

function contains(outer, inner) {
  return (
    inner.x >= outer.x &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y >= outer.y &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

test('every lifeline reaches below the last message', () => {
  const lastMessageY = Math.max(...layout.messages.map((message) => message.y));

  for (const lifeline of layout.lifelines) {
    assert.ok(lifeline.bottom > lastMessageY, `${lifeline.participantId} stops above the last message`);
  }
});

test('each frame wraps exactly the messages it covers', () => {
  const alt = layout.frames.find((frame) => frame.kind === 'alt');
  const loop = layout.frames.find((frame) => frame.kind === 'loop');
  const messagesIn = (frame) =>
    layout.messages.filter((message) => contains(frame.bounds, message.bounds)).map((message) => message.stepNumber);

  assert.deepEqual(messagesIn(alt), [5, 6, 7, 9]);
  assert.deepEqual(messagesIn(loop), [12]);
  assert.ok(alt.elseSections.length === 1, 'the alt frame has one else section');
});

test('a message outside a frame is not inside its bounds', () => {
  const alt = layout.frames.find((frame) => frame.kind === 'alt');
  const outsideMessage = layout.messages.find((message) => message.stepNumber === 2);

  assert.equal(contains(alt.bounds, outsideMessage.bounds), false);
});

const WIDE_LABEL = 'Authenticate the user with the identity provider';

function layoutWithMessage(sequence) {
  const text = JSON.stringify({
    participants: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C' },
    ],
    sequence,
  });
  return layoutSequence(parseSequenceSpec(text));
}

test('a wide message label stays between the lifelines of the participants it connects', () => {
  const layout = layoutWithMessage([{ from: 'a', to: 'b', text: WIDE_LABEL }]);
  const lifelineX = new Map(layout.lifelines.map((lifeline) => [lifeline.participantId, lifeline.x]));
  const { label } = layout.messages[0];

  assert.ok(label.x > lifelineX.get('a'), 'label crosses the lifeline of a');
  assert.ok(label.x + label.width < lifelineX.get('b'), 'label crosses the lifeline of b');
});

test('a multi-line label is as wide as its longest line and as tall as its lines', () => {
  const single = layoutWithMessage([{ from: 'a', to: 'b', text: 'Longer line here' }]).messages[0].label;
  const multi = layoutWithMessage([{ from: 'a', to: 'b', text: 'Short\nLonger line here' }]).messages[0].label;

  assert.equal(multi.width, single.width);
  assert.equal(multi.height, 2 * single.height);
});

test('a label is measured in code points, so an emoji counts as one character', () => {
  const ascii = layoutWithMessage([{ from: 'a', to: 'b', text: 'abcd' }]).messages[0].label;
  const emoji = layoutWithMessage([{ from: 'a', to: 'b', text: '😀😀😀😀' }]).messages[0].label;

  assert.equal(emoji.width, ascii.width);
});

test('a wide message label spanning two columns stays between the lifelines it connects', () => {
  const layout = layoutWithMessage([{ from: 'a', to: 'c', text: WIDE_LABEL }]);
  const lifelineX = new Map(layout.lifelines.map((lifeline) => [lifeline.participantId, lifeline.x]));
  const { label } = layout.messages[0];

  assert.ok(label.x > lifelineX.get('a'), 'label crosses the lifeline of a');
  assert.ok(label.x + label.width < lifelineX.get('c'), 'label crosses the lifeline of c');
});
