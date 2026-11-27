import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const temp = await fs.mkdtemp(path.join(os.tmpdir(), "lingo-vsm-tests-"));
process.env.VSM_DATA_DIR = temp;
process.env.LINGO_ID_HANDLE = "test-owner";
const identity = await import("../identity/identity.mjs?test-suite");
const lane = await import("../sonic-boom/lane.mjs?test-suite");

test("LINGO ID creates a local Ed25519 owner principal and verifies signed acceptance payloads", async () => {
  const principal = await identity.ensureOwnerIdentity();
  assert.equal(principal.id, "lingo://id/test-owner");
  assert.deepEqual(principal.roles, ["owner"]);
  const envelope = await identity.signOwnerPayload({ release_id: "rp-test", accepted: true });
  assert.equal(envelope.signer, principal.id);
  assert.equal(identity.verifySignedPayload(envelope, principal.public_key), true);
  assert.equal(identity.verifySignedPayload({ ...envelope, payload: { release_id: "rp-forged", accepted: true } }, principal.public_key), false);
});

test("Sonic Boom lane defaults off and enforces bounded concurrency settings", async () => {
  const initial = await lane.loadLane();
  assert.equal(initial.enabled, false);
  await assert.rejects(() => lane.configureLane({ enabled: true, max_parallel_jobs: 99 }));
  const configured = await lane.configureLane({ enabled: true, max_parallel_jobs: 3, owner_priority: true });
  assert.equal(configured.enabled, true);
  assert.equal(configured.max_parallel_jobs, 3);
});

test("Sonic Boom scheduler resolves queued work and serializes while disabled", async () => {
  await lane.configureLane({ enabled: false, max_parallel_jobs: 3 });
  const values = await Promise.all([
    lane.submitLaneJob({ kind: "test", run: async () => "one" }),
    lane.submitLaneJob({ kind: "test", run: async () => "two" })
  ]);
  assert.deepEqual(values, ["one", "two"]);
});

test("first LINGO bots only execute declared proposal and validation tasks", async () => {
  const worker = await import("../ai/bot-worker.mjs?test-suite");
  const proposal = await worker.executeBot({ botId: "lingo://id/bot-release", task: "prepare_release_draft", input: { title: "Phase 1 package", commit: "abcdef1234567", branch: "main", target: "local-preview" } });
  assert.equal(proposal.type, "release_draft_proposal");
  assert.equal(proposal.mutation_performed, false);
  const math = await worker.executeBot({ botId: "lingo://id/bot-math", task: "validate_probability_input", input: { probability: 0.25 } });
  assert.equal(math.percent, 25);
  await assert.rejects(() => worker.executeBot({ botId: "lingo://id/bot-release", task: "deploy_production", input: {} }));
});
