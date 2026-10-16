/**
 * LINGOassister Repair Engine — deterministic, fail-closed core.
 *
 * This module plans and records work. It never runs shell commands, deploys,
 * mutates production, or treats an attempted action as proof of success.
 * Integrations must supply authenticated evidence and enforce authorization.
 */

export const INCIDENT_STATES = Object.freeze([
  "investigating", "diagnosed", "planned", "awaiting_authorization",
  "executing", "testing", "verifying", "verified", "blocked", "failed"
]);

export const FINDING_CLASSES = Object.freeze([
  "CONFIRMED", "LIKELY", "UNKNOWN", "EXTERNAL_BLOCKER"
]);

const TERMINAL_STATES = new Set(["verified"]);
const ALLOWED_TRANSITIONS = Object.freeze({
  investigating: new Set(["diagnosed", "blocked", "failed"]),
  diagnosed: new Set(["planned", "investigating", "blocked", "failed"]),
  planned: new Set(["awaiting_authorization", "investigating", "blocked"]),
  awaiting_authorization: new Set(["executing", "planned", "blocked"]),
  executing: new Set(["testing", "blocked", "failed"]),
  testing: new Set(["verifying", "planned", "blocked", "failed"]),
  verifying: new Set(["verified", "planned", "blocked", "failed"]),
  verified: new Set(),
  blocked: new Set(["investigating"]),
  failed: new Set(["investigating"])
});

function requireText(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function isoNow(clock) {
  const value = clock();
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError("clock must return a valid date");
  return date.toISOString();
}

export function createIncident({
  id, title, goal, repository, environment = "unknown",
  productionProtected = true, createdAt = new Date().toISOString()
}) {
  const incident = {
    schemaVersion: 1,
    id: requireText(id, "id"),
    title: requireText(title, "title"),
    goal: requireText(goal, "goal"),
    repository: requireText(repository, "repository"),
    environment,
    state: "investigating",
    productionProtected: Boolean(productionProtected),
    rootCause: { classification: "UNKNOWN", statement: "Not yet established", evidenceIds: [] },
    evidence: [],
    actions: [],
    approvals: [],
    acceptance: { required: [], passed: [], independentVerifier: null },
    createdAt,
    updatedAt: createdAt
  };
  return Object.freeze(incident);
}

export function classifyFinding({ classification, statement, evidenceIds = [] }) {
  if (!FINDING_CLASSES.includes(classification)) {
    throw new TypeError(`classification must be one of: ${FINDING_CLASSES.join(", ")}`);
  }
  if (!Array.isArray(evidenceIds)) throw new TypeError("evidenceIds must be an array");
  if (classification === "CONFIRMED" && evidenceIds.length === 0) {
    throw new Error("A CONFIRMED finding requires at least one evidence ID");
  }
  if (classification === "EXTERNAL_BLOCKER" && !statement) {
    throw new Error("An EXTERNAL_BLOCKER requires a specific blocker statement");
  }
  return Object.freeze({
    classification,
    statement: requireText(statement, "statement"),
    evidenceIds: [...new Set(evidenceIds.map(id => requireText(id, "evidenceId")))]
  });
}

export function appendEvidence(incident, evidence, { clock = () => new Date() } = {}) {
  const record = {
    id: requireText(evidence.id, "evidence.id"),
    kind: requireText(evidence.kind, "evidence.kind"),
    source: requireText(evidence.source, "evidence.source"),
    observedAt: requireText(evidence.observedAt, "evidence.observedAt"),
    summary: requireText(evidence.summary, "evidence.summary"),
    correlationKey: evidence.correlationKey ? String(evidence.correlationKey) : null,
    digest: evidence.digest ? String(evidence.digest) : null,
    independentlyVerified: evidence.independentlyVerified === true,
    result: evidence.result ?? "UNKNOWN"
  };
  if (incident.evidence.some(item => item.id === record.id)) {
    throw new Error(`Duplicate evidence ID: ${record.id}`);
  }
  return {
    ...incident,
    evidence: [...incident.evidence, record],
    updatedAt: isoNow(clock)
  };
}

export function setRootCause(incident, finding, { clock = () => new Date() } = {}) {
  const evidenceIds = new Set(incident.evidence.map(item => item.id));
  for (const id of finding.evidenceIds) {
    if (!evidenceIds.has(id)) throw new Error(`Root cause references missing evidence: ${id}`);
  }
  return {
    ...incident,
    rootCause: classifyFinding(finding),
    state: finding.classification === "EXTERNAL_BLOCKER"
      ? "blocked"
      : finding.classification === "UNKNOWN" || finding.classification === "LIKELY"
        ? "investigating" : "diagnosed",
    updatedAt: isoNow(clock)
  };
}

/**
 * A diagnostic key is considered already tried only when the prior attempt is
 * recorded and the relevant context fingerprint is unchanged.
 */
export function shouldRepeatDiagnostic(incident, { diagnosticKey, contextFingerprint }) {
  requireText(diagnosticKey, "diagnosticKey");
  requireText(contextFingerprint, "contextFingerprint");
  return !incident.actions.some(action =>
    action.kind === "diagnostic" &&
    action.key === diagnosticKey &&
    action.contextFingerprint === contextFingerprint &&
    ["completed", "failed"].includes(action.outcome)
  );
}

export function recordAction(incident, action, { clock = () => new Date() } = {}) {
  const record = {
    id: requireText(action.id, "action.id"),
    kind: requireText(action.kind, "action.kind"),
    key: requireText(action.key, "action.key"),
    summary: requireText(action.summary, "action.summary"),
    contextFingerprint: requireText(action.contextFingerprint, "action.contextFingerprint"),
    outcome: action.outcome ?? "planned",
    requiresAuthorization: action.requiresAuthorization === true,
    authorizationId: action.authorizationId ?? null,
    productionImpact: action.productionImpact ?? "none",
    evidenceIds: Array.isArray(action.evidenceIds) ? [...action.evidenceIds] : []
  };
  if (incident.actions.some(item => item.id === record.id)) {
    throw new Error(`Duplicate action ID: ${record.id}`);
  }
  if (record.productionImpact !== "none" && !record.requiresAuthorization) {
    throw new Error("Any action with production impact requires explicit authorization");
  }
  if (record.outcome === "executed" && record.requiresAuthorization && !record.authorizationId) {
    throw new Error("An authorized action cannot be recorded as executed without an authorization ID");
  }
  if (record.kind === "diagnostic" && !shouldRepeatDiagnostic(incident, {
    diagnosticKey: record.key,
    contextFingerprint: record.contextFingerprint
  })) {
    throw new Error("Duplicate diagnostic blocked: no relevant context change was recorded");
  }
  return {
    ...incident,
    actions: [...incident.actions, record],
    updatedAt: isoNow(clock)
  };
}

export function transitionIncident(incident, nextState, {
  reason, authorizationId = null, clock = () => new Date()
} = {}) {
  if (!INCIDENT_STATES.includes(nextState)) throw new TypeError(`Unknown state: ${nextState}`);
  if (TERMINAL_STATES.has(incident.state)) throw new Error(`Terminal state ${incident.state} requires an explicit reopen workflow`);
  if (!ALLOWED_TRANSITIONS[incident.state]?.has(nextState)) {
    throw new Error(`Invalid incident transition: ${incident.state} -> ${nextState}`);
  }
  if (nextState === "executing") {
    if (!authorizationId || !incident.approvals.some(item => item.id === authorizationId && item.status === "approved")) {
      throw new Error("Execution blocked: a matching recorded approval is required");
    }
  }
  if (nextState === "verified" && incident.acceptance?.status !== "ACCEPTED") {
    throw new Error("Verification blocked: accepted evidence and an independent verifier are required");
  }
  return {
    ...incident,
    state: nextState,
    transitionReason: reason ? String(reason) : null,
    updatedAt: isoNow(clock)
  };
}

export function recordApproval(incident, approval, { clock = () => new Date() } = {}) {
  const record = {
    id: requireText(approval.id, "approval.id"),
    scope: requireText(approval.scope, "approval.scope"),
    approver: requireText(approval.approver, "approval.approver"),
    status: approval.status === "approved" ? "approved" : "rejected",
    approvedAt: requireText(approval.approvedAt, "approval.approvedAt")
  };
  if (incident.approvals.some(item => item.id === record.id)) {
    throw new Error(`Duplicate approval ID: ${record.id}`);
  }
  return {
    ...incident,
    approvals: [...incident.approvals, record],
    updatedAt: isoNow(clock)
  };
}

export function evaluateAcceptance(incident, {
  requiredEvidenceKinds = [],
  requiredCorrelationKey = null,
  verifierId = null
} = {}) {
  const missing = [];
  if (incident.rootCause.classification !== "CONFIRMED") missing.push("root_cause_confirmed");
  if (!verifierId) missing.push("independent_verifier");
  for (const kind of requiredEvidenceKinds) {
    const found = incident.evidence.some(item =>
      item.kind === kind &&
      item.independentlyVerified &&
      item.result === "PASS" &&
      (!requiredCorrelationKey || item.correlationKey === requiredCorrelationKey)
    );
    if (!found) missing.push(`independently_verified_evidence:${kind}`);
  }
  const passed = missing.length === 0;
  return {
    passed,
    status: passed ? "ACCEPTED" : "BLOCKED",
    missing,
    verifierId: verifierId || null,
    productionPromotionAllowed: false
  };
}

export function recordAcceptance(incident, options = {}, { clock = () => new Date() } = {}) {
  const evaluation = evaluateAcceptance(incident, options);
  return {
    ...incident,
    acceptance: {
      status: evaluation.status,
      required: [...(options.requiredEvidenceKinds ?? [])],
      passed: [...(options.requiredEvidenceKinds ?? [])].filter(kind =>
        !evaluation.missing.includes(`independently_verified_evidence:${kind}`)
      ),
      independentVerifier: evaluation.verifierId,
      missing: evaluation.missing,
      evaluatedAt: isoNow(clock),
      productionPromotionAllowed: false
    },
    updatedAt: isoNow(clock)
  };
}

/**
 * G02 acceptance predicate. Each signal must be positively evidenced; unknown,
 * missing, stale, or contradictory values fail closed.
 */
export function evaluateG02(signals = {}) {
  const predicates = [
    ["runner_id_positive", Number.isInteger(signals.runnerId) && signals.runnerId > 0],
    ["runner_name_present", typeof signals.runnerName === "string" && signals.runnerName.trim().length > 0],
    ["job_assigned", signals.jobAssigned === true],
    ["steps_instantiated", Array.isArray(signals.steps) && signals.steps.length > 0],
    ["sentinel_passed", signals.sentinelPassed === true],
    ["logs_retrievable", signals.logsRetrievable === true],
    ["artifact_retrievable", signals.artifactRetrievable === true],
    ["run_job_commit_correlated", signals.correlationVerified === true],
    ["independent_verification", signals.independentlyVerified === true]
  ];
  const missing = predicates.filter(([, passed]) => !passed).map(([name]) => name);
  return {
    gate: "G02",
    status: missing.length ? "BLOCKED" : "PASS",
    missing,
    productionPromotionAllowed: false
  };
}

/** Choose a next action without repeating a diagnostic in unchanged context. */
export function recommendNextAction(incident, candidates) {
  const eligible = candidates.filter(candidate => {
    if (candidate.requiresExternalAccess && !candidate.accessAvailable) return false;
    if (candidate.kind === "diagnostic" && !shouldRepeatDiagnostic(incident, {
      diagnosticKey: candidate.key,
      contextFingerprint: candidate.contextFingerprint
    })) return false;
    return true;
  });
  if (!eligible.length) {
    return {
      status: "BLOCKED",
      action: null,
      reason: "No safe, non-redundant action is currently available. Request new evidence or the missing external access."
    };
  }
  eligible.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
  return { status: "ACTION_AVAILABLE", action: eligible[0], reason: "Selected the highest-priority eligible action." };
}
