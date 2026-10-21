import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REQUIRED_ROLES, resolveDesign } from '../skills/excalidraw-diagram/scripts/resolve_design.js';

const design = resolveDesign();

// Expected values come from the palette the skill used before DESIGN.md (the former skills/excalidraw-diagram/references/color-palette.md).
const SHAPE_PURPOSES = {
  primary: { fill: '#2563eb', stroke: '#1e3a5f' },
  secondary: { fill: '#60a5fa', stroke: '#1e3a5f' },
  tertiary: { fill: '#93c5fd', stroke: '#1e3a5f' },
  start: { fill: '#fed7aa', stroke: '#c2410c' },
  end: { fill: '#a7f3d0', stroke: '#047857' },
  warning: { fill: '#fee2e2', stroke: '#dc2626' },
  decision: { fill: '#fef3c7', stroke: '#b45309' },
  ai: { fill: '#ddd6fe', stroke: '#6d28d9' },
  inactive: { fill: '#dbeafe', stroke: '#1e40af', strokeStyle: 'dashed' },
  error: { fill: '#fecaca', stroke: '#991b1b' },
};

const TEXT_PURPOSES = {
  title: '#1e40af',
  subtitle: '#2563eb',
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
  for (const role of ['participant-external', 'zone', 'note', 'step', 'frame-tag', 'frame-divider']) {
    assert.ok(REQUIRED_ROLES.includes(role), `${role} is not required`);
  }
});

test('frames are tinted so the conditional part of a flow stands out', () => {
  assert.notEqual(design.components.frame.backgroundColor, 'transparent');
  assert.notEqual(design.components['frame-tag'].backgroundColor, design.components.frame.backgroundColor);
});

test('frame operands are separated by dashed lines and the operator tag stands out', () => {
  assert.equal(design.components['frame-divider'].strokeStyle, 'dashed');
  assert.equal(design.components['frame-tag'].backgroundColor, design.components.frame.strokeColor);
  assert.equal(design.components['frame-tag'].textColor, '#ffffff');
});

test('error text is red like the error stroke', () => {
  assert.equal(design.components.error.textColor, design.components.error.strokeColor);
});

test('an error reply is red and dashed like any other reply', () => {
  const errorReturn = design.components['error-return'];
  assert.equal(errorReturn.strokeColor, design.components.error.strokeColor);
  assert.equal(errorReturn.textColor, design.components.error.textColor);
  assert.equal(errorReturn.strokeStyle, design.components['message-return'].strokeStyle);
  assert.equal(errorReturn.endArrowhead, design.components['message-return'].endArrowhead);
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
  assert.equal(design.components.marker.backgroundColor, '#2563eb');
  assert.equal(design.components.marker.strokeColor, '#2563eb');
  assert.equal(design.diagrams.viewBackgroundColor, '#ffffff');
});

test('base diagram tokens give the hand-drawn Excalidraw look', () => {
  assert.equal(design.diagrams.roughness, 0);
  assert.equal(design.diagrams.cornerRadius, 8);
  assert.equal(design.diagrams.padding, 24);
  assert.equal(design.diagrams.fontFamily, 5);
  assert.equal(design.diagrams.strokeWidth, 2);
  assert.equal(design.diagrams.strokeStyle, 'solid');
  assert.equal(design.diagrams.fillStyle, 'solid');
  assert.equal(design.diagrams.endArrowhead, 'arrow');
});

test('a store (database, cache, queue) is a required role that differs from a service', () => {
  assert.ok(REQUIRED_ROLES.includes('store'), 'store is not required');
  assert.notEqual(design.components.store.backgroundColor, design.components.primary.backgroundColor);
});
