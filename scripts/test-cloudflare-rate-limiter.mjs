import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('worker.js', 'utf8');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const { default: worker, BeaconRateLimiter } = await import(moduleUrl);

function makeState() {
  let bucket;
  let alarmAt = null;
  let tail = Promise.resolve();
  let externalGetCalls = 0;
  return {
    storage: {
      async transaction(callback) {
        const result = tail.then(() => callback({
          get: async (key) => key === 'bucket' ? bucket : undefined,
          put: async (key, value) => { if (key === 'bucket') bucket = value; },
          delete: async (key) => { if (key === 'bucket') bucket = undefined; },
        }));
        tail = result.then(() => undefined, () => undefined);
        return result;
      },
      async get(key) { externalGetCalls += 1; return key === 'bucket' ? bucket : undefined; },
      async setAlarm(value) { alarmAt = value; },
      async deleteAll() { bucket = undefined; },
      inspect() { return { bucket, alarmAt, externalGetCalls }; },
      seed(value) { bucket = value; },
    },
  };
}

async function request(limiter) {
  const response = await limiter.fetch(new Request('https://rate-limiter.internal/check', { method: 'POST' }));
  assert.equal(response.status, 200);
  return response.json();
}

test('Beacon limiter allows five requests and rejects the sixth within one hour', async () => {
  const state = makeState();
  const limiter = new BeaconRateLimiter(state);
  for (let i = 0; i < 5; i += 1) assert.deepEqual(await request(limiter), { limited: false });
  assert.deepEqual(await request(limiter), { limited: true });
});

test('Beacon limiter resets after the 60-minute window expires', async () => {
  const state = makeState();
  const limiter = new BeaconRateLimiter(state);
  for (let i = 0; i < 5; i += 1) await request(limiter);
  state.storage.seed({ startedAt: Date.now() - (60 * 60 * 1000) - 1, count: 5 });
  assert.deepEqual(await request(limiter), { limited: false });
});

test('Beacon limiter serializes concurrent requests atomically', async () => {
  const state = makeState();
  const limiter = new BeaconRateLimiter(state);
  const outcomes = await Promise.all(Array.from({ length: 20 }, () => request(limiter)));
  assert.equal(outcomes.filter((item) => item.limited === false).length, 5);
  assert.equal(outcomes.filter((item) => item.limited === true).length, 15);
});

test('alarm cleanup deletes only expired buckets', async () => {
  const state = makeState();
  const limiter = new BeaconRateLimiter(state);
  state.storage.seed({ startedAt: Date.now() - (60 * 60 * 1000) - 1, count: 5 });
  await limiter.alarm();
  assert.equal(state.storage.inspect().bucket, undefined);
  state.storage.seed({ startedAt: Date.now(), count: 1 });
  await limiter.alarm();
  assert.ok(state.storage.inspect().bucket);
  assert.ok(state.storage.inspect().alarmAt > Date.now());
});

test('alarm cleanup is transactionally serialized with a concurrent new request', async () => {
  const state = makeState();
  const limiter = new BeaconRateLimiter(state);
  state.storage.seed({ startedAt: Date.now() - (60 * 60 * 1000) - 1, count: 5 });
  await Promise.all([limiter.alarm(), request(limiter)]);
  const final = state.storage.inspect();
  assert.ok(final.bucket, 'the concurrent request must leave a fresh bucket');
  assert.equal(final.bucket.count, 1);
  assert.equal(final.externalGetCalls, 0, 'alarm must not read outside the transaction');
});


async function beaconRequest(env) {
  return worker.fetch(new Request('https://thelingolegacy.com/api/beacon-text-alerts', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'cf-connecting-ip': '203.0.113.10',
    },
    body: JSON.stringify({
      phone: '+14155552671',
      zone: 'full-entity-simulcast',
      consent: true,
    }),
  }), env);
}

test('Beacon endpoint fails closed when the Durable Object binding is missing', async () => {
  const response = await beaconRequest({ CANONICAL_DOMAIN: 'thelingolegacy.com' });
  assert.equal(response.status, 429);
  assert.match((await response.json()).error, /Too many beacon alert requests/);
});

test('Beacon endpoint fails closed when Durable Object storage is unavailable', async () => {
  const env = {
    CANONICAL_DOMAIN: 'thelingolegacy.com',
    BEACON_RATE_LIMITER: {
      idFromName() { return 'opaque-id'; },
      get() {
        return {
          async fetch() { throw new Error('simulated storage outage'); },
        };
      },
    },
  };
  const response = await beaconRequest(env);
  assert.equal(response.status, 429);
});

test('Beacon endpoint uses a SHA-256 object name and stages only after limiter approval', async () => {
  let objectName;
  const env = {
    CANONICAL_DOMAIN: 'thelingolegacy.com',
    BEACON_RATE_LIMITER: {
      idFromName(value) { objectName = value; return 'opaque-id'; },
      get() {
        return {
          async fetch() { return Response.json({ limited: false }); },
        };
      },
    },
  };
  const response = await beaconRequest(env);
  assert.equal(response.status, 202);
  assert.match(objectName, /^[a-f0-9]{64}$/);
  assert.notEqual(objectName, '203.0.113.10:+14155552671');
});
