import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import net from "node:net";

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", error => error ? reject(error) : resolve()));
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

test("VSM HTTP API enforces owner capabilities and records verifiable evidence", async t => {
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-api-"));
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-workspace-"));
  const port = await freePort();
  let previewPort = await freePort();
  while (previewPort === port) previewPort = await freePort();
  const token = "integration-owner-token-0123456789-abcdef";
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: path.resolve(import.meta.dirname, ".."),
    env: {
      ...process.env,
      PORT: String(port),
      PREVIEW_PORT: String(previewPort),
      HOST: "127.0.0.1",
      VSM_DATA_DIR: dataDir,
      VSM_WORKSPACE: workspace,
      VSM_OWNER_TOKEN: token,
      LINGO_ID_HANDLE: "integration-owner",
      VSM_PROBE_BASE_URL: "http://127.0.0.1:1"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  let output = "";
  child.stdout.on("data", chunk => { output += chunk.toString(); });
  child.stderr.on("data", chunk => { output += chunk.toString(); });
  t.after(async () => {
    child.kill("SIGTERM");
    await new Promise(resolve => {
      if (child.exitCode !== null) return resolve();
      child.once("exit", resolve);
      setTimeout(resolve, 1500);
    });
    await fs.rm(dataDir, { recursive: true, force: true });
    await fs.rm(workspace, { recursive: true, force: true });
  });

  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (child.exitCode !== null) break;
    try {
      const response = await fetch(base + "/api/health");
      if (response.ok) { ready = true; break; }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(ready, true, `VSM server did not become ready. Output: ${output}`);

  const denied = await fetch(base + "/api/releases", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Unauthorized draft", source: { branch: "main", commit: "abcdef1234567" }, target: "local-preview" })
  });
  assert.equal(denied.status, 403);

  const created = await fetch(base + "/api/releases", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: "Integration draft", source: { branch: "main", commit: "abcdef1234567" }, target: "local-preview" })
  });
  assert.equal(created.status, 201);
  const { release } = await created.json();
  assert.equal(release.status, "draft");

  const deniedProbe = await fetch(`${base}/api/releases/${release.id}/probe`, { method: "POST" });
  assert.equal(deniedProbe.status, 403);
  const deniedAcceptance = await fetch(`${base}/api/releases/${release.id}/accept`, { method: "POST" });
  assert.equal(deniedAcceptance.status, 403);
  const blockedAcceptance = await fetch(`${base}/api/releases/${release.id}/accept`, {
    method: "POST", headers: { authorization: `Bearer ${token}` }
  });
  assert.equal(blockedAcceptance.status, 409);
  const deniedLaneConfig = await fetch(base + "/api/sonic-boom", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ enabled: true, max_parallel_jobs: 2 })
  });
  assert.equal(deniedLaneConfig.status, 403);
  const deniedBot = await fetch(base + "/api/bots/run", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ bot_id: "lingo://id/bot-math", task: "validate_probability_input", input: { probability: 0.5 } })
  });
  assert.equal(deniedBot.status, 403);

  const attested = await fetch(`${base}/api/releases/${release.id}/gates/security`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ decision: "PASS", evidence_ref: "review-ticket-123", rationale: "Integration test evidence reviewed." })
  });
  assert.equal(attested.status, 200);
  const attestationBody = await attested.json();
  const evidenceId = attestationBody.attestation.evidence_record.id;

  const evidence = await fetch(`${base}/api/evidence/${evidenceId}`, { headers: { authorization: `Bearer ${token}` } });
  assert.equal(evidence.status, 200);
  const evidenceRecord = await evidence.json();
  assert.equal(evidenceRecord.payload.decision, "PASS");

  const deniedStudio = await fetch(base + "/api/studio/assets", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Unauthorized asset", division: "LINGO", kind: "image" })
  });
  assert.equal(deniedStudio.status, 403);

  const studioResponse = await fetch(base + "/api/studio/assets", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: "Integration concept", division: "LINGOarcade", kind: "design", rights_status: "pending_review", tags: ["integration"] })
  });
  assert.equal(studioResponse.status, 201);
  const studioBody = await studioResponse.json();
  assert.equal(studioBody.asset.status, "proposed");
  const studioList = await fetch(base + "/api/studio/assets");
  assert.equal(studioList.status, 200);
  assert.ok((await studioList.json()).assets.some(asset => asset.id === studioBody.asset.id));

  const invalidStudio = await fetch(base + "/api/studio/assets", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: "Bad rights", division: "LINGO", kind: "image", rights_status: "cleared" })
  });
  assert.equal(invalidStudio.status, 400);

  const deniedRun = await fetch(base + "/api/runs", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ config: { run_id: "api-run-denied", tracks: [] } })
  });
  assert.equal(deniedRun.status, 403);

  const productionRun = await fetch(base + "/api/runs", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ config: { run_id: "api-production-denied", run_type: "production-change", target: "production", tracks: [{ id: "deploy", criticality: "critical", steps: [] }] } })
  });
  assert.equal(productionRun.status, 423);

  const invalidMutation = await fetch(base + "/api/runs", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ config: {
      run_id: "api-bad-idempotency", target: "local", run_type: "local-validation",
      ALLOW_DESTRUCTIVE: true,
      tracks: [{ id: "mutation", criticality: "critical", steps: [{ id: "write", command: "node", args: ["-e", "process.exit(0)"], mutating: true, idempotency_key: "short" }] }]
    } })
  });
  assert.equal(invalidMutation.status, 400);

  const startedRun = await fetch(base + "/api/runs", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ config: {
      run_id: "api-local-run-001", run_type: "local-validation", target: "local",
      RUN_MAX_DURATION_MINUTES: 1, RUN_MAX_TOOL_CALLS: 10, RUN_MAX_COST_USD: 1,
      tracks: [{ id: "smoke-check", criticality: "critical", required_secrets: [], steps: [{ id: "hello", command: "node", args: ["-e", "process.stdout.write('runner-ok')"], require_nonempty_log: true }] }]
    } })
  });
  assert.equal(startedRun.status, 202);
  let runState;
  for (let attempt = 0; attempt < 60; attempt++) {
    const response = await fetch(base + "/api/runs/api-local-run-001", { headers: { authorization: `Bearer ${token}` } });
    if (response.ok) {
      runState = await response.json();
      if (runState.summary && runState.owner_notification) break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(runState?.summary?.status, "SUCCESS");
  assert.equal(runState.summary.tracks["smoke-check"].status, "SUCCESS");
  assert.equal(runState.summary.owner_notification, "SENT");
  assert.equal(runState.owner_notification.delivery, "LOCAL_OWNER_OUTBOX");
  assert.equal(runState.owner_notification.requires_human_poll, true);
  const runEvents = await fs.readFile(path.join(dataDir, "runs", "api-local-run-001", "events.jsonl"), "utf8");
  assert.ok(runEvents.includes("STARTED"));
  assert.ok(runEvents.includes("SUCCESS"));
  const auditEvents = await fs.readFile(path.join(dataDir, "audit.jsonl"), "utf8");
  assert.match(auditEvents, /run.owner-notification/);

  const unauthenticatedAudit = await fetch(base + "/api/audit/verify");
  assert.equal(unauthenticatedAudit.status, 403);
  const audit = await fetch(base + "/api/audit/verify", { headers: { authorization: `Bearer ${token}` } });
  assert.equal(audit.status, 200);
  const auditBody = await audit.json();
  assert.equal(auditBody.ok, true);
  assert.ok(auditBody.verified >= 2);

  const auditFile = path.join(dataDir, "audit.jsonl");
  const originalAudit = await fs.readFile(auditFile, "utf8");
  await fs.writeFile(auditFile, originalAudit.replace('"release.created"', '"release.forged"'));
  const tamperedAudit = await fetch(base + "/api/audit/verify", { headers: { authorization: `Bearer ${token}` } });
  assert.equal((await tamperedAudit.json()).ok, false);
});
