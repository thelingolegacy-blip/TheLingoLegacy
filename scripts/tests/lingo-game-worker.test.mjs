import assert from 'node:assert/strict';
import test from 'node:test';
import worker, { bearerTokenFromRequest } from '../../cloudflare/workers/lingo-game-engine-staging.mjs';

function fakeDb() {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      calls.push(sql);
      return { bind() { return this; }, async first() {
        if (sql.startsWith('SELECT 1')) return { ok: 1 };
        if (sql.includes('sqlite_master')) return { count: 6 };
        return null;
      } };
    },
  };
}


test('Firebase bearer parser accepts standard and case-insensitive Authorization headers', () => {
  const standard = new Request('https://staging.invalid/', { headers: { authorization: 'Bearer abc.def.ghi' } });
  const lowerCase = new Request('https://staging.invalid/', { headers: { authorization: 'bearer   abc.def.ghi' } });
  assert.equal(bearerTokenFromRequest(standard), 'abc.def.ghi');
  assert.equal(bearerTokenFromRequest(lowerCase), 'abc.def.ghi');
});

test('Firebase bearer parser rejects absent or malformed credentials', () => {
  assert.equal(bearerTokenFromRequest(new Request('https://staging.invalid/')), null);
  assert.equal(bearerTokenFromRequest(new Request('https://staging.invalid/', { headers: { authorization: 'Bearer' } })), null);
  assert.equal(bearerTokenFromRequest(new Request('https://staging.invalid/', { headers: { authorization: 'Basic abc' } })), null);
});


test('Firebase bearer parser handles case-insensitive header names and surrounding whitespace', () => {
  for (const headerName of ['Authorization', 'authorization', 'AUTHORIZATION', 'aUtHoRiZaTiOn']) {
    const request = new Request('https://staging.invalid/', {
      headers: { [headerName]: '  Bearer   abc.def.ghi  ' },
    });
    assert.equal(bearerTokenFromRequest(request), 'abc.def.ghi');
  }
});

test('Firebase bearer parser rejects extra credential fields and empty tokens', () => {
  for (const value of ['', 'Bearer ', 'Bearer abc def', 'Basic abc.def.ghi']) {
    const request = new Request('https://staging.invalid/', { headers: { authorization: value } });
    assert.equal(bearerTokenFromRequest(request), null);
  }
});

test('health endpoint confirms staging D1 reachability without authentication', async () => {
  const DB = fakeDb();
  const response = await worker.fetch(new Request('https://staging.invalid/healthz'), { DB, ENVIRONMENT: 'staging' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'ok', environment: 'staging', database: 'connected', tableCount: 6, rulesVersion: 'staging-demo-v1',
  });
});

test('protected wallet and game routes fail closed without a Firebase bearer token', async () => {
  const DB = fakeDb();
  const response = await worker.fetch(new Request('https://staging.invalid/api/v1/wallet/balance', {
    method: 'GET', headers: {},
  }), { DB, ENVIRONMENT: 'staging', FIREBASE_PROJECT_ID: 'lingo-legacy-production' });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'UNAUTHORIZED' });
  assert.equal(DB.calls.length, 0);
});


test('staging protected routes fail closed when Firebase is unset or points at production', async () => {
  for (const FIREBASE_PROJECT_ID of [undefined, 'lingo-legacy-production']) {
    const DB = fakeDb();
    const headers = { authorization: 'Bearer syntactically.valid.but.untrusted' };
    const env = { DB, ENVIRONMENT: 'staging' };
    if (FIREBASE_PROJECT_ID) env.FIREBASE_PROJECT_ID = FIREBASE_PROJECT_ID;
    const response = await worker.fetch(new Request('https://staging.invalid/api/v1/wallet/balance', {
      method: 'GET', headers,
    }), env);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: 'UNAUTHORIZED' });
    assert.equal(DB.calls.length, 0);
  }
});

test('unknown routes return 404', async () => {
  const response = await worker.fetch(new Request('https://staging.invalid/no-such-route'), { DB: fakeDb(), ENVIRONMENT: 'staging' });
  assert.equal(response.status, 404);
});
