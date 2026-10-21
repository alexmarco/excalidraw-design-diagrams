// Mechanical checks an agent cannot reliably do by eye: file structure; text that collides with bars,
// frame or zone edges, other text or lifelines; notes that cover arrows or text; and content too close
// to the edge of its zone or frame.

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
  const byId = new Map(elements.map((element) => [element.id, element]));
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
    for (const field of ['startBinding', 'endBinding']) {
      const target = byId.get(element[field]?.elementId);
      if (target && !(target.boundElements ?? []).some((bound) => bound.id === element.id)) {
        report(element.id, `${field} to ${target.id} is not listed in its boundElements`);
      }
    }
    for (const bound of element.boundElements ?? []) {
      const target = byId.get(bound.id);
      if (target && !pointsTo(target, element.id)) {
        report(element.id, `boundElements lists ${target.id}, which does not point back`);
      }
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

// A bound element points back to its shape through a binding (arrows) or a containerId (texts).
function pointsTo(bound, shapeId) {
  return bound.containerId === shapeId
    || bound.startBinding?.elementId === shapeId
    || bound.endBinding?.elementId === shapeId;
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
    for (const area of [...withRole('frame'), ...withRole('zone')].filter((element) => element.type === 'rectangle')) {
      const areaBox = boundsOf(area);
      if (intersects(box, areaBox) && !contains(areaBox, box, 0)) {
        report(textElement.id, `crosses the edge of ${area.customData.role} ${area.id}`);
      }
    }
    for (const earlier of texts.slice(0, index)) {
      if (intersects(box, boundsOf(earlier))) report(textElement.id, `overlaps text ${earlier.id}`);
    }
    const crossed = lifelines.some((lifeline) => intersects(box, boundsOf(lifeline)));
    if (crossed && !backings.some((backing) => contains(boundsOf(backing), box, 0))) {
      report(textElement.id, 'a lifeline crosses it without a label background');
    }
  });

  for (const note of withRole('note').filter((element) => element.type === 'rectangle')) {
    const noteBox = boundsOf(note);
    for (const arrow of elements.filter((element) => element.type === 'arrow')) {
      if (intersects(noteBox, boundsOf(arrow))) report(note.id, `covers arrow ${arrow.id}`);
    }
    for (const covered of texts.filter((element) => element.customData?.role !== 'note')) {
      if (intersects(noteBox, boundsOf(covered))) report(note.id, `covers text ${covered.id}`);
    }
  }

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

// Touching edges do not count as an overlap; a vertical or horizontal line crossing a box does.
function intersects(a, b) {
  return overlaps(a.left, a.right, b.left, b.right) && overlaps(a.top, a.bottom, b.top, b.bottom);
}

function overlaps(start, end, otherStart, otherEnd) {
  if (start === end) return otherStart < start && start < otherEnd;
  if (otherStart === otherEnd) return start < otherStart && otherStart < end;
  return start < otherEnd && otherStart < end;
}

function grow(box, margin) {
  return { left: box.left - margin, top: box.top - margin, right: box.right + margin, bottom: box.bottom + margin };
}

function contains(outer, inner, margin) {
  return inner.left >= outer.left + margin && inner.right <= outer.right - margin
    && inner.top >= outer.top + margin && inner.bottom <= outer.bottom - margin;
}
