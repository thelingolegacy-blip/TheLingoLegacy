import assert from 'node:assert/strict';
import test from 'node:test';
import {
  authorizeD1Request, issueSpinApprovalD1, requestCorrelationId, sha256Hex, verifyPendingApproval,
} from '../../src/server/saaae-d1.mjs';

class FakeD1 {
  constructor({ principal = { status: 'active', token_valid_after_epoch: 100 }, membership = { status: 'active' }, grants = [{ effect: 'allow' }], failAudit = false } = {}) {
    this.principal = principal;
    this.membership = membership;
    this.grants = grants;
    this.failAudit = failAudit;
    this.buckets = new Map();
    this.audit = [];
    this.lastApprovalArgs = null;
    this.approval = { approval_id: 'approval-1' };
  }
  prepare(sql) {
    const db = this;
    return {
      args: [],
      bind(...args) { this.args = args; return this; },
      async first() {
        if (sql.includes('SELECT status, token_valid_after_epoch')) return db.principal;
        if (sql.includes('SELECT status FROM lingo_saaae_tenant_memberships')) return db.membership;
        if (sql.includes('INSERT INTO lingo_saaae_rate_limit_buckets')) {
          const [key, uid, route, windowStart, limit] = this.args;
          const count = db.buckets.get(key) || 0;
          if (count >= limit) return null;
          db.buckets.set(key, count + 1);
          return { request_count: count + 1 };
        }
        if (sql.includes('SELECT approval_id') && sql.includes('FROM lingo_saaae_approvals')) {
          db.lastApprovalArgs = this.args;
          return db.approval;
        }
        throw new Error('Unexpected first query: ' + sql);
      },
      async all() {
        if (sql.includes('FROM lingo_saaae_grants')) return { results: db.grants };
        throw new Error('Unexpected all query: ' + sql);
      },
      async run() {
        if (sql.includes('INSERT INTO lingo_saaae_audit_events')) {
          if (db.failAudit) throw new Error('audit unavailable');
          db.audit.push(this.args);
          return { success: true };
        }
        throw new Error('Unexpected run query: ' + sql);
      },
    };
  }
}

const base = {
  uid: 'firebase-user-1', authTime: 120, tenantId: 'tenant-1',
  productId: 'thats-my-lingo', resourceId: 'wallet:firebase-user-1',
  operation: 'wallet.read', routeKey: 'wallet.read', correlationId: 'corr-1',
  nowEpoch: 180, windowSeconds: 60, rateLimit: 2,
};

test('default denies when principal is missing', async () => {
  const db = new FakeD1({ principal: null });
  const result = await authorizeD1Request(db, base);
  assert.deepEqual(result, { ok: false, reasonCode: 'PRINCIPAL_INACTIVE_OR_REVOKED' });
  assert.equal(db.audit[0][8], 'PRINCIPAL_INACTIVE_OR_REVOKED');
});

test('revoked principal and tokens authenticated before valid-after are denied', async () => {
  const revoked = new FakeD1({ principal: { status: 'revoked', token_valid_after_epoch: 100 } });
  assert.equal((await authorizeD1Request(revoked, base)).ok, false);
  const staleToken = new FakeD1({ principal: { status: 'active', token_valid_after_epoch: 130 } });
  assert.equal((await authorizeD1Request(staleToken, base)).reasonCode, 'PRINCIPAL_INACTIVE_OR_REVOKED');
});

test('default denies missing tenant membership', async () => {
  const db = new FakeD1({ membership: null });
  assert.equal((await authorizeD1Request(db, base)).reasonCode, 'TENANT_MEMBERSHIP_REQUIRED');
});

test('exact scoped allow grant permits request and records audit', async () => {
  const db = new FakeD1();
  const result = await authorizeD1Request(db, base);
  assert.equal(result.ok, true);
  assert.equal(result.remaining, 1);
  assert.equal(db.audit.length, 1);
  assert.equal(db.audit[0][7], 'allow');
});

test('explicit deny grant overrides an allow grant', async () => {
  const db = new FakeD1({ grants: [{ effect: 'allow' }, { effect: 'deny' }] });
  assert.equal((await authorizeD1Request(db, base)).reasonCode, 'EXPLICIT_DENY_GRANT');
  assert.equal(db.buckets.size, 0);
});

test('missing exact scope grant is denied', async () => {
  const db = new FakeD1({ grants: [] });
  assert.equal((await authorizeD1Request(db, base)).reasonCode, 'EXACT_SCOPE_GRANT_REQUIRED');
});

test('rate limit is enforced and denial is audited', async () => {
  const db = new FakeD1();
  await authorizeD1Request(db, base);
  await authorizeD1Request(db, base);
  const result = await authorizeD1Request(db, base);
  assert.equal(result.reasonCode, 'RATE_LIMIT_EXCEEDED');
  assert.equal(db.audit.at(-1)[7], 'rate_limited');
});

test('audit persistence failure propagates so callers can fail closed', async () => {
  const db = new FakeD1({ principal: null, failAudit: true });
  await assert.rejects(() => authorizeD1Request(db, base), /audit unavailable/);
});

test('approval lookup binds requester, tenant, product, resource, operation and digest', async () => {
  const db = new FakeD1();
  const valid = await verifyPendingApproval(db, {
    approvalId: 'approval-1', uid: base.uid, tenantId: base.tenantId,
    productId: base.productId, resourceId: 'game:thats-my-lingo',
    operation: 'spin', actionDigest: 'sha256:request',
  });
  assert.equal(valid, true);
  assert.deepEqual(db.lastApprovalArgs, [
    'approval-1', base.uid, base.tenantId, base.productId,
    'game:thats-my-lingo', 'spin', 'sha256:request',
  ]);
});

test('approval lookup rejects absent identifiers and missing records', async () => {
  const db = new FakeD1();
  assert.equal(await verifyPendingApproval(db, {
    approvalId: '', uid: base.uid, tenantId: base.tenantId,
    productId: base.productId, resourceId: 'game:thats-my-lingo',
    operation: 'spin', actionDigest: 'sha256:request',
  }), false);
  db.approval = null;
  assert.equal(await verifyPendingApproval(db, {
    approvalId: 'approval-1', uid: base.uid, tenantId: base.tenantId,
    productId: base.productId, resourceId: 'game:thats-my-lingo',
    operation: 'spin', actionDigest: 'sha256:request',
  }), false);
});

test('correlation IDs are bounded and generated when untrusted input is malformed', () => {
  const valid = new Request('https://unit.test', { headers: { 'x-correlation-id': 'corr.safe-1' } });
  const invalid = new Request('https://unit.test', { headers: { 'x-correlation-id': 'bad value' } });
  assert.equal(requestCorrelationId(valid), 'corr.safe-1');
  assert.match(requestCorrelationId(invalid), /^[0-9a-f-]{36}$/);
});

test('request digest helper returns a stable SHA-256 hex digest', async () => {
  const one = await sha256Hex('same request');
  const two = await sha256Hex('same request');
  const other = await sha256Hex('different request');
  assert.equal(one, two);
  assert.match(one, /^[0-9a-f]{64}$/);
  assert.notEqual(one, other);
});

class IssuanceD1 {
  constructor(issued = true) { this.issued = issued; this.batchStatements = []; this.audit = []; }
  prepare(sql) {
    const db = this;
    return {
      sql,
      args: [],
      bind(...args) { this.args = args; return this; },
      async first() {
        if (sql.includes('SELECT approval_id FROM lingo_saaae_approvals')) {
          return db.issued ? { approval_id: this.args[0] } : null;
        }
        throw new Error('Unexpected issuance first query: ' + sql);
      },
      async run() {
        if (sql.includes('INSERT INTO lingo_saaae_audit_events')) {
          db.audit.push({ sql, args: this.args });
          return { success: true };
        }
        throw new Error('Unexpected issuance run query: ' + sql);
      },
    };
  }
  async batch(statements) { this.batchStatements = statements; return []; }
}

const issuance = {
  approvalId: 'approval-new-1', requesterUid: 'requester-1', approverUid: 'approver-1',
  approverAuthTime: 120, tenantId: 'tenant-1', productId: 'thats-my-lingo',
  resourceId: 'game:thats-my-lingo', actionDigest: 'a'.repeat(64),
  expiresAt: '2026-11-23T00:05:00.000Z', correlationId: 'corr-issue',
  nowMs: Date.parse('2026-11-23T00:00:00.000Z'),
};

test('approval issuance binds requester and approver eligibility in one D1 batch', async () => {
  const db = new IssuanceD1(true);
  const result = await issueSpinApprovalD1(db, issuance);
  assert.equal(result.ok, true);
  assert.equal(db.batchStatements.length, 2);
  assert.match(db.batchStatements[0].sql, /approval\.approve/);
  assert.match(db.batchStatements[0].sql, /NOT EXISTS/);
  assert.match(db.batchStatements[1].sql, /approval_issued/);
});

test('approval issuance denies ineligible requester and writes a denial audit', async () => {
  const db = new IssuanceD1(false);
  const result = await issueSpinApprovalD1(db, issuance);
  assert.equal(result.ok, false);
  assert.equal(result.reasonCode, 'REQUESTER_NOT_ELIGIBLE_FOR_SPIN_APPROVAL');
  assert.equal(db.audit.length, 1);
  assert.equal(db.audit[0].args[8], 'REQUESTER_NOT_ELIGIBLE_FOR_SPIN_APPROVAL');
});

test('approval issuance rejects self-approval and excessive or malformed expiry', async () => {
  const db = new IssuanceD1(true);
  await assert.rejects(() => issueSpinApprovalD1(db, { ...issuance, requesterUid: issuance.approverUid }), /must differ/);
  await assert.rejects(() => issueSpinApprovalD1(db, {
    ...issuance, expiresAt: '2026-11-23T00:06:00.000Z',
  }), /no more than five minutes/);
  await assert.rejects(() => issueSpinApprovalD1(db, {
    ...issuance, actionDigest: 'not-a-digest',
  }), /actionDigest is invalid/);
  assert.equal(db.batchStatements.length, 0);
});
