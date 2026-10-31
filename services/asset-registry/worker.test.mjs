import test from "node:test";
import assert from "node:assert/strict";
import { cleanEmail, isSafeSourceUri, isSha256, roleFor, validateAssetInput } from "./worker.mjs";

test("normalizes identity email", () => {
  assert.equal(cleanEmail("  ADMIN@LINGOLEGACY.COM "), "admin@lingolegacy.com");
});
test("role resolution fails closed to viewer", () => {
  assert.equal(roleFor("creator@example.com", { REGISTRY_CREATORS: "Creator@Example.com" }), "creator");
  assert.equal(roleFor("unknown@example.com", {}), "viewer");
  assert.equal(roleFor("boss@example.com", { REGISTRY_ADMINS: "boss@example.com", REGISTRY_REVIEWERS: "boss@example.com" }), "admin");
});
test("asset metadata validation rejects invalid categories and oversized descriptions", () => {
  assert.equal(validateAssetInput({ name: "Logo set", category: "logos" }), null);
  assert.match(validateAssetInput({ name: "x", category: "logos" }), /name/);
  assert.match(validateAssetInput({ name: "Asset", category: "../admin" }), /Category/);
  assert.match(validateAssetInput({ name: "Asset", category: "logos", description: "x".repeat(2001) }), /2,000/);
});
test("source references accept HTTPS and controlled R2 object references only", () => {
  assert.equal(isSafeSourceUri("https://assets.example.com/logo.png"), true);
  assert.equal(isSafeSourceUri("r2://creative/logo.png"), true);
  assert.equal(isSafeSourceUri("http://assets.example.com/logo.png"), false);
  assert.equal(isSafeSourceUri("javascript:alert(1)"), false);
});
test("SHA-256 must be exactly 64 hexadecimal characters", () => {
  assert.equal(isSha256("a".repeat(64)), true);
  assert.equal(isSha256("z".repeat(64)), false);
  assert.equal(isSha256("a".repeat(63)), false);
});
