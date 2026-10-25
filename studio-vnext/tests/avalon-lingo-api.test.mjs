import test from "node:test";
import assert from "node:assert/strict";
import worker from "../api/worker.mjs";

const request = (path, method = "GET", body) => new Request("https://preview.invalid" + path, {
  method,
  headers: body ? { "content-type": "application/json" } : {},
  body: body ? JSON.stringify(body) : undefined
});

test("status endpoint reports explicit preview-only, fail-closed integration state", async () => {
  const response = await worker.fetch(request("/api/v1/avalon/status"));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.environment, "isolated-preview");
  assert.equal(data.releaseGate, "PROTECTED_HOLD");
  assert.equal(data.productionMutation, false);
  assert.equal(data.integrations.assistant, "NOT_CONFIGURED");
  assert.equal(data.integrations.email, "NOT_CONFIGURED");
  assert.equal(data.integrations.dns, "NOT_CONFIGURED");
  assert.equal(data.integrations.identity, "DEMO_ONLY");
});

test("assistant and email never report success without configured provider adapters", async () => {
  for (const path of ["/api/v1/avalon/assistant", "/api/v1/avalon/email/dispatch", "/api/v1/avalon/house-id"]) {
    const response = await worker.fetch(request(path, "POST", { prompt: "test" }));
    assert.equal(response.status, 503);
    const data = await response.json();
    assert.equal(data.ok, false);
    assert.equal(data.code, "INTEGRATION_NOT_CONFIGURED");
    assert.equal(data.status, "NOT_CONFIGURED");
  }
});

test("DNS diagnostic accepts only allowlisted domains and fails closed when unconfigured", async () => {
  const invalid = await worker.fetch(request("/api/v1/avalon/dns-check?domain=attacker.example"));
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).code, "DOMAIN_NOT_ALLOWLISTED");
  const valid = await worker.fetch(request("/api/v1/avalon/dns-check?domain=thelingolegacy.com"));
  assert.equal(valid.status, 503);
  assert.equal((await valid.json()).status, "NOT_CONFIGURED");
});

test("method contracts are explicit and security headers are present", async () => {
  const wrong = await worker.fetch(request("/api/v1/avalon/status", "POST", {}));
  assert.equal(wrong.status, 405);
  assert.equal(wrong.headers.get("allow"), "GET, HEAD");
  const response = await worker.fetch(request("/api/v1/avalon/status"));
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
});

test("unknown endpoints fail with JSON 404", async () => {
  const response = await worker.fetch(request("/api/v1/avalon/unknown"));
  assert.equal(response.status, 404);
  assert.equal((await response.json()).code, "NOT_FOUND");
});
