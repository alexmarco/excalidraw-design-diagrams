import https from 'node:https';
import tls from 'node:tls';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Each set is an npm package pinned to an exact version and served per icon by jsDelivr.
const SOURCES = {
  lucide: { packageName: 'lucide-static', version: '1.61.0' },
  'simple-icons': { packageName: 'simple-icons', version: '16.35.0' },
};

const VALID_NAME = /^[a-z0-9][a-z0-9-]*$/;

// The per-user cache folder, outside any repository. EXCALIDRAW_ICON_CACHE overrides it.
export function iconCacheDirectory(env = process.env) {
  if (env.EXCALIDRAW_ICON_CACHE) return env.EXCALIDRAW_ICON_CACHE;
  const baseDirectory = env.LOCALAPPDATA ?? env.XDG_CACHE_HOME ?? join(homedir(), '.cache');
  return join(baseDirectory, 'excalidraw-design-diagrams', 'icons');
}

// Plain HTTPS GET that also trusts the operating system's certificate store, which Node's fetch
// does not by default (it fails behind corporate proxies and on some Windows machines).
export function downloadText(url) {
  const ca = [...tls.getCACertificates('default'), ...tls.getCACertificates('system')];
  return new Promise((resolve, reject) => {
    https.get(url, { ca }, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode} from ${url}`));
        return;
      }
      response.setEncoding('utf8');
      let body = '';
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

// Downloads the named icons into <cacheDirectory>/<set>@<version>/<name>.svg, skipping the ones already
// there, and returns their paths. `download` is injectable so tests need no network.
export async function fetchIcons({ set, names, cacheDirectory, download = downloadText }) {
  const source = SOURCES[set];
  if (!source) throw new Error(`unknown icon set "${set}"; use ${Object.keys(SOURCES).join(' or ')}`);
  for (const name of names) {
    if (!VALID_NAME.test(name)) throw new Error(`invalid icon name "${name}"`);
  }
  const setDirectory = join(cacheDirectory, `${set}@${source.version}`);
  await mkdir(setDirectory, { recursive: true });
  const paths = [];
  for (const name of names) {
    const path = join(setDirectory, `${name}.svg`);
    const cached = await access(path).then(() => true, () => false);
    if (!cached) {
      const url = `https://cdn.jsdelivr.net/npm/${source.packageName}@${source.version}/icons/${name}.svg`;
      const svgText = await download(url).catch((error) => {
        throw new Error(`${set}/${name}: ${error.message}`);
      });
      await writeFile(path, svgText);
    }
    paths.push(path);
  }
  return paths;
}
