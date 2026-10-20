#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { resolveDesign } from './resolve_design.js';
import { restyleDocument } from './restyle_excalidraw.js';

const USAGE = 'Usage: node restyle.js <file.excalidraw> [--design <DESIGN.md>]';

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

function restyle(args) {
  const { filePath, designPath } = parseCommandLine(args);
  const design = resolveDesign({ explicitPath: designPath && resolve(designPath), projectDir: process.cwd() });
  const { document, unstyledIds } = restyleDocument(JSON.parse(readFileSync(filePath, 'utf8')), design);
  writeFileSync(filePath, `${JSON.stringify(document, null, 2)}\n`);

  console.log(`Restyled ${document.elements.length - unstyledIds.length} elements.`);
  if (unstyledIds.length > 0) {
    console.log(`Left unchanged because they have no known role: ${unstyledIds.join(', ')}`);
  }
}

try {
  restyle(process.argv.slice(2));
} catch (error) {
  if (error instanceof UsageError) {
    console.error(USAGE);
  } else {
    console.error(`Error: ${error.message}`);
  }
  process.exitCode = 1;
}
