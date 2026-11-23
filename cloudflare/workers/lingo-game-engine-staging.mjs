import { verifyFirebaseIdToken } from '../../src/auth/firebase-id-token.mjs';
import { authorizeD1Request, issueSpinApprovalD1, requestCorrelationId, sha256Hex, verifyPendingApproval } from '../../src/server/saaae-d1.mjs';
import { findSettledD1SpinReplay, playAndSettleD1Spin } from '../../src/server/d1-slot-service.mjs';

const GAME_ID = 'thats-my-lingo';
const PRODUCT_ID = 'thats-my-lingo';
const SYMBOLS = ['LEGACY_LION', 'ELECTRIC_GOLD', 'CRIMSON_CROWN', 'OBSIDIAN_BAR', 'SEVEN'];
// Explicitly provisional staging-only virtual-credit rules; not an RTP certification.
const PAYTABLE = { LEGACY_LION: 40, ELECTRIC_GOLD: 30, CRIMSON_CROWN: 20, OBSIDIAN_BAR: 15, SEVEN: 15 };
const RULE_VERSION = 'staging-demo-v1';
const MAX_WAGER_UNITS = 100;

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

export function bearerTokenFromRequest(request) {
  const header = request.headers.get('authorization') || '';
  const match = /^Bearer\s+([^\s]+)$/i.exec(header);
  return match?.[1] || null;
}

async function identityFromRequest(request, env) {
  if (env.ENVIRONMENT !== 'staging' || !env.FIREBASE_PROJECT_ID
      || env.FIREBASE_PROJECT_ID === 'lingo-legacy-production') {
    return { ok: false, status: 503, code: 'STAGING_IDENTITY_NOT_CONFIGURED' };
  }
  const token = bearerTokenFromRequest(request);
  if (!token) return { ok: false, status: 401, code: 'UNAUTHORIZED' };
  let verified;
  try {
    verified = await verifyFirebaseIdToken(token, env.FIREBASE_PROJECT_ID);
  } catch {
    return { ok: false, status: 503, code: 'IDENTITY_PROVIDER_UNAVAILABLE' };
  }
  if (!verified.ok) {
    const unavailable = verified.code === 'TOKEN_VERIFICATION_UNAVAILABLE';
    return { ok: false, status: unavailable ? 503 : 401, code: unavailable ? 'IDENTITY_PROVIDER_UNAVAILABLE' : 'UNAUTHORIZED' };
  }
  return { ok: true, uid: verified.uid, authTime: verified.claims?.auth_time };
}

function tenantFromRequest(request) {
  const value = request.headers.get('x-lingo-tenant') || '';
  return /^[A-Za-z0-9._:-]{1,128}$/.test(value) ? value : null;
}

async function ensureAccount(db, uid, tenantId, authTime) {
  const accountResource = `account:${uid}`;
  const eligible = `
    EXISTS (
      SELECT 1
        FROM lingo_saaae_principals p
        JOIN lingo_saaae_tenant_memberships m
          ON m.firebase_uid = p.firebase_uid AND m.tenant_id = ? AND m.status = 'active'
        JOIN lingo_saaae_grants g
          ON g.firebase_uid = p.firebase_uid AND g.tenant_id = m.tenant_id
         AND g.product_id = ? AND g.resource_id = ? AND g.operation = 'account.bootstrap'
         AND g.effect = 'allow' AND g.status = 'active'
       WHERE p.firebase_uid = ? AND p.status = 'active' AND p.token_valid_after_epoch <= ?
         AND g.valid_from <= strftime('%Y-%m-%dT%H:%M:%fZ','now')
         AND (g.expires_at IS NULL OR g.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    )
    AND NOT EXISTS (
      SELECT 1 FROM lingo_saaae_grants d
       WHERE d.firebase_uid = ? AND d.tenant_id = ? AND d.product_id = ?
         AND d.resource_id = ? AND d.operation = 'account.bootstrap'
         AND d.effect = 'deny' AND d.status = 'active'
         AND d.valid_from <= strftime('%Y-%m-%dT%H:%M:%fZ','now')
         AND (d.expires_at IS NULL OR d.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    )
  `;
  const scope = [tenantId, PRODUCT_ID, accountResource, uid, authTime,
    uid, tenantId, PRODUCT_ID, accountResource];
  await db.batch([
    db.prepare(`INSERT OR IGNORE INTO lingo_game_accounts(firebase_uid) SELECT ? WHERE ${eligible}`)
      .bind(uid, ...scope),
    db.prepare(`INSERT OR IGNORE INTO lingo_game_wallets(firebase_uid) SELECT ? WHERE EXISTS (SELECT 1 FROM lingo_game_accounts WHERE firebase_uid = ?) AND ${eligible}`)
      .bind(uid, uid, ...scope),
    db.prepare(`INSERT OR IGNORE INTO lingo_game_progression(firebase_uid) SELECT ? WHERE EXISTS (SELECT 1 FROM lingo_game_accounts WHERE firebase_uid = ?) AND ${eligible}`)
      .bind(uid, uid, ...scope),
  ]);
}

async function recordDeniedApproval(db, values) {
  await db.prepare(`
    INSERT INTO lingo_saaae_audit_events
      (event_id, correlation_id, actor_uid, tenant_id, product_id, resource_id, operation, decision, reason_code, request_digest)
    VALUES (?, ?, ?, ?, ?, ?, 'spin', 'approval_required', ?, ?)
  `).bind(
    crypto.randomUUID(), values.correlationId, values.uid, values.tenantId,
    PRODUCT_ID, `game:${GAME_ID}`, values.reasonCode, values.actionDigest,
  ).run();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/healthz' && request.method === 'GET') {
      if (env.ENVIRONMENT !== 'staging' || !env.DB) return json({ status: 'degraded' }, 503);
      try {
        await env.DB.prepare('SELECT 1 AS ok').first();
        const required = await env.DB.prepare(`
          SELECT COUNT(*) AS present
            FROM sqlite_master
           WHERE type = 'table' AND name IN (
             'lingo_saaae_principals',
             'lingo_saaae_tenant_memberships',
             'lingo_saaae_grants',
             'lingo_saaae_approvals',
             'lingo_saaae_audit_events',
             'lingo_saaae_rate_limit_buckets'
           )
        `).first();
        if (required?.present !== 6) return json({ status: 'degraded', environment: 'staging' }, 503);
        return json({ status: 'ok', environment: 'staging', rulesVersion: RULE_VERSION });
      } catch {
        return json({ status: 'degraded', environment: 'staging' }, 503);
      }
    }

    const routes = {
      '/api/v1/accounts/bootstrap': 'POST',
      '/api/v1/wallet/balance': 'GET',
      '/api/v1/admin/approvals': 'POST',
      '/api/v1/slots/spin': 'POST',
    };
    const expectedMethod = routes[url.pathname];
    if (!expectedMethod) return json({ error: 'NOT_FOUND' }, 404);
    if (request.method !== expectedMethod) return json({ error: 'METHOD_NOT_ALLOWED' }, 405);

    const correlationId = requestCorrelationId(request);
    const identity = await identityFromRequest(request, env);
    if (!identity.ok) return json({ error: identity.code, correlationId }, identity.status);

    const tenantId = tenantFromRequest(request);
    if (!tenantId) return json({ error: 'TENANT_CONTEXT_REQUIRED', correlationId }, 400);

    try {
      if (url.pathname === '/api/v1/accounts/bootstrap') {
        const resourceId = `account:${identity.uid}`;
        const authorization = await authorizeD1Request(env.DB, {
          uid: identity.uid, authTime: identity.authTime, tenantId,
          productId: PRODUCT_ID, resourceId, operation: 'account.bootstrap',
          routeKey: 'account.bootstrap', correlationId, rateLimit: 5,
        });
        if (!authorization.ok) return json({ error: 'FORBIDDEN', reason: authorization.reasonCode, correlationId }, 403);

        // Account creation is permitted only after an existing principal,
        // active tenant membership, and exact scoped bootstrap grant are verified.
        await ensureAccount(env.DB, identity.uid, tenantId, identity.authTime);
        const wallet = await env.DB.prepare('SELECT credits_units, xp_units FROM lingo_game_wallets WHERE firebase_uid = ?').bind(identity.uid).first();
        if (!wallet) throw new Error('ACCOUNT_BOOTSTRAP_NOT_VERIFIED');
        return json({ status: 'account_ready', wallet, correlationId });
      }

      if (url.pathname === '/api/v1/wallet/balance') {
        const resourceId = `wallet:${identity.uid}`;
        const authorization = await authorizeD1Request(env.DB, {
          uid: identity.uid, authTime: identity.authTime, tenantId,
          productId: PRODUCT_ID, resourceId, operation: 'wallet.read',
          routeKey: 'wallet.read', correlationId, rateLimit: 60,
        });
        if (!authorization.ok) return json({ error: 'FORBIDDEN', reason: authorization.reasonCode, correlationId }, 403);
        const wallet = await env.DB.prepare('SELECT credits_units, xp_units FROM lingo_game_wallets WHERE firebase_uid = ?').bind(identity.uid).first();
        if (!wallet) return json({ error: 'ACCOUNT_NOT_INITIALIZED', correlationId }, 404);
        return json({
          creditsUnits: wallet.credits_units, xpUnits: wallet.xp_units,
          currency: 'NON_REDEEMABLE_PLAY_CREDITS', correlationId,
        });
      }

      if (url.pathname === '/api/v1/admin/approvals') {
        let body;
        try { body = await request.json(); } catch { return json({ error: 'INVALID_JSON', correlationId }, 400); }
        const requesterUid = body?.requesterUid;
        const wagerUnits = body?.wagerUnits;
        const idempotencyKey = body?.idempotencyKey;
        if (typeof requesterUid !== 'string' || requesterUid.length < 1 || requesterUid.length > 128
            || requesterUid === identity.uid) {
          return json({ error: 'INVALID_REQUESTER', correlationId }, 400);
        }
        if (!Number.isSafeInteger(wagerUnits) || wagerUnits < 1 || wagerUnits > MAX_WAGER_UNITS) {
          return json({ error: 'INVALID_WAGER', maxWagerUnits: MAX_WAGER_UNITS, correlationId }, 400);
        }
        if (typeof idempotencyKey !== 'string' || !/^[A-Za-z0-9._:-]{16,128}$/.test(idempotencyKey)) {
          return json({ error: 'IDEMPOTENCY_KEY_REQUIRED', correlationId }, 400);
        }
        const resourceId = `game:${GAME_ID}`;
        const authorization = await authorizeD1Request(env.DB, {
          uid: identity.uid, authTime: identity.authTime, tenantId,
          productId: PRODUCT_ID, resourceId, operation: 'approval.approve',
          routeKey: 'admin.approvals.issue', correlationId, rateLimit: 10,
        });
        if (!authorization.ok) return json({ error: 'FORBIDDEN', reason: authorization.reasonCode, correlationId }, 403);

        const actionDigest = await sha256Hex(JSON.stringify({
          tenantId, productId: PRODUCT_ID, resourceId, operation: 'spin',
          wagerUnits, idempotencyKey,
        }));
        const approvalId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        const issued = await issueSpinApprovalD1(env.DB, {
          approvalId, requesterUid, approverUid: identity.uid,
          approverAuthTime: identity.authTime, tenantId, productId: PRODUCT_ID,
          resourceId, actionDigest, expiresAt, correlationId,
        });
        if (!issued.ok) return json({ error: 'REQUESTER_NOT_ELIGIBLE', correlationId }, 403);
        return json({ approvalId, expiresAt, actionDigest, correlationId }, 201);
      }

      if (url.pathname === '/api/v1/slots/spin') {
        let body;
        try { body = await request.json(); } catch { return json({ error: 'INVALID_JSON', correlationId }, 400); }
        const wagerUnits = body?.wagerUnits;
        const approvalId = body?.approvalId;
        const idempotencyKey = request.headers.get('Idempotency-Key') || body?.idempotencyKey;
        if (!Number.isSafeInteger(wagerUnits) || wagerUnits < 1 || wagerUnits > MAX_WAGER_UNITS) {
          return json({ error: 'INVALID_WAGER', maxWagerUnits: MAX_WAGER_UNITS, correlationId }, 400);
        }
        if (typeof idempotencyKey !== 'string' || idempotencyKey.length < 16 || idempotencyKey.length > 128) {
          return json({ error: 'IDEMPOTENCY_KEY_REQUIRED', correlationId }, 400);
        }
        const resourceId = `game:${GAME_ID}`;
        const actionDigest = await sha256Hex(JSON.stringify({
          tenantId, productId: PRODUCT_ID, resourceId, operation: 'spin',
          wagerUnits, idempotencyKey,
        }));
        const authorization = await authorizeD1Request(env.DB, {
          uid: identity.uid, authTime: identity.authTime, tenantId,
          productId: PRODUCT_ID, resourceId, operation: 'spin',
          routeKey: 'slots.spin', correlationId, requestDigest: actionDigest, rateLimit: 20,
        });
        if (!authorization.ok) return json({ error: 'FORBIDDEN', reason: authorization.reasonCode, correlationId }, 403);

        const replay = await findSettledD1SpinReplay(env.DB, {
          firebaseUid: identity.uid, gameId: GAME_ID, idempotencyKey,
          ruleVersion: RULE_VERSION, wagerUnits,
        });
        if (replay) {
          return json({
            sessionId: replay.session_id, reels: JSON.parse(replay.reels_json),
            wagerUnits: replay.wager_units, payoutUnits: replay.payout_units,
            newBalanceUnits: replay.balance_after_units, replayed: true,
            currency: 'NON_REDEEMABLE_PLAY_CREDITS', rulesVersion: replay.rule_version,
            correlationId,
          });
        }

        const approvalValid = await verifyPendingApproval(env.DB, {
          approvalId, uid: identity.uid, tenantId, productId: PRODUCT_ID,
          resourceId, operation: 'spin', actionDigest,
        });
        if (!approvalValid) {
          await recordDeniedApproval(env.DB, {
            correlationId, uid: identity.uid, tenantId, actionDigest,
            reasonCode: 'EXACT_UNEXPIRED_APPROVAL_REQUIRED',
          });
          return json({ error: 'APPROVAL_REQUIRED', correlationId }, 403);
        }

        const result = await playAndSettleD1Spin(env.DB, {
          firebaseUid: identity.uid, gameId: GAME_ID, idempotencyKey,
          ruleVersion: RULE_VERSION, symbols: SYMBOLS, paytable: PAYTABLE,
          wagerUnits, tenantId, approvalId, actionDigest, correlationId, authTime: identity.authTime,
        });
        return json({
          sessionId: result.session_id, reels: JSON.parse(result.reels_json),
          wagerUnits: result.wager_units, payoutUnits: result.payout_units,
          newBalanceUnits: result.balance_after_units, replayed: result.replayed,
          currency: 'NON_REDEEMABLE_PLAY_CREDITS', rulesVersion: result.rule_version,
          correlationId,
        });
      }
      return json({ error: 'NOT_FOUND', correlationId }, 404);
    } catch (error) {
      const message = String(error?.message || error);
      if (message.includes('INSUFFICIENT_FUNDS')) return json({ error: 'INSUFFICIENT_FUNDS', correlationId }, 409);
      if (message.includes('IDEMPOTENCY_KEY_REUSED')) return json({ error: 'IDEMPOTENCY_CONFLICT', correlationId }, 409);
      if (message.includes('IDEMPOTENT_SESSION_NOT_SETTLED')) return json({ error: 'SETTLEMENT_PENDING', correlationId }, 409);
      // Authorization, audit, approval, and rate-limit storage failures fail closed.
      return json({ error: 'STAGING_AUTHORIZATION_OR_SETTLEMENT_UNAVAILABLE', correlationId }, 503);
    }
  },
};
