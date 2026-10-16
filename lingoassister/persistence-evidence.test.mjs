import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { IncidentStore } from "./incident-store.mjs";
import { createGitHubEvidenceAdapter } from "./github-evidence-adapter.mjs";
async function withTemp(fn) { const dir = await mkdtemp(join(tmpdir(), "lingoassister-")); try { await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); } }

test("journal persists ordered records across store instances", async () => withTemp(async dir => {
  const path = join(dir, "incidents.jsonl"), store = new IncidentStore(path);
  assert.deepEqual(await store.readAll(), []);
  await store.append({ id: "INC-1", state: "investigating" });
  await store.append({ id: "INC-1", state: "blocked" });
  assert.deepEqual(await new IncidentStore(path).readAll(), [{ id: "INC-1", state: "investigating" }, { id: "INC-1", state: "blocked" }]);
}));
test("journal detects payload tampering", async () => withTemp(async dir => {
  const path = join(dir, "incidents.jsonl"); await new IncidentStore(path).append({ id: "INC-1", state: "investigating" });
  await writeFile(path, (await readFile(path, "utf8")).replace("investigating", "verified"));
  await assert.rejects(() => new IncidentStore(path).readAll(), /Digest mismatch/);
}));
test("journal rejects incomplete trailing records", async () => withTemp(async dir => {
  const path = join(dir, "incidents.jsonl"); await new IncidentStore(path).append({ id: "INC-1" });
  await writeFile(path, (await readFile(path, "utf8")) + '{"partial":');
  await assert.rejects(() => new IncidentStore(path).readAll(), /incomplete trailing record/);
}));
test("journal rejects invalid payloads", async () => withTemp(async dir => {
  await assert.rejects(() => new IncidentStore(join(dir, "x.jsonl")).append(null), /payload must be an object/);
}));
test("GitHub adapter uses GET and correlates repository plus commit", async () => {
  const calls = [], sha = "a".repeat(40);
  const adapter = createGitHubEvidenceAdapter({ fetchImpl: async (url, options) => {
    calls.push({ url: String(url), options });
    return { ok: true, status: 200, json: async () => ({ id: 123, name: "Static CI", status: "completed", conclusion: "failure", head_sha: sha, html_url: "https://github.com/acme/repo/actions/runs/123", repository: { full_name: "acme/repo" } }) };
  }});
  const e = await adapter.collectWorkflowRun({ repository: "acme/repo", runId: 123, expectedCommit: sha });
  assert.equal(calls.length, 1); assert.equal(calls[0].options.method, "GET");
  assert.equal(calls[0].url, "https://api.github.com/repos/acme/repo/actions/runs/123");
  assert.deepEqual(e.correlation, { repositoryMatches: true, commitMatches: true, verified: true });
  assert.equal(e.independentlyVerified, false); assert.equal(e.accepted, false); assert.equal(e.conclusion, "failure");
});
test("GitHub adapter flags mismatched commit and does not accept evidence", async () => {
  const adapter = createGitHubEvidenceAdapter({ fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ id: 7, head_sha: "b".repeat(40), repository: { full_name: "acme/repo" } }) }) });
  const e = await adapter.collectWorkflowRun({ repository: "acme/repo", runId: 7, expectedCommit: "a".repeat(40) });
  assert.equal(e.correlation.commitMatches, false); assert.equal(e.correlation.verified, false); assert.equal(e.accepted, false);
});
test("GitHub adapter fails closed on HTTP errors", async () => {
  const adapter = createGitHubEvidenceAdapter({ fetchImpl: async () => ({ ok: false, status: 404 }) });
  await assert.rejects(() => adapter.collectWorkflowRun({ repository: "acme/repo", runId: 7, expectedCommit: "a".repeat(40) }), /HTTP 404/);
});
test("GitHub adapter validates inputs before network access", async () => {
  const adapter = createGitHubEvidenceAdapter({ fetchImpl: async () => { throw new Error("fetch must not be called"); } });
  await assert.rejects(() => adapter.collectWorkflowRun({ repository: "bad", runId: 1, expectedCommit: "a".repeat(40) }), /owner\/name/);
  await assert.rejects(() => adapter.collectWorkflowRun({ repository: "acme/repo", runId: 0, expectedCommit: "a".repeat(40) }), /positive integer/);
  await assert.rejects(() => adapter.collectWorkflowRun({ repository: "acme/repo", runId: 1, expectedCommit: "abc" }), /full 40-character SHA/);
});

test("journal resumes sequence and hash chain after reopening", async () => withTemp(async dir => {
  const path = join(dir, "incidents.jsonl");
  await new IncidentStore(path).append({ id: "INC-1", revision: 1 });
  await new IncidentStore(path).append({ id: "INC-1", revision: 2 });
  const records = await new IncidentStore(path).readAll();
  assert.deepEqual(records.map(record => record.revision), [1, 2]);
  const third = await new IncidentStore(path).append({ id: "INC-1", revision: 3 });
  assert.equal(third.sequence, 3);
  assert.deepEqual((await new IncidentStore(path).readAll()).map(record => record.revision), [1, 2, 3]);
}));
test("journal refuses a second writer while the exclusive lock exists", async () => withTemp(async dir => {
  const path = join(dir, "incidents.jsonl");
  const store = new IncidentStore(path);
  await writeFile(path + ".lock", "held by another writer", { flag: "wx" });
  await assert.rejects(() => store.append({ id: "INC-1" }), /Concurrent writer blocked/);
  assert.deepEqual(await store.readAll(), []);
}));

test("GitHub adapter marks stale and missing source timestamps without accepting evidence", async () => {
  const now = new Date("2026-10-16T12:00:00.000Z");
  const make = updated_at => createGitHubEvidenceAdapter({
    clock: () => now, maxAgeMs: 60_000,
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({
      id: 7, workflow_id: 3, run_number: 9, run_attempt: 2,
      name: "Static CI", status: "completed", conclusion: "failure",
      head_sha: "a".repeat(40), updated_at,
      html_url: "https://github.com/acme/repo/actions/runs/7",
      repository: { full_name: "acme/repo" }, head_repository: { full_name: "acme/repo" }
    }) })
  });
  const stale = await make("2026-10-16T11:00:00.000Z").collectWorkflowRun({
    repository: "acme/repo", runId: 7, expectedCommit: "a".repeat(40)
  });
  assert.equal(stale.freshness, "STALE");
  assert.equal(stale.runAttempt, 2);
  assert.equal(stale.retrieval.outcome, "SUCCESS");
  assert.equal(stale.accepted, false);
  const unknown = await make(undefined).collectWorkflowRun({
    repository: "acme/repo", runId: 7, expectedCommit: "a".repeat(40)
  });
  assert.equal(unknown.freshness, "UNKNOWN");
});
test("GitHub adapter rejects malformed response objects and mismatched returned run IDs", async () => {
  const make = body => createGitHubEvidenceAdapter({
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => body })
  });
  await assert.rejects(() => make([]).collectWorkflowRun({
    repository: "acme/repo", runId: 7, expectedCommit: "a".repeat(40)
  }), /JSON object/);
  const mismatched = await make({ id: 8, head_sha: "a".repeat(40), repository: { full_name: "acme/repo" } }).collectWorkflowRun({
    repository: "acme/repo", runId: 7, expectedCommit: "a".repeat(40)
  });
  assert.equal(mismatched.runIdMatches, false);
  assert.equal(mismatched.correlation.verified, false);
  assert.equal(mismatched.accepted, false);
});
test("GitHub adapter rejects non-GitHub run URLs and records failed correlation", async () => {
  const adapter = createGitHubEvidenceAdapter({
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({
      id: 7, head_sha: "a".repeat(40), html_url: "https://evil.example/run",
      repository: { full_name: "other/repo" }, updated_at: "not-a-date"
    }) })
  });
  const e = await adapter.collectWorkflowRun({ repository: "acme/repo", runId: 7, expectedCommit: "a".repeat(40) });
  assert.equal(e.runUrl, null);
  assert.equal(e.correlation.repositoryMatches, false);
  assert.equal(e.correlation.verified, false);
  assert.equal(e.freshness, "UNKNOWN");
  assert.equal(e.accepted, false);
});
