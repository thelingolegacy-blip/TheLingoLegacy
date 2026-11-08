import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('worker.js', 'utf8');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const { BeaconRateLimiter } = await import(moduleUrl);

function makeState() {
  let bucket;
  let alarmAt = null;
  let tail = Promise.resolve();
  return {
    storage: {
      async transaction(callback) {
        const result = tail.then(() => callback({
          get: async (key) => key === 'bucket' ? bucket : undefined,
          put: async (key, value) => { if (key === 'bucket') bucket = value; },
        }));
        tail = result.then(() => undefined, () => undefined);
        return result;
      },
      async get(key) { return key === 'bucket' ? bucket : undefined; },
      async setAlarm(value) { alarmAt = value; },
      async deleteAll() { bucket = undefined; },
      inspect() { return { bucket, alarmAt }; },
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
