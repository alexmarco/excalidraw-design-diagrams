import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { resolveDesign } from '../skill/scripts/resolve_design.js';

const WCAG_AA_NORMAL_TEXT = 4.5;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function relativeLuminance(hex) {
  const [red, green, blue] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(firstHex, secondHex) {
  const [lighter, darker] = [relativeLuminance(firstHex), relativeLuminance(secondHex)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function failingRatios(pairs) {
  return pairs
    .map(([name, textColor, fillColor]) => [name, contrastRatio(textColor, fillColor)])
    .filter(([, ratio]) => ratio < WCAG_AA_NORMAL_TEXT)
    .map(([name, ratio]) => `${name}: ${ratio.toFixed(2)}`);
}

function textOnFillPairs(design) {
  return Object.entries(design.components)
    .filter(([, role]) => HEX_COLOR.test(role.backgroundColor ?? '') && HEX_COLOR.test(role.textColor ?? ''))
    .map(([name, role]) => [name, role.textColor, role.backgroundColor]);
}

test('contrast helper matches known WCAG values', () => {
  assert.ok(Math.abs(contrastRatio('#000000', '#ffffff') - 21) < 0.01);
  assert.ok(Math.abs(contrastRatio('#3b82f6', '#ffffff') - 3.68) < 0.05);
});

test('every role with text on a fill in the base design reaches WCAG AA', () => {
  assert.deepEqual(failingRatios(textOnFillPairs(resolveDesign())), []);
});

test('the colored text roles on the canvas reach WCAG AA', () => {
  const design = resolveDesign();
  const canvas = design.diagrams.viewBackgroundColor;
  const pairs = ['title', 'subtitle', 'body'].map((name) => [name, design.components[name].textColor, canvas]);
  assert.deepEqual(failingRatios(pairs), []);
});

for (const example of ['web-app-architecture', 'ci-cd-pipeline', 'concept-rag']) {
  test(`${example} override: report text on fill ratios`, () => {
    const explicitPath = fileURLToPath(new URL(`../examples/${example}/DESIGN.md`, import.meta.url));
    const failures = failingRatios(textOnFillPairs(resolveDesign({ explicitPath })));
    console.log(`${example} failing:`, failures.join(', ') || 'none');
  });
}
