import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { RUNTIME_DEPENDENCIES, dependencyProblem } from '../skills/excalidraw-diagram/scripts/check_dependencies.js';

const SKILL_DIRECTORY = fileURLToPath(new URL('../skills/excalidraw-diagram/', import.meta.url));
const SKILL_PACKAGE = JSON.parse(readFileSync(join(SKILL_DIRECTORY, 'package.json'), 'utf8'));

test('the checked dependencies are the ones the skill package declares', () => {
  assert.deepEqual([...RUNTIME_DEPENDENCIES].sort(), Object.keys(SKILL_PACKAGE.dependencies).sort());
});

test('nothing is reported when every dependency resolves', () => {
  assert.equal(dependencyProblem({ resolve: () => 'file:///resolved.js', skillDirectory: '/skill' }), undefined);
});

test('the missing dependencies and the exact install command are reported', () => {
  const resolve = (name) => {
    if (name === 'yaml') throw Object.assign(new Error(`Cannot find package '${name}'`), { code: 'ERR_MODULE_NOT_FOUND' });
    return 'file:///resolved.js';
  };

  const message = dependencyProblem({ resolve, skillDirectory: '/home/me/.claude/skills/excalidraw-diagram' });

  assert.match(message, /yaml/);
  assert.doesNotMatch(message, /esbuild/);
  assert.match(message, /npm install --omit=dev --prefix "\/home\/me\/\.claude\/skills\/excalidraw-diagram"/);
});

test('an error other than a missing module is not hidden', () => {
  const resolve = () => {
    throw new Error('disk failure');
  };

  assert.throws(() => dependencyProblem({ resolve, skillDirectory: '/skill' }), /disk failure/);
});

function skillCopyWithoutDependencies() {
  const directory = mkdtempSync(join(tmpdir(), 'skill-nodeps-'));
  const copy = join(directory, 'excalidraw-diagram');
  cpSync(SKILL_DIRECTORY, copy, { recursive: true, filter: (source) => !source.includes('node_modules') });
  return { directory, copy };
}

for (const script of ['scripts/restyle.js', 'scripts/validate.js', 'references/render_excalidraw.js']) {
  test(`${script} prints the install command instead of a module-not-found error`, () => {
    const { directory, copy } = skillCopyWithoutDependencies();
    try {
      const diagram = join(directory, 'diagram.excalidraw');
      writeFileSync(diagram, JSON.stringify({ type: 'excalidraw', version: 2, elements: [], appState: {}, files: {} }));

      const result = spawnSync(process.execPath, [join(copy, script), diagram], { cwd: directory, encoding: 'utf8' });

      assert.equal(result.status, 1);
      assert.match(result.stderr, /npm install --omit=dev --prefix /);
      assert.doesNotMatch(result.stderr, /ERR_MODULE_NOT_FOUND/);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
}
