import test from "node:test";
import assert from "node:assert/strict";
import worker from "../../cloudflare/studio-worker.js";

async function request(path, env = {}) {
  const response = await worker.fetch(new Request("https://launch.thelingolegacy.com" + path, {
    headers: { accept: "application/json" }
  }), env);
  const contentType = response.headers.get("content-type") || "";
  let body = null;
  if (contentType.includes("application/json")) body = await response.json();
  return { response, contentType, body };
}

test("health route returns a timestamped staging JSON contract", async () => {
  const { response, contentType, body } = await request("/api/health");
  assert.equal(response.status, 200);
  assert.match(contentType, /application\/json/);
  assert.equal(body.status, "healthy");
  assert.equal(body.service, "studio-preview");
  assert.equal(body.environment, "staging");
  assert.ok(Number.isFinite(Date.parse(body.timestamp)));
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
});

test("runtime route identifies staging and keeps sensitive integrations disabled", async () => {
  const { response, contentType, body } = await request("/api/v1/runtime", { BUILD_SHA: "test-commit-sha" });
  assert.equal(response.status, 200);
  assert.match(contentType, /application\/json/);
  assert.equal(body.environment, "staging");
  assert.equal(body.version, "test-commit-sha");
  assert.equal(body.features.production_mutations, false);
  assert.equal(body.features.firebase, false);
  assert.equal(body.features.payments, false);
  assert.equal(body.features.customer_data, false);
});

test("platform gates are explicitly staging stubs and release authorization stays closed", async () => {
  const { response, contentType, body } = await request("/api/v1/platform/gates");
  assert.equal(response.status, 200);
  assert.match(contentType, /application\/json/);
  assert.equal(body.environment, "staging");
  assert.equal(body.gates.preview_ui, true);
  assert.equal(body.gates.release_authorization, false);
  assert.equal(body.gates.production_mutations, false);
  assert.match(body.note, /not production release evidence/);
});

test("Avalon health fails closed while no live health adapter is configured", async () => {
  const { response, contentType, body } = await request("/api/v1/avalon/health");
  assert.equal(response.status, 503);
  assert.match(contentType, /application\/json/);
  assert.equal(body.avalon, "not_configured");
  assert.equal(body.status, "degraded");
});

test("unknown API routes return JSON 404, never the HTML fallback", async () => {
  const { response, contentType, body } = await request("/api/not-a-real-route");
  assert.equal(response.status, 404);
  assert.match(contentType, /application\/json/);
  assert.equal(body.code, "NOT_FOUND");
});
