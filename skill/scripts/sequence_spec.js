import { parse } from 'yaml';

const FRAME_KINDS = ['alt', 'opt', 'loop'];
const MESSAGE_TYPES = ['sync', 'async', 'return'];
const PARTICIPANT_KINDS = ['participant', 'actor'];

// YAML reads values such as 401 or 2024 as numbers, but labels are always text.
function toText(value) {
  return value === undefined ? undefined : String(value);
}

function parseParticipant(entry) {
  return { id: entry.id, label: toText(entry.label ?? entry.id), kind: entry.kind ?? 'participant' };
}

function parseStep(entry, stepNumber) {
  if (entry === null || typeof entry !== 'object') {
    throw new Error(`Unrecognized step in step ${stepNumber}`);
  }
  if ('from' in entry) {
    return { type: 'message', messageType: entry.type ?? 'sync', from: entry.from, to: entry.to, text: toText(entry.text) };
  }
  if ('self' in entry) {
    return { type: 'self', messageType: entry.type ?? 'sync', participant: entry.self, text: toText(entry.text) };
  }
  if ('activate' in entry) {
    return { type: 'activate', participant: entry.activate };
  }
  if ('deactivate' in entry) {
    return { type: 'deactivate', participant: entry.deactivate };
  }
  if ('frame' in entry) {
    return { type: 'frame', frame: entry.frame, text: toText(entry.text) };
  }
  if ('else' in entry) {
    return { type: 'else', text: toText(entry.else) };
  }
  if ('end' in entry) {
    return { type: 'end', frame: entry.end };
  }
  throw new Error(`Unrecognized step in step ${stepNumber}`);
}

function validateParticipants(participants) {
  const participantIds = new Set();
  for (const { id, kind } of participants) {
    if (!PARTICIPANT_KINDS.includes(kind)) {
      throw new Error(`Unknown kind "${kind}" for participant "${id}"`);
    }
    if (participantIds.has(id)) {
      throw new Error(`Duplicate participant "${id}"`);
    }
    participantIds.add(id);
  }
  return participantIds;
}

function validateSpec({ participants, steps }) {
  const participantIds = validateParticipants(participants);
  const openFrames = [];
  const openActivations = new Map();

  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    const assertKnownParticipant = (id) => {
      if (!participantIds.has(id)) {
        throw new Error(`Unknown participant "${id}" in step ${stepNumber}`);
      }
    };

    if (step.type === 'message' || step.type === 'self') {
      if (!MESSAGE_TYPES.includes(step.messageType)) {
        throw new Error(`Unknown message type "${step.messageType}" in step ${stepNumber}`);
      }
      const participantsOfStep = step.type === 'message' ? [step.from, step.to] : [step.participant];
      participantsOfStep.forEach(assertKnownParticipant);
      openFrames.forEach((frame) => frame.messageCount++);
    }
    if (step.type === 'activate' || step.type === 'deactivate') {
      assertKnownParticipant(step.participant);
      const activations = openActivations.get(step.participant) ?? [];
      if (step.type === 'activate') {
        activations.push(stepNumber);
      } else if (activations.length === 0) {
        throw new Error(`Deactivation of "${step.participant}" in step ${stepNumber} has no open activation`);
      } else {
        activations.pop();
      }
      openActivations.set(step.participant, activations);
    }
    if (step.type === 'frame') {
      if (!FRAME_KINDS.includes(step.frame)) {
        throw new Error(`Unknown frame "${step.frame}" in step ${stepNumber}`);
      }
      openFrames.push({ frame: step.frame, stepNumber, messageCount: 0 });
    }
    if (step.type === 'else') {
      const innermostFrame = openFrames.at(-1);
      if (innermostFrame?.frame !== 'alt') {
        throw new Error(`"else" in step ${stepNumber} is only valid inside an alt frame`);
      }
    }
    if (step.type === 'end') {
      const innermostFrame = openFrames.at(-1);
      if (!innermostFrame) {
        throw new Error(`End of "${step.frame}" in step ${stepNumber} has no open frame`);
      }
      if (innermostFrame.frame !== step.frame) {
        throw new Error(
          `Frame "${innermostFrame.frame}" opened in step ${innermostFrame.stepNumber} is closed by "${step.frame}" in step ${stepNumber}`,
        );
      }
      if (innermostFrame.messageCount === 0) {
        throw new Error(`Frame "${innermostFrame.frame}" opened in step ${innermostFrame.stepNumber} has no messages`);
      }
      openFrames.pop();
    }
  });

  const unclosedFrame = openFrames.at(-1);
  if (unclosedFrame) {
    throw new Error(`Frame "${unclosedFrame.frame}" opened in step ${unclosedFrame.stepNumber} is never closed`);
  }
  for (const [participant, activations] of openActivations) {
    if (activations.length > 0) {
      const stepNumber = activations.at(-1);
      throw new Error(`Activation of "${participant}" in step ${stepNumber} is never closed`);
    }
  }
}

export function parseSequenceSpec(yamlText) {
  const document = parse(yamlText);
  if (!Array.isArray(document?.participants)) {
    throw new Error('The spec needs a "participants" list');
  }
  if (!Array.isArray(document.sequence)) {
    throw new Error('The spec needs a "sequence" list');
  }
  const spec = {
    participants: document.participants.map(parseParticipant),
    steps: document.sequence.map((entry, index) => parseStep(entry, index + 1)),
  };
  validateSpec(spec);
  return spec;
}
