import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const cliPath = join(testDirectory, '..', 'skill', 'references', 'render_excalidraw.js');
const sampleDiagram = join(testDirectory, 'fixtures', 'sample.excalidraw');

function runCli(args, env = {}) {
  return new Promise((resolve) => {
    execFile(process.execPath, [cliPath, ...args], { env: { ...process.env, ...env } }, (error, stdout, stderr) => {
      resolve({ code: error ? error.code : 0, stdout, stderr });
    });
  });
}

test('--help prints the usage with the output, scale and width options', async () => {
  const { code, stdout } = await runCli(['--help']);

  assert.equal(code, 0);
  assert.match(stdout, /--output/);
  assert.match(stdout, /--scale/);
  assert.match(stdout, /--width/);
});

test('fails when no input file is given', async () => {
  const { code, stderr } = await runCli([]);

  assert.equal(code, 1);
  assert.match(stderr, /An input .excalidraw file is required/);
});

test('rejects a scale that is not a positive integer', async () => {
  const { code, stderr } = await runCli([sampleDiagram, '--scale', '0']);

  assert.equal(code, 1);
  assert.match(stderr, /--scale must be a positive integer/);
});

test('names CHROME_PATH when the browser it points to does not exist', async () => {
  const { code, stderr } = await runCli([sampleDiagram], { CHROME_PATH: join(testDirectory, 'no-such-chrome.exe') });

  assert.equal(code, 1);
  assert.match(stderr, /CHROME_PATH/);
});
