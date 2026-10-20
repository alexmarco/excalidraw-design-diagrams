#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { parseSequenceSpec } from './sequence_spec.js';
import { buildSequenceDocument } from './sequence_excalidraw.js';
import { resolveDesign } from './resolve_design.js';

const USAGE = 'Usage: node generate_sequence.js <spec.yaml> [--output <file.excalidraw>] [--design <DESIGN.md>]';

class UsageError extends Error {}

function parseCommandLine(args) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      output: { type: 'string', short: 'o' },
      design: { type: 'string' },
    },
  });
  if (positionals.length !== 1) {
    throw new UsageError();
  }
  return { specPath: resolve(positionals[0]), outputPath: values.output, designPath: values.design };
}

function defaultOutputPath(specPath) {
  return join(dirname(specPath), `${basename(specPath, extname(specPath))}.excalidraw`);
}

function generate(args) {
  const { specPath, outputPath = defaultOutputPath(specPath), designPath } = parseCommandLine(args);
  const resolvedOutputPath = resolve(outputPath);
  const spec = parseSequenceSpec(readFileSync(specPath, 'utf8'));
  if (existsSync(resolvedOutputPath)) {
    throw new Error(`${resolvedOutputPath} already exists. The .excalidraw file is the source of truth, so it is not regenerated.`);
  }
  const design = resolveDesign({ explicitPath: designPath && resolve(designPath), projectDir: dirname(specPath) });
  mkdirSync(dirname(resolvedOutputPath), { recursive: true });
  writeFileSync(resolvedOutputPath, `${JSON.stringify(buildSequenceDocument(spec, design), null, 2)}\n`);
}

try {
  generate(process.argv.slice(2));
} catch (error) {
  if (error instanceof UsageError) {
    console.error(USAGE);
  } else {
    console.error(`Error: ${error.message}`);
  }
  process.exitCode = 1;
}
