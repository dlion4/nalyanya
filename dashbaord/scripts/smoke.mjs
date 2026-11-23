/**
 * Headless render smoke test.
 *
 * Builds the dashboard (a plain, non single-file bundle) and mounts it in
 * JSDOM at a given route, then asserts the page rendered the expected
 * content and that nothing threw on the way.
 *
 *   node scripts/smoke.mjs /dashboard/obituaries "The people we carry"
 */
/* Capture Node's native queueMicrotask before jsdom's Window.js replaces
   it with a recursive version in this environment. */
const nativeQueueMicrotask = globalThis.queueMicrotask;

import { JSDOM, VirtualConsole } from "jsdom";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { performance } from "node:perf_hooks";
globalThis.performance = performance;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const route = process.argv[2] ?? "/dashboard/obituaries";
const expect = process.argv[3] ?? "The people we carry";

const assets = path.join(root, "dist-smoke", "assets");
const entry = readdirSync(assets).find((f) => f.endsWith(".js"));
if (!entry) {
  console.error("No bundle found in dist-smoke/assets — run the build first.");
  process.exit(1);
}

const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", (e) => errors.push(e));
virtualConsole.on("error", (...a) => errors.push(a.join(" ")));

const dom = new JSDOM(
  `<!doctype html><html><head></head><body><div id="root"></div></body></html>`,
  {
    url: `http://localhost:5173${route}`,
    pretendToBeVisual: true,
    runScripts: "outside-only",
    virtualConsole,
  },
);

const { window } = dom;
window.queueMicrotask =
  nativeQueueMicrotask ||
  ((cb) => Promise.resolve().then(cb));
window.scrollTo = () => {};
window.requestAnimationFrame =
  window.requestAnimationFrame ||
  ((cb) => setTimeout(() => cb(Date.now()), 16));
window.cancelAnimationFrame =
  window.cancelAnimationFrame || ((id) => clearTimeout(id));
window.scrollTo =
  window.scrollTo || (() => {});
window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  }));
window.scrollTo = () => {};
window.requestAnimationFrame = (cb) => window.setTimeout(() => cb(Date.now()), 16);
window.cancelAnimationFrame = (id) => window.clearTimeout(id);
if (!window.HTMLCanvasElement.prototype.getContext) {
  window.HTMLCanvasElement.prototype.getContext = () => null;
}
window.ResizeObserver =
  window.ResizeObserver ||
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

/* Copy only the globals React/dom libraries actually read; skip anything
   that jsdom implements recursively (performance, navigator, ...). */
Object.defineProperty(globalThis, "window", {
  configurable: true,
  enumerable: true,
  get: () => window,
});
Object.defineProperty(globalThis, "self", {
  configurable: true,
  enumerable: true,
  get: () => window,
});
globalThis.scrollTo = () => {};
globalThis.requestAnimationFrame =
  globalThis.requestAnimationFrame ||
  ((cb) => setTimeout(() => cb(Date.now()), 16));
globalThis.cancelAnimationFrame =
  globalThis.cancelAnimationFrame || ((id) => clearTimeout(id));

for (const key of [
  "document",
  "navigator",
  "location",
  "history",
  "HTMLElement",
  "Element",
  "Node",
  "Event",
  "CustomEvent",
  "MouseEvent",
  "KeyboardEvent",
  "getComputedStyle",
  "localStorage",
  "sessionStorage",
  "ResizeObserver",
  "IntersectionObserver",
  "matchMedia",
  "CSS",
  "DOMParser",
  "XMLSerializer",
  "SVGElement",
  "Image",
  "HTMLImageElement",
  "URL",
  "URLSearchParams",
  "TextEncoder",
  "TextDecoder",
  "atob",
  "btoa",
  "fetch",
  "AbortController",
  "MutationObserver",
]) {
  if (key in globalThis) continue;
  if (window[key] === undefined) continue;
  try {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      enumerable: true,
      get: () => window[key],
    });
  } catch {
    /* Some window properties refuse to be copied — harmless. */
  }
}

const style = readdirSync(assets).find((f) => f.endsWith(".css"));
if (style) {
  const css = readFileSync(path.join(assets, style), "utf8");
  const tag = window.document.createElement("style");
  tag.textContent = css;
  window.document.head.appendChild(tag);
}

await import(pathToFileURL(path.join(assets, entry)).href);

await new Promise((resolve) => window.setTimeout(resolve, 900));

const text = window.document.body.textContent ?? "";
const normalised = text.replace(/\s+/g, " ").trim();

let failed = false;
if (!normalised.includes(expect)) {
  failed = true;
  console.error(`✗ expected "${expect}" in the rendered output`);
  console.error("  got:", normalised.slice(0, 400));
} else {
  console.log(`✓ rendered "${expect}"`);
}

const fatal = errors.filter(
  (e) => !/Not implemented|Could not parse CSS|Error: Not implemented/i.test(String(e?.message ?? e)),
);
if (fatal.length) {
  failed = true;
  console.error("✗ runtime errors:");
  fatal.slice(0, 8).forEach((e) => console.error("  ", e?.stack ?? e));
} else {
  console.log("✓ no runtime errors");
}
if (errors.length > fatal.length) {
  console.log(`(filtered ${errors.length - fatal.length} benign jsdom warnings)`);
}

const size = normalised.length;
console.log(`· rendered ${size} characters of text`);
if (size < 400) {
  failed = true;
  console.error("✗ the page rendered almost nothing");
}

process.exit(failed ? 1 : 0);
