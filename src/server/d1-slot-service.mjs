import { evaluateThreeReelSpin, validateIdempotencyKey } from './slot-engine.mjs';

const safeId = (value, field) => {
  if (typeof value !== 'string' || value.length < 1 || value.length > 128) {
    throw new TypeError(`${field} is invalid`);
  }
  return value;
};

const SESSION_SELECT = `
  SELECT session_id, game_id, rule_version, reels_json, wager_units, payout_units, status, balance_after_units
    FROM lingo_game_sessions
   WHERE firebase_uid = ? AND idempotency_key = ?
`;

function assertSameRequest(existing, gameId, ruleVersion, wagerUnits) {
  if (existing.game_id !== gameId || existing.rule_version !== ruleVersion || existing.wager_units !== wagerUnits) {
    throw new Error('IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST');
  }
  if (existing.status !== 'settled' || !Number.isSafeInteger(existing.balance_after_units)) {
    throw new Error('IDEMPOTENT_SESSION_NOT_SETTLED');
  }
  return { ...existing, replayed: true };
}

/**
 * Generate and persist one server-authoritative spin. The result is generated
 * here from Web Crypto; never accept reels or payout values from the browser.
 * The caller must pass only a Firebase UID returned by verifyFirebaseIdToken.
 * Authorization, rate limits, wager limits, account state and game access are
 * separate mandatory checks at the API boundary.
 */
export async function playAndSettleD1Spin(db, {
  firebaseUid, gameId, idempotencyKey, ruleVersion, symbols, paytable, wagerUnits,
}) {
  safeId(firebaseUid, 'firebaseUid');
  safeId(gameId, 'gameId');
  safeId(ruleVersion, 'ruleVersion');
  if (!validateIdempotencyKey(idempotencyKey)) throw new TypeError('idempotencyKey is invalid');

  // Check before consuming randomness so a normal retry returns the original spin.
  const prior = await db.prepare(SESSION_SELECT).bind(firebaseUid, idempotencyKey).first();
  if (prior) return assertSameRequest(prior, gameId, ruleVersion, wagerUnits);

  const outcome = evaluateThreeReelSpin({ symbols, paytable, wagerUnits });
  const sessionId = crypto.randomUUID();
  const insertSession = db.prepare(`
    INSERT INTO lingo_game_sessions
      (session_id, firebase_uid, game_id, idempotency_key, rule_version, reels_json, wager_units, payout_units, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).bind(sessionId, firebaseUid, gameId, idempotencyKey, ruleVersion, JSON.stringify(outcome.reels), wagerUnits, outcome.payoutUnits);

  const debit = db.prepare(`
    INSERT INTO lingo_wallet_ledger (event_id, session_id, firebase_uid, event_type, delta_units)
    VALUES (?, ?, ?, 'slot_wager_debit', ?)
  `).bind(`${sessionId}:debit`, sessionId, firebaseUid, -wagerUnits);

  const statements = [insertSession, debit];
  if (outcome.payoutUnits > 0) {
    statements.push(db.prepare(`
      INSERT INTO lingo_wallet_ledger (event_id, session_id, firebase_uid, event_type, delta_units)
      VALUES (?, ?, ?, 'slot_payout_credit', ?)
    `).bind(`${sessionId}:payout`, sessionId, firebaseUid, outcome.payoutUnits));
  }
  statements.push(db.prepare(`
    UPDATE lingo_game_sessions
       SET status = 'settled', balance_after_units = (
         SELECT credits_units FROM lingo_game_wallets WHERE firebase_uid = ?
       )
     WHERE session_id = ? AND firebase_uid = ? AND status = 'pending'
  `).bind(firebaseUid, sessionId, firebaseUid));

  try {
    // D1 batch executes these statements atomically. Ledger triggers apply deltas
    // and abort the transaction if the wallet would become negative.
    await db.batch(statements);
  } catch (error) {
    // Concurrent requests with the same idempotency key converge on one result.
    const existing = await db.prepare(SESSION_SELECT).bind(firebaseUid, idempotencyKey).first();
    if (existing) return assertSameRequest(existing, gameId, ruleVersion, wagerUnits);
    throw error;
  }

  const result = await db.prepare(`
    SELECT session_id, game_id, rule_version, reels_json, wager_units, payout_units, status, balance_after_units
      FROM lingo_game_sessions
     WHERE session_id = ? AND firebase_uid = ?
  `).bind(sessionId, firebaseUid).first();
  if (!result || result.status !== 'settled' || !Number.isSafeInteger(result.balance_after_units)) {
    throw new Error('SPIN_SETTLEMENT_NOT_VERIFIED');
  }
  return { ...result, replayed: false };
}
