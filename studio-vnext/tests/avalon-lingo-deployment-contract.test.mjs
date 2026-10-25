import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const studioIndex = read("../index.html");
const studioAvalon = read("../avalon-lingo.html");
const deployedIndex = read("../../cloudflare/studio-assets/index.html");
const deployedAvalon = read("../../cloudflare/studio-assets/avalon-lingo.html");
const worker = read("../../cloudflare/studio-worker.js");
const wrangler = read("../../cloudflare/wrangler.toml");

test("curated Worker assets remain byte-for-byte synchronized with Studio sources", () => {
  assert.equal(deployedIndex, studioIndex);
  assert.equal(deployedAvalon, studioAvalon);
});

test("isolated Worker routes Avalon API and curated assets with a fail-closed binding check", () => {
  assert.match(worker, /import avalonApi from "\.\.\/studio-vnext\/api\/worker\.mjs"/);
  assert.match(worker, /url\.pathname\.startsWith\("\/api\/v1\/avalon\/"\)/);
  assert.match(worker, /env\.ASSETS\.fetch\(request\)/);
  assert.match(worker, /ASSET_BINDING_NOT_CONFIGURED/);
  assert.match(worker, /frame-ancestors 'none'/);
  assert.match(wrangler, /directory = "studio-assets"/);
  assert.match(wrangler, /binding = "ASSETS"/);
  assert.match(wrangler, /run_worker_first = \["\/api\/\*"\]/);
});
