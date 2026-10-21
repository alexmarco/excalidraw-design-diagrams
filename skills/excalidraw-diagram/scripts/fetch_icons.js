#!/usr/bin/env node

import { fetchIcons, iconCacheDirectory } from './icon_cache.js';

const USAGE = 'Usage: node fetch_icons.js <lucide|simple-icons> <icon-name>...';

async function main(args) {
  const [set, ...names] = args;
  if (!set || names.length === 0) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  try {
    for (const path of await fetchIcons({ set, names, cacheDirectory: iconCacheDirectory() })) {
      console.log(path);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

await main(process.argv.slice(2));
