import { fileURLToPath } from 'node:url';

export const RUNTIME_DEPENDENCIES = ['@excalidraw/utils', 'esbuild', 'yaml'];

const SKILL_DIRECTORY = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');

// Returns a message with the exact install command when a runtime dependency does not resolve.
export function dependencyProblem({ resolve = (name) => import.meta.resolve(name), skillDirectory = SKILL_DIRECTORY } = {}) {
  const missing = RUNTIME_DEPENDENCIES.filter((name) => {
    try {
      resolve(name);
      return false;
    } catch (error) {
      if (error.code === 'ERR_MODULE_NOT_FOUND') {
        return true;
      }
      throw error;
    }
  });
  if (missing.length === 0) {
    return undefined;
  }
  return `Missing dependencies: ${missing.join(', ')}. Install them once with:\n  npm install --omit=dev --prefix "${skillDirectory}"`;
}

// Call this before importing a module that needs the dependencies, so a fresh install fails with
// the install command instead of a module-not-found stack.
export function exitIfDependenciesMissing() {
  const problem = dependencyProblem();
  if (problem) {
    console.error(`Error: ${problem}`);
    process.exit(1);
  }
}
