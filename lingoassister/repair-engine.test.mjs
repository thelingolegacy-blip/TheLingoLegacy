import test from "node:test";
import assert from "node:assert/strict";
import { createLearningRecord } from "./learning-loop.mjs";
import {
  createIncident, classifyFinding, appendEvidence, setRootCause,
  shouldRepeatDiagnostic, recordAction, transitionIncident, recordApproval,
  evaluateAcceptance, recordAcceptance, evaluateG02, recommendNextAction
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

test("verification closure is blocked until acceptance is recorded", () => {
  let value = incident();
  value = appendEvidence(value, {
    id: "E-1", kind: "root-cause", source: "test-fixture",
    observedAt: "2026-10-15T19:30:00.000Z", summary: "Confirmed by fixture",
    independentlyVerified: true, result: "PASS"
  }, { clock });
  value = setRootCause(value, {
    classification: "CONFIRMED", statement: "Fixture confirms test condition", evidenceIds: ["E-1"]
  }, { clock });
  value = transitionIncident(value, "planned", { clock });
  value = transitionIncident(value, "awaiting_authorization", { clock });
  value = recordApproval(value, {
    id: "APR-VERIFY-1", scope: "test fixture only", approver: "owner",
    status: "approved", approvedAt: "2026-10-15T19:59:00.000Z"
  }, { clock });
  value = transitionIncident(value, "executing", { authorizationId: "APR-VERIFY-1", clock });
  value = transitionIncident(value, "testing", { clock });
  value = transitionIncident(value, "verifying", { clock });
  assert.throws(() => transitionIncident(value, "verified", { clock }), /accepted evidence/);
  value = recordAcceptance(value, { verifierId: "independent-reviewer" }, { clock });
  assert.equal(value.acceptance.status, "ACCEPTED");
  assert.equal(transitionIncident(value, "verified", { clock }).state, "verified");
});

test("external blocker moves incident to blocked and can be reopened for new evidence", () => {
  let value = incident();
  value = appendEvidence(value, {
    id: "E-1", kind: "dispatch-record", source: "github-connector",
    observedAt: "2026-10-15T19:30:00.000Z", summary: "Job remains unassigned",
    independentlyVerified: false, result: "UNKNOWN"
  }, { clock });
  value = setRootCause(value, {
    classification: "EXTERNAL_BLOCKER", statement: "Host inventory unavailable", evidenceIds: ["E-1"]
  }, { clock });
  assert.equal(value.state, "blocked");
  assert.equal(transitionIncident(value, "investigating", { reason: "New host evidence available", clock }).state, "investigating");
});

test("acceptance rejects a confirmed label whose cited evidence is not independently verified", () => {
  let value = appendEvidence(incident(), {
    id: "E-UNVERIFIED", kind: "root-cause", source: "untrusted-report",
    observedAt: "2026-10-15T19:30:00.000Z", summary: "Claimed cause without independent check",
    independentlyVerified: false, result: "UNKNOWN"
  }, { clock });
  value = setRootCause(value, {
    classification: "CONFIRMED", statement: "Claimed cause", evidenceIds: ["E-UNVERIFIED"]
  }, { clock });
  const result = evaluateAcceptance(value, { verifierId: "reviewer-1" });
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.missing.includes("root_cause_evidence_not_independently_verified"));
});


test("verified contextual lessons are advisory-only in next-action recommendations", () => {
  const lesson = createLearningRecord({
    id: "LESSON-G02-1", incidentId: "INC-1", classification: "verified-lesson",
    title: "Do not repeat unchanged runner probe",
    statement: "Do not repeat the same diagnostic when the context fingerprint is unchanged.",
    evidenceIds: ["E-VERIFIED-1"], sourceRefs: ["https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/209"],
    contextFingerprint: "runner:hosted|workflow:static-ci|sha:abc", outcome: "unchanged-dispatch",
    independentlyVerified: true, producerId: "lingoassister", verifierId: "lingoassisthem",
    reviewStatus: "accepted", createdAt: "2026-10-16T12:00:00Z", expiresAt: "2026-11-16T12:00:00Z"
  });
  const candidate = {
    kind: "repair", key: "inspect-dispatch", summary: "Inspect dispatch evidence",
    contextFingerprint: "runner:hosted|workflow:static-ci|sha:abc", priority: 1
  };
  const result = recommendNextAction(incident(), [candidate], {
    learningRecords: [lesson], now: "2026-10-17T00:00:00Z"
  });
  assert.equal(result.status, "ACTION_AVAILABLE");
  assert.equal(result.action.key, "inspect-dispatch");
  assert.equal(result.advisoryLessons.length, 1);
  assert.equal(result.advisoryLessons[0].id, "LESSON-G02-1");
  assert.equal(result.learningInfluencedRanking, false);
  assert.equal(result.actionAuthority, false);
  const mismatch = recommendNextAction(incident(), [candidate], {
    learningRecords: [lesson], now: "2026-10-17T00:00:00Z"
  });
  assert.equal(mismatch.advisoryLessons.length, 1);
  const otherContext = recommendNextAction(incident(), [{ ...candidate, contextFingerprint: "different-context" }], {
    learningRecords: [lesson], now: "2026-10-17T00:00:00Z"
  });
  assert.equal(otherContext.advisoryLessons.length, 0);
});
