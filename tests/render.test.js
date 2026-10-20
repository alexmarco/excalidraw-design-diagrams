import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBrowser } from '../skill/references/render/find-browser.js';
import { renderExcalidrawFile } from '../skill/references/render/render-file.js';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const sampleDiagram = join(testDirectory, 'fixtures', 'sample.excalidraw');
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const browserAvailable = (() => {
  try {
    findBrowser();
    return true;
  } catch {
    return false;
  }
})();
const requiresBrowser = { skip: browserAvailable ? false : 'no Chrome or Chromium installed' };

const pngWidth = (png) => png.readUInt32BE(16);

let outputDirectory;

before(async () => {
  outputDirectory = await mkdtemp(join(tmpdir(), 'excalidraw-render-test-'));
});

after(async () => {
  await rm(outputDirectory, { recursive: true, force: true });
});

test('renders a diagram to a PNG and an SVG at the requested output path', requiresBrowser, async () => {
  const outputPath = join(outputDirectory, 'sample.png');

  const { pngPath, svgPath } = await renderExcalidrawFile(sampleDiagram, { outputPath, scale: 1, maxWidth: 1920 });

  assert.equal(pngPath, outputPath);
  assert.equal(svgPath, join(outputDirectory, 'sample.svg'));
  assert.deepEqual(await readFile(pngPath).then((png) => png.subarray(0, 8)), PNG_SIGNATURE);
  assert.match(await readFile(svgPath, 'utf8'), /^<svg[\s>]/);
});

test('the scale option multiplies the PNG width', requiresBrowser, async () => {
  const onePath = join(outputDirectory, 'scale-1.png');
  const twoPath = join(outputDirectory, 'scale-2.png');

  await renderExcalidrawFile(sampleDiagram, { outputPath: onePath, scale: 1, maxWidth: 1920 });
  await renderExcalidrawFile(sampleDiagram, { outputPath: twoPath, scale: 2, maxWidth: 1920 });

  const widthAtOne = pngWidth(await readFile(onePath));
  const widthAtTwo = pngWidth(await readFile(twoPath));
  assert.ok(Math.abs(widthAtTwo - 2 * widthAtOne) <= 1, `expected ~${2 * widthAtOne}, got ${widthAtTwo}`);
});

test('the width option caps the PNG width in CSS pixels', requiresBrowser, async () => {
  const uncappedPath = join(outputDirectory, 'uncapped.png');
  const cappedPath = join(outputDirectory, 'capped.png');

  await renderExcalidrawFile(sampleDiagram, { outputPath: uncappedPath, scale: 1, maxWidth: 1920 });
  await renderExcalidrawFile(sampleDiagram, { outputPath: cappedPath, scale: 1, maxWidth: 200 });

  const cappedWidth = pngWidth(await readFile(cappedPath));
  assert.ok(Math.abs(cappedWidth - 200) <= 1, `expected ~200, got ${cappedWidth}`);
  assert.ok(cappedWidth < pngWidth(await readFile(uncappedPath)));
});
