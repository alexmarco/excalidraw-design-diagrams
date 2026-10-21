import { roleStyle } from './role_style.js';

// Returns the document with each role's style reapplied, plus the ids of elements that have no role
// in the design. Geometry, text and bindings are never rewritten.
export function restyleDocument(document, design) {
  const unstyledIds = [];
  const elements = document.elements.map((element) => {
    const role = element.customData?.role;
    if (!Object.hasOwn(design.components, role)) {
      unstyledIds.push(element.id);
      return element;
    }
    return {
      ...element,
      ...roleStyle(role, element.type, design),
      ...arrowheadStyle(element, role, design),
      ...cornerStyle(element, design),
    };
  });
  return { document: { ...document, elements, appState: canvasStyle(document, design) }, unstyledIds };
}

// The canvas takes the design's background; a design without the token keeps the current one.
function canvasStyle(document, design) {
  const { viewBackgroundColor } = design.diagrams;
  return viewBackgroundColor === undefined
    ? document.appState
    : { ...document.appState, viewBackgroundColor };
}

// Rounded shapes take the design's corner radius; sharp shapes stay sharp.
function cornerStyle(element, design) {
  const { cornerRadius } = design.diagrams;
  return element.roundness?.type === 3 && cornerRadius !== undefined
    ? { roundness: { type: 3, value: cornerRadius } }
    : {};
}

// Only arrows take an arrowhead from their role, and only when the design defines one for it.
function arrowheadStyle(element, role, design) {
  const { endArrowhead } = design.components[role];
  return element.type === 'arrow' && endArrowhead !== undefined ? { endArrowhead } : {};
}
