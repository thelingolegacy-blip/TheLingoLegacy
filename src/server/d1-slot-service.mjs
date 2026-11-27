import { evaluateSpin5x3 } from './slot-engine-5x3.mjs';
import { validateIdempotencyKey } from './slot-engine.mjs';

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

export async function findSettledD1SpinReplay(db, { firebaseUid, gameId, idempotencyKey, ruleVersion, wagerUnits }) {
  safeId(firebaseUid, 'firebaseUid');
  safeId(gameId, 'gameId');
  safeId(ruleVersion, 'ruleVersion');
  if (!validateIdempotencyKey(idempotencyKey)) throw new TypeError('idempotencyKey is invalid');
  const prior = await db.prepare(SESSION_SELECT).bind(firebaseUid, idempotencyKey).first();
  return prior ? assertSameRequest(prior, gameId, ruleVersion, wagerUnits) : null;
}

/**
 * Generate and persist one server-authoritative spin. Approval consumption,
 * session creation, ledger settlement and the corresponding audit event share
 * one D1 batch so a failed debit or missing approval rolls the entire action back.
 */
export async function playAndSettleD1Spin(db, {
  firebaseUid, gameId, idempotencyKey, ruleVersion, weightedSymbols, paytable, wagerUnits,
  activePaylines = 20, tenantId, approvalId, actionDigest, correlationId, authTime,
}) {
  safeId(firebaseUid, 'firebaseUid');
  safeId(gameId, 'gameId');
  safeId(ruleVersion, 'ruleVersion');
  safeId(tenantId, 'tenantId');
  safeId(approvalId, 'approvalId');
  safeId(actionDigest, 'actionDigest');
  safeId(correlationId, 'correlationId');
  if (!validateIdempotencyKey(idempotencyKey)) throw new TypeError('idempotencyKey is invalid');
  if (!Number.isSafeInteger(wagerUnits) || wagerUnits < 1) throw new RangeError('wagerUnits is invalid');

  // An already-settled retry returns the original result without re-consuming approval.
  const prior = await db.prepare(SESSION_SELECT).bind(firebaseUid, idempotencyKey).first();
  if (prior) return assertSameRequest(prior, gameId, ruleVersion, wagerUnits);

  const approval = db.prepare(`
    UPDATE lingo_saaae_approvals
       SET status = 'consumed', consumed_at = strftime('%Y-%m-%dT%H:%M:%fZ','now'), consumed_by = ?
     WHERE approval_id = ? AND requester_uid = ? AND tenant_id = ?
       AND product_id = ? AND resource_id = ? AND operation = 'spin'
       AND action_digest = ? AND status = 'approved'
       AND expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now')
       AND approver_uid <> requester_uid
       AND EXISTS (
         SELECT 1 FROM lingo_saaae_principals p
          WHERE p.firebase_uid = lingo_saaae_approvals.requester_uid
            AND p.status = 'active' AND p.token_valid_after_epoch <= ?
       )
       AND EXISTS (
         SELECT 1 FROM lingo_saaae_tenant_memberships m
          WHERE m.firebase_uid = lingo_saaae_approvals.requester_uid
            AND m.tenant_id = lingo_saaae_approvals.tenant_id AND m.status = 'active'
       )
       AND EXISTS (
         SELECT 1 FROM lingo_saaae_grants g
          WHERE g.firebase_uid = lingo_saaae_approvals.requester_uid
            AND g.tenant_id = lingo_saaae_approvals.tenant_id
            AND g.product_id = lingo_saaae_approvals.product_id
            AND g.resource_id = lingo_saaae_approvals.resource_id
            AND g.operation = 'spin' AND g.effect = 'allow' AND g.status = 'active'
            AND g.valid_from <= strftime('%Y-%m-%dT%H:%M:%fZ','now')
            AND (g.expires_at IS NULL OR g.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       )
       AND NOT EXISTS (
         SELECT 1 FROM lingo_saaae_grants g
          WHERE g.firebase_uid = lingo_saaae_approvals.requester_uid
            AND g.tenant_id = lingo_saaae_approvals.tenant_id
            AND g.product_id = lingo_saaae_approvals.product_id
            AND g.resource_id = lingo_saaae_approvals.resource_id
            AND g.operation = 'spin' AND g.effect = 'deny' AND g.status = 'active'
            AND g.valid_from <= strftime('%Y-%m-%dT%H:%M:%fZ','now')
            AND (g.expires_at IS NULL OR g.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       )
       AND EXISTS (
         SELECT 1 FROM lingo_saaae_principals p
          WHERE p.firebase_uid = lingo_saaae_approvals.approver_uid AND p.status = 'active'
            AND p.token_valid_after_epoch <= lingo_saaae_approvals.approver_auth_time_epoch
       )
       AND EXISTS (
         SELECT 1 FROM lingo_saaae_tenant_memberships m
          WHERE m.firebase_uid = lingo_saaae_approvals.approver_uid
            AND m.tenant_id = lingo_saaae_approvals.tenant_id AND m.status = 'active'
       )
       AND EXISTS (
         SELECT 1 FROM lingo_saaae_grants g
          WHERE g.firebase_uid = lingo_saaae_approvals.approver_uid
            AND g.tenant_id = lingo_saaae_approvals.tenant_id
            AND g.product_id = lingo_saaae_approvals.product_id
            AND g.resource_id = lingo_saaae_approvals.resource_id
            AND g.operation = 'approval.approve' AND g.effect = 'allow' AND g.status = 'active'
            AND g.valid_from <= strftime('%Y-%m-%dT%H:%M:%fZ','now')
            AND (g.expires_at IS NULL OR g.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       )
       AND NOT EXISTS (
         SELECT 1 FROM lingo_saaae_grants g
          WHERE g.firebase_uid = lingo_saaae_approvals.approver_uid
            AND g.tenant_id = lingo_saaae_approvals.tenant_id
            AND g.product_id = lingo_saaae_approvals.product_id
            AND g.resource_id = lingo_saaae_approvals.resource_id
            AND g.operation = 'approval.approve' AND g.effect = 'deny' AND g.status = 'active'
            AND g.valid_from <= strftime('%Y-%m-%dT%H:%M:%fZ','now')
            AND (g.expires_at IS NULL OR g.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       )
  `).bind(firebaseUid, approvalId, firebaseUid, tenantId, gameId, `game:${gameId}`, actionDigest, authTime);

  const sessionId = crypto.randomUUID();
  const outcome = evaluateSpin5x3({ weightedSymbols, paytable, wagerUnits, activePaylines });
  const insertSession = db.prepare(`
    INSERT INTO lingo_game_sessions
      (session_id, firebase_uid, game_id, idempotency_key, rule_version, reels_json, wager_units, payout_units, status)
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, 'pending'
     WHERE EXISTS (
       SELECT 1 FROM lingo_saaae_approvals
        WHERE approval_id = ? AND requester_uid = ? AND tenant_id = ?
          AND product_id = ? AND resource_id = ? AND operation = 'spin'
          AND action_digest = ? AND status = 'consumed' AND consumed_by = ?
     )
  `).bind(
    sessionId, firebaseUid, gameId, idempotencyKey, ruleVersion,
    JSON.stringify(outcome.grid), wagerUnits, outcome.totalPayoutUnits,
    approvalId, firebaseUid, tenantId, gameId, `game:${gameId}`, actionDigest, firebaseUid,
  );

  const debit = db.prepare(`
    INSERT INTO lingo_wallet_ledger (event_id, session_id, firebase_uid, event_type, delta_units)
    VALUES (?, ?, ?, 'slot_wager_debit', ?)
  `).bind(`${sessionId}:debit`, sessionId, firebaseUid, -wagerUnits);

  const statements = [approval, insertSession, debit];
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
  statements.push(db.prepare(`
    INSERT INTO lingo_saaae_audit_events
      (event_id, correlation_id, actor_uid, tenant_id, product_id, resource_id, operation, decision, reason_code, request_digest)
    SELECT ?, ?, ?, ?, ?, ?, 'spin', 'approval_consumed', 'APPROVAL_CONSUMED_WITH_SETTLEMENT', ?
     WHERE EXISTS (SELECT 1 FROM lingo_game_sessions WHERE session_id = ? AND status = 'settled')
  `).bind(
    crypto.randomUUID(), correlationId, firebaseUid, tenantId, gameId,
    `game:${gameId}`, actionDigest, sessionId,
  ));

  try {
    // D1 batch is atomic. If approval consumption matches zero rows, the gated
    // session insert creates no row and the ledger FK aborts/rolls back the batch.
    await db.batch(statements);
  } catch (error) {
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
