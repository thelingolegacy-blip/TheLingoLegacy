import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validator = path.join(root, "scripts/validate-lingo-registry.mjs");
const source = JSON.parse(fs.readFileSync(path.join(root, "config/lingo-ecosystem-registry.v1.json"), "utf8"));

function runRegistry(t, mutate = (value) => value) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lingo-registry-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, "registry.json");
  fs.writeFileSync(file, JSON.stringify(mutate(structuredClone(source))));
  return spawnSync(process.execPath, [validator, file], { cwd: root, encoding: "utf8" });
}

test("canonical registry passes with exactly fourteen unique realms", (t) => {
  const result = runRegistry(t);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Realms:\s+14/);
});

test("registry rejects a missing realm", (t) => {
  const result = runRegistry(t, (value) => { value.realms.pop(); return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /exactly 14 entries/);
});

test("registry rejects duplicate realm identifiers", (t) => {
  const result = runRegistry(t, (value) => { value.realms[1].id = value.realms[0].id; return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Duplicate realm id/);
});

test("registry rejects duplicate non-null routes", (t) => {
  const result = runRegistry(t, (value) => { value.realms[1].route = value.realms[0].route; return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Duplicate realm route/);
});

test("registry rejects missing or malformed dependency arrays", (t) => {
  const result = runRegistry(t, (value) => { value.realms[0].dependencies = "lingo-core"; return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /dependencies must be an array/);
});

test("registry rejects production status while the global policy is protected-hold", (t) => {
  const result = runRegistry(t, (value) => { value.realms[0].status = "production"; return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /cannot be production while production_policy is protected-hold/);
});

test("registry requires release evidence for a production realm after hold is lifted", (t) => {
  const result = runRegistry(t, (value) => {
    value.production_policy = "controlled-release";
    value.realms[0].status = "production";
    return value;
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Production realm lacks release_record/);
});
