import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let server, base, directory;
before(async () => {
  directory = await mkdtemp(join(tmpdir(), "lkis-api-"));
  process.env.LKIS_DATA_FILE = join(directory, "records.json");
  process.env.LKIS_READ_TOKEN = "reader-test-token";
  process.env.LKIS_ADMIN_TOKEN = "admin-test-token";
  process.env.LKIS_REVIEW_TOKEN = "review-test-token";
  process.env.LKIS_REVIEWER_ID = "independent-test-reviewer";
  const { createLkisServer } = await import("../src/server.mjs");
  server = createLkisServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  base = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (directory) await rm(directory, { recursive: true, force: true });
});
const headers = token => ({ authorization: "Bearer " + token, "content-type": "application/json" });
const record = () => ({
  id: "lkis.api.integration-001", title: "LKIS API integration test", domain: "KNOW",
  classification: "internal", knowledge_type: "lesson",
  statement: "Only independently reviewed records enter assistant context retrieval.",
  source_refs: ["https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/562"],
  evidence_refs: ["https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/562"],
  observed_at: new Date().toISOString(), status: "proposed", owner: "knowledge-governance",
  limitations: ["Synthetic API test fixture."]
});
test("health is public but knowledge APIs require authentication", async () => {
  assert.equal((await fetch(base + "/healthz")).status, 200);
  assert.equal((await fetch(base + "/api/v1/records")).status, 401);
});
test("admin can create proposed records; independent reviewer verifies; reader retrieves cited context", async () => {
  const created = await fetch(base + "/api/v1/records", { method: "POST", headers: headers("admin-test-token"), body: JSON.stringify(record()) });
  assert.equal(created.status, 201);
  const forbidden = await fetch(base + "/api/v1/records/lkis.api.integration-001/verify", { method: "POST", headers: headers("admin-test-token") });
  assert.equal(forbidden.status, 403);
  const verified = await fetch(base + "/api/v1/records/lkis.api.integration-001/verify", { method: "POST", headers: headers("review-test-token") });
  assert.equal(verified.status, 200);
  const context = await fetch(base + "/api/v1/assistant/context?q=independently%20reviewed", { headers: headers("reader-test-token") });
  const result = await context.json();
  assert.equal(context.status, 200);
  assert.equal(result.generated_answer, false);
  assert.equal(result.records.length, 1);
  assert.ok(result.records[0].source_refs.length > 0);
});
test("reader cannot create records", async () => {
  const response = await fetch(base + "/api/v1/records", { method: "POST", headers: headers("reader-test-token"), body: JSON.stringify(record()) });
  assert.equal(response.status, 403);
});

test("reviewer cannot verify records above their classification scope", async () => {
  const restricted = { ...record(), id: "lkis.api.restricted-001", classification: "restricted" };
  const created = await fetch(base + "/api/v1/records", { method: "POST", headers: headers("admin-test-token"), body: JSON.stringify(restricted) });
  assert.equal(created.status, 201);
  const response = await fetch(base + "/api/v1/records/lkis.api.restricted-001/verify", { method: "POST", headers: headers("review-test-token") });
  assert.equal(response.status, 404);
});
