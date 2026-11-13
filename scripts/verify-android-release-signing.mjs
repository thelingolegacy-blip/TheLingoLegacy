import fs from "node:fs";
import assert from "node:assert/strict";

const gradle = fs.readFileSync("android/app/build.gradle", "utf8");
for (const variable of [
  "LINGO_ANDROID_KEYSTORE_PATH",
  "LINGO_ANDROID_KEYSTORE_PASSWORD",
  "LINGO_ANDROID_KEY_ALIAS",
  "LINGO_ANDROID_KEY_PASSWORD",
]) {
  assert.ok(gradle.includes(variable), `Missing protected release variable: ${variable}`);
}
assert.ok(gradle.includes("signingConfig signingConfigs.release"));
assert.ok(gradle.includes("if (!hasReleaseSigning)"));
assert.ok(!/release\s*\{[\s\S]*?signingConfig signingConfigs\.debug/.test(gradle));

console.log("ANDROID_RELEASE_SIGNING_POLICY=PASS");
