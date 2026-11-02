import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(resolve(root, path), "utf8");

const architecture = JSON.parse(await read("architecture.json"));
const manifest = JSON.parse(await read("asklingo/mcp-manifest.json"));
const registry = JSON.parse(await read("cloudflare/route-registry.json"));
const worker = await read("cloudflare/worker.js");
const rules = await read("firebase/firestore.rules");
const wrangler = await read("cloudflare/wrangler.toml");
const functions = await read("firebase/functions/src/index.ts");

assert.equal(architecture.environment, "staging");
assert.equal(architecture.status, "partially-deployed-staging");
assert.equal(architecture.invariants.productionProtected, true);
assert.equal(architecture.invariants.automaticPromotion, false);
assert.equal(registry.environment, "staging");
assert.equal(registry.routes.length, 16);
assert.equal(new Set(registry.routes.map((r) => r.slug)).size, 16);
assert.equal(new Set(registry.routes.map((r) => r.appId)).size, 16);
for (const route of registry.routes) {
  assert.match(route.slug, /^[a-z0-9-]+$/);
  assert.match(route.origin, /^https:\/\/[a-z0-9-]+\.v2\.appdeploy\.ai$/);
}
assert.equal(manifest.server.endpointState, "NOT_CONFIGURED");
assert.equal(manifest.governance.productionMutation, false);
assert.ok(manifest.tools.some((tool) => tool.name === "lingo.tasks.create"));
assert.match(worker, /request\.method!==\s*"GET"&&request\.method!==\s*"HEAD"/);
assert.match(worker, /Route not registered/);
assert.match(worker, /Protected application endpoints are not proxied/);
assert.match(worker, /const ENVIRONMENT = "staging"/);
assert.match(worker, /ENVIRONMENT !== "staging"/);
assert.match(worker, /decoded\.startsWith/);
assert.match(worker, /routeCount:ROUTES\.length/);
assert.match(worker, /\/healthz/);
assert.match(rules, /allow write: if false;/);
assert.match(rules, /match \/\{document=\*\*\}/);
assert.match(rules, /studioEvidenceReviews/);
assert.match(functions, /executionStarted: false/);
assert.match(functions, /promotionAuthorized: false/);
assert.match(functions, /reviewStudioEvidence/);
assert.match(functions, /independentReviewerUid === review\?\.reviewerUid/);
assert.match(wrangler, /workers_dev = true/);
assert.doesNotMatch(wrangler, /^\s*routes\s*=/m);
assert.doesNotMatch(wrangler, /thelingolegacy\.com/);

console.log("PASS: integration package structure and fail-closed invariants validated.");
console.log("NOT RUN: Firebase emulator, public Cloudflare Worker runtime smoke tests, authenticated MCP handshake, and direct HTTP probes for all 16 origins.");
