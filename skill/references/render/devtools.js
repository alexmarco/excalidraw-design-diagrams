import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const LAUNCH_TIMEOUT_MS = 20_000;
const DEVTOOLS_ENDPOINT_LINE = /DevTools listening on (ws:\/\/\S+)/;

function readDevToolsEndpoint(child) {
  return new Promise((resolve, reject) => {
    let stderr = "";
    let settled = false;
    const settle = (error, endpoint) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      if (error) {
        reject(error);
      } else {
        resolve(endpoint);
      }
    };
    const timer = setTimeout(
      () => settle(new Error(`Chrome did not report a DevTools endpoint within ${LAUNCH_TIMEOUT_MS} ms`)),
      LAUNCH_TIMEOUT_MS,
    );

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      const match = DEVTOOLS_ENDPOINT_LINE.exec(stderr);
      if (match) {
        settle(null, match[1]);
      }
    });
    child.once("error", (error) => settle(error));
    child.once("exit", (code) => settle(new Error(`Chrome exited with code ${code} before it started:\n${stderr}`)));
  });
}

function openSocket(endpoint) {
  const socket = new WebSocket(endpoint);
  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve(socket), { once: true });
    socket.addEventListener(
      "error",
      () => reject(new Error(`Could not connect to Chrome DevTools at ${endpoint}`)),
      { once: true },
    );
  });
}

function createCommandClient(socket) {
  let nextId = 1;
  const pending = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const request = pending.get(message.id);
    if (!request) {
      return;
    }
    pending.delete(message.id);
    if (message.error) {
      request.reject(new Error(`${request.method} failed: ${message.error.message}`));
    } else {
      request.resolve(message.result);
    }
  });

  return {
    send(method, params = {}, sessionId) {
      const id = nextId++;
      const response = new Promise((resolve, reject) => pending.set(id, { method, resolve, reject }));
      socket.send(JSON.stringify({ id, method, params, sessionId }));
      return response;
    },
  };
}

/**
 * Starts a headless Chrome that exposes the DevTools protocol on a random local port,
 * and opens one blank page to run scripts in.
 */
export async function launchBrowser(browserPath) {
  const userDataDirectory = await mkdtemp(path.join(tmpdir(), "excalidraw-chrome-"));
  const child = spawn(
    browserPath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDirectory}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  const exited = new Promise((resolve) => child.once("exit", resolve));

  let socket;
  let client;
  let sessionId;
  try {
    const endpoint = await readDevToolsEndpoint(child);
    socket = await openSocket(endpoint);
    client = createCommandClient(socket);
    const { targetId } = await client.send("Target.createTarget", { url: "about:blank" });
    ({ sessionId } = await client.send("Target.attachToTarget", { targetId, flatten: true }));
  } catch (error) {
    socket?.close();
    child.kill();
    await exited;
    await rm(userDataDirectory, { recursive: true, force: true, maxRetries: 5 });
    throw error;
  }

  return {
    /** Runs a script in the page and resolves with its (awaited) JSON-serializable value. */
    async evaluate(expression) {
      const { result, exceptionDetails } = await client.send(
        "Runtime.evaluate",
        { expression, awaitPromise: true, returnByValue: true },
        sessionId,
      );
      if (exceptionDetails) {
        throw new Error(`Browser script failed: ${exceptionDetails.exception?.description ?? exceptionDetails.text}`);
      }
      return result.value;
    },
    async close() {
      socket.close();
      child.kill();
      await exited;
      await rm(userDataDirectory, { recursive: true, force: true, maxRetries: 5 });
    },
  };
}
