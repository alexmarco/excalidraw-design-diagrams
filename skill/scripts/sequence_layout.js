const MARGIN = 40;
const MIN_COLUMN_PITCH = 200;
const COLUMN_PADDING = 80;
const HEADER_HEIGHT = 60;
const HEADER_INSET = 20;
const ROW_HEIGHT = 60;
const SECTION_HEIGHT = 60;
const LABEL_GAP = 4;
const FRAME_PADDING = 20;
const FRAME_LABEL_INSET = 8;
const SELF_MESSAGE_WIDTH = 40;
const SELF_MESSAGE_HEIGHT = 30;
const SELF_LABEL_OFFSET = SELF_MESSAGE_WIDTH + LABEL_GAP * 2;
const ACTIVATION_WIDTH = 12;
const ACTIVATION_DEPTH_OFFSET = 6;
const FONT_SIZES = { participant: 18, message: 16, frame: 16 };
const TEXT_WIDTH_RATIO = 0.6;
const TEXT_LINE_RATIO = 1.25;

// Width is the longest line in code points; height is one line box per line.
function textSize(text, fontSize) {
  const lines = text.split(/\r?\n/);
  const longestLineLength = Math.max(...lines.map((line) => [...line].length));
  return {
    width: Math.ceil(longestLineLength * fontSize * TEXT_WIDTH_RATIO),
    height: lines.length * Math.ceil(fontSize * TEXT_LINE_RATIO),
  };
}

function textLabel(text, fontSize, x, y) {
  return { text, fontSize, x, y, ...textSize(text, fontSize) };
}

function centeredLabel(text, fontSize, centerX, centerY) {
  const size = textSize(text, fontSize);
  return textLabel(text, fontSize, centerX - size.width / 2, centerY - size.height / 2);
}

function unite(boxes) {
  const left = Math.min(...boxes.map((box) => box.x));
  const top = Math.min(...boxes.map((box) => box.y));
  const right = Math.max(...boxes.map((box) => box.x + box.width));
  const bottom = Math.max(...boxes.map((box) => box.y + box.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function frameLabelText(frame) {
  return frame.text ? `${frame.frame} [${frame.text}]` : frame.frame;
}

function layoutMessage(step, columns, cursorY) {
  if (step.type === 'self') {
    const x = columns.get(step.participant);
    const arrow = {
      x,
      y: cursorY,
      width: SELF_MESSAGE_WIDTH,
      height: SELF_MESSAGE_HEIGHT,
      points: [
        [0, 0],
        [SELF_MESSAGE_WIDTH, 0],
        [SELF_MESSAGE_WIDTH, SELF_MESSAGE_HEIGHT],
        [0, SELF_MESSAGE_HEIGHT],
      ],
    };
    const label = step.text
      ? textLabel(
          step.text,
          FONT_SIZES.message,
          x + SELF_MESSAGE_WIDTH + LABEL_GAP * 2,
          cursorY + SELF_MESSAGE_HEIGHT / 2 - textSize(step.text, FONT_SIZES.message).height / 2,
        )
      : null;
    return { arrow, label, bounds: unite([arrow, label ?? arrow]) };
  }

  const fromX = columns.get(step.from);
  const toX = columns.get(step.to);
  const arrow = {
    x: fromX,
    y: cursorY,
    width: Math.abs(toX - fromX),
    height: 0,
    points: [
      [0, 0],
      [toX - fromX, 0],
    ],
  };
  const label = step.text
    ? centeredLabel(step.text, FONT_SIZES.message, (fromX + toX) / 2, cursorY - LABEL_GAP - textSize(step.text, FONT_SIZES.message).height / 2)
    : null;
  return { arrow, label, bounds: unite([{ x: Math.min(fromX, toX), y: cursorY, width: arrow.width, height: 0 }, label ?? arrow]) };
}

function closeFrame(frame, bottom) {
  const left = frame.left - FRAME_PADDING;
  const sectionTexts = [frameLabelText(frame), ...frame.elseSections.map((section) => `[${section.text}]`)];
  const widestText = Math.max(...sectionTexts.map((text) => textSize(text, FONT_SIZES.frame).width));
  const right = Math.max(frame.right + FRAME_PADDING, left + FRAME_LABEL_INSET * 2 + widestText);
  return {
    stepNumber: frame.stepNumber,
    kind: frame.frame,
    bounds: { x: left, y: frame.top, width: right - left, height: bottom - frame.top },
    label: textLabel(frameLabelText(frame), FONT_SIZES.frame, left + FRAME_LABEL_INSET, frame.top + LABEL_GAP),
    elseSections: frame.elseSections.map((section) => ({
      y: section.y,
      label: textLabel(`[${section.text}]`, FONT_SIZES.frame, left + FRAME_LABEL_INSET, section.y + LABEL_GAP),
    })),
  };
}

// Columns are evenly spaced, so the pitch must fit the widest message label once spread over the columns it crosses.
function labelPitch(step, columnIndexes) {
  if (!step.text) {
    return 0;
  }
  const labelWidth = textSize(step.text, FONT_SIZES.message).width;
  if (step.type === 'self') {
    return labelWidth + SELF_LABEL_OFFSET + COLUMN_PADDING;
  }
  if (step.type === 'message') {
    const gaps = Math.abs(columnIndexes.get(step.to) - columnIndexes.get(step.from));
    return Math.ceil((labelWidth + COLUMN_PADDING) / gaps);
  }
  return 0;
}

export function layoutSequence({ participants, steps }) {
  const widestLabel = Math.max(...participants.map((participant) => textSize(participant.label, FONT_SIZES.participant).width));
  const columnIndexes = new Map(participants.map((participant, index) => [participant.id, index]));
  const columnPitch = Math.max(MIN_COLUMN_PITCH, widestLabel + COLUMN_PADDING, ...steps.map((step) => labelPitch(step, columnIndexes)));
  const columns = new Map(participants.map((participant, index) => [participant.id, MARGIN + columnPitch / 2 + index * columnPitch]));
  const headerTop = MARGIN;
  const lifelineTop = headerTop + HEADER_HEIGHT;

  const messages = [];
  const frames = [];
  const activations = [];
  const openFrames = [];
  const openActivations = new Map();
  let cursorY = lifelineTop + ROW_HEIGHT;
  let lastMessageY = null;

  const extendOpenFrames = (bounds) => {
    for (const frame of openFrames) {
      frame.left = Math.min(frame.left, bounds.x);
      frame.right = Math.max(frame.right, bounds.x + bounds.width);
    }
  };

  for (const [index, step] of steps.entries()) {
    const stepNumber = index + 1;
    if (step.type === 'message' || step.type === 'self') {
      const message = { stepNumber, messageType: step.messageType, y: cursorY, ...layoutMessage(step, columns, cursorY) };
      messages.push(message);
      extendOpenFrames(message.bounds);
      lastMessageY = cursorY;
      cursorY += ROW_HEIGHT;
    } else if (step.type === 'activate') {
      const stack = openActivations.get(step.participant) ?? [];
      stack.push({ top: lastMessageY ?? cursorY, depth: stack.length });
      openActivations.set(step.participant, stack);
    } else if (step.type === 'deactivate') {
      const { top, depth } = openActivations.get(step.participant).pop();
      const x = columns.get(step.participant) - ACTIVATION_WIDTH / 2 + depth * ACTIVATION_DEPTH_OFFSET;
      activations.push({ id: `activation-${activations.length + 1}`, participantId: step.participant, x, top, bottom: lastMessageY ?? cursorY, width: ACTIVATION_WIDTH });
    } else if (step.type === 'frame') {
      openFrames.push({ stepNumber, frame: step.frame, text: step.text, top: cursorY, left: Infinity, right: -Infinity, elseSections: [] });
      cursorY += SECTION_HEIGHT;
    } else if (step.type === 'else') {
      openFrames.at(-1).elseSections.push({ y: cursorY, text: step.text });
      cursorY += SECTION_HEIGHT;
    } else {
      const frame = closeFrame(openFrames.pop(), cursorY - ROW_HEIGHT / 2);
      cursorY += ROW_HEIGHT / 2;
      frames.push(frame);
      extendOpenFrames(frame.bounds);
    }
  }

  return {
    participants: participants.map((participant) => {
      const centerX = columns.get(participant.id);
      const header = { x: centerX - (columnPitch - HEADER_INSET * 2) / 2, y: headerTop, width: columnPitch - HEADER_INSET * 2, height: HEADER_HEIGHT };
      return {
        id: participant.id,
        kind: participant.kind,
        header,
        label: centeredLabel(participant.label, FONT_SIZES.participant, centerX, headerTop + HEADER_HEIGHT / 2),
      };
    }),
    lifelines: participants.map((participant) => ({
      participantId: participant.id,
      x: columns.get(participant.id),
      top: lifelineTop,
      bottom: cursorY,
    })),
    activations,
    messages,
    frames: frames.sort((first, second) => first.stepNumber - second.stepNumber),
  };
}
