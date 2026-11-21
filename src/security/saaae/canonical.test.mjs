import test from "node:test";
import assert from "node:assert/strict";
import { canonicalizeJson, digestCanonicalJson } from "./canonical.mjs";

test("canonical JSON sorts object keys recursively", () => {
  assert.equal(canonicalizeJson({ z: 1, a: { y: true, b: null } }), '{"a":{"b":null,"y":true},"z":1}');
});
test("canonical JSON preserves array order", () => {
  assert.notEqual(canonicalizeJson([1, 2]), canonicalizeJson([2, 1]));
});
test("canonical JSON rejects non-finite numbers", () => {
  assert.throws(() => canonicalizeJson({ amount: Number.NaN }), /NON_FINITE_NUMBER/);
});
test("canonical JSON rejects undefined and unsupported values", () => {
  assert.throws(() => canonicalizeJson({ missing: undefined }), /UNSUPPORTED_CANONICAL_VALUE/);
});
test("canonical JSON rejects non-plain objects", () => {
  assert.throws(() => canonicalizeJson(new Date()), /UNSUPPORTED_CANONICAL_VALUE/);
});
test("canonical digests are independent of object insertion order", async () => {
  assert.equal(await digestCanonicalJson({ b: 2, a: 1 }), await digestCanonicalJson({ a: 1, b: 2 }));
});
