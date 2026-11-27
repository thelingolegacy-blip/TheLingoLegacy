import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = await readFile(path.join(root, "casino/index.html"), "utf8");
const staticCopy = await readFile(path.join(root, "static-site/casino/index.html"), "utf8");

test("That’s My Lingo casino alias is a virtual-credit Vegas Studio surface", () => {
  assert.equal(staticCopy, source, "static-site alias must stay byte-for-byte aligned");
  assert.match(source, /<title>That’s My Lingo — Vegas Studio Mode<\/title>/);
  assert.match(source, /Spin cost \(Demo Coins\)/);
  assert.match(source, /Demo Coin Balance/);
  assert.match(source, /Demo Coin Return/);
  assert.match(source, /Demo Coin bonus meter/);
  assert.match(source, /function demoCoins\(value\)/);
  assert.match(source, /symbol: "◈"/);
  assert.doesNotMatch(source, /\$\s?\d/);
  assert.doesNotMatch(source, /virtual bet/i);
  assert.doesNotMatch(source, /sweepstakes/i);
  assert.doesNotMatch(source, /dollar symbols/i);
  assert.doesNotMatch(source, /Jackpot meter/i);
});
