import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = await readFile(path.join(root, "casino/index.html"), "utf8");
const staticCopy = await readFile(path.join(root, "static-site/casino/index.html"), "utf8");
const studioHub = await readFile(path.join(root, "studio-hub/index.html"), "utf8");
const drop = await readFile(path.join(root, "drop/index.html"), "utf8");
const stripeScript = await readFile(path.join(root, "assets/stripe-checkout.js"), "utf8");
const worker = await readFile(path.join(root, "worker.js"), "utf8");
const arcade = await readFile(path.join(root, "lingoarcade/index.html"), "utf8");
const app = await readFile(path.join(root, "app/index.html"), "utf8");
const studioProduction = await readFile(path.join(root, "studio-production/index.html"), "utf8");
const studioAssets = await readFile(path.join(root, "studio-assets/index.html"), "utf8");

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
  assert.match(studioHub, /demo spins using virtual credits only/i);
  assert.match(studioHub, /cash wagering, cash-out and prize redemption are not enabled/i);
  assert.doesNotMatch(studioHub, /cash-value wagering/i);
  assert.match(arcade, /Vegas Studio demo game and virtual-credit progression lane/);
  assert.doesNotMatch(arcade, /Casino-style demo game/i);
  assert.match(app, /Mobile game shell/);
  assert.doesNotMatch(app, /Sportsbook-style|Open Casino Floor|Casino Demo/i);
  assert.match(studioProduction, /Vegas Studio environment/);
  assert.match(studioProduction, /No wagering, cash-out, or prize redemption/);
  assert.doesNotMatch(studioProduction, /Casino-language is scoped/i);
  assert.match(studioAssets, /Vegas Studio depth plate/);
  assert.doesNotMatch(studioAssets, /Casino depth plate/);
});

test("founder drop checkout remains disabled in source and Worker", () => {
  assert.match(drop, /no checkout or payment is available/i);
  assert.match(drop, /THE PRESTIGIOUS HOUSE OF DUSSE/);
  assert.doesNotMatch(drop, /Avalon House Badge Set/i);
  assert.match(drop, /data-stripe-tier="xp" disabled aria-disabled="true">Payments paused/);
  assert.match(stripeScript, /button\.disabled = true/);
  assert.match(stripeScript, /Payments paused/);
  assert.match(worker, /code: 'BILLING_DISABLED'/);
  assert.match(worker, /}, 410, request, env\)/);
  assert.match(worker, /billing: \{ mode: 'DISABLED', checkout: false/);
  assert.doesNotMatch(worker, /STRIPE_SECRET_KEY/);
});
