import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const validator = path.join(root, "ops/g02/validate-evidence-packets.mjs");

test("template packets fail closed and cannot be accepted as evidence", () => {
  const result = spawnSync(process.execPath, [validator], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.match(result.stderr, /G02_EVIDENCE_VALIDATION=BLOCKED/);
  assert.match(result.stderr, /templates, not collected evidence/i);
  assert.doesNotMatch(result.stdout + result.stderr, /G02_EVIDENCE_VALIDATION=PASS/);
});

test("missing packet input fails closed", () => {
  const result = spawnSync(process.execPath, [validator, "does-not-exist-packet-a.json", "does-not-exist-packet-b.json"], {
    cwd: root, encoding: "utf8"
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /G02_EVIDENCE_VALIDATION=BLOCKED/);
  assert.doesNotMatch(result.stdout + result.stderr, /G02_EVIDENCE_VALIDATION=PASS/);
});
