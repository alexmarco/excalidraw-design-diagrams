import { layoutSequence } from './sequence_layout.js';

const FONT_FAMILY = 3;
const TEXT_LINE_HEIGHT = 1.25;
const TEXT_ROLE_FALLBACK = 'text-on-light';

// FNV-1a hash, so seeds and nonces depend only on the element id and stay stable across runs.
function stableNumber(text) {
  let hash = 0x811c9dc5;
  for (const character of text) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function baseElement(id, type, geometry, role, design) {
  const component = design.components[role];
  return {
    id,
    type,
    ...geometry,
    angle: 0,
    strokeColor: component.strokeColor ?? component.textColor,
    backgroundColor: component.backgroundColor ?? 'transparent',
    fillStyle: design.diagrams.fillStyle,
    strokeWidth: design.diagrams.strokeWidth,
    strokeStyle: component.strokeStyle ?? design.diagrams.strokeStyle,
    roughness: design.diagrams.roughness,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: stableNumber(id),
    version: 1,
    versionNonce: stableNumber(`${id}:nonce`),
    isDeleted: false,
    boundElements: [],
    updated: 1,
    link: null,
    locked: false,
    customData: { role },
  };
}

function rectangle(id, role, bounds, design) {
  return baseElement(id, 'rectangle', bounds, role, design);
}

function linear(id, type, { x, y, width, height, points }, role, design, endArrowhead) {
  return {
    ...baseElement(id, type, { x, y, width, height }, role, design),
    points,
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead,
    elbowed: false,
  };
}

function textElement(id, label, role, design, { containerId = null, textAlign, verticalAlign }) {
  const component = design.components[role];
  const textColor = component.textColor ?? design.components[TEXT_ROLE_FALLBACK].textColor;
  return {
    ...baseElement(id, 'text', { x: label.x, y: label.y, width: label.width, height: label.height }, role, design),
    strokeColor: textColor,
    backgroundColor: 'transparent',
    text: label.text,
    originalText: label.text,
    fontSize: label.fontSize,
    fontFamily: FONT_FAMILY,
    textAlign,
    verticalAlign,
    containerId,
    lineHeight: TEXT_LINE_HEIGHT,
    autoResize: true,
  };
}

// Text bound to a container moves with it and is listed in the container's boundElements.
function boundText(container, id, label, role, design, alignment) {
  container.boundElements.push({ type: 'text', id });
  return textElement(id, label, role, design, { containerId: container.id, ...alignment });
}

function participantElements(participant, design) {
  const header = rectangle(`participant-${participant.id}`, participant.kind, participant.header, design);
  const label = boundText(header, `participant-${participant.id}-label`, participant.label, participant.kind, design, {
    textAlign: 'center',
    verticalAlign: 'middle',
  });
  return [header, label];
}

function frameElements(frame, design) {
  const idPrefix = `frame-${frame.stepNumber}`;
  const container = rectangle(idPrefix, 'frame', frame.bounds, design);
  const elements = [
    container,
    boundText(container, `${idPrefix}-label`, frame.label, 'frame', design, { textAlign: 'left', verticalAlign: 'top' }),
  ];
  frame.elseSections.forEach((section, index) => {
    const divider = { x: frame.bounds.x, y: section.y, width: frame.bounds.width, height: 0 };
    const sectionPrefix = `${idPrefix}-else-${index + 1}`;
    elements.push(linear(sectionPrefix, 'line', { ...divider, points: [[0, 0], [frame.bounds.width, 0]] }, 'frame', design, null));
    elements.push(textElement(`${sectionPrefix}-label`, section.label, 'frame', design, { textAlign: 'left', verticalAlign: 'top' }));
  });
  return elements;
}

function messageElements(message, design) {
  const role = `message-${message.messageType}`;
  const arrow = linear(
    `message-${message.stepNumber}`,
    'arrow',
    message.arrow,
    role,
    design,
    design.components[role].endArrowhead,
  );
  if (!message.label) {
    return [arrow];
  }
  const label = textElement(`message-${message.stepNumber}-label`, message.label, role, design, {
    textAlign: 'center',
    verticalAlign: 'bottom',
  });
  return [arrow, label];
}

export function buildSequenceDocument(spec, design) {
  const layout = layoutSequence(spec);
  const elements = [
    ...layout.frames.flatMap((frame) => frameElements(frame, design)),
    ...layout.lifelines.map((lifeline) =>
      linear(
        `lifeline-${lifeline.participantId}`,
        'line',
        { x: lifeline.x, y: lifeline.top, width: 0, height: lifeline.bottom - lifeline.top, points: [[0, 0], [0, lifeline.bottom - lifeline.top]] },
        'lifeline',
        design,
        null,
      ),
    ),
    ...layout.activations.map((activation) =>
      rectangle(
        activation.id,
        'activation',
        { x: activation.x, y: activation.top, width: activation.width, height: activation.bottom - activation.top },
        design,
      ),
    ),
    ...layout.messages.flatMap((message) => messageElements(message, design)),
    ...layout.participants.flatMap((participant) => participantElements(participant, design)),
  ];

  return {
    type: 'excalidraw',
    version: 2,
    source: 'https://excalidraw.com',
    elements,
    appState: { viewBackgroundColor: design.diagrams.viewBackgroundColor },
    files: {},
  };
}
