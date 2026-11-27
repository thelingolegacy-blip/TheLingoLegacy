import assert from 'node:assert/strict';
import test from 'node:test';
import { playAndSettleD1Spin } from '../../src/server/d1-slot-service.mjs';

class SettlementD1 {
  constructor() { this.batchStatements = []; this.sessionReads = 0; }
  prepare(sql) {
    const db = this;
    return {
      sql, args: [],
      bind(...args) { this.args = args; return this; },
      async first() {
        if (sql.includes('WHERE firebase_uid = ? AND idempotency_key = ?')) {
          db.sessionReads += 1;
          return null;
        }
        if (sql.includes('WHERE session_id = ? AND firebase_uid = ?')) {
          return {
            session_id: 'session-1', game_id: 'thats-my-lingo', rule_version: 'tml-5x3-20line-option2-v1',
            ruleset_digest: 'a'.repeat(64), reels_json: JSON.stringify(Array.from({ length: 5 }, () => ['SEVEN','SEVEN','SEVEN'])), wager_units: 20, payout_units: 300,
            status: 'settled', balance_after_units: 114,
          };
        }
        throw new Error('Unexpected first query: ' + sql);
      },
    };
  }
  async batch(statements) { this.batchStatements = statements; return []; }
}

test('settlement atomically rechecks approver token freshness and explicit deny grants', async () => {
  const db = new SettlementD1();
  const result = await playAndSettleD1Spin(db, {
    firebaseUid: 'requester-1', gameId: 'thats-my-lingo', idempotencyKey: 'settlement-test-0001',
    ruleVersion: 'tml-5x3-20line-option2-v1', rulesetDigest: 'a'.repeat(64),
    weightedSymbols: [{ symbol: 'SEVEN', weight: 1 }], paytable: { SEVEN: { 3: 1, 4: 5, 5: 15 } },
    wagerUnits: 20, activePaylines: 20, tenantId: 'tenant-1', approvalId: 'approval-1',
    actionDigest: 'a'.repeat(64), correlationId: 'corr-1', authTime: 120,
  });
  assert.equal(result.status, 'settled');
  assert.equal(db.batchStatements.length >= 6, true);
  assert.match(db.batchStatements[1].sql, /ruleset_digest/);
  const payoutCredit = db.batchStatements.find((statement) => statement.sql.includes('slot_payout_credit'));
  assert.ok(payoutCredit, 'aggregate payout credit must be included in the atomic D1 batch');
  assert.equal(payoutCredit.args[3], 300);
  const approvalSql = db.batchStatements[0].sql;
  assert.match(approvalSql, /approver_auth_time_epoch/);
  assert.match(approvalSql, /token_valid_after_epoch <= lingo_saaae_approvals\.approver_auth_time_epoch/);
  assert.match(approvalSql, /approval\.approve/);
  assert.match(approvalSql, /effect = 'deny'/);
});
