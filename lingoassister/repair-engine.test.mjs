import test from "node:test";
import assert from "node:assert/strict";
import {
  createIncident, classifyFinding, appendEvidence, setRootCause,
  shouldRepeatDiagnostic, recordAction, transitionIncident, recordApproval,
  evaluateAcceptance, evaluateG02, recommendNextAction
} from "./repair-engine.mjs";

const clock = () => new Date("2026-10-15T20:00:00.000Z");
function incident() {
  return createIncident({
    id: "INC-1", title: "G02 runner dispatch", goal: "Establish verified runner execution",
    repository: "thelingolegacy-blip/TheLingoLegacy", environment: "staging",
    createdAt: "2026-10-15T19:00:00.000Z"
  });
}

test("new incidents default to investigation and protect production", () => {
  const value = incident();
  assert.equal(value.state, "investigating");
  assert.equal(value.productionProtected, true);
  assert.equal(value.rootCause.classification, "UNKNOWN");
});

test("confirmed findings require evidence IDs", () => {
  assert.throws(() => classifyFinding({ classification: "CONFIRMED", statement: "Runner missing" }), /requires at least one evidence ID/);
});

test("root cause cannot cite evidence that is not in the incident", () => {
  assert.throws(() => setRootCause(incident(), {
    classification: "CONFIRMED", statement: "Runner process missing", evidenceIds: ["missing"]
  }), /missing evidence/);
});

test("duplicate diagnostic is suppressed when context is unchanged", () => {
  let value = recordAction(incident(), {
    id: "ACT-1", kind: "diagnostic", key: "inspect-runner", summary: "Inspect runner state",
    contextFingerprint: "host:unknown|workflow:abc", outcome: "failed"
  }, { clock });
  assert.equal(shouldRepeatDiagnostic(value, {
    diagnosticKey: "inspect-runner", contextFingerprint: "host:unknown|workflow:abc"
  }), false);
  assert.equal(shouldRepeatDiagnostic(value, {
    diagnosticKey: "inspect-runner", contextFingerprint: "host:reported-online"
  }), true);
});

test("production-impacting action requires authorization metadata", () => {
  assert.throws(() => recordAction(incident(), {
    id: "ACT-1", kind: "repair", key: "restart-runner", summary: "Restart runner",
    contextFingerprint: "host-a", productionImpact: "production"
  }), /requires explicit authorization/);
});

test("execution transition requires an approved matching authorization", () => {
  const planned = transitionIncident(incident(), "diagnosed", { clock });
  const plan = transitionIncident(planned, "planned", { clock });
  const awaiting = transitionIncident(plan, "awaiting_authorization", { clock });
  assert.throws(() => transitionIncident(awaiting, "executing", { clock }), /approval is required/);
  const approved = recordApproval(awaiting, {
    id: "APR-1", scope: "staging runner sentinel only", approver: "owner",
    status: "approved", approvedAt: "2026-10-15T19:59:00.000Z"
  }, { clock });
  assert.equal(transitionIncident(approved, "executing", { authorizationId: "APR-1", clock }).state, "executing");
});

test("acceptance fails closed without independently verified evidence", () => {
  const result = evaluateAcceptance(incident(), {
    requiredEvidenceKinds: ["workflow-job", "job-logs"], verifierId: "reviewer-1"
  });
  assert.equal(result.status, "BLOCKED");
  assert.equal(result.productionPromotionAllowed, false);
  assert.ok(result.missing.includes("root_cause_confirmed"));
});

test("G02 fails closed for zero runner ID and missing execution evidence", () => {
  const result = evaluateG02({
    runnerId: 0, runnerName: "", jobAssigned: false, steps: [],
    sentinelPassed: false, logsRetrievable: false, artifactRetrievable: false,
    correlationVerified: false, independentlyVerified: false
  });
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.missing.includes("runner_id_positive"));
  assert.ok(result.missing.includes("steps_instantiated"));
  assert.equal(result.productionPromotionAllowed, false);
});

test("G02 passes only when every predicate is positively evidenced", () => {
  const result = evaluateG02({
    runnerId: 42, runnerName: "lingo-g02-ephemeral", jobAssigned: true,
    steps: [{ name: "sentinel", conclusion: "success" }], sentinelPassed: true,
    logsRetrievable: true, artifactRetrievable: true, correlationVerified: true,
    independentlyVerified: true
  });
  assert.equal(result.status, "PASS");
  assert.deepEqual(result.missing, []);
  assert.equal(result.productionPromotionAllowed, false);
});

test("next action avoids repeating a diagnostic and selects useful alternative", () => {
  const prior = recordAction(incident(), {
    id: "ACT-1", kind: "diagnostic", key: "inspect-runner", summary: "Inspect runner state",
    contextFingerprint: "same-state", outcome: "failed"
  }, { clock });
  const result = recommendNextAction(prior, [
    { kind: "diagnostic", key: "inspect-runner", contextFingerprint: "same-state", priority: 1 },
    { kind: "external", key: "request-host-inventory", contextFingerprint: "same-state", priority: 2, requiresExternalAccess: true, accessAvailable: false },
    { kind: "external", key: "prepare-support-evidence", contextFingerprint: "same-state", priority: 3, requiresExternalAccess: false, accessAvailable: true }
  ]);
  assert.equal(result.status, "ACTION_AVAILABLE");
  assert.equal(result.action.key, "prepare-support-evidence");
});

test("no eligible action returns a blocker instead of a repeated loop", () => {
  const prior = recordAction(incident(), {
    id: "ACT-1", kind: "diagnostic", key: "inspect-runner", summary: "Inspect runner state",
    contextFingerprint: "same-state", outcome: "completed"
  }, { clock });
  const result = recommendNextAction(prior, [
    { kind: "diagnostic", key: "inspect-runner", contextFingerprint: "same-state", priority: 1 },
    { kind: "external", key: "host-inspection", contextFingerprint: "same-state", priority: 2, requiresExternalAccess: true, accessAvailable: false }
  ]);
  assert.equal(result.status, "BLOCKED");
  assert.equal(result.action, null);
});
