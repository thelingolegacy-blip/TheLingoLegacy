import test from "node:test";
import assert from "node:assert/strict";
import { GATES, G02_PREDICATES, parseEvidenceJson, parseSha256Manifest, summarizeEvidence, getGateDisplayStatus } from "../evidence-core.mjs";

test("gate matrix contains G00 through G11", () => {
  assert.equal(GATES.length, 12);
  assert.equal(GATES[0].id, "G00");
  assert.equal(GATES[11].id, "G11");
});

test("G02 acceptance is explicitly decomposed into nine predicates", () => {
  assert.equal(G02_PREDICATES.length, 9);
  assert.equal(G02_PREDICATES[1][0], "P2");
  assert.equal(G02_PREDICATES[8][0], "P9");
});

test("rejects malformed JSON", () => {
  assert.deepEqual(parseEvidenceJson("{oops"), { ok: false, error: "File is not valid JSON." });
});

test("rejects arrays and empty objects", () => {
  assert.equal(parseEvidenceJson("[]").ok, false);
  assert.equal(parseEvidenceJson("{}").ok, false);
});

test("accepts a non-empty JSON object", () => {
  const result = parseEvidenceJson('{"observations":[]}');
  assert.equal(result.ok, true);
  assert.deepEqual(result.packet, { observations: [] });
});

test("parses standard SHA-256 manifest lines", () => {
  const digest = "a".repeat(64);
  assert.equal(parseSha256Manifest(digest + "  packet.json"), digest);
  assert.equal(parseSha256Manifest(digest.toUpperCase() + " *packet.json"), digest);
  assert.equal(parseSha256Manifest("not-a-digest"), null);
});

test("queued job with runner ID zero and no steps never qualifies as assignment", () => {
  const summary = summarizeEvidence({
    captured_at_utc: "2026-10-16T00:00:00Z",
    observations: [{
      workflow: "Sentinel",
      run_id: 123,
      run_status: "queued",
      runner_id: 0,
      runner_name: "",
      steps_endpoint_result: [],
      artifacts_endpoint_result: []
    }]
  });
  assert.equal(summary.derived.runner_assignment_observed, false);
  assert.equal(summary.derived.executed_steps_observed, false);
  assert.equal(summary.derived.artifacts_observed, false);
  assert.equal(summary.derived.can_claim_g02_pass, false);
});

test("nonzero runner ID only counts when runner name is populated", () => {
  const summary = summarizeEvidence({ observations: [{ runner_id: 77, runner_name: "", steps: [{ name: "sentinel" }] }] });
  assert.equal(summary.derived.runner_assignment_observed, false);
  assert.equal(summary.derived.executed_steps_observed, true);
  assert.equal(summary.derived.can_claim_g02_pass, false);
});

test("empty evidence and missing fields do not become PASS", () => {
  const summary = summarizeEvidence({});
  assert.equal(summary.captured_at_utc, "UNKNOWN");
  assert.equal(summary.source_sha, "UNKNOWN");
  assert.equal(summary.declared_g02, "UNKNOWN");
  assert.equal(summary.derived.can_claim_g02_pass, false);
});

test("logs and artifacts absent cannot be inferred from completed conclusion", () => {
  const summary = summarizeEvidence({ observations: [{ status: "completed", conclusion: "success" }] });
  assert.equal(summary.runs[0].log_result, "UNKNOWN");
  assert.equal(summary.derived.artifacts_observed, false);
  assert.equal(summary.derived.can_claim_g02_pass, false);
});

test("gate display is fail-closed for unknown or unexpected values", () => {
  assert.equal(getGateDisplayStatus("PASS"), "PASS");
  assert.equal(getGateDisplayStatus("FAIL"), "FAIL");
  assert.equal(getGateDisplayStatus("UNKNOWN"), "BLOCKED");
  assert.equal(getGateDisplayStatus(undefined), "BLOCKED");
  assert.equal(getGateDisplayStatus("success"), "BLOCKED");
});