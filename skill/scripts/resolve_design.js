import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const FRONT_MATTER = /^---\n([\s\S]*?)\n---(?:\n|$)/;
const DIAGRAMS_SECTION = /^## Diagrams\n([\s\S]*?)(?=^## |(?![\s\S]))/m;
const YAML_BLOCK = /^```yaml\n([\s\S]*?)\n```/m;
const REFERENCE = /^\{([^{}]+)\}$/;

const BASE_DESIGN_PATH = fileURLToPath(new URL('../DESIGN.md', import.meta.url));

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
  'participant',
  'actor',
  'message-sync',
  'message-async',
  'message-return',
  'lifeline',
  'activation',
  'frame',
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

function resolveReferences(node, document) {
  if (typeof node === 'string') {
    const reference = REFERENCE.exec(node);
    return reference ? resolveReferences(lookup(document, reference[1]), document) : node;
  }
  if (Array.isArray(node)) {
    return node.map((item) => resolveReferences(item, document));
  }
  if (node !== null && typeof node === 'object') {
    return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, resolveReferences(value, document)]));
  }
  return node;
}

export function resolveDesign({ basePath = BASE_DESIGN_PATH } = {}) {
  const base = parseDesign(readFileSync(basePath, 'utf8'));
  const document = { ...base.tokens, diagrams: base.diagrams };
  return resolveReferences(document, document);
}
