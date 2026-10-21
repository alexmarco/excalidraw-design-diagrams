#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { resolveDesign } from './resolve_design.js';
import { validateDocument } from './validate_excalidraw.js';

const USAGE = 'Usage: node validate.js <file.excalidraw> [--design <DESIGN.md>]';

class UsageError extends Error {}

function parseCommandLine(args) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      design: { type: 'string' },
    },
  });
  if (positionals.length !== 1) {
    throw new UsageError();
  }
  return { filePath: resolve(positionals[0]), designPath: values.design };
}

function validate(args) {
  const { filePath, designPath } = parseCommandLine(args);
  const design = resolveDesign({ explicitPath: designPath && resolve(designPath), projectDir: dirname(filePath) });
  const problems = validateDocument(JSON.parse(readFileSync(filePath, 'utf8')), design);
  if (problems.length === 0) {
    console.log('No problems found.');
    return;
  }
  for (const { id, message } of problems) {
    console.log(`${id}: ${message}`);
  }
  process.exitCode = 1;
}

try {
  validate(process.argv.slice(2));
} catch (error) {
  if (error instanceof UsageError) {
    console.error(USAGE);
  } else {
    console.error(`Error: ${error.message}`);
  }
  process.exitCode = 1;
}
