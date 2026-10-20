#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { chromium } from "playwright";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  return [
    "Usage: node render_excalidraw.js <input.excalidraw> [--output path.png] [--scale 2] [--width 1920]",
    "",
    "Render an Excalidraw JSON file to PNG using headless Chromium.",
  ].join("\n");
}

function parseArguments(args) {
  const { values, positionals } = parseArgs({
    args,
    options: {
      help: { type: "boolean", short: "h" },
      output: { type: "string", short: "o" },
      scale: { type: "string", short: "s" },
      width: { type: "string", short: "w" },
    },
    allowPositionals: true,
  });

  if (values.help) {
    return { help: true };
  }

  if (positionals.length === 0) {
    throw new Error("An input .excalidraw file is required");
  }
  if (positionals.length > 1) {
    throw new Error(`Unexpected argument: ${positionals[1]}`);
  }
  if (values.output === "") {
    throw new Error("--output must not be empty");
  }
  const scale = Number(values.scale ?? 2);
  const maxWidth = Number(values.width ?? 1920);
  if (!Number.isInteger(scale) || scale < 1) {
    throw new Error("--scale must be a positive integer");
  }
  if (!Number.isInteger(maxWidth) || maxWidth < 1) {
    throw new Error("--width must be a positive integer");
  }

  return {
    inputPath: positionals[0],
    outputPath: values.output,
    scale,
    maxWidth,
  };
}

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

function computeBoundingBox(elements) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const element of elements) {
    if (element.isDeleted) {
      continue;
    }
    const x = element.x ?? 0;
    const y = element.y ?? 0;
    const width = element.width ?? 0;
    const height = element.height ?? 0;

    if (
      (element.type === "arrow" || element.type === "line") &&
      Array.isArray(element.points)
    ) {
      for (const [pointX, pointY] of element.points) {
        minX = Math.min(minX, x + pointX);
        minY = Math.min(minY, y + pointY);
        maxX = Math.max(maxX, x + pointX);
        maxY = Math.max(maxY, y + pointY);
      }
    } else {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + Math.abs(width));
      maxY = Math.max(maxY, y + Math.abs(height));
    }
  }

  if (minX === Number.POSITIVE_INFINITY) {
    return [0, 0, 800, 600];
  }
  return [minX, minY, maxX, maxY];
}

async function loadDiagram(inputPath) {
  const raw = await readFile(inputPath, "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${inputPath}: ${error.message}`, {
        cause: error,
      });
    }
    throw error;
  }

  const validationErrors = validateExcalidraw(data);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid Excalidraw file:\n${validationErrors.map((item) => `  - ${item}`).join("\n")}`);
  }

  return data;
}

async function render(data, { inputPath, outputPath, scale, maxWidth }) {
  const [minX, minY, maxX, maxY] = computeBoundingBox(data.elements);
  const padding = 80;
  const viewportWidth = Math.min(Math.trunc(maxX - minX + padding * 2), maxWidth);
  const viewportHeight = Math.max(Math.trunc(maxY - minY + padding * 2), 600);
  const { dir, name } = path.parse(inputPath);
  const resolvedOutputPath = outputPath ?? path.join(dir, `${name}.png`);
  const templatePath = path.join(scriptDirectory, "render_template.html");
  await access(templatePath);

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: viewportWidth, height: viewportHeight },
      deviceScaleFactor: scale,
    });
    await page.goto(pathToFileURL(templatePath).href);
    await page.waitForFunction(() => window.__moduleReady === true, undefined, {
      timeout: 30_000,
    });

    const result = await page.evaluate((diagram) => window.renderDiagram(diagram), data);
    if (!result?.success) {
      throw new Error(`Render failed: ${result?.error ?? "renderDiagram returned null"}`);
    }

    const svg = page.locator("#root svg");
    if ((await svg.count()) === 0) {
      throw new Error("No SVG element found after render");
    }
    await svg.screenshot({ path: resolvedOutputPath });
    return resolvedOutputPath;
  } finally {
    await browser.close();
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  const data = await loadDiagram(options.inputPath);
  console.log(await render(data, options));
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  console.error(usage());
  process.exitCode = 1;
});
