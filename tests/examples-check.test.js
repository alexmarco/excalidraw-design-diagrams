import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkExamples } from '../skill/scripts/check_examples.js';

const EXAMPLES_DIR = fileURLToPath(new URL('../skill/examples', import.meta.url));
const OAUTH_DIR = join(EXAMPLES_DIR, 'oauth-pkce');
const INDEX_WITH_OAUTH = '| [oauth-pkce](oauth-pkce/) | Sequence | Base |\n';

// A copy of the OAuth example in a temporary examples folder, with an index that lists it.
function examplesWithOauth({ index = INDEX_WITH_OAUTH } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'examples-check-'));
  cpSync(OAUTH_DIR, join(dir, 'oauth-pkce'), { recursive: true });
  writeFileSync(join(dir, 'README.md'), index);
  return dir;
}

function editDiagram(dir, edit) {
  const path = join(dir, 'oauth-pkce', 'oauth-pkce.excalidraw');
  const document = JSON.parse(readFileSync(path, 'utf8'));
  edit(document);
  writeFileSync(path, JSON.stringify(document, null, 2));
}

function problemsOf(dir) {
  const problems = checkExamples(dir);
  rmSync(dir, { recursive: true, force: true });
  return problems;
}

test('the examples of the repository pass the check', () => {
  assert.deepEqual(checkExamples(EXAMPLES_DIR), []);
});

test('a complete example listed in the index has no problems', () => {
  assert.deepEqual(problemsOf(examplesWithOauth()), []);
});

test('an example without its PNG is reported', () => {
  const dir = examplesWithOauth();
  rmSync(join(dir, 'oauth-pkce', 'oauth-pkce.png'));

  assert.deepEqual(problemsOf(dir), ['oauth-pkce: missing oauth-pkce.png']);
});

test('an example without its SVG is reported', () => {
  const dir = examplesWithOauth();
  rmSync(join(dir, 'oauth-pkce', 'oauth-pkce.svg'));

  assert.deepEqual(problemsOf(dir), ['oauth-pkce: missing oauth-pkce.svg']);
});

test('an example that does not pass the validator is reported', () => {
  const dir = examplesWithOauth();
  editDiagram(dir, (document) => {
    document.elements.push({ ...document.elements[0] });
  });

  const problems = problemsOf(dir);

  assert.ok(problems.some((problem) => problem.startsWith('oauth-pkce: validator: ')), problems.join('\n'));
});

test('an example that changes when restyled is reported', () => {
  const dir = examplesWithOauth();
  editDiagram(dir, (document) => {
    const shape = document.elements.find((element) => element.customData?.role === 'participant');
    shape.strokeColor = '#123456';
  });

  assert.deepEqual(problemsOf(dir), ['oauth-pkce: changes when restyled']);
});

test('an example missing from the index is reported', () => {
  const dir = examplesWithOauth({ index: '# Examples\n' });

  assert.deepEqual(problemsOf(dir), ['oauth-pkce: missing from the examples index']);
});

test('an example folder uses its own DESIGN.md to restyle and validate', () => {
  const dir = examplesWithOauth();
  writeFileSync(
    join(dir, 'oauth-pkce', 'DESIGN.md'),
    '---\ncomponents:\n  participant:\n    strokeColor: "#123456"\n---\n',
  );

  assert.deepEqual(problemsOf(dir), ['oauth-pkce: changes when restyled']);
});
