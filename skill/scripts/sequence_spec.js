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

export function parseSequenceSpec(yamlText) {
  const document = parse(yamlText);
  return {
    participants: document.participants.map(parseParticipant),
    steps: document.sequence.map(parseStep),
  };
}
