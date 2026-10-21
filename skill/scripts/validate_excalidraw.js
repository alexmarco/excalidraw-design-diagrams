// Mechanical checks an agent cannot reliably do by eye: file structure, and text that collides
// with bars, frame edges, other text or lifelines, or sits too close to the edge of its zone or frame.

const ROUGHNESS_VALUES = [0, 1, 2];
const FONT_FAMILIES = [1, 2, 3, 5, 6, 7, 8, 9, 10];
const SHAPE_TYPES = ['rectangle', 'ellipse', 'diamond', 'text'];
// Roles allowed in a frame's corner, and label backings, whose own texts are checked instead.
const PADDING_EXEMPT_ROLES = ['frame', 'frame-tag', 'label-background', 'label-background-in-frame'];
const NOT_A_BACKING_ROLES = ['zone', 'frame', 'activation'];

export function validateDocument(document, design) {
  const elements = document.elements ?? [];
  return [...structureProblems(elements, design), ...layoutProblems(elements, design)];
}

function structureProblems(elements, design) {
  const problems = [];
  const report = (id, message) => problems.push({ id, kind: 'structure', message });
  const ids = new Set();
  for (const element of elements) {
    if (ids.has(element.id)) report(element.id, 'duplicate id');
    ids.add(element.id);
  }
  for (const element of elements) {
    const references = [
      ['containerId', element.containerId],
      ...(element.boundElements ?? []).map((bound) => ['boundElements', bound.id]),
      ['startBinding', element.startBinding?.elementId],
      ['endBinding', element.endBinding?.elementId],
    ];
    for (const [field, target] of references) {
      if (target && !ids.has(target)) report(element.id, `${field} points to missing element ${target}`);
    }
    const role = element.customData?.role;
    if (role === undefined) report(element.id, 'has no role');
    else if (!Object.hasOwn(design.components, role)) report(element.id, `role ${role} is not in the design`);
    if (element.roughness !== undefined && !ROUGHNESS_VALUES.includes(element.roughness)) {
      report(element.id, `roughness ${element.roughness} is not 0, 1 or 2`);
    }
    if (element.type === 'text' && !FONT_FAMILIES.includes(element.fontFamily)) {
      report(element.id, `fontFamily ${element.fontFamily} is not an Excalidraw font`);
    }
  }
  return problems;
}

function layoutProblems(elements, design) {
  const problems = [];
  const report = (id, message) => problems.push({ id, kind: 'layout', message });
  const withRole = (role) => elements.filter((element) => element.customData?.role === role);
  const texts = elements.filter((element) => element.type === 'text');
  const lifelines = withRole('lifeline');
  const backings = elements.filter((element) => ['rectangle', 'ellipse'].includes(element.type)
    && !NOT_A_BACKING_ROLES.includes(element.customData?.role));

  texts.forEach((textElement, index) => {
    const box = boundsOf(textElement);
    for (const bar of withRole('activation')) {
      if (intersects(box, boundsOf(bar))) report(textElement.id, `overlaps activation bar ${bar.id}`);
    }
    for (const frame of withRole('frame').filter((element) => element.type === 'rectangle')) {
      const frameBox = boundsOf(frame);
      if (intersects(box, frameBox) && !contains(frameBox, box, 0)) report(textElement.id, `crosses the edge of frame ${frame.id}`);
    }
    for (const earlier of texts.slice(0, index)) {
      if (intersects(box, boundsOf(earlier))) report(textElement.id, `overlaps text ${earlier.id}`);
    }
    const crossed = lifelines.some((lifeline) => intersects(box, boundsOf(lifeline)));
    if (crossed && !backings.some((backing) => contains(boundsOf(backing), box, 0))) {
      report(textElement.id, 'a lifeline crosses it without a label background');
    }
  });

  const padding = design.diagrams.padding ?? 0;
  const zones = elements.filter((element) => element.type === 'rectangle' && element.customData?.role === 'zone');
  zones.forEach((zone, index) => {
    for (const earlier of zones.slice(0, index)) {
      if (intersects(grow(boundsOf(zone), padding), boundsOf(earlier))) report(zone.id, `closer than ${padding}px to zone ${earlier.id}`);
    }
  });
  const areas = elements.filter((element) => element.type === 'rectangle' && ['zone', 'frame'].includes(element.customData?.role));
  for (const area of areas) {
    const areaBox = boundsOf(area);
    for (const element of elements) {
      if (element === area || !SHAPE_TYPES.includes(element.type) || PADDING_EXEMPT_ROLES.includes(element.customData?.role)) continue;
      const box = boundsOf(element);
      if (contains(areaBox, box, 0) && !contains(areaBox, box, padding)) {
        report(element.id, `closer than ${padding}px to the edge of ${area.customData.role} ${area.id}`);
      }
    }
  }
  return problems;
}

function boundsOf(element) {
  if (Array.isArray(element.points)) {
    const xs = element.points.map(([x]) => element.x + x);
    const ys = element.points.map(([, y]) => element.y + y);
    return { left: Math.min(...xs), top: Math.min(...ys), right: Math.max(...xs), bottom: Math.max(...ys) };
  }
  return { left: element.x, top: element.y, right: element.x + element.width, bottom: element.y + element.height };
}

// Touching edges do not count as an overlap; a vertical line crossing a box does.
function intersects(a, b) {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
    || (a.left === a.right && b.left < a.left && a.left < b.right && a.top < b.bottom && b.top < a.bottom)
    || (b.left === b.right && a.left < b.left && b.left < a.right && a.top < b.bottom && b.top < a.bottom);
}

function grow(box, margin) {
  return { left: box.left - margin, top: box.top - margin, right: box.right + margin, bottom: box.bottom + margin };
}

function contains(outer, inner, margin) {
  return inner.left >= outer.left + margin && inner.right <= outer.right - margin
    && inner.top >= outer.top + margin && inner.bottom <= outer.bottom - margin;
}
