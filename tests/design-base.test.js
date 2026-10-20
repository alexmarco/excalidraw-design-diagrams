import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REQUIRED_ROLES, resolveDesign } from '../skill/scripts/resolve_design.js';

const design = resolveDesign();

// Expected values come from the palette the skill used before DESIGN.md (the former skill/references/color-palette.md).
const SHAPE_PURPOSES = {
  primary: { fill: '#3b82f6', stroke: '#1e3a5f' },
  secondary: { fill: '#60a5fa', stroke: '#1e3a5f' },
  tertiary: { fill: '#93c5fd', stroke: '#1e3a5f' },
  start: { fill: '#fed7aa', stroke: '#c2410c' },
  end: { fill: '#a7f3d0', stroke: '#047857' },
  warning: { fill: '#fee2e2', stroke: '#dc2626' },
  decision: { fill: '#fef3c7', stroke: '#b45309' },
  ai: { fill: '#ddd6fe', stroke: '#6d28d9' },
  inactive: { fill: '#dbeafe', stroke: '#1e40af', strokeStyle: 'dashed' },
  error: { fill: '#fecaca', stroke: '#b91c1c' },
};

const TEXT_PURPOSES = {
  title: '#1e40af',
  subtitle: '#3b82f6',
  body: '#64748b',
  'text-on-light': '#374151',
  'text-on-dark': '#ffffff',
};

test('base DESIGN.md resolves to concrete values', () => {
  assert.equal(typeof design.components, 'object');
  assert.equal(typeof design.diagrams, 'object');
});

test('base DESIGN.md defines every required role', () => {
  for (const role of REQUIRED_ROLES) {
    assert.ok(design.components[role], `missing role: ${role}`);
  }
});

test('the roles that make a diagram readable are required', () => {
  for (const role of ['participant-external', 'zone', 'note', 'step', 'frame-tag']) {
    assert.ok(REQUIRED_ROLES.includes(role), `${role} is not required`);
  }
});

test('frames are tinted so the conditional part of a flow stands out', () => {
  assert.notEqual(design.components.frame.backgroundColor, 'transparent');
  assert.notEqual(design.components['frame-tag'].backgroundColor, design.components.frame.backgroundColor);
});

test('a label background inside a frame blends with the frame tint', () => {
  const backing = design.components['label-background-in-frame'];
  assert.equal(backing.backgroundColor, design.components.frame.backgroundColor);
  assert.equal(backing.strokeColor, design.components.frame.backgroundColor);
});

test('each shape purpose of the current palette maps to a role with the same colors', () => {
  for (const [role, { fill, stroke, strokeStyle }] of Object.entries(SHAPE_PURPOSES)) {
    assert.equal(design.components[role].backgroundColor, fill, `${role} fill`);
    assert.equal(design.components[role].strokeColor, stroke, `${role} stroke`);
    assert.equal(design.components[role].strokeStyle ?? 'solid', strokeStyle ?? 'solid', `${role} strokeStyle`);
  }
});

test('each text purpose of the current palette maps to a role with the same color', () => {
  for (const [role, color] of Object.entries(TEXT_PURPOSES)) {
    assert.equal(design.components[role].textColor, color, role);
  }
});

test('evidence artifacts and lines keep the current palette colors', () => {
  assert.equal(design.components.code.backgroundColor, '#1e293b');
  assert.equal(design.components.code.textColor, '#22c55e');
  assert.equal(design.components.structure.strokeColor, '#1e3a5f');
  assert.equal(design.components.marker.backgroundColor, '#3b82f6');
  assert.equal(design.components.marker.strokeColor, '#3b82f6');
  assert.equal(design.diagrams.viewBackgroundColor, '#ffffff');
});

test('base diagram tokens give the hand-drawn Excalidraw look', () => {
  assert.equal(design.diagrams.roughness, 0.5);
  assert.equal(design.diagrams.fontFamily, 5);
  assert.equal(design.diagrams.strokeWidth, 2);
  assert.equal(design.diagrams.strokeStyle, 'solid');
  assert.equal(design.diagrams.fillStyle, 'solid');
  assert.equal(design.diagrams.endArrowhead, 'arrow');
});
