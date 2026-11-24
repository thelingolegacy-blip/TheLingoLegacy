import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validator = path.join(root, "scripts/validate-lingo-dispatch.mjs");
const source = JSON.parse(fs.readFileSync(path.join(root, "config/lingo-dispatch-routes.v1.json"), "utf8"));

function runRoutes(t, mutate = (value) => value) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lingo-dispatch-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, "routes.json");
  fs.writeFileSync(file, JSON.stringify(mutate(structuredClone(source))));
  return spawnSync(process.execPath, [validator, file], { cwd: root, encoding: "utf8" });
}

test("canonical dispatch routes pass with all severity routes and approval gates", (t) => {
  const result = runRoutes(t);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Triggers:\s+11/);
  assert.match(result.stdout, /Approval gates:\s+12/);
});

test("dispatch rejects secret or raw-PII inclusion", (t) => {
  const result = runRoutes(t, (value) => { value.dispatch_defaults.include_secrets = true; return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /exclude secrets/);
});

test("dispatch rejects duplicate trigger events", (t) => {
  const result = runRoutes(t, (value) => { value.triggers[1].event = value.triggers[0].event; return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Duplicate trigger event/);
});

test("dispatch rejects an unsupported severity", (t) => {
  const result = runRoutes(t, (value) => { value.triggers[0].severity = "SEV9"; return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unsupported trigger severity/);
});

test("dispatch rejects an automatic action outside the read-only allowlist", (t) => {
  const result = runRoutes(t, (value) => { value.severity_routes.SEV1.auto_actions.push("production-deploy"); return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unapproved automatic action/);
});

test("startup failure route cannot authorize G02 activation or mislabel a startup failure", (t) => {
  const result = runRoutes(t, (value) => {
    value.triggers.find((item) => item.event === "github.workflow.startup_failure").forbidden = ["rerun indefinitely"];
    return value;
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must forbid: activate G02/);
});

test("dispatch requires the G02 activation approval gate", (t) => {
  const result = runRoutes(t, (value) => {
    value.approval_gates = value.approval_gates.filter((gate) => gate !== "G02-runner-activation");
    return value;
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing required approval gate: G02-runner-activation/);
});

test("dispatch remains design-only until owner approval", (t) => {
  const result = runRoutes(t, (value) => { value.mode = "active"; return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /remain design-only/);
});

test("SEV0 and production severity routes retain mutation approval", (t) => {
  const result = runRoutes(t, (value) => { value.severity_routes.SEV0.approval_required = ["production-mutation"]; return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /SEV0 must require approval for all-mutations/);
});

test("dispatch rejects duplicate approval gates", (t) => {
  const result = runRoutes(t, (value) => { value.approval_gates.push(value.approval_gates[0]); return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /approval_gates must be unique/);
});
