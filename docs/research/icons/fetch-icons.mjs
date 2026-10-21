// Spike prototype (issue #26): download named icons from a pinned source into a cache outside the repo.
// Usage: node fetch-icons.mjs <lucide|simple-icons> <cacheDir> <iconName>...
// Uses the built-in fetch (Node >= 22), so it needs no dependency and no `curl --ssl-no-revoke`.
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const SOURCES = {
  lucide: { packageName: "lucide-static", version: "1.61.0" },
  "simple-icons": { packageName: "simple-icons", version: "16.35.0" },
};

// Browsers draw an <svg> without width/height at 300x150, so give it the viewBox size.
function ensureIntrinsicSize(svgText) {
  if (/<svg[^>]*\swidth=/.test(svgText)) return svgText;
  const [, , , width, height] = svgText.match(/viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/);
  return svgText.replace("<svg", `<svg width="${width}" height="${height}"`);
}

const [setName, cacheDirectory, ...iconNames] = process.argv.slice(2);
const source = SOURCES[setName];
if (!source || !cacheDirectory || iconNames.length === 0) {
  console.error("Usage: node fetch-icons.mjs <lucide|simple-icons> <cacheDir> <iconName>...");
  process.exit(1);
}

const targetDirectory = path.join(cacheDirectory, `${setName}@${source.version}`);
await mkdir(targetDirectory, { recursive: true });

for (const iconName of iconNames) {
  const targetPath = path.join(targetDirectory, `${iconName}.svg`);
  const alreadyCached = await access(targetPath).then(() => true, () => false);
  if (!alreadyCached) {
    const url = `https://cdn.jsdelivr.net/npm/${source.packageName}@${source.version}/icons/${iconName}.svg`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${iconName}: HTTP ${response.status} from ${url}`);
    await writeFile(targetPath, ensureIntrinsicSize(await response.text()));
  }
  console.log(targetPath);
}
