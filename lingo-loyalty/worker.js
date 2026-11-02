const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const MAX_BODY_BYTES = 8192;
const DAILY_AD_CAP = 20;
const MAX_AD_REWARD = 100;
const MAX_GAME_SPEND = 50;

function response(status, body, origin) {
  const headers = { ...JSON_HEADERS, vary: "Origin" };
  if (origin) headers["access-control-allow-origin"] = origin;
  return new Response(JSON.stringify(body), { status, headers });
}
function safeEqualOrigin(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return true; // Native clients still require authenticated sessions.
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean);
  return allowed.includes(origin) && origin.startsWith("https://");
}
async function readJson(request) {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) throw new Error("body_too_large");
  return JSON.parse(raw);
}
function validId(value) {
  return typeof value === "string" && /^[A-Za-z0-9:_-]{8,128}$/.test(value);
}
function id() {
  return crypto.randomUUID();
}
async function authenticate(request, env) {
  if (typeof env.AUTHENTICATE !== "function") return null;
  const result = await env.AUTHENTICATE(request);
  return result && validId(result.userId) ? result.userId : null;
}
async function ensureWallet(db, userId) {
  await db.prepare("INSERT OR IGNORE INTO loyalty_wallets(user_id) VALUES (?)").bind(userId).run();
  const wallet = await db.prepare("SELECT user_id,status,lingo_coins,game_credits FROM loyalty_wallet_balances WHERE user_id = ?").bind(userId).first();
  return wallet;
}
async function ledgerInsert(db, row) {
  return db.prepare(`INSERT OR IGNORE INTO loyalty_ledger
    (id,user_id,unit,delta,event_type,external_event_id,idempotency_key,metadata_json)
    VALUES (?,?,?,?,?,?,?,?)`)
    .bind(id(), row.userId, row.unit, row.delta, row.eventType, row.externalEventId, row.idempotencyKey, JSON.stringify(row.metadata || {})).run();
}
export default {
  async fetch(request, env) {
    const respond = (status, body) => response(status, body, request.headers.get("Origin"));
    try {
      if (!env.DB || !safeEqualOrigin(request, env)) return respond(403, { error: "origin_not_allowed" });
      const url = new URL(request.url);
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...JSON_HEADERS, "access-control-allow-origin": request.headers.get("Origin"), "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type,idempotency-key", "access-control-max-age": "600", vary: "Origin" } });
      const userId = await authenticate(request, env);
      if (!userId) return respond(401, { error: "authentication_required" });
      const wallet = await ensureWallet(env.DB, userId);
      if (!wallet || wallet.status !== "active") return respond(403, { error: "wallet_unavailable" });

      if (request.method === "GET" && url.pathname === "/v1/wallet") {
        const rows = await env.DB.prepare("SELECT unit,delta,event_type,created_at FROM loyalty_ledger WHERE user_id=? ORDER BY created_at DESC LIMIT 30").bind(userId).all();
        return respond(200, { unitPolicy: "non_cash_promotional_points", balances: { lingoCoins: wallet.lingo_coins, gameCredits: wallet.game_credits }, recentActivity: rows.results || [] });
      }

      if (request.method !== "POST") return respond(405, { error: "method_not_allowed" });
      if (typeof env.RATE_LIMITER !== "function") return respond(503, { error: "rate_limiter_unconfigured" });
      if (!(await env.RATE_LIMITER({ userId, route: url.pathname, request }))) return respond(429, { error: "rate_limited" });
      const key = request.headers.get("Idempotency-Key");
      if (!validId(key)) return respond(400, { error: "valid_idempotency_key_required" });
      const payload = await readJson(request);

      if (url.pathname === "/v1/rewards/ad") {
        if (typeof env.VERIFY_AD_REWARD !== "function") return respond(503, { error: "ad_verification_unconfigured" });
        const proof = await env.VERIFY_AD_REWARD(payload);
        if (!proof || proof.userId !== userId || !validId(proof.eventId) || !Number.isInteger(proof.coins) || proof.coins < 1 || proof.coins > MAX_AD_REWARD) return respond(403, { error: "reward_proof_invalid" });
        const inserted = await env.DB.prepare(`INSERT OR IGNORE INTO loyalty_ledger
          (id,user_id,unit,delta,event_type,external_event_id,idempotency_key,metadata_json)
          SELECT ?,?, 'LINGOCOIN', ?, 'AD_REWARD', ?, ?, ?
          WHERE (SELECT COUNT(*) FROM loyalty_ledger WHERE user_id=? AND event_type='AD_REWARD' AND created_at >= date('now')) < ?`)
          .bind(id(), userId, proof.coins, proof.eventId, key, JSON.stringify({ source: "server_verified_rewarded_ad" }), userId, DAILY_AD_CAP).run();
        if (!inserted.meta?.changes) {
          const prior = await env.DB.prepare("SELECT id FROM loyalty_ledger WHERE user_id=? AND idempotency_key=?").bind(userId, key).first();
          if (!prior) return respond(429, { error: "daily_reward_limit_reached_or_duplicate_event" });
        }
      } else if (url.pathname === "/v1/game/grant") {
        if (typeof env.VERIFY_GAME_GRANT !== "function") return respond(503, { error: "game_grant_verification_unconfigured" });
        const grant = await env.VERIFY_GAME_GRANT(payload);
        if (!grant || grant.userId !== userId || !validId(grant.eventId) || !Number.isInteger(grant.credits) || grant.credits < 1 || grant.credits > 100) return respond(403, { error: "game_grant_invalid" });
        await ledgerInsert(env.DB, { userId, unit: "GAME_CREDIT", delta: grant.credits, eventType: "GAME_GRANT", externalEventId: grant.eventId, idempotencyKey: key, metadata: { source: "verified_game_server" } });
      } else if (url.pathname === "/v1/game/spend") {
        if (!validId(payload.gameEventId) || !Number.isInteger(payload.credits) || payload.credits < 1 || payload.credits > MAX_GAME_SPEND) return respond(400, { error: "invalid_game_spend" });
        if (typeof env.VERIFY_GAME_EVENT !== "function" || !(await env.VERIFY_GAME_EVENT(payload, userId))) return respond(403, { error: "game_event_unverified" });
        const spend = await env.DB.prepare(`INSERT OR IGNORE INTO loyalty_ledger
          (id,user_id,unit,delta,event_type,external_event_id,idempotency_key,metadata_json)
          SELECT ?,?, 'GAME_CREDIT', ?, 'GAME_SPEND', ?, ?, '{}'
          WHERE (SELECT COALESCE(SUM(delta),0) FROM loyalty_ledger WHERE user_id=? AND unit='GAME_CREDIT') >= ?`)
          .bind(id(), userId, -payload.credits, payload.gameEventId, key, userId, payload.credits).run();
        if (!spend.meta?.changes) return respond(409, { error: "insufficient_game_credits_or_duplicate_event" });
      } else if (url.pathname === "/v1/coupons/redeem") {
        if (typeof env.AUTHORIZE_MERCHANT_REDEMPTION !== "function") return respond(503, { error: "merchant_redemption_unconfigured" });
        const authorization = await env.AUTHORIZE_MERCHANT_REDEMPTION(payload, userId);
        if (!authorization || !validId(authorization.authorizationId) || !validId(authorization.merchantId) || !validId(authorization.offerId)) return respond(403, { error: "merchant_authorization_invalid" });
        await env.DB.prepare(`INSERT OR IGNORE INTO coupon_redemptions
          (redemption_id,user_id,merchant_id,offer_id,authorization_id,status,idempotency_key)
          VALUES (?,?,?,?,?,'issued',?)`)
          .bind(id(), userId, authorization.merchantId, authorization.offerId, authorization.authorizationId, key).run();
      } else {
        return respond(404, { error: "route_not_found" });
      }
      const updated = await ensureWallet(env.DB, userId);
      return respond(200, { accepted: true, balances: { lingoCoins: updated.lingo_coins, gameCredits: updated.game_credits }, note: "non-cash loyalty units; no cash value or cash redemption" });
    } catch (error) {
      return respond(400, { error: error?.message === "body_too_large" ? "body_too_large" : "request_invalid" });
    }
  }
};
