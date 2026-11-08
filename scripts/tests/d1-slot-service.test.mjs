import assert from 'node:assert/strict';
import test from 'node:test';
import { playAndSettleD1Spin } from '../../src/server/d1-slot-service.mjs';

function priorSessionDb(volatility) {
  const prior = {
    session_id: 'session-prior',
    game_id: 'thats-my-lingo',
    rule_version: 'staging-5x3-demo-v3',
    reels_json: JSON.stringify({ matrix: Array.from({ length: 3 }, () => Array(5).fill('LEGACY_LION')), wins: [], volatility, xpAwardUnits: 25 }),
    wager_units: 500,
    payout_units: 0,
    status: 'settled',
    balance_after_units: 4500,
  };
  return {
    prepare(sql) {
      return {
        bind() { return this; },
        async first() {
          if (sql.includes('FROM lingo_game_sessions')) return prior;
          if (sql.includes('FROM lingo_game_wallets')) return { credits_units: 4500, xp_units: 25 };
          return null;
        },
      };
    },
  };
}

const request = {
  firebaseUid: 'firebase-user-001',
  gameId: 'thats-my-lingo',
  idempotencyKey: 'spin-2026-11-08-00000001',
  ruleVersion: 'staging-5x3-demo-v3',
  wagerUnits: 500,
};

test('same idempotency key and same volatility replays the settled result', async () => {
  const result = await playAndSettleD1Spin(priorSessionDb('medium'), { ...request, volatility: 'medium' });
  assert.equal(result.replayed, true);
  assert.equal(result.volatility, 'medium');
  assert.equal(result.xpUnits, 25);
  assert.equal(result.xpAwardUnits, 0);
});

test('same idempotency key with a different volatility profile is rejected', async () => {
  await assert.rejects(
    playAndSettleD1Spin(priorSessionDb('medium'), { ...request, volatility: 'high' }),
    /IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST/,
  );
});
