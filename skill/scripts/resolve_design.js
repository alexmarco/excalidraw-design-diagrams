import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parse } from 'yaml';

const FRONT_MATTER = /^---\n([\s\S]*?)\n---(?:\n|$)/;
const DIAGRAMS_SECTION = /^## Diagrams\n([\s\S]*?)(?=^## |(?![\s\S]))/m;
const YAML_BLOCK = /^```yaml\n([\s\S]*?)\n```/m;
const REFERENCE = /^\{([^{}]+)\}$/;

const BASE_DESIGN_PATH = fileURLToPath(new URL('../DESIGN.md', import.meta.url));
const PROJECT_DESIGN_PATHS = ['DESIGN.md', join('docs', 'DESIGN.md')];

export const REQUIRED_ROLES = [
  'primary',
  'secondary',
  'tertiary',
  'start',
  'end',
  'warning',
  'decision',
  'ai',
  'inactive',
  'error',
  'title',
  'subtitle',
  'body',
  'text-on-light',
  'text-on-dark',
  'code',
  'structure',
  'marker',
  'label-background',
  'participant',
  'actor',
  'message-sync',
  'message-async',
  'message-return',
  'lifeline',
  'activation',
  'frame',
  'participant-external',
  'zone',
  'note',
  'step',
];

function parseYamlOrEmpty(source) {
  return source === undefined ? {} : parse(source) ?? {};
}

export function parseDesign(markdown) {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const frontMatter = FRONT_MATTER.exec(normalized);
  const diagramsSection = DIAGRAMS_SECTION.exec(normalized);
  const yamlBlock = diagramsSection && YAML_BLOCK.exec(diagramsSection[1]);

  return {
    tokens: parseYamlOrEmpty(frontMatter?.[1]),
    diagrams: parseYamlOrEmpty(yamlBlock?.[1]),
  };
}

function lookup(document, referencePath) {
  return referencePath.split('.').reduce((node, key) => node?.[key], document);
}

function resolveReference(referencePath, document, referenceStack) {
  if (referenceStack.includes(referencePath)) {
    throw new Error(`Circular design reference: {${referencePath}}`);
  }
  const target = lookup(document, referencePath);
  if (target === undefined) {
    throw new Error(`Broken design reference: {${referencePath}}`);
  }
  return resolveReferences(target, document, [...referenceStack, referencePath]);
}

function resolveReferences(node, document, referenceStack = []) {
  if (typeof node === 'string') {
    const reference = REFERENCE.exec(node);
    return reference ? resolveReference(reference[1], document, referenceStack) : node;
  }
  if (Array.isArray(node)) {
    return node.map((item) => resolveReferences(item, document, referenceStack));
  }
  if (node !== null && typeof node === 'object') {
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, resolveReferences(value, document, referenceStack)]),
    );
  }
  return node;
}

function assertRequiredRoles(design) {
  const missingRoles = REQUIRED_ROLES.filter((role) => !design.components?.[role]);
  if (missingRoles.length > 0) {
    throw new Error(`Design is missing required roles: ${missingRoles.join(', ')}`);
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function mergeDeep(base, override) {
  const merged = { ...base };
  for (const [key, value] of Object.entries(override)) {
    merged[key] = isPlainObject(base[key]) && isPlainObject(value) ? mergeDeep(base[key], value) : value;
  }
  return merged;
}

function findProjectDesignPath(projectDir) {
  return PROJECT_DESIGN_PATHS.map((relativePath) => join(projectDir, relativePath)).find((candidate) =>
    existsSync(candidate),
  );
}

function toDocument({ tokens, diagrams }) {
  return { ...tokens, diagrams };
}

export function resolveDesign({ explicitPath, projectDir, basePath = BASE_DESIGN_PATH } = {}) {
  const base = toDocument(parseDesign(readFileSync(basePath, 'utf8')));
  const overridePath = explicitPath ?? (projectDir && findProjectDesignPath(projectDir));
  const override = overridePath ? toDocument(parseDesign(readFileSync(overridePath, 'utf8'))) : {};
  const document = mergeDeep(base, override);
  const design = resolveReferences(document, document);
  assertRequiredRoles(design);
  return design;
}
