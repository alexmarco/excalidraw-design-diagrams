import { parse } from 'yaml';

function parseParticipant(entry) {
  return { id: entry.id, label: entry.label ?? entry.id, kind: entry.kind ?? 'participant' };
}

function parseStep(entry) {
  if ('from' in entry) {
    return { type: 'message', messageType: entry.type ?? 'sync', from: entry.from, to: entry.to, text: entry.text };
  }
  if ('self' in entry) {
    return { type: 'self', messageType: entry.type ?? 'sync', participant: entry.self, text: entry.text };
  }
  if ('activate' in entry) {
    return { type: 'activate', participant: entry.activate };
  }
  if ('deactivate' in entry) {
    return { type: 'deactivate', participant: entry.deactivate };
  }
  if ('frame' in entry) {
    return { type: 'frame', frame: entry.frame, text: entry.text };
  }
  if ('else' in entry) {
    return { type: 'else', text: entry.else };
  }
  return { type: 'end', frame: entry.end };
}

function validateSpec({ participants, steps }) {
  const participantIds = new Set(participants.map((participant) => participant.id));
  const openFrames = [];

  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    const assertKnownParticipant = (id) => {
      if (!participantIds.has(id)) {
        throw new Error(`Unknown participant "${id}" in step ${stepNumber}`);
      }
    };

    if (step.type === 'message') {
      assertKnownParticipant(step.from);
      assertKnownParticipant(step.to);
    }
    if (step.type === 'frame') {
      openFrames.push({ frame: step.frame, stepNumber });
    }
    if (step.type === 'end') {
      openFrames.pop();
    }
  });

  const unclosedFrame = openFrames.at(-1);
  if (unclosedFrame) {
    throw new Error(`Frame "${unclosedFrame.frame}" opened in step ${unclosedFrame.stepNumber} is never closed`);
  }
}

export function parseSequenceSpec(yamlText) {
  const document = parse(yamlText);
  const spec = {
    participants: document.participants.map(parseParticipant),
    steps: document.sequence.map(parseStep),
  };
  validateSpec(spec);
  return spec;
}
