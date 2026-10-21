import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cliPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'excalidraw-diagram', 'scripts', 'fetch_icons.js');

function runCli(args, env = {}) {
  return new Promise((resolve) => {
    execFile(process.execPath, [cliPath, ...args], { env: { ...process.env, ...env } }, (error, stdout, stderr) => {
      resolve({ code: error ? error.code : 0, stdout, stderr });
    });
  });
}

test('fails with the usage when no set or icon is given', async () => {
  const { code, stderr } = await runCli(['lucide']);

  assert.equal(code, 1);
  assert.match(stderr, /Usage: node fetch_icons\.js <lucide\|simple-icons> <icon-name>\.\.\./);
});

test('prints the cached path of each icon, downloading nothing when it is cached', async () => {
  const cacheDirectory = mkdtempSync(join(tmpdir(), 'fetch-icons-cli-'));
  mkdirSync(join(cacheDirectory, 'lucide@1.61.0'));
  writeFileSync(join(cacheDirectory, 'lucide@1.61.0', 'database.svg'), '<svg></svg>');

  const { code, stdout } = await runCli(['lucide', 'database'], { EXCALIDRAW_ICON_CACHE: cacheDirectory });

  assert.equal(code, 0);
  assert.equal(stdout.trim(), join(cacheDirectory, 'lucide@1.61.0', 'database.svg'));
});

test('an unknown set is reported as an error', async () => {
  const { code, stderr } = await runCli(['aws', 'lambda']);

  assert.equal(code, 1);
  assert.match(stderr, /unknown icon set "aws"/);
});
