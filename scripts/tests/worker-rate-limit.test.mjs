import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Exercise the real Worker module without external services or credentials.
const source = await readFile(new URL('../../worker.js', import.meta.url), 'utf8');
const encoded = Buffer.from(source).toString('base64');
const { default: worker } = await import(`data:text/javascript;base64,${encoded}`);
const { default: secondIsolate } = await import(`data:text/javascript;base64,${encoded}#second-isolate`);

const sharedBeaconCounts = new Map();
const sharedAskCounts = new Map();
function rateLimitBinding(store, limit) {
  return {
    async limit({ key }) {
      const count = store.get(key) || 0;
      store.set(key, count + 1);
      return { success: count < limit };
    },
  };
}
const env = {
  CANONICAL_DOMAIN: 'thelingolegacy.com',
  ASSETS: { fetch: async () => new Response('asset') },
  BEACON_RATE_LIMITER: rateLimitBinding(sharedBeaconCounts, 5),
  ASK_RATE_LIMITER: rateLimitBinding(sharedAskCounts, 20),
};

async function submit({ ip, forwarded, phone = '+15551234567' } = {}) {
  const headers = { 'content-type': 'application/json', origin: 'https://thelingolegacy.com' };
  if (ip) headers['cf-connecting-ip'] = ip;
  if (forwarded) headers['x-forwarded-for'] = forwarded;
  const request = new Request('https://thelingolegacy.com/api/beacon-text-alerts', {
    method: 'POST',
    headers,
    body: JSON.stringify({ phone, zone: 'delaware-crown-zone', consent: true }),
  });
  return worker.fetch(request, env);
}

// A client must not bypass the limit by rotating the spoofable X-Forwarded-For header.
const spoofableHeaderStatuses = [];
for (let i = 0; i < 6; i += 1) {
  const response = await submit({ ip: '198.51.100.10', forwarded: `203.0.113.${i + 1}` });
  spoofableHeaderStatuses.push(response.status);
}
assert.deepEqual(spoofableHeaderStatuses, [202, 202, 202, 202, 202, 429]);

// A Cloudflare-managed binding carries the same key across separate Worker isolates.
async function submitWith(targetWorker, ip, phone) {
  const request = new Request('https://thelingolegacy.com/api/beacon-text-alerts', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://thelingolegacy.com', 'cf-connecting-ip': ip },
    body: JSON.stringify({ phone, zone: 'delaware-crown-zone', consent: true }),
  });
  return targetWorker.fetch(request, env);
}
const sharedBeaconStatuses = [];
for (let i = 0; i < 5; i += 1) {
  const target = i % 2 ? secondIsolate : worker;
  sharedBeaconStatuses.push((await submitWith(target, '198.51.100.77', '+15551234570')).status);
}
sharedBeaconStatuses.push((await submitWith(secondIsolate, '198.51.100.77', '+15551234570')).status);
assert.deepEqual(sharedBeaconStatuses, [202, 202, 202, 202, 202, 429]);

const missingBeaconBinding = await worker.fetch(
  new Request('https://thelingolegacy.com/api/beacon-text-alerts', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://thelingolegacy.com', 'cf-connecting-ip': '198.51.100.90' },
    body: JSON.stringify({ phone: '+15551234590', zone: 'delaware-crown-zone', consent: true }),
  }),
  { ...env, BEACON_RATE_LIMITER: undefined },
);
assert.equal(missingBeaconBinding.status, 503, 'Beacon delivery must fail closed without the edge rate-limit binding');



// A different Cloudflare edge IP receives an independent bucket.
const independentIp = await submit({ ip: '198.51.100.11', phone: '+15551234567' });
assert.equal(independentIp.status, 202);

// Missing edge identity fails closed for the same phone even if X-Forwarded-For changes.
const missingEdgeIdentityStatuses = [];
for (let i = 0; i < 6; i += 1) {
  const response = await submit({ forwarded: `192.0.2.${i + 1}`, phone: '+15551234568' });
  missingEdgeIdentityStatuses.push(response.status);
}
assert.deepEqual(missingEdgeIdentityStatuses, [202, 202, 202, 202, 202, 429]);

// The map is bounded. Fill the remaining slots with unique valid phone keys,
// then verify that a new key is rejected instead of growing memory unbounded.
for (let i = 0; i < 9996; i += 1) {
  const phone = `+1${String(i).padStart(10, '0')}`;
  const response = await submit({ ip: '192.0.2.200', phone });
  assert.equal(response.status, 202, `unexpected rejection while filling bounded buckets at index ${i}`);
}
const saturated = await submit({ ip: '192.0.2.201', phone: '+15551234569' });
assert.equal(saturated.status, 429, 'a saturated rate-limit map must fail closed');

// askLINGO status must not claim model readiness when the model name is absent.
const aiBindingOnly = {
  ...env,
  ASKLINGO_AI_ENABLED: 'true',
  AI: { run: async () => ({ response: 'test response' }) },
};
const statusWithoutModel = await worker.fetch(
  new Request('https://thelingolegacy.com/api/v1/asklingo/status'),
  aiBindingOnly,
);
const statusWithoutModelBody = await statusWithoutModel.json();
assert.equal(statusWithoutModelBody.ai_ready, false);
assert.equal(statusWithoutModelBody.mode, 'guided-fallback');

const statusWithModel = await worker.fetch(
  new Request('https://thelingolegacy.com/api/v1/asklingo/status'),
  { ...aiBindingOnly, ASKLINGO_MODEL: 'test-model' },
);
const statusWithModelBody = await statusWithModel.json();
assert.equal(statusWithModelBody.ai_ready, true);
assert.equal(statusWithModelBody.mode, 'ai-enabled');

// The assistant's per-isolate limit rejects request 21 for the same edge IP.
async function askLINGO(ip, targetWorker = worker) {
  return targetWorker.fetch(new Request('https://thelingolegacy.com/api/v1/asklingo/chat', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://thelingolegacy.com',
      'cf-connecting-ip': ip,
    },
    body: JSON.stringify({ message: 'Where can I find LINGOarcade?' }),
  }), env);
}
const askStatuses = [];
for (let i = 0; i < 20; i += 1) askStatuses.push((await askLINGO('203.0.113.77')).status);
assert.ok(askStatuses.every(status => status === 200));
assert.equal((await askLINGO('203.0.113.77')).status, 429);

// The edge binding must enforce the same per-IP key across separate isolates.
const sharedAskStatuses = [];
for (let i = 0; i < 20; i += 1) {
  const target = i % 2 ? secondIsolate : worker;
  sharedAskStatuses.push((await askLINGO('203.0.113.88', target)).status);
}
sharedAskStatuses.push((await askLINGO('203.0.113.88', secondIsolate)).status);
assert.ok(sharedAskStatuses.slice(0, 20).every(status => status === 200));
assert.equal(sharedAskStatuses[20], 429);

const missingAskBinding = await worker.fetch(
  new Request('https://thelingolegacy.com/api/v1/asklingo/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://thelingolegacy.com', 'cf-connecting-ip': '203.0.113.99' },
    body: JSON.stringify({ message: 'Where can I find LINGOarcade?' }),
  }),
  { ...env, ASK_RATE_LIMITER: undefined },
);
assert.equal(missingAskBinding.status, 503, 'askLINGO must fail closed without the edge rate-limit binding');





const checkoutDisabled = await worker.fetch(
  new Request('https://thelingolegacy.com/api/create-checkout-session', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://thelingolegacy.com' },
    body: JSON.stringify({ tier: 'xp' }),
  }),
  { ...env, STRIPE_SECRET_KEY: 'test-secret', STRIPE_PRICE_XP_PACK: 'price_test' },
);
assert.equal(checkoutDisabled.status, 503, 'Checkout must remain disabled even when Stripe credentials are present');

const checkoutCrossOrigin = await worker.fetch(
  new Request('https://thelingolegacy.com/api/create-checkout-session', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://attacker.example' },
    body: JSON.stringify({ tier: 'xp' }),
  }),
  { ...env, CHECKOUT_ENABLED: 'true', STRIPE_SECRET_KEY: 'test-secret', STRIPE_PRICE_XP_PACK: 'price_test' },
);
assert.equal(checkoutCrossOrigin.status, 403, 'Checkout must reject untrusted origins');

const beaconDisabled = await worker.fetch(
  new Request('https://thelingolegacy.com/api/beacon-text-alerts', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://thelingolegacy.com', 'cf-connecting-ip': '198.51.100.91' },
    body: JSON.stringify({ phone: '+15551234591', zone: 'delaware-crown-zone', consent: true }),
  }),
  { ...env, BEACON_SMS_SEND_ENABLED: 'true', TWILIO_ACCOUNT_SID: 'ACtest', TWILIO_AUTH_TOKEN: 'test', TWILIO_FROM_NUMBER: '+15551234500' },
);
assert.equal(beaconDisabled.status, 503, 'SMS must fail closed without server-side consent verification');

const falseStringFlags = await worker.fetch(
  new Request('https://thelingolegacy.com/api/v1/runtime'),
  { ...env, OBSERVABILITY_ENABLED: 'false', REALTIME_ENABLED: 'false' },
);
const falseStringFlagsBody = await falseStringFlags.json();
assert.equal(falseStringFlagsBody.observability, false, "the string 'false' must not enable observability");
assert.equal(falseStringFlagsBody.realtime.websocket, false, "the string 'false' must not enable realtime");
assert.equal(falseStringFlagsBody.realtime.status, 'DISABLED');

const trueStringFlags = await worker.fetch(
  new Request('https://thelingolegacy.com/api/v1/runtime'),
  { ...env, OBSERVABILITY_ENABLED: 'true', REALTIME_ENABLED: 'true' },
);
const trueStringFlagsBody = await trueStringFlags.json();
assert.equal(trueStringFlagsBody.observability, true, "the string 'true' must enable observability");
assert.equal(trueStringFlagsBody.realtime.websocket, true, "the string 'true' must enable realtime");
assert.equal(trueStringFlagsBody.realtime.status, 'ENABLED');

console.log('WORKER_RATE_LIMIT_REGRESSION=PASS');
console.log('SPOOFED_X_FORWARDED_FOR_BYPASS=BLOCKED');
console.log('MISSING_EDGE_IDENTITY=FAIL_CLOSED');
console.log('RATE_BUCKET_MEMORY_BOUND=PASS');
