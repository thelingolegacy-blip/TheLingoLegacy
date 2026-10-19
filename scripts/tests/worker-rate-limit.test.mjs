import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Exercise the real Worker module without external services or credentials.
const source = await readFile(new URL('../../worker.js', import.meta.url), 'utf8');
const encoded = Buffer.from(source).toString('base64');
const { default: worker } = await import(`data:text/javascript;base64,${encoded}`);

const env = {
  CANONICAL_DOMAIN: 'thelingolegacy.com',
  ASSETS: { fetch: async () => new Response('asset') },
};

async function submit({ ip, forwarded, phone = '+15551234567' } = {}) {
  const headers = { 'content-type': 'application/json' };
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

// Missing edge identity fails closed for the same phone even if X-Forwarded-For changes.
const missingEdgeIdentityStatuses = [];
for (let i = 0; i < 6; i += 1) {
  const response = await submit({ forwarded: `192.0.2.${i + 1}`, phone: '+15551234568' });
  missingEdgeIdentityStatuses.push(response.status);
}
assert.deepEqual(missingEdgeIdentityStatuses, [202, 202, 202, 202, 202, 429]);

// The map is bounded. Fill the remaining slots with unique valid phone keys,
// then verify that a new key is rejected instead of growing memory unbounded.
for (let i = 0; i < 9997; i += 1) {
  const phone = `+1${String(i).padStart(10, '0')}`;
  const response = await submit({ ip: '192.0.2.200', phone });
  assert.equal(response.status, 202, `unexpected rejection while filling bounded buckets at index ${i}`);
}
const saturated = await submit({ ip: '192.0.2.201', phone: '+15551234569' });
assert.equal(saturated.status, 429, 'a saturated rate-limit map must fail closed');

console.log('WORKER_RATE_LIMIT_REGRESSION=PASS');
console.log('SPOOFED_X_FORWARDED_FOR_BYPASS=BLOCKED');
console.log('MISSING_EDGE_IDENTITY=FAIL_CLOSED');
console.log('RATE_BUCKET_MEMORY_BOUND=PASS');
