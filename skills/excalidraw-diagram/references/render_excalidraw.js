#!/usr/bin/env node

import { parseArgs } from "node:util";
import { exitIfDependenciesMissing } from "../scripts/check_dependencies.js";

exitIfDependenciesMissing();
const { renderExcalidrawFile } = await import("./render/render-file.js");

function usage() {
  return [
    "Usage: node render_excalidraw.js <input.excalidraw> [--output path.png] [--scale 2] [--width 1920]",
    "",
    "Render an Excalidraw JSON file to a PNG and an SVG using a local Chrome or Chromium.",
    "The SVG is written beside the PNG with the same base name.",
    "Set CHROME_PATH to use a specific browser executable.",
  ].join("\n");
}

// Errors in the command line; only these are followed by the usage.
class ArgumentError extends Error {}

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
    throw new ArgumentError("An input .excalidraw file is required");
  }
  if (positionals.length > 1) {
    throw new ArgumentError(`Unexpected argument: ${positionals[1]}`);
  }
  if (values.output === "") {
    throw new ArgumentError("--output must not be empty");
  }
  const scale = Number(values.scale ?? 2);
  const maxWidth = Number(values.width ?? 1920);
  if (!Number.isInteger(scale) || scale < 1) {
    throw new ArgumentError("--scale must be a positive integer");
  }
  if (!Number.isInteger(maxWidth) || maxWidth < 1) {
    throw new ArgumentError("--width must be a positive integer");
  }

  return {
    inputPath: positionals[0],
    outputPath: values.output,
    scale,
    maxWidth,
  };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  const { pngPath, svgPath } = await renderExcalidrawFile(options.inputPath, options);
  console.log(pngPath);
  console.log(svgPath);
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  if (error instanceof ArgumentError || error.code?.startsWith("ERR_PARSE_ARGS")) {
    console.error(usage());
  }
  process.exitCode = 1;
});
