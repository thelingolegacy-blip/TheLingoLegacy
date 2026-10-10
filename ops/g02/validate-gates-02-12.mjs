#!/usr/bin/env node
/**
 * LINGO G02–G12 evidence gate evaluator.
 * Local, read-only validator. Never mutates GitHub, host services, or production.
 * Usage: node ops/g02/validate-gates-02-12.mjs [gate-packet.json]
 * Exit 0 only when all gates G02–G12 are independently accepted with verifiable evidence.
 */
import fs from "node:fs";
import crypto from "node:crypto";
const packetPath = process.argv[2] || "docs/g02/gate-acceptance-template.json";
function stop(reason, code=2) {
  console.error("LINGO_GATE_EVALUATION=BLOCKED");
  console.error("REASON=" + reason);
  process.exit(code);
}
function readJson(path) {
  try { return JSON.parse(fs.readFileSync(path,"utf8")); }
  catch (e) { stop("Cannot read/parse " + path + ": " + e.message); }
}
function sha256(path) { return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"); }
function isHash(s) { return typeof s === "string" && /^[a-f0-9]{64}$/.test(s); }
function utc(s) { return typeof s === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(s) && Number.isFinite(Date.parse(s)); }
const p=readJson(packetPath);
if(p.status==="TEMPLATE_NOT_EVIDENCE") stop("Gate packet is a template, not collected evidence.");
if(p.packet_type!=="LINGO_G02_G12_GATE_ACCEPTANCE") stop("Incorrect gate packet type.");
if(!p.candidate || !/^[a-f0-9]{40}$/i.test(p.candidate.commit_sha||"")) stop("Candidate commit SHA missing or invalid.");
if(!utc(p.generated_at_utc)) stop("Gate packet generation timestamp must be UTC.");
if(!p.independent_verifier?.identity || !utc(p.independent_verifier?.reviewed_at_utc)) stop("Independent verifier identity/timestamp missing.");
const required=Array.from({length:11},(_,i)=>"G"+String(i+2).padStart(2,"0"));
const failures=[];
for(const gate of required){
 const g=p.gates?.[gate];
 if(!g){ failures.push(gate+": missing gate record"); continue; }
 if(g.status!=="ACCEPTED"){ failures.push(gate+": status is "+String(g.status)); continue; }
 if(!Array.isArray(g.evidence)||g.evidence.length===0){failures.push(gate+": no evidence references");continue;}
 for(const e of g.evidence){
   if(!e || typeof e.path!=="string" || !isHash(e.sha256) || !e.source_reference || !e.verified_by || !utc(e.verified_at_utc)){
     failures.push(gate+": malformed evidence record"); continue;
   }
   if(e.verified_by===p.independent_verifier.identity){failures.push(gate+": evidence verifier must be distinct from independent gate reviewer");continue;}
   if(!fs.existsSync(e.path)){failures.push(gate+": evidence file missing: "+e.path);continue;}
   if(sha256(e.path)!==e.sha256){failures.push(gate+": SHA-256 mismatch: "+e.path);}
 }
}
if(p.promotion?.authorized===true && !p.promotion?.authorization_reference) failures.push("Promotion claims authorization but lacks authorization_reference");
if(p.promotion?.production_mutation_performed===true) failures.push("This validator is not a production-mutation or deployment authorization tool");
for(const f of failures) console.error("GATE_CHECK_FAIL="+f);
if(failures.length) stop(failures.length+" gate/evidence checks failed; no gates accepted by this evaluation.");
console.log("GATES_02_THROUGH_12=INDEPENDENT_EVIDENCE_PRESENT");
console.log("LINGO_GATE_EVALUATION=PASS");
console.log("NOTE=This report validates packet structure and local evidence hashes; reviewers must still verify source authority and meaning.");
