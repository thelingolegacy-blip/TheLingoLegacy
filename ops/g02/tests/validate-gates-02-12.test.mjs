import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const validator = path.resolve("ops/g02/validate-gates-02-12.mjs");
const requiredEvidenceTypes = {
  "G02": [
    "host_telemetry",
    "sentinel_execution",
    "raw_logs",
    "artifact_manifest",
    "correlation_report",
    "validator_report"
  ],
  "G03": [
    "workflow_job",
    "workflow_logs",
    "required_checks_report"
  ],
  "G04": [
    "certification_report",
    "criteria_matrix"
  ],
  "G05": [
    "release_manifest",
    "build_metadata",
    "release_notes",
    "acceptance_review"
  ],
  "G06": [
    "change_approval",
    "deployment_plan",
    "rollback_plan",
    "artifact_sha_linkage"
  ],
  "G07": [
    "live_probe_response",
    "expected_status_headers",
    "independent_probe_review"
  ],
  "G08": [
    "revision_inventory",
    "configuration_drift_report",
    "checksum_reconciliation"
  ],
  "G09": [
    "activation_approval",
    "activation_record",
    "rollback_readiness"
  ],
  "G10": [
    "health_checks",
    "telemetry_window",
    "user_path_tests",
    "threshold_comparison"
  ],
  "G11": [
    "operations_owner_acceptance",
    "runbook",
    "alerting_oncall_coverage",
    "incident_rollback_procedure"
  ],
  "G12": [
    "gates_02_11_chain",
    "independent_audit",
    "final_authorization"
  ]
};
function sha256(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lingo-g02-gates-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const commit = "a".repeat(40);
  const packet = {
    schema_version: "1.0",
    packet_type: "LINGO_G02_G12_GATE_ACCEPTANCE",
    status: "EVIDENCE_COLLECTED",
    candidate: { repository: "thelingolegacy-blip/TheLingoLegacy", commit_sha: commit, environment: "non-production" },
    generated_at_utc: "2026-10-10T21:15:00Z",
    independent_verifier: { identity: "independent-reviewer", reviewed_at_utc: "2026-10-10T21:20:00Z" },
    gates: {},
    promotion: { authorized: false, authorization_reference: null, production_mutation_performed: false }
  };
  for (const [gate, types] of Object.entries(requiredEvidenceTypes)) {
    const evidence = [];
    for (const type of types) {
      const evidencePath = path.join(dir, gate + "-" + type + ".json");
      fs.writeFileSync(evidencePath, JSON.stringify({ gate, evidence_type: type, outcome: "synthetic-fixture" }) + "\n");
      evidence.push({
        evidence_type: type,
        path: evidencePath,
        sha256: sha256(evidencePath),
        source_reference: "https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/123",
        verified_by: "evidence-collector",
        verified_at_utc: "2026-10-10T21:05:00Z",
        candidate_commit_sha: commit
      });
    }
    packet.gates[gate] = { status: "ACCEPTED", evidence };
  }
  const packetPath = path.join(dir, "packet.json");
  fs.writeFileSync(packetPath, JSON.stringify(packet, null, 2) + "\n");
  return { dir, packet, packetPath };
}
function run(packetPath) { return spawnSync(process.execPath, [validator, packetPath], { encoding: "utf8" }); }

test("default gate template fails closed", () => {
  const r = run(path.resolve("docs/g02/gate-acceptance-template.json"));
  assert.equal(r.status, 2, r.stdout + "\n" + r.stderr);
  assert.match(r.stderr, /LINGO_GATE_EVALUATION=BLOCKED/);
  assert.match(r.stderr, /template, not collected evidence/i);
  assert.doesNotMatch(r.stdout + "\n" + r.stderr, /LINGO_GATE_EVALUATION=PASS/);
});
test("missing packet fails closed", () => {
  const r = run(path.resolve("missing-gate-packet.json"));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /LINGO_GATE_EVALUATION=BLOCKED/);
  assert.doesNotMatch(r.stdout + "\n" + r.stderr, /LINGO_GATE_EVALUATION=PASS/);
});
test("synthetic packet with every gate-specific evidence type passes structural and hash checks", t => {
  const f = fixture(t);
  const r = run(f.packetPath);
  assert.equal(r.status, 0, r.stdout + "\n" + r.stderr);
  assert.match(r.stdout, /LINGO_GATE_EVALUATION=PASS/);
  assert.match(r.stdout, /STRUCTURALLY_VALIDATED/);
});
test("candidate SHA mismatch fails closed", t => {
  const f = fixture(t);
  f.packet.gates.G02.evidence[0].candidate_commit_sha = "b".repeat(40);
  fs.writeFileSync(f.packetPath, JSON.stringify(f.packet));
  const r = run(f.packetPath);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /candidate SHA does not match/i);
});
test("tampered evidence file fails hash verification", t => {
  const f = fixture(t);
  fs.appendFileSync(f.packet.gates.G02.evidence[0].path, "tampered\n");
  const r = run(f.packetPath);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /SHA-256 mismatch/i);
});
test("evidence verifier cannot be the independent reviewer", t => {
  const f = fixture(t);
  f.packet.gates.G02.evidence[0].verified_by = "independent-reviewer";
  fs.writeFileSync(f.packetPath, JSON.stringify(f.packet));
  const r = run(f.packetPath);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /must be distinct/i);
});
test("missing gate acceptance fails closed", t => {
  const f = fixture(t);
  delete f.packet.gates.G12;
  fs.writeFileSync(f.packetPath, JSON.stringify(f.packet));
  const r = run(f.packetPath);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /G12: missing gate record/);
});
test("missing gate-specific evidence type fails closed", t => {
  const f = fixture(t);
  f.packet.gates.G02.evidence = f.packet.gates.G02.evidence.filter(e => e.evidence_type !== "sentinel_execution");
  fs.writeFileSync(f.packetPath, JSON.stringify(f.packet));
  const r = run(f.packetPath);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /G02: required evidence type missing: sentinel_execution/);
});
test("invalid UTC timestamp fails closed", t => {
  const f = fixture(t);
  f.packet.gates.G02.evidence[0].verified_at_utc = "yesterday";
  fs.writeFileSync(f.packetPath, JSON.stringify(f.packet));
  const r = run(f.packetPath);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /malformed evidence record/i);
});
test("evidence verified after packet generation fails closed", t => {
  const f = fixture(t);
  f.packet.gates.G02.evidence[0].verified_at_utc = "2026-10-10T21:16:00Z";
  fs.writeFileSync(f.packetPath, JSON.stringify(f.packet));
  const r = run(f.packetPath);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /evidence verification timestamp is after packet generation/i);
});
test("independent review before packet generation fails closed", t => {
  const f = fixture(t);
  f.packet.independent_verifier.reviewed_at_utc = "2026-10-10T21:10:00Z";
  fs.writeFileSync(f.packetPath, JSON.stringify(f.packet));
  const r = run(f.packetPath);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /Independent review timestamp precedes gate packet generation/i);
});

test("production mutation claims are rejected", t => {
  const f = fixture(t);
  f.packet.promotion.production_mutation_performed = true;
  fs.writeFileSync(f.packetPath, JSON.stringify(f.packet));
  const r = run(f.packetPath);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /not a production-mutation/i);
});
