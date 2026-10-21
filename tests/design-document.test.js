import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDesign } from '../skills/excalidraw-diagram/scripts/resolve_design.js';

test('parseDesign reads tokens from the YAML front matter and diagram tokens from the Diagrams block', () => {
  const markdown = [
    '---',
    'colors:',
    '  blue: "#3b82f6"',
    '---',
    '',
    '# Design',
    '',
    '## Diagrams',
    '',
    '```yaml',
    'roughness: 0',
    'strokeWidth: 2',
    '```',
    '',
  ].join('\n');

  assert.deepEqual(parseDesign(markdown), {
    tokens: { colors: { blue: '#3b82f6' } },
    diagrams: { roughness: 0, strokeWidth: 2 },
  });
});

test('parseDesign returns empty diagram tokens when there is no Diagrams block', () => {
  const markdown = ['---', 'colors:', '  blue: "#3b82f6"', '---', '', '# Design', ''].join('\n');

  assert.deepEqual(parseDesign(markdown), {
    tokens: { colors: { blue: '#3b82f6' } },
    diagrams: {},
  });
});

test('parseDesign returns empty tokens when there is no front matter', () => {
  const markdown = ['# Design', '', '## Diagrams', '', '```yaml', 'roughness: 0', '```', ''].join('\n');

  assert.deepEqual(parseDesign(markdown), {
    tokens: {},
    diagrams: { roughness: 0 },
  });
});

test('parseDesign accepts CRLF line endings', () => {
  const markdown = ['---', 'colors:', '  blue: "#3b82f6"', '---', '', '## Diagrams', '', '```yaml', 'roughness: 0', '```'].join('\r\n');

  assert.deepEqual(parseDesign(markdown), {
    tokens: { colors: { blue: '#3b82f6' } },
    diagrams: { roughness: 0 },
  });
});
