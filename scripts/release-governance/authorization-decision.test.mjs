import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { evaluateAuthorization } from "./authorization-decision.mjs";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const policyPath = "../../config/release/cross-stack-authorization-policy.json";
const registryPath = "../../config/release/surface-matrix.registry.json";

async function fixture() {
  const policy = await readJson(policyPath);
  const registry = await readJson(registryPath);
  policy.status = "ACTIVE";
  policy.productionPromotionEnabledByThisPolicy = true;
  registry.status = "ACCEPTED";
  registry.surfaces = registry.surfaces.map((surface) => ({
    ...surface,
    status: "ACCEPTED",
    owner: "release-platform",
    environment: "production",
    deploymentTarget: "test-deployment-target",
    dependencies: "test-dependencies"
  }));
  const commitSha = "a".repeat(40);
  const artifactDigest = `sha256:${"b".repeat(64)}`;
  const release = {
    commitSha,
    artifactDigest,
    releaseCandidate: "RC-test-001",
    environment: "production",
    surfaceIds: [registry.surfaces[0].surfaceId],
    osTargets: ["supported-browsers"],
    independentVerifierId: "verifier-1",
    gates: {}
  };
  for (const gate of Object.keys(policy.requiredGates)) {
    release.gates[gate] = {
      status: "PASS",
      evidence: {
        uri: `https://evidence.example.test/${gate}`,
        commitSha,
        artifactDigest,
        environment: "production",
        verifiedBy: "verifier-1",
        verifiedAt: "2026-10-26T12:00:00.000Z"
      }
    };
  }
  release.gates.G02.runnerEvidence = {
    runnerId: 17,
    runnerName: "lingo-legacy-g02",
    jobAssigned: true,
    stepsInstantiated: true,
    sentinelExecuted: true,
    logsRetrievable: true,
    runId: 12345,
    runAttempt: 1,
    commitSha,
    artifactDigest
  };
  return { policy, registry, release };
}

test("design policy and unreconciled registry never authorize production", async () => {
  const policy = await readJson(policyPath);
  const registry = await readJson(registryPath);
  const { release } = await fixture();
  const result = evaluateAuthorization({ policy, registry, release });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("surface-registry-not-accepted"));
  assert.ok(result.reasons.includes("authorization-policy-not-active-for-production") === false);
});

test("complete evidence cannot activate the checked-in design-only policy", async () => {
  const context = await fixture();
  context.policy.status = "DESIGN_NOT_ACTIVE_AUTHORIZATION";
  context.policy.productionPromotionEnabledByThisPolicy = false;
  const result = evaluateAuthorization(context);
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("authorization-policy-not-active-for-production"));
});

test("missing gate evidence fails closed", async () => {
  const context = await fixture();
  delete context.release.gates.G04;
  const result = evaluateAuthorization(context);
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.some((reason) => reason.includes("G04")));
});

test("evidence bound to a different artifact fails closed", async () => {
  const context = await fixture();
  context.release.gates.G03.evidence.artifactDigest = `sha256:${"c".repeat(64)}`;
  const result = evaluateAuthorization(context);
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("gate-evidence-invalid-or-unbound:G03"));
});

test("G02 runner ID zero or missing execution evidence fails closed", async () => {
  const context = await fixture();
  context.release.gates.G02.runnerEvidence.runnerId = 0;
  const result = evaluateAuthorization(context);
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("g02-runtime-evidence-incomplete"));
});

test("complete evidence without explicit approval is only eligible for approval", async () => {
  const context = await fixture();
  const result = evaluateAuthorization(context);
  assert.equal(result.decision, "ELIGIBLE_FOR_APPROVAL");
  assert.ok(result.reasons.includes("explicit-independent-scope-bound-approval-required"));
});

test("approval for a different artifact can never authorize the release", async () => {
  const context = await fixture();
  context.release.approval = {
    explicit: true,
    approverId: "approver-2",
    reason: "Approve candidate",
    approvedAt: "2026-10-26T12:30:00.000Z",
    commitSha: context.release.commitSha,
    artifactDigest: `sha256:${"c".repeat(64)}`,
    releaseCandidate: context.release.releaseCandidate,
    environment: context.release.environment
  };
  const result = evaluateAuthorization(context);
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("approval-invalid-or-not-bound-to-exact-release-scope"));
});

test("exact-scope explicit approval is required even after technical gates pass", async () => {
  const context = await fixture();
  context.release.approval = {
    explicit: true,
    approverId: "approver-2",
    reason: "Independent approval for exact release candidate",
    approvedAt: "2026-10-26T12:30:00.000Z",
    commitSha: context.release.commitSha,
    artifactDigest: context.release.artifactDigest,
    releaseCandidate: context.release.releaseCandidate,
    environment: context.release.environment
  };
  assert.equal(evaluateAuthorization(context).decision, "AUTHORIZED");
});
