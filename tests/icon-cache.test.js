import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { downloadText, fetchIcons, iconCacheDirectory } from '../skills/excalidraw-diagram/scripts/icon_cache.js';

const LUCIDE_SVG = '<!-- @license lucide-static v1.61.0 - ISC -->\n<svg width="24" height="24"></svg>';

function temporaryCache() {
  return mkdtempSync(join(tmpdir(), 'icon-cache-'));
}

test('fetchIcons stores each requested icon under <set>@<version>/<name>.svg and returns the paths', async () => {
  const cacheDirectory = temporaryCache();
  const requestedUrls = [];
  const download = async (url) => {
    requestedUrls.push(url);
    return LUCIDE_SVG;
  };

  const paths = await fetchIcons({ set: 'lucide', names: ['database', 'server'], cacheDirectory, download });

  assert.deepEqual(paths, [
    join(cacheDirectory, 'lucide@1.61.0', 'database.svg'),
    join(cacheDirectory, 'lucide@1.61.0', 'server.svg'),
  ]);
  assert.equal(readFileSync(paths[0], 'utf8'), LUCIDE_SVG);
  assert.deepEqual(requestedUrls, [
    'https://cdn.jsdelivr.net/npm/lucide-static@1.61.0/icons/database.svg',
    'https://cdn.jsdelivr.net/npm/lucide-static@1.61.0/icons/server.svg',
  ]);
});

test('fetchIcons pins Simple Icons to its own version and package', async () => {
  const requestedUrls = [];
  const download = async (url) => {
    requestedUrls.push(url);
    return '<svg viewBox="0 0 24 24"></svg>';
  };

  const [path] = await fetchIcons({ set: 'simple-icons', names: ['redis'], cacheDirectory: temporaryCache(), download });

  assert.match(path, /simple-icons@16\.35\.0/);
  assert.deepEqual(requestedUrls, ['https://cdn.jsdelivr.net/npm/simple-icons@16.35.0/icons/redis.svg']);
});

test('fetchIcons does not download an icon that is already cached', async () => {
  const cacheDirectory = temporaryCache();
  let downloads = 0;
  const download = async () => {
    downloads += 1;
    return LUCIDE_SVG;
  };

  await fetchIcons({ set: 'lucide', names: ['database'], cacheDirectory, download });
  await fetchIcons({ set: 'lucide', names: ['database'], cacheDirectory, download });

  assert.equal(downloads, 1);
});

test('fetchIcons rejects an unknown set before downloading anything', async () => {
  const download = async () => assert.fail('must not download');

  await assert.rejects(
    fetchIcons({ set: 'aws', names: ['lambda'], cacheDirectory: temporaryCache(), download }),
    /unknown icon set "aws".*lucide.*simple-icons/i,
  );
});

test('fetchIcons rejects a name that could leave the cache folder', async () => {
  const download = async () => assert.fail('must not download');

  await assert.rejects(
    fetchIcons({ set: 'lucide', names: ['../escape'], cacheDirectory: temporaryCache(), download }),
    /invalid icon name/i,
  );
});

test('a failed download stores nothing and names the icon', async () => {
  const cacheDirectory = temporaryCache();
  const download = async () => {
    throw new Error('HTTP 404');
  };

  await assert.rejects(
    fetchIcons({ set: 'lucide', names: ['nope'], cacheDirectory, download }),
    /nope.*HTTP 404/,
  );
  assert.equal(existsSync(join(cacheDirectory, 'lucide@1.61.0', 'nope.svg')), false);
});

test('the cache lives outside the repository and an environment variable overrides it', () => {
  assert.equal(iconCacheDirectory({ EXCALIDRAW_ICON_CACHE: '/custom/cache' }), '/custom/cache');
  const defaultDirectory = iconCacheDirectory({ LOCALAPPDATA: 'C:\\Users\\me\\AppData\\Local' });
  assert.match(defaultDirectory, /excalidraw-design-diagrams/);
  assert.ok(defaultDirectory.startsWith('C:\\Users\\me\\AppData\\Local'));
});

test('downloadText gets a real icon over the network (opt in with ICON_NETWORK_TESTS=1)', {
  skip: process.env.ICON_NETWORK_TESTS !== '1' && 'set ICON_NETWORK_TESTS=1 to run',
}, async () => {
  const text = await downloadText('https://cdn.jsdelivr.net/npm/lucide-static@1.61.0/icons/database.svg');

  assert.match(text, /@license lucide-static/);
  assert.match(text, /<svg/);
});
