import { existsSync } from "node:fs";
import path from "node:path";

const NO_BROWSER_MESSAGE =
  "No Chrome or Chromium executable found. Install Google Chrome or set CHROME_PATH to the browser executable.";

function defaultInstallLocations(platform, env) {
  if (platform === "win32") {
    const chromeSubpath = path.join("Google", "Chrome", "Application", "chrome.exe");
    return [
      env.PROGRAMFILES && path.join(env.PROGRAMFILES, chromeSubpath),
      env["PROGRAMFILES(X86)"] && path.join(env["PROGRAMFILES(X86)"], chromeSubpath),
      env.LOCALAPPDATA && path.join(env.LOCALAPPDATA, chromeSubpath),
    ].filter(Boolean);
  }
  if (platform === "darwin") {
    return [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ];
  }
  return [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
  ];
}

function executableNamesOnPath(platform) {
  if (platform === "win32") {
    return ["chrome.exe", "chromium.exe"];
  }
  return ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome"];
}

/**
 * Locates a Chrome or Chromium executable.
 * Order: CHROME_PATH, then the default install locations, then PATH.
 */
export function findBrowser({
  env = process.env,
  platform = process.platform,
  exists = existsSync,
} = {}) {
  if (env.CHROME_PATH) {
    if (!exists(env.CHROME_PATH)) {
      throw new Error(`CHROME_PATH points to a file that does not exist: ${env.CHROME_PATH}`);
    }
    return env.CHROME_PATH;
  }

  const installed = defaultInstallLocations(platform, env).find((candidate) => exists(candidate));
  if (installed) {
    return installed;
  }

  const pathDelimiter = platform === "win32" ? ";" : path.delimiter;
  const pathDirectories = (env.PATH ?? "").split(pathDelimiter).filter(Boolean);
  for (const directory of pathDirectories) {
    for (const executableName of executableNamesOnPath(platform)) {
      const candidate = path.join(directory, executableName);
      if (exists(candidate)) {
        return candidate;
      }
    }
  }

  throw new Error(NO_BROWSER_MESSAGE);
}
