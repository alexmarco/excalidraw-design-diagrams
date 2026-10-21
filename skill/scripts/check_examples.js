import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { join } from 'node:path';
import { resolveDesign } from './resolve_design.js';
import { restyleDocument } from './restyle_excalidraw.js';
import { validateDocument } from './validate_excalidraw.js';

// Walks every example folder (<name>/<name>.excalidraw, .png and .svg) and returns one message per
// problem. An example may carry its own DESIGN.md, which is resolved next to the diagram.
export function checkExamples(examplesDir) {
  const index = readFileSync(join(examplesDir, 'README.md'), 'utf8');
  const names = readdirSync(examplesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  return names.flatMap((name) => checkExample(join(examplesDir, name), name, index));
}

function checkExample(exampleDir, name, index) {
  const problems = [];
  const report = (message) => problems.push(`${name}: ${message}`);

  for (const extension of ['png', 'svg']) {
    if (!existsSync(join(exampleDir, `${name}.${extension}`))) report(`missing ${name}.${extension}`);
  }
  if (!index.includes(`[${name}](${name}/)`)) report('missing from the examples index');

  const diagramPath = join(exampleDir, `${name}.excalidraw`);
  if (!existsSync(diagramPath)) {
    report(`missing ${name}.excalidraw`);
    return problems;
  }
  try {
    const document = JSON.parse(readFileSync(diagramPath, 'utf8'));
    const design = resolveDesign({ projectDir: exampleDir });
    for (const { id, message } of validateDocument(document, design)) report(`validator: ${id}: ${message}`);
    if (!isDeepStrictEqual(restyleDocument(document, design).document, document)) report('changes when restyled');
  } catch (error) {
    report(`could not be checked: ${error.message}`);
  }
  return problems;
}
