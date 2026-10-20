const TEXT_ROLE_FALLBACK = 'text-on-light';

// The style properties that a role's DESIGN.md tokens define for an element of the given type.
export function roleStyle(role, elementType, design) {
  const component = design.components[role];
  const style = {
    strokeColor: component.strokeColor ?? component.textColor,
    backgroundColor: component.backgroundColor ?? 'transparent',
    fillStyle: design.diagrams.fillStyle,
    strokeWidth: design.diagrams.strokeWidth,
    strokeStyle: component.strokeStyle ?? design.diagrams.strokeStyle,
    roughness: design.diagrams.roughness,
  };
  if (elementType !== 'text') {
    return style;
  }
  return {
    ...style,
    strokeColor: component.textColor ?? design.components[TEXT_ROLE_FALLBACK].textColor,
    backgroundColor: 'transparent',
  };
}
