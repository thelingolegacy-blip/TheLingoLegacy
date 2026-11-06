const TOKEN_ISSUER = 'https://securetoken.google.com/';
const CERT_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const MAX_TOKEN_LENGTH = 12_000;
const keyCache = new Map();

/**
 * Verify a Firebase Authentication ID token without a service-account secret.
 * This verifies identity only; callers must still authorize the requested action.
 */
export async function verifyFirebaseIdToken(token, projectId, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const now = Number.isFinite(options.nowSeconds) ? options.nowSeconds : Math.floor(Date.now() / 1000);
  if (typeof token !== 'string' || token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
    return { ok: false, code: 'INVALID_TOKEN' };
  }
  if (typeof projectId !== 'string' || !/^[a-z0-9][a-z0-9-]{4,62}$/.test(projectId)) {
    return { ok: false, code: 'FIREBASE_PROJECT_NOT_CONFIGURED' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, code: 'INVALID_TOKEN' };

  let header;
  let claims;
  try {
    header = JSON.parse(decodeBase64Url(parts[0]));
    claims = JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return { ok: false, code: 'INVALID_TOKEN' };
  }
  if (header?.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) {
    return { ok: false, code: 'INVALID_TOKEN' };
  }

  const issuer = TOKEN_ISSUER + projectId;
  if (claims?.aud !== projectId || claims?.iss !== issuer
    || typeof claims?.sub !== 'string' || claims.sub.length < 1 || claims.sub.length > 128
    || !Number.isFinite(claims.exp) || claims.exp <= now
    || !Number.isFinite(claims.iat) || claims.iat > now + 300 || now - claims.iat > 3900
    || claims.exp - claims.iat > 3900
    || !Number.isFinite(claims.auth_time) || claims.auth_time > now + 300
    || claims.auth_time > claims.iat + 300) {
    return { ok: false, code: 'INVALID_TOKEN' };
  }

  const key = await getSigningKey(header.kid, fetchImpl, now, options.certUrl || CERT_URL);
  if (key === undefined) return { ok: false, code: 'TOKEN_VERIFICATION_UNAVAILABLE' };
  if (!key) return { ok: false, code: 'INVALID_TOKEN' };

  try {
    const cryptoKey = await crypto.subtle.importKey(
      'jwk', key, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']
    );
    const signature = decodeBase64UrlBytes(parts[2]);
    const signedData = new TextEncoder().encode(parts[0] + '.' + parts[1]);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, signedData);
    return valid
      ? { ok: true, uid: claims.sub, claims: { aud: claims.aud, iss: claims.iss, exp: claims.exp, auth_time: claims.auth_time } }
      : { ok: false, code: 'INVALID_TOKEN' };
  } catch {
    return { ok: false, code: 'INVALID_TOKEN' };
  }
}

async function getSigningKey(kid, fetchImpl, now, certUrl) {
  const cached = keyCache.get(certUrl);
  if (cached && cached.expiresAt > now && cached.keys.has(kid)) return cached.keys.get(kid);
  if (cached && cached.expiresAt > now && !cached.keys.has(kid) && cached.nextUnknownKidRefreshAt > now) return null;

  let response;
  try {
    response = await fetchImpl(certUrl, { signal: AbortSignal.timeout(5000) });
  } catch {
    return undefined;
  }
  if (!response.ok) return undefined;

  let payload;
  try { payload = await response.json(); } catch { return undefined; }
  if (!Array.isArray(payload?.keys)) return undefined;

  const keys = new Map(payload.keys
    .filter((entry) => entry?.kid && entry.kty === 'RSA' && entry.alg === 'RS256' && entry.use === 'sig')
    .map((entry) => [entry.kid, entry]));
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/i)?.[1] || 300);
  keyCache.set(certUrl, { keys, expiresAt: now + Math.min(Math.max(maxAge, 60), 3600), nextUnknownKidRefreshAt: now + 60 });
  return keys.get(kid) || null;
}

function decodeBase64Url(value) {
  return new TextDecoder().decode(decodeBase64UrlBytes(value));
}
function decodeBase64UrlBytes(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
