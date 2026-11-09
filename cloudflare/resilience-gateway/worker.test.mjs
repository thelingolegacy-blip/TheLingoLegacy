import test from "node:test";
import assert from "node:assert/strict";
import { handleRequest } from "./worker.mjs";

const env = { CANONICAL_DOMAIN: "thelingolegacy.com" };
const request = (path, method = "GET") => new Request(`https://lingo-resilience-gateway.thelingolegacy.workers.dev${path}`, { method });

test("root serves a standalone fallback page without third-party assets", async () => {
  const response = await handleRequest(request("/"), env);
  const body = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(body, /LINGOlegacy/);
  assert.match(body, /Resilience gateway is responding/);
  assert.match(response.headers.get("content-security-policy"), /default-src 'none'/);
});

test("health endpoint reports this Worker as healthy", async () => {
  const response = await handleRequest(request("/healthz"), env);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.status, "healthy");
  assert.equal(body.service, "lingo-resilience-gateway");
});

test("readiness endpoint exposes explicit dependency-free checks", async () => {
  const response = await handleRequest(request("/readyz"), env);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, "ready");
  assert.deepEqual(body.production_dependencies, []);
  assert.equal(body.checks.external_dependencies, "none");
});

test("status and manifest are machine-readable", async () => {
  for (const path of ["/api/v1/status", "/api/v1/manifest"]) {
    const response = await handleRequest(request(path), env);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.service, "lingo-resilience-gateway");
    assert.equal(body.billing_enabled, false);
  }
});

test("unknown paths return 404 and mutation methods fail closed", async () => {
  assert.equal((await handleRequest(request("/missing"), env)).status, 404);
  const post = await handleRequest(request("/healthz", "POST"), env);
  assert.equal(post.status, 405);
  assert.equal(post.headers.get("allow"), "GET, HEAD");
});

test("HEAD returns headers without a body", async () => {
  const response = await handleRequest(request("/", "HEAD"), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
});
