import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const firebase = JSON.parse(readFileSync("firebase.json", "utf8"));
const firebaseRc = JSON.parse(readFileSync(".firebaserc", "utf8"));

test("root Firebase config cannot publish the repository root or any Hosting directory", () => {
  assert.equal(Object.hasOwn(firebase, "hosting"), false);
});

test("Firebase CLI has no implicit default project", () => {
  assert.deepEqual(firebaseRc.projects, {});
  assert.equal(firebaseRc.projects?.default, undefined);
});

test("production Firebase project is not selected by CLI config", () => {
  assert.equal(JSON.stringify(firebaseRc).includes("lingo-legacy-production"), false);
});
