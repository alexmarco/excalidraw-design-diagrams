import { parse } from 'yaml';

const FRONT_MATTER = /^---\n([\s\S]*?)\n---(?:\n|$)/;
const DIAGRAMS_SECTION = /^## Diagrams\n([\s\S]*?)(?=^## |(?![\s\S]))/m;
const YAML_BLOCK = /^```yaml\n([\s\S]*?)\n```/m;

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
