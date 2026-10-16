export const GATES = [
  { id: "G00", name: "Source authority", status: "PASS" },
  { id: "G01", name: "Repository integrity", status: "PASS" },
  { id: "G02", name: "Runner dispatch", status: "BLOCKED" },
  { id: "G03", name: "CI execution", status: "BLOCKED" },
  { id: "G04", name: "Certification", status: "BLOCKED" },
  { id: "G05", name: "Release candidate", status: "BLOCKED" },
  { id: "G06", name: "Deployment", status: "BLOCKED" },
  { id: "G07", name: "Live validation", status: "BLOCKED" },
  { id: "G08", name: "Synchronization", status: "BLOCKED" },
  { id: "G09", name: "Activation", status: "BLOCKED" },
  { id: "G10", name: "Post-activation", status: "BLOCKED" },
  { id: "G11", name: "Acceptance", status: "BLOCKED" }
];

export const G02_PREDICATES = [
  ["P1", "Matching runner exists"],
  ["P2", "Runner ID greater than zero"],
  ["P3", "Runner name populated and matches"],
  ["P4", "Job assigned to runner"],
  ["P5", "Steps instantiated"],
  ["P6", "Sentinel steps executed"],
  ["P7", "Job logs generated"],
  ["P8", "Job logs retrievable"],
  ["P9", "Artifact independently verified"]
];

export function parseEvidenceJson(text) {
  let packet;
  try {
    packet = JSON.parse(text);
  } catch {
    return { ok: false, error: "File is not valid JSON." };
  }
  if (!packet || typeof packet !== "object" || Array.isArray(packet)) {
    return { ok: false, error: "Evidence packet must be a JSON object." };
  }
  const keys = Object.keys(packet);
  if (keys.length === 0) return { ok: false, error: "Evidence packet is empty." };
  return { ok: true, packet };
}

export async function sha256Hex(bytes) {
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    throw new Error("Web Crypto SHA-256 is unavailable in this context. Use HTTPS or localhost.");
  }
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export function parseSha256Manifest(text) {
  const match = String(text).trim().match(/^([a-fA-F0-9]{64})(?:\s+\*?[^\r\n]+)?$/);
  return match ? match[1].toLowerCase() : null;
}

export function summarizeEvidence(packet) {
  const obs = Array.isArray(packet.observations) ? packet.observations : [];
  const runner = packet.working_runner_evidence || packet.runner || {};
  const gate = packet.interpretation || {};
  const runs = obs.map(item => ({
    workflow: typeof item.workflow === "string" ? item.workflow : "Unknown workflow",
    run_id: item.run_id ?? null,
    status: item.run_status || item.status || "UNKNOWN",
    conclusion: item.run_conclusion || item.conclusion || "UNKNOWN",
    runner_id: item.runner_id ?? item.runner?.id ?? null,
    runner_name: item.runner_name ?? item.runner?.name ?? null,
    step_count: Array.isArray(item.steps_endpoint_result) ? item.steps_endpoint_result.length :
      (Array.isArray(item.steps) ? item.steps.length : null),
    artifact_count: Array.isArray(item.artifacts_endpoint_result) ? item.artifacts_endpoint_result.length :
      (Array.isArray(item.artifacts) ? item.artifacts.length : null),
    log_result: item.logs_retrieval?.result || item.logs_result || "UNKNOWN"
  }));
  const assigned = runs.some(item => Number(item.runner_id) > 0 && typeof item.runner_name === "string" && item.runner_name.trim().length > 0);
  const executed = runs.some(item => Number(item.step_count) > 0);
  const artifacts = runs.some(item => Number(item.artifact_count) > 0);
  return {
    captured_at_utc: packet.captured_at_utc || packet.captured_at || "UNKNOWN",
    source_sha: packet.pr?.head_sha || packet.source_sha || "UNKNOWN",
    declared_g02: gate.g02 || gate.G02 || "UNKNOWN",
    runner_evidence_available: runner.available === true,
    run_count: runs.length,
    runs,
    derived: {
      runner_assignment_observed: assigned,
      executed_steps_observed: executed,
      artifacts_observed: artifacts,
      can_claim_g02_pass: false
    }
  };
}

export function getGateDisplayStatus(status) {
  const value = String(status || "").toUpperCase();
  if (value === "PASS") return "PASS";
  if (value === "FAIL") return "FAIL";
  return "BLOCKED";
}