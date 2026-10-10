#!/usr/bin/env node
/**
 * LINGO G02–G12 evidence gate evaluator.
 * Read-only: validates packet structure and local evidence-file integrity only.
 * It cannot establish source authority, prove an external event, or authorize promotion.
 * Usage: node ops/g02/validate-gates-02-12.mjs [gate-packet.json]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const packetPath = path.resolve(process.argv[2] || "docs/g02/gate-acceptance-template.json");
function stop(reason, code = 2) {
  console.error("LINGO_GATE_EVALUATION=BLOCKED");
  console.error("REASON=" + reason);
  process.exit(code);
}
function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { stop("Cannot read/parse " + file + ": " + e.message); }
}
function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
function isHash(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}
function isUtc(value) {
  if (typeof value !== "string" ||
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(value)) return false;
  const ms = Date.parse(value);
  return Number.isFinite(ms) && new Date(ms).toISOString().startsWith(value.replace(/\.\d+Z$/, "Z").replace(/Z$/, ""));
}
function failIf(condition, message, failures) {
  if (condition) failures.push(message);
}
const packet = readJson(packetPath);
if (packet.status === "TEMPLATE_NOT_EVIDENCE") stop("Gate packet is a template, not collected evidence.");
if (packet.packet_type !== "LINGO_G02_G12_GATE_ACCEPTANCE") stop("Incorrect gate packet type.");
if (packet.candidate?.repository !== "thelingolegacy-blip/TheLingoLegacy") stop("Candidate repository missing or does not match canonical repository.");
if (!/^[a-f0-9]{40}$/i.test(packet.candidate?.commit_sha || "")) stop("Candidate commit SHA missing or invalid.");
if (!isUtc(packet.generated_at_utc)) stop("Gate packet generation timestamp must be UTC.");
if (!packet.independent_verifier?.identity || !isUtc(packet.independent_verifier?.reviewed_at_utc)) {
  stop("Independent verifier identity/timestamp missing or invalid.");
}
const requiredGates = Array.from({ length: 11 }, (_, i) => "G" + String(i + 2).padStart(2, "0"));
const failures = [];
const seenEvidence = new Set();
for (const gate of requiredGates) {
  const record = packet.gates?.[gate];
  if (!record) { failures.push(gate + ": missing gate record"); continue; }
  if (record.status !== "ACCEPTED") { failures.push(gate + ": status is " + String(record.status)); continue; }
  if (!Array.isArray(record.evidence) || record.evidence.length === 0) {
    failures.push(gate + ": no evidence references");
    continue;
  }
  for (const evidence of record.evidence) {
    if (!evidence || typeof evidence.path !== "string" || !evidence.path.trim() ||
        !isHash(evidence.sha256) || typeof evidence.source_reference !== "string" ||
        !evidence.source_reference.trim() || !evidence.verified_by ||
        !isUtc(evidence.verified_at_utc) ||
        !/^[a-f0-9]{40}$/i.test(evidence.candidate_commit_sha || "")) {
      failures.push(gate + ": malformed evidence record (path/hash/source/verifier/time/candidate SHA required)");
      continue;
    }
    if (evidence.candidate_commit_sha.toLowerCase() !== packet.candidate.commit_sha.toLowerCase()) {
      failures.push(gate + ": evidence candidate SHA does not match packet candidate SHA");
      continue;
    }
    if (evidence.verified_by === packet.independent_verifier.identity) {
      failures.push(gate + ": evidence verifier must be distinct from independent gate reviewer");
      continue;
    }
    const resolved = path.resolve(path.dirname(packetPath), evidence.path);
    const uniqueKey = gate + ":" + resolved + ":" + evidence.sha256;
    if (seenEvidence.has(uniqueKey)) failures.push(gate + ": duplicate evidence reference " + evidence.path);
    seenEvidence.add(uniqueKey);
    if (!fs.existsSync(resolved)) { failures.push(gate + ": evidence file missing: " + evidence.path); continue; }
    let stat;
    try { stat = fs.statSync(resolved); }
    catch (e) { failures.push(gate + ": evidence file cannot be inspected: " + evidence.path); continue; }
    if (!stat.isFile()) { failures.push(gate + ": evidence path is not a regular file: " + evidence.path); continue; }
    try {
      if (sha256(resolved) !== evidence.sha256) failures.push(gate + ": SHA-256 mismatch: " + evidence.path);
    } catch (e) {
      failures.push(gate + ": evidence file cannot be hashed: " + evidence.path);
    }
  }
}
failIf(packet.promotion?.authorized === true && !packet.promotion?.authorization_reference,
  "Promotion claims authorization but lacks authorization_reference", failures);
failIf(packet.promotion?.production_mutation_performed === true,
  "This validator is not a production-mutation or deployment authorization tool", failures);
for (const failure of failures) console.error("GATE_CHECK_FAIL=" + failure);
if (failures.length) stop(failures.length + " gate/evidence checks failed; no gates accepted by this evaluation.");
console.log("GATES_02_THROUGH_12=STRUCTURALLY_VALIDATED");
console.log("LINGO_GATE_EVALUATION=PASS");
console.log("LIMITATION=Structure and local hashes only; source authority and evidence meaning still require independent review.");
