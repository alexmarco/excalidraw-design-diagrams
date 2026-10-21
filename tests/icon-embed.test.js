import { test } from 'node:test';
import assert from 'node:assert/strict';
import { embedIcon } from '../skill/scripts/icon_embed.js';

const LUCIDE_SVG = `<!-- @license lucide-static v1.61.0 - ISC -->
<svg
  class="lucide lucide-database"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
><path d="M3 5V19A9 3 0 0 0 21 19V5" /></svg>`;

const SIMPLE_ICONS_SVG = '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Redis</title><path d="M0 0h24v24H0z"/></svg>';

function decodedSvg(file) {
  const [, base64] = file.dataURL.match(/^data:image\/svg\+xml;base64,(.+)$/);
  return Buffer.from(base64, 'base64').toString('utf8');
}

test('returns the files entry and an image element that point to each other, with explicit size', () => {
  const { fileId, file, element } = embedIcon({ svgText: LUCIDE_SVG, id: 'db-icon', x: 100, y: 50, size: 48 });

  assert.equal(file.id, fileId);
  assert.equal(file.mimeType, 'image/svg+xml');
  assert.equal(typeof file.created, 'number');
  assert.equal(element.type, 'image');
  assert.equal(element.id, 'db-icon');
  assert.equal(element.fileId, fileId);
  assert.equal(element.status, 'saved');
  assert.deepEqual([element.x, element.y, element.width, element.height], [100, 50, 48, 48]);
  assert.deepEqual(element.scale, [1, 1]);
});

test('the stored SVG keeps the original licence comment', () => {
  const { file } = embedIcon({ svgText: LUCIDE_SVG, id: 'a', x: 0, y: 0, size: 24 });

  assert.match(decodedSvg(file), /^<!-- @license lucide-static v1\.61\.0 - ISC -->/);
});

test('an SVG with only a viewBox gets an explicit width and height', () => {
  const { file } = embedIcon({ svgText: SIMPLE_ICONS_SVG, id: 'a', x: 0, y: 0, size: 24 });

  assert.match(decodedSvg(file), /<svg width="24" height="24" role="img"/);
});

test('an SVG that already declares its size is stored as it is', () => {
  const { file } = embedIcon({ svgText: LUCIDE_SVG, id: 'a', x: 0, y: 0, size: 24 });

  assert.equal(decodedSvg(file), LUCIDE_SVG);
});

test('the element keeps the aspect ratio of the viewBox', () => {
  const wideSvg = '<svg viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg"></svg>';

  const { element } = embedIcon({ svgText: wideSvg, id: 'a', x: 0, y: 0, size: 80 });

  assert.deepEqual([element.width, element.height], [80, 40]);
});

test('color replaces currentColor in the stored SVG', () => {
  const { file } = embedIcon({ svgText: LUCIDE_SVG, id: 'a', x: 0, y: 0, size: 24, color: '#1e3a5f' });

  assert.match(decodedSvg(file), /stroke="#1e3a5f"/);
  assert.doesNotMatch(decodedSvg(file), /currentColor/);
});

test('a lucide icon without color keeps currentColor, which renders black', () => {
  const { file } = embedIcon({ svgText: LUCIDE_SVG, id: 'a', x: 0, y: 0, size: 24 });

  assert.match(decodedSvg(file), /currentColor/);
});

test('color on an icon that has no currentColor is an error, so brand marks stay unmodified', () => {
  assert.throws(
    () => embedIcon({ svgText: SIMPLE_ICONS_SVG, id: 'a', x: 0, y: 0, size: 24, color: '#ff0000' }),
    /currentColor/,
  );
});

test('color must be a hex color', () => {
  assert.throws(
    () => embedIcon({ svgText: LUCIDE_SVG, id: 'a', x: 0, y: 0, size: 24, color: '"/><script>' }),
    /hex color/,
  );
});

test('the same icon and color always get the same fileId; a different color gets another one', () => {
  const first = embedIcon({ svgText: LUCIDE_SVG, id: 'a', x: 0, y: 0, size: 24, color: '#1e3a5f' });
  const second = embedIcon({ svgText: LUCIDE_SVG, id: 'b', x: 90, y: 90, size: 64, color: '#1e3a5f' });
  const otherColor = embedIcon({ svgText: LUCIDE_SVG, id: 'c', x: 0, y: 0, size: 24, color: '#c2410c' });

  assert.equal(first.fileId, second.fileId);
  assert.deepEqual(first.file, second.file);
  assert.notEqual(first.fileId, otherColor.fileId);
});
