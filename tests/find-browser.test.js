import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { findBrowser } from '../skill/references/render/find-browser.js';

const windowsEnv = {
  PROGRAMFILES: 'C:\\Program Files',
  LOCALAPPDATA: 'C:\\Users\\me\\AppData\\Local',
  PATH: '',
};
const defaultWindowsChrome = path.join('C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe');
const customChrome = path.join('D:\\tools', 'chrome.exe');

const existingFiles = (...files) => (candidate) => files.includes(candidate);

test('uses the browser named by CHROME_PATH when that file exists', () => {
  const browserPath = findBrowser({
    env: { ...windowsEnv, CHROME_PATH: customChrome },
    platform: 'win32',
    exists: existingFiles(customChrome, defaultWindowsChrome),
  });

  assert.equal(browserPath, customChrome);
});

test('fails naming CHROME_PATH when it points to a missing file', () => {
  assert.throws(
    () => findBrowser({
      env: { ...windowsEnv, CHROME_PATH: customChrome },
      platform: 'win32',
      exists: existingFiles(defaultWindowsChrome),
    }),
    (error) => error.message.includes('CHROME_PATH') && error.message.includes(customChrome),
  );
});

test('falls back to the default install location when CHROME_PATH is unset', () => {
  const browserPath = findBrowser({
    env: windowsEnv,
    platform: 'win32',
    exists: existingFiles(defaultWindowsChrome),
  });

  assert.equal(browserPath, defaultWindowsChrome);
});

test('falls back to PATH when no default install location exists', () => {
  const pathDirectory = path.join('C:\\portable', 'bin');
  const browserOnPath = path.join(pathDirectory, 'chrome.exe');
  const browserPath = findBrowser({
    env: { ...windowsEnv, PATH: pathDirectory },
    platform: 'win32',
    exists: existingFiles(browserOnPath),
  });

  assert.equal(browserPath, browserOnPath);
});

test('fails naming CHROME_PATH when no browser is found anywhere', () => {
  assert.throws(
    () => findBrowser({ env: windowsEnv, platform: 'win32', exists: () => false }),
    (error) => error.message.includes('CHROME_PATH'),
  );
});
