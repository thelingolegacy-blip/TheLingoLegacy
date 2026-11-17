import { verifyFirebaseIdToken } from '../auth/firebase-id-token.mjs';

const MAX_BODY_BYTES = 8 * 1024;
const MAX_MESSAGE_CHARS = 2000;
const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT = 20;
const RATE_BUCKET_MAX = 5000;
const buckets = new Map();

/**
 * Authenticated public askLINGO facade.
 * It intentionally returns a disabled response until a separately approved,
 * zero-cost-safe provider/mock mode is implemented. It never invokes OpenAI.
 */
export async function handleAskLingoRequest(request, env, options = {}) {
  if (request.method !== 'POST') return json({ ok: false, code: 'METHOD_NOT_ALLOWED' }, 405);
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return json({ ok: false, code: 'UNSUPPORTED_MEDIA_TYPE' }, 415);
  }
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_BYTES) return json({ ok: false, code: 'REQUEST_TOO_LARGE' }, 413);

  const authorization = request.headers.get('authorization') || '';
  const match = authorization.match(/^Bearer ([A-Za-z0-9._~-]+)$/);
  if (!match) return json({ ok: false, code: 'AUTHENTICATION_REQUIRED' }, 401);

  const projectId = env.FIREBASE_AUTH_PROJECT_ID;
  const verifier = options.verifyToken || verifyFirebaseIdToken;
  const identity = await verifier(match[1], projectId, options.verifierOptions || {});
  if (!identity?.ok || !identity.uid) {
    const unavailable = identity?.code === 'TOKEN_VERIFICATION_UNAVAILABLE'
      || identity?.code === 'FIREBASE_PROJECT_NOT_CONFIGURED';
    return json({ ok: false, code: unavailable ? 'IDENTITY_PROVIDER_UNAVAILABLE' : 'INVALID_IDENTITY' }, unavailable ? 503 : 401);
  }

  let raw;
  try { raw = await readBodyLimited(request, MAX_BODY_BYTES); } catch { return json({ ok: false, code: 'INVALID_REQUEST' }, 400); }
  if (raw === null) return json({ ok: false, code: 'REQUEST_TOO_LARGE' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ ok: false, code: 'INVALID_JSON' }, 400); }

  const allowedKeys = new Set(['message', 'surface', 'locale']);
  if (!body || typeof body !== 'object' || Array.isArray(body)
    || Object.keys(body).some((key) => !allowedKeys.has(key))) {
    return json({ ok: false, code: 'INVALID_REQUEST_FIELDS' }, 400);
  }
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const surface = typeof body.surface === 'string' ? body.surface : 'web';
  const locale = typeof body.locale === 'string' ? body.locale : 'en-US';
  if (!message || message.length > MAX_MESSAGE_CHARS
    || !['web', 'ios', 'android', 'desktop', 'tv', 'unity', 'unreal'].includes(surface)
    || !/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})?$/.test(locale)) {
    return json({ ok: false, code: 'INVALID_REQUEST_FIELDS' }, 400);
  }

  const clientAddress = String(request.headers.get('cf-connecting-ip') || 'unknown').slice(0, 64);
  const bucketKey = clientAddress + ':' + identity.uid;
  if (isLocallyRateLimited(bucketKey, options.nowMs ?? Date.now())) {
    return json({ ok: false, code: 'RATE_LIMITED', rate_limit_scope: 'worker-isolate' }, 429);
  }

  // No prompt is stored, logged, or sent to an inference provider in zero-spend mode.
  return json({
    ok: false,
    code: 'ASKLINGO_DISABLED',
    status: 'not_available',
    message: 'askLINGO is not enabled yet. No AI request was sent.',
    request_id: crypto.randomUUID(),
    rate_limit_scope: 'worker-isolate'
  }, 423);
}

function isLocallyRateLimited(key, now) {
  const current = buckets.get(key);
  if (current && now - current.startedAt < RATE_WINDOW_MS) {
    current.count += 1;
    return current.count > RATE_LIMIT;
  }
  if (buckets.size >= RATE_BUCKET_MAX) {
    for (const [oldKey, value] of buckets) {
      if (now - value.startedAt >= RATE_WINDOW_MS) buckets.delete(oldKey);
      if (buckets.size < RATE_BUCKET_MAX) break;
    }
  }
  if (buckets.size >= RATE_BUCKET_MAX) return true;
  buckets.set(key, { startedAt: now, count: 1 });
  return false;
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

async function readBodyLimited(request, maxBytes) {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}
