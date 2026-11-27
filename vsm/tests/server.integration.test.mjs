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

  const unauthenticatedAudit = await fetch(base + "/api/audit/verify");
  assert.equal(unauthenticatedAudit.status, 403);
  const audit = await fetch(base + "/api/audit/verify", { headers: { authorization: `Bearer ${token}` } });
  assert.equal(audit.status, 200);
  const auditBody = await audit.json();
  assert.equal(auditBody.ok, true);
  assert.ok(auditBody.verified >= 2);
});
