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

test("canonical taxonomy separates eight public portfolios, four shared services, and two LINGOworld subproducts", (t) => {
  const result = runRegistry(t);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Public portfolios:\s+8/);
  assert.match(result.stdout, /Shared platform services:\s+4/);
  assert.match(result.stdout, /Subproducts:\s+2/);
  const publicIds = source.realms.filter((realm) => realm.node_type === "public_portfolio").map((realm) => realm.id).sort();
  assert.deepEqual(publicIds, ["legacy-x-club","lingo-arcade","lingo-lane","lingo-legacy","lingo-library","lingo-media","lingo-slots","lingo-world"].sort());
  assert.equal(source.realms.find((realm) => realm.id === "lingo-shield").parent_id, "lingo-world");
  assert.equal(source.realms.find((realm) => realm.id === "lingo-campus").parent_id, "lingo-world");
});

test("registry rejects a missing node_type", (t) => {
  const result = runRegistry(t, (value) => { delete value.realms[0].node_type; return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unsupported node_type/);
});

test("registry rejects an unsupported node_type", (t) => {
  const result = runRegistry(t, (value) => { value.realms[0].node_type = "brand"; return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unsupported node_type/);
});

test("registry rejects a subproduct without a parent", (t) => {
  const result = runRegistry(t, (value) => { delete value.realms.find((realm) => realm.id === "lingo-campus").parent_id; return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Subproduct must declare a non-empty parent_id/);
});

test("registry rejects a subproduct assigned to a non-canonical parent", (t) => {
  const result = runRegistry(t, (value) => { value.realms.find((realm) => realm.id === "lingo-shield").parent_id = "lingo-core"; return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must belong to lingo-world/);
});

test("registry rejects a shared service reclassified as a public portfolio", (t) => {
  const result = runRegistry(t, (value) => { value.realms.find((realm) => realm.id === "lingo-wallet").node_type = "public_portfolio"; return value; });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /canonical public portfolio|canonical shared platform service/);
});
