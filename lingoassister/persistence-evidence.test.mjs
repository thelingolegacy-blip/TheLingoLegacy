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


test("evidence bundle correlates run, job, steps, and artifact metadata without accepting evidence", async () => {
  const sha = "c".repeat(40);
  const calls = [];
  const adapter = createGitHubEvidenceAdapter({
    clock: () => new Date("2026-10-16T12:00:00.000Z"),
    fetchImpl: async (url, options) => {
      const parsed = new URL(String(url));
      calls.push({ path: parsed.pathname, method: options.method });
      let body;
      if (parsed.pathname.endsWith("/actions/runs/11")) {
        body = {
          id: 11, workflow_id: 5, run_number: 12, run_attempt: 1,
          name: "Static CI", status: "completed", conclusion: "success",
          head_sha: sha, updated_at: "2026-10-16T11:59:00.000Z",
          html_url: "https://github.com/acme/repo/actions/runs/11",
          repository: { full_name: "acme/repo" }
        };
      } else if (parsed.pathname.endsWith("/actions/runs/11/jobs")) {
        body = { jobs: [{
          id: 22, run_id: 11, name: "validate", status: "completed",
          conclusion: "success", runner_id: 44, runner_name: "hosted-1",
          steps: [{ name: "sentinel", status: "completed", conclusion: "success", number: 1 }]
        }] };
      } else if (parsed.pathname.endsWith("/actions/runs/11/artifacts")) {
        body = { artifacts: [{ id: 33, name: "sentinel-proof", size_in_bytes: 128, expired: false }] };
      } else {
        throw new Error("Unexpected request path: " + parsed.pathname);
      }
      return { ok: true, status: 200, json: async () => body };
    }
  });
  const bundle = await adapter.collectWorkflowEvidenceBundle({
    repository: "acme/repo", runId: 11, expectedCommit: sha
  });
  assert.equal(calls.length, 3);
  assert.ok(calls.every(call => call.method === "GET"));
  assert.equal(bundle.correlation.verified, true);
  assert.equal(bundle.jobs[0].jobRunMatches, true);
  assert.equal(bundle.jobs[0].steps[0].conclusion, "success");
  assert.equal(bundle.artifacts[0].artifactId, 33);
  assert.equal(bundle.jobs[0].logs.outcome, "NOT_COLLECTED");
  assert.equal(bundle.completeness.jobLogs, "NOT_COLLECTED");
  assert.equal(bundle.independentlyVerified, false);
  assert.equal(bundle.accepted, false);
});

test("evidence bundle fails correlation when a returned job belongs to another run", async () => {
  const sha = "d".repeat(40);
  const adapter = createGitHubEvidenceAdapter({
    fetchImpl: async url => {
      const path = new URL(String(url)).pathname;
      if (path.endsWith("/actions/runs/12")) return {
        ok: true, status: 200, json: async () => ({
          id: 12, head_sha: sha, repository: { full_name: "acme/repo" },
          updated_at: "2026-10-16T11:59:00.000Z"
        })
      };
      if (path.endsWith("/actions/runs/12/jobs")) return {
        ok: true, status: 200, json: async () => ({
          jobs: [{ id: 23, run_id: 99, name: "validate", steps: [] }]
        })
      };
      if (path.endsWith("/actions/runs/12/artifacts")) return {
        ok: true, status: 200, json: async () => ({ artifacts: [] })
      };
      throw new Error("Unexpected request path: " + path);
    }
  });
  const bundle = await adapter.collectWorkflowEvidenceBundle({
    repository: "acme/repo", runId: 12, expectedCommit: sha
  });
  assert.equal(bundle.correlation.jobsCorrelated, false);
  assert.equal(bundle.correlation.verified, false);
  assert.equal(bundle.accepted, false);
});
