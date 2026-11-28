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

test("Sonic Boom removes an aborted run from the queue without starting it", async () => {
  await lane.configureLane({ enabled: false, max_parallel_jobs: 1, owner_priority: true });
  let releaseFirst;
  const firstGate = new Promise(resolve => { releaseFirst = resolve; });
  const first = lane.submitLaneJob({ owner: true, kind: "test:blocker", run: () => firstGate });
  assert.equal(lane.snapshot().active_jobs, 1);
  const aborter = new AbortController();
  let secondStarted = false;
  const second = lane.submitLaneJob({
    owner: true,
    kind: "test:queued-run",
    signal: aborter.signal,
    run: async () => { secondStarted = true; return "unexpected"; }
  });
  assert.equal(lane.snapshot().queued_jobs, 1);
  aborter.abort();
  await assert.rejects(second, error => error.name === "AbortError" && error.code === "ABORT_ERR");
  assert.equal(lane.snapshot().queued_jobs, 0);
  assert.equal(secondStarted, false);
  releaseFirst("first-complete");
  assert.equal(await first, "first-complete");
});

test("first LINGO bots only execute declared proposal and validation tasks", async () => {
  const worker = await import("../ai/bot-worker.mjs?test-suite");
  const proposal = await worker.executeBot({ botId: "lingo://id/bot-release", task: "prepare_release_draft", input: { title: "Phase 1 package", commit: "abcdef1234567", branch: "main", target: "local-preview" } });
  assert.equal(proposal.type, "release_draft_proposal");
  assert.equal(proposal.mutation_performed, false);
  const math = await worker.executeBot({ botId: "lingo://id/bot-math", task: "validate_probability_input", input: { probability: 0.25 } });
  assert.equal(math.percent, 25);
  const distribution = await worker.executeBot({ botId: "lingo://id/bot-math", task: "evaluate_virtual_distribution", input: { outcomes: [{ value: 0, probability: 0.5 }, { value: 10, probability: 0.5 }] } });
  assert.equal(distribution.expected_virtual_value, 5);
  assert.equal(distribution.monetary_wagering, false);
  await assert.rejects(() => worker.executeBot({ botId: "lingo://id/bot-release", task: "deploy_production", input: {} }));
});

test("evidence records are immutable-by-id and SHA-256 integrity checked", async () => {
  const evidence = await import("../evidence/store.mjs?test-suite");
  const ref = await evidence.writeEvidence({ releaseId: "rp-20261127-test", type: "test", payload: { checks: 4, passed: true }, createdBy: "lingo://id/test-owner" });
  const record = await evidence.readEvidence(ref.id);
  assert.equal(record.sha256, ref.sha256);
  assert.deepEqual(record.payload, { checks: 4, passed: true });
  const evidencePath = path.join(temp, "evidence", ref.id + ".json");
  const tampered = JSON.parse(await fs.readFile(evidencePath, "utf8"));
  tampered.payload.passed = false;
  await fs.writeFile(evidencePath, JSON.stringify(tampered));
  await assert.rejects(() => evidence.readEvidence(ref.id), /integrity check failed/);
  await assert.rejects(() => evidence.readEvidence("../escape"));
});

test("SAAAE policy defaults to deny and never grants production mutation", async () => {
  const policy = await import("../security/policy.mjs?test-suite");
  const owner = { id: "lingo://id/test-owner", status: "active", roles: ["owner"] };
  const operator = { id: "lingo://id/test-operator", status: "active", roles: ["operator"] };
  assert.equal(policy.authorize(owner, "release.accept.local"), true);
  assert.equal(policy.authorize(owner, "studio.propose"), true);
  assert.equal(policy.authorize(owner, "production.promote"), false);
  assert.equal(policy.authorize(operator, "release.accept.local"), false);
  assert.equal(policy.authorize({ ...owner, status: "suspended" }, "vsm.read"), false);
  assert.equal(policy.authorize(owner, "unknown.capability"), false);
  for (const capability of ["production.promote", "production.dns.write", "production.secret.rotate", "data.delete", "authority.hold.remove"]) assert.equal(policy.authorize(owner, capability), false);
  for (const capability of ["release.create", "release.probe", "release.attest", "release.accept.local", "sonic_boom.configure", "bot.invoke", "evidence.read", "audit.verify"]) assert.equal(policy.authorize(owner, capability), true);
  assert.equal(policy.authorize(operator, "release.create"), false);
  assert.equal(policy.authorize(operator, "studio.propose"), false);
  assert.equal(policy.authorize(operator, "audit.verify"), true);
});

test("math engine validates probability vectors and calculates virtual distribution statistics", async () => {
  const math = await import("../math/engine.mjs?test-suite");
  assert.equal(math.validateProbabilityVector([0.2, 0.3, 0.5]).valid, true);
  assert.equal(math.validateProbabilityVector([0.2, 0.2]).valid, false);
  const report = math.evaluateVirtualDistribution([{ value: 0, probability: 0.5 }, { value: 10, probability: 0.5 }]);
  assert.equal(report.expected_virtual_value, 5);
  assert.equal(report.variance, 25);
  assert.equal(report.monetary_wagering, false);
  assert.throws(() => math.evaluateVirtualDistribution([{ value: 1, probability: 0.4 }]), /sum to 1/);
  assert.throws(() => math.evaluateVirtualDistribution([{ value: Number.MAX_VALUE, probability: 0.5 }, { value: -Number.MAX_VALUE, probability: 0.5 }]), /numeric range/);
});

test("Studio asset registry validates ownership metadata and source references", async () => {
  const studio = await import("../studio/asset-registry.mjs?test-suite");
  const asset = await studio.createStudioAsset({
    name: "Kotton's Code character concept",
    division: "Kotton's Code",
    kind: "design",
    description: "Original character concept pending owner review.",
    tags: ["character", "concept"],
    source_uri: "repo://TheLingoLegacy/assets/kotton",
    rights_status: "owner_created",
    declared_content_sha256: "a".repeat(64)
  }, "lingo://id/test-owner");
  assert.match(asset.id, /^la-/);
  assert.equal(asset.status, "proposed");
  assert.equal(asset.rights_status, "owner_created");
  assert.equal(asset.declared_content_sha256, "a".repeat(64));
  assert.equal((await studio.listStudioAssets()).some(item => item.id === asset.id), true);
  await assert.rejects(() => studio.createStudioAsset({ name: "X", division: "IP", kind: "design" }, "lingo://id/test-owner"), /Asset name/);
  await assert.rejects(() => studio.createStudioAsset({ name: "Invalid source", division: "IP", kind: "image", source_uri: "file:///etc/passwd" }, "lingo://id/test-owner"), /HTTPS/);
  await assert.rejects(() => studio.createStudioAsset({ name: "Invalid rights", division: "IP", kind: "image", rights_status: "approved" }, "lingo://id/test-owner"), /rights_status/);
});

test("Sonic Boom refuses unsafe persisted scheduler configuration", async () => {
  await fs.writeFile(path.join(temp, "sonic-boom-lane.json"), JSON.stringify({ enabled: true, owner_priority: true, max_parallel_jobs: 99 }));
  await assert.rejects(() => lane.loadLane(), /failed validation/);
  await fs.writeFile(path.join(temp, "sonic-boom-lane.json"), JSON.stringify({ enabled: false, owner_priority: true, max_parallel_jobs: 4 }));
  assert.equal((await lane.loadLane()).enabled, false);
});
