import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { findBrowser } from "./find-browser.js";
import { launchBrowser } from "./devtools.js";

const exportPagePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "export-page.js");

function validateExcalidraw(data) {
  const errors = [];
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return ["Expected a JSON object"];
  }
  if (data.type !== "excalidraw") {
    errors.push(`Expected type 'excalidraw', got '${data.type}'`);
  }
  if (!("elements" in data)) {
    errors.push("Missing 'elements' array");
  } else if (!Array.isArray(data.elements)) {
    errors.push("'elements' must be an array");
  } else if (data.elements.length === 0) {
    errors.push("'elements' array is empty — nothing to render");
  }
  return errors;
}

async function loadDiagram(inputPath) {
  const raw = await readFile(inputPath, "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${inputPath}: ${error.message}`, { cause: error });
    }
    throw error;
  }

  const validationErrors = validateExcalidraw(data);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid Excalidraw file:\n${validationErrors.map((item) => `  - ${item}`).join("\n")}`);
  }

  return data;
}

// Bundles the browser-side export code, including @excalidraw/utils, into one script.
async function bundleExportPage() {
  const result = await build({
    entryPoints: [exportPagePath],
    bundle: true,
    format: "iife",
    globalName: "ExcalidrawExport",
    platform: "browser",
    write: false,
    logLevel: "silent",
  });
  return result.outputFiles[0].text;
}

/**
 * Renders an .excalidraw file to a PNG and an SVG with a local Chrome.
 * The SVG is written beside the PNG with the same base name.
 */
export async function renderExcalidrawFile(inputPath, { outputPath, scale, maxWidth }) {
  const diagram = await loadDiagram(inputPath);
  const { dir, name } = path.parse(inputPath);
  const pngPath = outputPath ?? path.join(dir, `${name}.png`);
  const svgPath = path.join(path.dirname(pngPath), `${path.parse(pngPath).name}.svg`);

  const browserPath = findBrowser();
  const bundle = await bundleExportPage();
  const browser = await launchBrowser(browserPath);
  let rendered;
  try {
    rendered = await browser.evaluate(
      `${bundle}\nExcalidrawExport.renderDiagram(${JSON.stringify(diagram)}, ${JSON.stringify({ scale, maxWidth })});`,
    );
  } finally {
    await browser.close();
  }

  await writeFile(svgPath, rendered.svg);
  await writeFile(pngPath, Buffer.from(rendered.pngBase64, "base64"));
  return { pngPath, svgPath };
}
