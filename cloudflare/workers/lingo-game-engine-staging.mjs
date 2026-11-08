import { verifyFirebaseIdToken } from '../../src/auth/firebase-id-token.mjs';
import { playAndSettleD1Spin } from '../../src/server/d1-slot-service.mjs';

const SYMBOLS = ['LEGACY_LION', 'ELECTRIC_GOLD', 'CRIMSON_CROWN', 'OBSIDIAN_BAR', 'SEVEN'];
// Explicitly provisional staging-only virtual-credit rules; not an RTP certification.
const PAYTABLE = { LEGACY_LION: 40, ELECTRIC_GOLD: 30, CRIMSON_CROWN: 20, OBSIDIAN_BAR: 15, SEVEN: 15 };
const RULE_VERSION = 'staging-demo-v1';
const MAX_WAGER_UNITS = 100;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

async function uidFromRequest(request, env) {
export function bearerTokenFromRequest(request) {
  const header = request.headers.get('authorization') || '';
  const match = /^Bearer\s+([^\s]+)$/i.exec(header);
  return match?.[1] || null;
}

async function uidFromRequest(request, env) {
  const token = bearerTokenFromRequest(request);
  if (!token) return null;
  const verified = await verifyFirebaseIdToken(token, env.FIREBASE_PROJECT_ID);
  return verified.ok ? verified.uid : null;
}

async function ensureAccount(db, uid) {
  await db.batch([
    db.prepare('INSERT OR IGNORE INTO lingo_game_accounts(firebase_uid) VALUES (?)').bind(uid),
    db.prepare('INSERT OR IGNORE INTO lingo_game_wallets(firebase_uid) VALUES (?)').bind(uid),
    db.prepare('INSERT OR IGNORE INTO lingo_game_progression(firebase_uid) VALUES (?)').bind(uid),
  ]);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/healthz' && request.method === 'GET') {
      try {
        const check = await env.DB.prepare('SELECT 1 AS ok').first();
        const tables = await env.DB.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table'").first();
        return json({ status: check?.ok === 1 ? 'ok' : 'degraded', environment: env.ENVIRONMENT, database: 'connected', tableCount: tables?.count ?? 0, rulesVersion: RULE_VERSION });
      } catch {
        return json({ status: 'degraded', environment: env.ENVIRONMENT, database: 'unavailable' }, 503);
      }
    }
    if (url.pathname !== '/api/v1/accounts/bootstrap'
      && url.pathname !== '/api/v1/wallet/balance'
      && url.pathname !== '/api/v1/slots/spin') return json({ error: 'NOT_FOUND' }, 404);

    const uid = await uidFromRequest(request, env);
    if (!uid) return json({ error: 'UNAUTHORIZED' }, 401);

    try {
      if (url.pathname === '/api/v1/accounts/bootstrap' && request.method === 'POST') {
        await ensureAccount(env.DB, uid);
        const wallet = await env.DB.prepare('SELECT credits_units, xp_units FROM lingo_game_wallets WHERE firebase_uid = ?').bind(uid).first();
        return json({ status: 'account_ready', wallet });
      }
      if (url.pathname === '/api/v1/wallet/balance' && request.method === 'GET') {
        const wallet = await env.DB.prepare('SELECT credits_units, xp_units FROM lingo_game_wallets WHERE firebase_uid = ?').bind(uid).first();
        if (!wallet) return json({ error: 'ACCOUNT_NOT_INITIALIZED' }, 404);
        return json({ creditsUnits: wallet.credits_units, xpUnits: wallet.xp_units, currency: 'NON_REDEEMABLE_PLAY_CREDITS' });
      }
      if (url.pathname === '/api/v1/slots/spin' && request.method === 'POST') {
        let body;
        try { body = await request.json(); } catch { return json({ error: 'INVALID_JSON' }, 400); }
        const wagerUnits = body?.wagerUnits;
        const idempotencyKey = request.headers.get('Idempotency-Key') || body?.idempotencyKey;
        if (!Number.isSafeInteger(wagerUnits) || wagerUnits < 1 || wagerUnits > MAX_WAGER_UNITS) {
          return json({ error: 'INVALID_WAGER', maxWagerUnits: MAX_WAGER_UNITS }, 400);
        }
        const result = await playAndSettleD1Spin(env.DB, {
          firebaseUid: uid, gameId: 'thats-my-lingo', idempotencyKey, ruleVersion: RULE_VERSION,
          symbols: SYMBOLS, paytable: PAYTABLE, wagerUnits,
        });
        return json({
          sessionId: result.session_id, reels: JSON.parse(result.reels_json),
          wagerUnits: result.wager_units, payoutUnits: result.payout_units,
          newBalanceUnits: result.balance_after_units, replayed: result.replayed,
          currency: 'NON_REDEEMABLE_PLAY_CREDITS', rulesVersion: result.rule_version,
        });
      }
      return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
    } catch (error) {
      const message = String(error?.message || error);
      if (message.includes('INSUFFICIENT_FUNDS')) return json({ error: 'INSUFFICIENT_FUNDS' }, 409);
      if (message.includes('IDEMPOTENCY_KEY_REUSED')) return json({ error: 'IDEMPOTENCY_CONFLICT' }, 409);
      if (message.includes('IDEMPOTENT_SESSION_NOT_SETTLED')) return json({ error: 'SETTLEMENT_PENDING' }, 409);
      return json({ error: 'INTERNAL_ERROR' }, 500);
    }
  },
};
