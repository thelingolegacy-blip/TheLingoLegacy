export function evaluateAuthorization({ policy, registry, release, now = new Date() }) {
  const reasons = [];
  if (!policy || policy.failClosed !== true) reasons.push("policy-not-fail-closed");
  if (!registry || registry.status !== "ACCEPTED") reasons.push("surface-registry-not-accepted");
  if (!release || !/^[a-f0-9]{40}$/i.test(release.commitSha ?? "")) reasons.push("release-commit-sha-missing-or-invalid");
  if (!/^sha256:[a-f0-9]{64}$/i.test(release?.artifactDigest ?? "")) reasons.push("artifact-digest-missing-or-invalid");
  if (!release?.releaseCandidate) reasons.push("release-candidate-missing");
  if (!release?.environment) reasons.push("environment-missing");
  if (!Array.isArray(release?.surfaceIds) || release.surfaceIds.length === 0) reasons.push("surface-scope-missing");
  if (!Array.isArray(release?.osTargets) || release.osTargets.length === 0) reasons.push("os-scope-missing");

  const surfaces = new Map((registry?.surfaces ?? []).map((surface) => [surface.surfaceId, surface]));
  for (const surfaceId of release?.surfaceIds ?? []) {
    const surface = surfaces.get(surfaceId);
    if (!surface) reasons.push(`surface-not-registered:${surfaceId}`);
    else if (surface.status !== "ACCEPTED") reasons.push(`surface-not-accepted:${surfaceId}`);
    else if (surface.owner === "UNKNOWN" || surface.environment === "UNKNOWN" ||
      surface.deploymentTarget === "UNKNOWN" || surface.dependencies === "UNKNOWN") {
      reasons.push(`surface-inventory-incomplete:${surfaceId}`);
    }
  }

  const freshness = policy?.evidenceFreshness;
  if (!freshness || !(Number.isFinite(freshness.maxAgeHours) && freshness.maxAgeHours > 0) ||
    !(Number.isFinite(freshness.maxFutureSkewMinutes) && freshness.maxFutureSkewMinutes >= 0) ||
    freshness.requireTimestamp !== true) {
    reasons.push("evidence-freshness-policy-invalid");
  }

  const requiredGates = Object.keys(policy?.requiredGates ?? {});
  if (requiredGates.length !== 12 || !Array.from({ length: 12 }, (_, i) => `G${String(i).padStart(2, "0")}`).every((gate) => requiredGates.includes(gate))) {
    reasons.push("required-gate-set-invalid");
  }
  for (const gate of requiredGates) {
    const record = release?.gates?.[gate];
    if (!record || record.status !== "PASS") {
      reasons.push(`gate-not-passed:${gate}`);
      continue;
    }
    const evidence = record.evidence;
    const verifiedAtMs = Date.parse(evidence?.verifiedAt ?? "");
    const nowMs = Date.parse(now);
    const maxAgeMs = freshness?.maxAgeHours * 60 * 60 * 1000;
    const futureSkewMs = freshness?.maxFutureSkewMinutes * 60 * 1000;
    if (!evidence || evidence.commitSha !== release.commitSha ||
      evidence.artifactDigest !== release.artifactDigest ||
      evidence.environment !== release.environment ||
      !evidence.uri || !evidence.verifiedBy || evidence.verifiedBy === release?.approval?.approverId ||
      !Number.isFinite(verifiedAtMs) || !Number.isFinite(nowMs)) {
      reasons.push(`gate-evidence-invalid-or-unbound:${gate}`);
    } else if (!Number.isFinite(maxAgeMs) || !Number.isFinite(futureSkewMs) ||
      nowMs - verifiedAtMs > maxAgeMs || verifiedAtMs - nowMs > futureSkewMs) {
      reasons.push(`gate-evidence-stale-or-future-dated:${gate}`);
    }
  }

  const g02 = release?.gates?.G02?.runnerEvidence;
  if (!g02 || !(Number.isInteger(g02.runnerId) && g02.runnerId > 0) ||
    !g02.runnerName || g02.jobAssigned !== true || g02.stepsInstantiated !== true ||
    g02.sentinelExecuted !== true || g02.logsRetrievable !== true ||
    g02.runId == null || g02.runAttempt == null ||
    g02.commitSha !== release?.commitSha || g02.artifactDigest !== release?.artifactDigest) {
    reasons.push("g02-runtime-evidence-incomplete");
  }

  if (reasons.length) return { decision: "BLOCKED", reasons: [...new Set(reasons)] };

  if (policy.status !== "ACTIVE" || policy.productionPromotionEnabledByThisPolicy !== true) {
    return { decision: "BLOCKED", reasons: ["authorization-policy-not-active-for-production"] };
  }

  const approval = release?.approval;
  if (!approval) {
    return { decision: "ELIGIBLE_FOR_APPROVAL", reasons: ["explicit-independent-scope-bound-approval-required"] };
  }
  if (approval.explicit !== true || !approval.approverId || !approval.reason ||
    !approval.approvedAt || !Number.isFinite(Date.parse(approval.approvedAt)) ||
    approval.approverId === release?.independentVerifierId ||
    approval.commitSha !== release.commitSha ||
    approval.artifactDigest !== release.artifactDigest ||
    approval.releaseCandidate !== release.releaseCandidate ||
    approval.environment !== release.environment) {
    return { decision: "BLOCKED", reasons: ["approval-invalid-or-not-bound-to-exact-release-scope"] };
  }

  return { decision: "AUTHORIZED", reasons: [] };
}
