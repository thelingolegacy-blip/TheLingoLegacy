const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff"
};
const MAX_BODY_BYTES = 8192;
const DAILY_AD_CAP = 20;
const MAX_AD_REWARD = 100;
const MAX_GAME_SPEND = 50;
const RATE_LIMIT_PER_MINUTE = 60;
let firebaseJwksCache;
let firebaseJwksFetchedAt = 0;

function jsonResponse(status, body, origin, env) {
  const headers = { ...JSON_HEADERS, vary: "Origin" };
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean);
  if (origin && allowed.includes(origin)) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-credentials"] = "true";
  }
  return new Response(JSON.stringify(body), { status, headers });
}
function originAllowed(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean);
  return origin.startsWith("https://") && allowed.includes(origin);
}
function validId(value) {
  return typeof value === "string" && /^[A-Za-z0-9:_-]{8,128}$/.test(value);
}
function randomId() {
  return crypto.randomUUID();
}
function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  return Uint8Array.from(atob(padded), char => char.charCodeAt(0));
}
function bytesToHex(bytes) {
  return Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
}
function constantTimeEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string" || left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}
async function readPayload(request) {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) throw new Error("body_too_large");
  let payload;
  try { payload = JSON.parse(raw); } catch { throw new Error("invalid_json"); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("invalid_payload");
  return { raw, payload };
}
async function verifySignedPayload(request, raw, secret) {
  if (typeof secret !== "string" || secret.length < 32) return false;
  const timestamp = request.headers.get("X-LINGO-Timestamp");
  const signature = request.headers.get("X-LINGO-Signature");
  if (!timestamp || !/^\d{10}$/.test(timestamp) || !signature || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const seconds = Math.floor(Date.now() / 1000);
  if (Math.abs(seconds - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(timestamp + "." + raw));
  return constantTimeEqual(bytesToHex(new Uint8Array(digest)), signature.toLowerCase());
}
async function firebaseKeys() {
  const now = Date.now();
  if (firebaseJwksCache && now - firebaseJwksFetchedAt < 3600000) return firebaseJwksCache;
  const response = await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com", { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("identity_provider_unavailable");
  const body = await response.json();
  if (!Array.isArray(body.keys)) throw new Error("identity_provider_invalid_keys");
  firebaseJwksCache = body.keys;
  firebaseJwksFetchedAt = now;
  return firebaseJwksCache;
}
async function authenticateFirebase(request, env) {
  const projectId = env.FIREBASE_PROJECT_ID;
  if (typeof projectId !== "string" || !/^[a-z0-9-]{3,64}$/.test(projectId)) return null;
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer ([A-Za-z0-9._-]+)$/);
  if (!match) return null;
  const parts = match[1].split(".");
  if (parts.length !== 3) return null;
  let header, claims;
  try {
    header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[0])));
    claims = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[1])));
  } catch { return null; }
  if (header.alg !== "RS256" || typeof header.kid !== "string") return null;
  const now = Math.floor(Date.now() / 1000);
  if (claims.aud !== projectId || claims.iss !== "https://securetoken.google.com/" + projectId) return null;
  if (typeof claims.sub !== "string" || claims.sub.length < 1 || claims.sub.length > 128) return null;
  if (!Number.isInteger(claims.exp) || claims.exp <= now || !Number.isInteger(claims.iat) || claims.iat > now + 60) return null;
  const jwks = await firebaseKeys();
  const jwk = jwks.find(key => key.kid === header.kid && key.kty === "RSA");
  if (!jwk) return null;
  const publicKey = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, base64UrlToBytes(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
  return valid ? claims.sub : null;
}
async function applyRateLimit(db, userId, route) {
  const result = await db.prepare(`INSERT INTO loyalty_rate_limits(user_id,route,window_start,request_count)
    VALUES(?,?,strftime('%Y-%m-%dT%H:%M:00Z','now'),1)
    ON CONFLICT(user_id,route,window_start) DO UPDATE SET request_count=request_count+1
    WHERE request_count < ?`)
    .bind(userId, route, RATE_LIMIT_PER_MINUTE).run();
  return Number(result.meta?.changes || 0) === 1;
}
async function ensureWallet(db, userId) {
  await db.prepare("INSERT OR IGNORE INTO loyalty_wallets(user_id) VALUES (?)").bind(userId).run();
  return db.prepare("SELECT user_id,status,lingo_coins,game_credits FROM loyalty_wallet_balances WHERE user_id=?").bind(userId).first();
}
async function findDuplicate(db, userId, key, eventId) {
  return db.prepare("SELECT id FROM loyalty_ledger WHERE user_id=? AND (idempotency_key=? OR external_event_id=?) LIMIT 1")
    .bind(userId, key, eventId).first();
}
async function insertLedger(db, row) {
  return db.prepare(`INSERT OR IGNORE INTO loyalty_ledger
    (id,user_id,unit,delta,event_type,external_event_id,idempotency_key,metadata_json)
    VALUES (?,?,?,?,?,?,?,?)`)
    .bind(randomId(), row.userId, row.unit, row.delta, row.eventType, row.eventId, row.idempotencyKey, JSON.stringify(row.metadata || {})).run();
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const respond = (status, body) => jsonResponse(status, body, origin, env);
    try {
      if (!env.DB || !originAllowed(request, env)) return respond(403, { error: "origin_not_allowed" });
      const url = new URL(request.url);
      if (request.method === "OPTIONS") {
        if (!origin) return new Response(null, { status: 204, headers: JSON_HEADERS });
        return new Response(null, { status: 204, headers: {
          ...JSON_HEADERS,
          "access-control-allow-origin": origin,
          "access-control-allow-credentials": "true",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "authorization,content-type,idempotency-key,x-lingo-timestamp,x-lingo-signature",
          "access-control-max-age": "600",
          vary: "Origin"
        }});
      }

      if (request.method === "GET" && url.pathname === "/v1/wallet") {
        const userId = await authenticateFirebase(request, env);
        if (!userId) return respond(401, { error: "authentication_required" });
        if (!validId(userId)) return respond(403, { error: "identity_not_supported" });
        if (!(await applyRateLimit(env.DB, userId, "wallet_read"))) return respond(429, { error: "rate_limited" });
        const wallet = await ensureWallet(env.DB, userId);
        if (!wallet || wallet.status !== "active") return respond(403, { error: "wallet_unavailable" });
        const rows = await env.DB.prepare("SELECT unit,delta,event_type,created_at FROM loyalty_ledger WHERE user_id=? ORDER BY created_at DESC LIMIT 30").bind(userId).all();
        return respond(200, { unitPolicy: "non_cash_promotional_points", balances: { lingoCoins: wallet.lingo_coins, gameCredits: wallet.game_credits }, recentActivity: rows.results || [] });
      }

      if (request.method !== "POST") return respond(405, { error: "method_not_allowed" });
      const { raw, payload } = await readPayload(request);
      const idempotencyKey = request.headers.get("Idempotency-Key");
      if (!validId(idempotencyKey)) return respond(400, { error: "valid_idempotency_key_required" });

      let userId;
      let eventId;
      let mutation;

      if (url.pathname === "/v1/rewards/ad") {
        if (!(await verifySignedPayload(request, raw, env.AD_REWARD_HMAC_SECRET))) return respond(403, { error: "ad_callback_signature_invalid" });
        userId = payload.userId;
        eventId = payload.eventId;
        if (!validId(userId) || !validId(eventId) || !Number.isInteger(payload.coins) || payload.coins < 1 || payload.coins > MAX_AD_REWARD) return respond(400, { error: "reward_payload_invalid" });
        const activeWallet = await ensureWallet(env.DB, userId);
        if (!activeWallet || activeWallet.status !== "active") return respond(403, { error: "wallet_unavailable" });
        if (!(await applyRateLimit(env.DB, userId, "ad_reward"))) return respond(429, { error: "rate_limited" });
        const inserted = await env.DB.prepare(`INSERT OR IGNORE INTO loyalty_ledger
          (id,user_id,unit,delta,event_type,external_event_id,idempotency_key,metadata_json)
          SELECT ?,?, 'LINGOCOIN', ?, 'AD_REWARD', ?, ?, ?
          WHERE (SELECT COUNT(*) FROM loyalty_ledger WHERE user_id=? AND event_type='AD_REWARD' AND created_at >= date('now')) < ?`)
          .bind(randomId(), userId, payload.coins, eventId, idempotencyKey, JSON.stringify({ source: "signed_server_reward_callback" }), userId, DAILY_AD_CAP).run();
        if (!inserted.meta?.changes) {
          if (await findDuplicate(env.DB, userId, idempotencyKey, eventId)) return respond(409, { error: "duplicate_reward_event" });
          return respond(429, { error: "daily_reward_limit_reached" });
        }
        mutation = inserted;
      } else if (url.pathname === "/v1/game/grant") {
        if (!(await verifySignedPayload(request, raw, env.GAME_EVENT_HMAC_SECRET))) return respond(403, { error: "game_grant_signature_invalid" });
        userId = payload.userId;
        eventId = payload.eventId;
        if (!validId(userId) || !validId(eventId) || !Number.isInteger(payload.credits) || payload.credits < 1 || payload.credits > 100) return respond(400, { error: "game_grant_invalid" });
        const activeWallet = await ensureWallet(env.DB, userId);
        if (!activeWallet || activeWallet.status !== "active") return respond(403, { error: "wallet_unavailable" });
        if (!(await applyRateLimit(env.DB, userId, "game_grant"))) return respond(429, { error: "rate_limited" });
        mutation = await insertLedger(env.DB, { userId, unit: "GAME_CREDIT", delta: payload.credits, eventType: "GAME_GRANT", eventId, idempotencyKey, metadata: { source: "signed_game_server" } });
        if (!mutation.meta?.changes) return respond(409, { error: "duplicate_game_grant" });
      } else if (url.pathname === "/v1/game/spend") {
        userId = await authenticateFirebase(request, env);
        if (!userId || !validId(userId)) return respond(401, { error: "authentication_required" });
        eventId = payload.gameEventId;
        if (!validId(eventId) || payload.userId !== userId || !Number.isInteger(payload.credits) || payload.credits < 1 || payload.credits > MAX_GAME_SPEND) return respond(400, { error: "invalid_game_spend" });
        const activeWallet = await ensureWallet(env.DB, userId);
        if (!activeWallet || activeWallet.status !== "active") return respond(403, { error: "wallet_unavailable" });
        if (!(await verifySignedPayload(request, raw, env.GAME_EVENT_HMAC_SECRET))) return respond(403, { error: "game_event_signature_invalid" });
        if (!(await applyRateLimit(env.DB, userId, "game_spend"))) return respond(429, { error: "rate_limited" });
        mutation = await env.DB.prepare(`INSERT OR IGNORE INTO loyalty_ledger
          (id,user_id,unit,delta,event_type,external_event_id,idempotency_key,metadata_json)
          SELECT ?,?, 'GAME_CREDIT', ?, 'GAME_SPEND', ?, ?, '{}'
          WHERE (SELECT COALESCE(SUM(delta),0) FROM loyalty_ledger WHERE user_id=? AND unit='GAME_CREDIT') >= ?`)
          .bind(randomId(), userId, -payload.credits, eventId, idempotencyKey, userId, payload.credits).run();
        if (!mutation.meta?.changes) {
          if (await findDuplicate(env.DB, userId, idempotencyKey, eventId)) return respond(409, { error: "duplicate_game_spend" });
          return respond(409, { error: "insufficient_game_credits" });
        }
      } else if (url.pathname === "/v1/coupons/redeem") {
        userId = await authenticateFirebase(request, env);
        if (!userId || !validId(userId)) return respond(401, { error: "authentication_required" });
        if (payload.userId !== userId || !validId(payload.merchantId) || !validId(payload.offerId) || !validId(payload.authorizationId)) return respond(400, { error: "coupon_payload_invalid" });
        const activeWallet = await ensureWallet(env.DB, userId);
        if (!activeWallet || activeWallet.status !== "active") return respond(403, { error: "wallet_unavailable" });
        if (!(await verifySignedPayload(request, raw, env.MERCHANT_AUTH_HMAC_SECRET))) return respond(403, { error: "merchant_authorization_invalid" });
        if (!(await applyRateLimit(env.DB, userId, "coupon_redeem"))) return respond(429, { error: "rate_limited" });
        mutation = await env.DB.prepare(`INSERT OR IGNORE INTO coupon_redemptions
          (redemption_id,user_id,merchant_id,offer_id,authorization_id,status,idempotency_key)
          VALUES (?,?,?,?,?,'issued',?)`)
          .bind(randomId(), userId, payload.merchantId, payload.offerId, payload.authorizationId, idempotencyKey).run();
        if (!mutation.meta?.changes) return respond(409, { error: "duplicate_coupon_authorization" });
      } else {
        return respond(404, { error: "route_not_found" });
      }

      const wallet = await ensureWallet(env.DB, userId);
      if (!wallet || wallet.status !== "active") return respond(403, { error: "wallet_unavailable" });
      return respond(200, { accepted: true, balances: { lingoCoins: wallet.lingo_coins, gameCredits: wallet.game_credits }, note: "non-cash loyalty units; no cash value or cash redemption" });
    } catch (error) {
      const message = error?.message === "body_too_large" ? "body_too_large" : "request_invalid";
      return respond(400, { error: message });
    }
  },
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(env.DB.prepare("DELETE FROM loyalty_rate_limits WHERE window_start < strftime('%Y-%m-%dT%H:%M:00Z','now','-1 day')").run());
  }
};
