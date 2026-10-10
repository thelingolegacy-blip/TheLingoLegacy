import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
const validator=path.resolve("ops/g02/validate-gates-02-12.mjs");
test("default gate template fails closed",()=>{
 const r=spawnSync(process.execPath,[validator],{encoding:"utf8"});
 assert.equal(r.status,2,r.stdout+"\n"+r.stderr);
 assert.match(r.stderr,/LINGO_GATE_EVALUATION=BLOCKED/);
 assert.match(r.stderr,/template, not collected evidence/i);
 assert.doesNotMatch(r.stdout+"\n"+r.stderr,/LINGO_GATE_EVALUATION=PASS/);
});
test("missing gate packet fails closed",()=>{
 const r=spawnSync(process.execPath,[validator,"missing-gate-packet.json"],{encoding:"utf8"});
 assert.equal(r.status,2);
 assert.match(r.stderr,/LINGO_GATE_EVALUATION=BLOCKED/);
 assert.doesNotMatch(r.stdout+"\n"+r.stderr,/LINGO_GATE_EVALUATION=PASS/);
});
