import fs from "node:fs";
import assert from "node:assert/strict";

const gradle = fs.readFileSync("android/app/build.gradle", "utf8");
assert.match(gradle, /LINGO_ANDROID_KEYSTORE_PATH/);
assert.match(gradle, /LINGO_ANDROID_KEYSTORE_PASSWORD/);
assert.match(gradle, /LINGO_ANDROID_KEY_ALIAS/);
assert.match(gradle, /LINGO_ANDROID_KEY_PASSWORD/);
assert.match(gradle, /signingConfig signingConfigs\.release/);
assert.match(gradle, /if \(!hasReleaseSigning\)/);
assert.doesNotMatch(gradle, /release\s*\{[\s\S]*?signingConfig signingConfigs\.debug/);

console.log("ANDROID_RELEASE_SIGNING_POLICY=PASS");
