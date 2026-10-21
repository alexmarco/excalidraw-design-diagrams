import { createHash } from 'node:crypto';

const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;
// Fixed so the same icon always produces the same file entry.
const CREATED = 1700000000000;

// Builds the `files` entry and the `image` element for one icon. Store the file under its `fileId`
// (`document.files[fileId] = file`) and push the element: icons that are identical share one fileId,
// so the SVG is stored once however many elements use it.
export function embedIcon({ svgText, id, x, y, size, color }) {
  const svg = withIntrinsicSize(recolored(svgText, color));
  const [, , , viewBoxWidth, viewBoxHeight] = svg.match(/viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/);
  const fileId = `icon-${createHash('sha1').update(svg).digest('hex').slice(0, 12)}`;
  const file = {
    mimeType: 'image/svg+xml',
    id: fileId,
    dataURL: `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`,
    created: CREATED,
  };
  const element = {
    id,
    type: 'image',
    x,
    y,
    width: size,
    height: (size * viewBoxHeight) / viewBoxWidth,
    angle: 0,
    strokeColor: 'transparent',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: 1,
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: null,
    updated: CREATED,
    link: null,
    locked: false,
    status: 'saved',
    fileId,
    scale: [1, 1],
  };
  return { fileId, file, element };
}

// Lucide draws with currentColor, which renders black outside a page. Other icons are brand marks
// and stay unmodified.
function recolored(svgText, color) {
  if (color === undefined) return svgText;
  if (!HEX_COLOR.test(color)) throw new Error(`color must be a hex color such as #1e3a5f, got "${color}"`);
  if (!svgText.includes('currentColor')) {
    throw new Error('color only applies to icons drawn with currentColor (Lucide); brand marks stay unmodified');
  }
  return svgText.replaceAll('currentColor', color);
}

// A browser draws an <svg> without width and height at 300x150, so give it the viewBox size.
function withIntrinsicSize(svgText) {
  if (/<svg[^>]*\swidth=/.test(svgText)) return svgText;
  const [, , , width, height] = svgText.match(/viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/);
  return svgText.replace('<svg', `<svg width="${width}" height="${height}"`);
}
