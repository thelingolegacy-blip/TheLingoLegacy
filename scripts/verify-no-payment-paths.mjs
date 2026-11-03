import fs from 'node:fs';
import assert from 'node:assert/strict';

const forbidden = [
  ['worker.js', /STRIPE_|create-checkout-session|createCheckout|CHECKOUT_TIERS|api\.stripe\.com/i],
  ['.env.example', /STRIPE_/i],
  ['drop/index.html', /stripe-checkout\.js|data-stripe-tier|\/api\/create-checkout-session|Checkout with Stripe|Stripe Checkout|\$\d/i],
  ['index.html', /stripe founder checkout|stripe-ready drop|stripe-checkout/i],
  ['monetization/index.html', /stripe|buy digital|paid subscription|href="[^"]*checkout/i],
  ['live-casino-studio/index.html', /Square|Stripe|\bACH\b|id="payments"|href="#payments"/i],
  ['loyalty-lane-apparel/index.html', /stripe|href="#checkout"|<div class="price">|Order%20|stripe-checkout/i],
  ['assets/premium-studio-refresh.js', /stripe|square-ready|data-premium-square|stripe-checkout|paid subscription/i],
  ['thats-my-lingo/index.html', /stripe-ready|founder checkout|stripe-checkout|href="#checkout"/i],
  ['studio/index.html', /Stripe checkout readiness|Stripe secret binding|i\.stripe|Price IDs|Webhook reconciliation/i],
  ['config/production/env-contract.json', /payment provider secret keys|Payment provider live-mode/i],
];

for (const [path, pattern] of forbidden) {
  assert.equal(pattern.test(fs.readFileSync(path, 'utf8')), false, path + ' still contains a payment integration');
}
assert.equal(fs.existsSync('assets/stripe-checkout.js'), false, 'payment checkout browser asset must be absent');
console.log('PAYMENT_FREE_SOURCE_GATE=PASS');
console.log('CHECKED_FILES=' + forbidden.length);
console.log('PAYMENT_BROWSER_ASSET=ABSENT');
