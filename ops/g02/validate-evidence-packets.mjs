#!/usr/bin/env node
/**
 * LINGO G02 evidence packet validator.
 * Read-only; validates supplied JSON packets and acceptance predicates.
 * Usage: node ops/g02/validate-evidence-packets.mjs [packet-a.json] [packet-b.json]
 * Exit 0 only for complete, correlated, evidence-bearing packets with P1-P9 true.
 * Templates intentionally return nonzero.
 */
import fs from "node:fs";
import crypto from "node:crypto";

const [packetAPath, packetBPath] = process.argv.slice(2);
const defaultA = "docs/g02/packet-a-host-runner.json";
const defaultB = "docs/g02/packet-b-sentinel-execution.json";
const A_PATH = packetAPath || defaultA;
const B_PATH = packetBPath || defaultB;

function fail(message) {
  console.error("G02_EVIDENCE_VALIDATION=BLOCKED");
  console.error("REASON=" + message);
  process.exit(2);
}
function loadJson(path) {
  try { return JSON.parse(fs.readFileSync(path, "utf8")); }
  catch (e) { fail("Cannot parse " + path + ": " + e.message); }
}
function isSha256(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}
function hashFile(path) {
  return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");
}
function isUtc(value) {
  return typeof value === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(value)
    && Number.isFinite(Date.parse(value));
}
function requireValue(value, label) {
  if (value === null || value === undefined || value === "" || value === "unknown") {
    fail("Missing/unknown required value: " + label);
  }
}

const A = loadJson(A_PATH);
const B = loadJson(B_PATH);

if (A.status === "TEMPLATE_NOT_EVIDENCE" || B.status === "TEMPLATE_NOT_EVIDENCE") {
  fail("One or more packets are templates, not collected evidence.");
}
if (A.packet_type !== "LINGO_G02_PACKET_A_HOST_RUNNER") fail("Packet A type mismatch.");
if (B.packet_type !== "LINGO_G02_PACKET_B_SENTINEL_EXECUTION") fail("Packet B type mismatch.");

for (const [v, label] of [
  [A.correlation_id, "Packet A correlation_id"], [B.correlation_id, "Packet B correlation_id"],
  [A.collected_at_utc, "Packet A collected_at_utc"], [A.collector_identity, "Packet A collector_identity"],
  [A.host?.hostname, "Packet A host.hostname"], [A.host?.os, "Packet A host.os"],
  [A.host?.architecture, "Packet A host.architecture"], [A.runner?.observed_name, "Packet A runner name"],
  [A.runner?.runner_id, "Packet A runner ID"], [B.workflow_run_id, "Packet B workflow_run_id"],
  [B.run_attempt, "Packet B run_attempt"], [B.job_id, "Packet B job_id"],
  [B.commit_sha, "Packet B commit_sha"], [B.runner_id, "Packet B runner_id"],
  [B.runner_name, "Packet B runner_name"], [B.sentinel_exit_code, "Packet B sentinel exit code"],
  [B.started_at_utc, "Packet B started_at_utc"], [B.completed_at_utc, "Packet B completed_at_utc"]
]) requireValue(v, label);

if (A.correlation_id !== B.correlation_id) fail("Correlation IDs do not match.");
if (A.repository !== B.repository) fail("Repository identity mismatch.");
if (A.expected_runner_name !== "lingo-legacy-g02") fail("Packet A expected runner name is not canonical.");
if (A.runner.observed_name !== "lingo-legacy-g02" || B.runner_name !== "lingo-legacy-g02") fail("Runner name mismatch.");
if (!Number.isInteger(A.runner.runner_id) || A.runner.runner_id <= 0) fail("Packet A runner ID must be > 0.");
if (!Number.isInteger(B.runner_id) || B.runner_id <= 0) fail("Packet B runner ID must be > 0.");
if (A.runner.runner_id !== B.runner_id) fail("Runner IDs do not match across packets.");
if (typeof B.commit_sha !== "string" || !/^[a-f0-9]{40}$/i.test(B.commit_sha)) fail("Invalid commit SHA.");
if (B.job_status !== "completed") fail("Sentinel job is not completed.");
if (B.job_assigned !== true) fail("Job assignment is not explicitly verified.");
if (B.job_steps_instantiated !== true) fail("Job steps were not independently confirmed as instantiated.");
if (B.sentinel_exit_code !== 0) fail("Sentinel exit code is not zero.");
if (B.raw_logs?.retrievable !== true || !isSha256(B.raw_logs?.sha256)) fail("Raw logs are missing, unavailable, or unhashed.");
if (!Array.isArray(B.artifacts) || B.artifacts.length === 0) fail("Required evidence artifacts are missing.");
if (A.independent_verification !== "accepted" || B.independent_verification !== "accepted") fail("Independent verification has not accepted both packets.");
if (A.redaction_reviewed !== true || B.redaction_reviewed !== true) fail("Redaction review has not passed.");
if (!isUtc(A.collected_at_utc) || !isUtc(B.started_at_utc) || !isUtc(B.completed_at_utc)) fail("Timestamps must be explicit UTC timestamps.");
if (Date.parse(B.completed_at_utc) < Date.parse(B.started_at_utc)) fail("Completion timestamp precedes start timestamp.");
if (!isSha256(A.manifest_sha256) || !isSha256(B.manifest_sha256)) fail("Packet manifest SHA-256 is missing or invalid.");
if (A.manifest_sha256 === B.manifest_sha256) fail("Packet A and Packet B must have distinct manifest hashes.");

const predicates = {
  P1_real_matching_runner: A.runner.registration_state === "verified" && A.runner.observed_name === B.runner_name,
  P2_runner_id_gt_zero: Number.isInteger(B.runner_id) && B.runner_id > 0,
  P3_expected_runner_name: B.runner_name === "lingo-legacy-g02",
  P4_job_assigned: B.job_assigned === true && B.job_status === "completed" && B.runner_id > 0,
  P5_steps_instantiated: B.job_steps_instantiated === true,
  P6_sentinel_exit_zero: B.sentinel_exit_code === 0,
  P7_raw_logs_generated: B.raw_logs?.retrievable === true && isSha256(B.raw_logs?.sha256),
  P8_logs_artifacts_retrievable: B.raw_logs?.retrievable === true && B.artifacts.length > 0,
  P9_independent_correlation: A.correlation_id === B.correlation_id && A.runner.runner_id === B.runner_id && A.repository === B.repository && A.independent_verification === "accepted" && B.independent_verification === "accepted"
};
for (const [id, passed] of Object.entries(predicates)) {
  console.log(id + "=" + (passed ? "TRUE" : "FALSE"));
}
if (!Object.values(predicates).every(Boolean)) fail("At least one conjunctive acceptance predicate is false.");
console.log("G02_EVIDENCE_VALIDATION=PASS");
console.log("PACKET_A_SHA256=" + hashFile(A_PATH));
console.log("PACKET_B_SHA256=" + hashFile(B_PATH));
console.log("G02_GATE_STATUS=ACCEPTED_FOR_SEPARATE_GOVERNANCE_REVIEW");
