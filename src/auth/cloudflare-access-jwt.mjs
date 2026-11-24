const MAX_TOKEN_LENGTH = 12_000;
const keyCache = new Map();

/**
 * Verify a Cloudflare Access service-token-free human identity JWT.
 * This authenticates the edge identity only. Callers must map the verified
 * subject to an explicit operator registry and enforce requester/reviewer/
 * executor separation independently.
 */
export async function verifyCloudflareAccessJwt(token, {
  teamDomain,
  audience,
  fetchImpl = fetch,
  nowSeconds = Math.floor(Date.now() / 1000),
  certsUrl,
} = {}) {
  if (typeof token !== 'string' || token.length < 1 || token.length > MAX_TOKEN_LENGTH) {
    return { ok: false, code: 'ACCESS_TOKEN_INVALID' };
  }
  if (typeof teamDomain !== 'string'
      || !/^[a-z0-9][a-z0-9-]{1,62}\.cloudflareaccess\.com$/.test(teamDomain)
      || typeof audience !== 'string' || audience.length < 8 || audience.length > 256) {
    return { ok: false, code: 'ACCESS_CONFIGURATION_INVALID' };
  }

  const issuer = `https://${teamDomain}`;
  const jwksUrl = certsUrl || `${issuer}/cdn-cgi/access/certs`;
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, code: 'ACCESS_TOKEN_INVALID' };

  let header;
  let claims;
  try {
    header = JSON.parse(decodeBase64Url(parts[0]));
    claims = JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return { ok: false, code: 'ACCESS_TOKEN_INVALID' };
  }
  if (header?.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) {
    return { ok: false, code: 'ACCESS_TOKEN_INVALID' };
  }

  const audiences = Array.isArray(claims?.aud) ? claims.aud : [claims?.aud];
  if (claims?.iss !== issuer || !audiences.includes(audience)
      || typeof claims?.sub !== 'string' || claims.sub.length < 1 || claims.sub.length > 256
      || !Number.isFinite(claims.exp) || claims.exp <= nowSeconds
      || (claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf > nowSeconds))
      || (claims.iat !== undefined && (!Number.isFinite(claims.iat) || claims.iat > nowSeconds + 60))) {
    return { ok: false, code: 'ACCESS_TOKEN_INVALID' };
  }

  const key = await getSigningKey(header.kid, jwksUrl, fetchImpl, nowSeconds);
  if (!key) return { ok: false, code: 'ACCESS_SIGNING_KEYS_UNAVAILABLE' };

  try {
    const cryptoKey = await crypto.subtle.importKey(
      'jwk', key, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']
    );
    const signature = decodeBase64UrlBytes(parts[2]);
    const signedData = new TextEncoder().encode(parts[0] + '.' + parts[1]);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, signedData);
    if (!valid) return { ok: false, code: 'ACCESS_TOKEN_INVALID' };
    return {
      ok: true,
      subject: claims.sub,
      email: typeof claims.email === 'string' ? claims.email : null,
      issuer,
      audience,
      expiresAt: claims.exp,
    };
  } catch {
    return { ok: false, code: 'ACCESS_TOKEN_INVALID' };
  }
}

async function getSigningKey(kid, jwksUrl, fetchImpl, nowSeconds) {
  const cached = keyCache.get(jwksUrl);
  // A valid cache entry is usable only when it contains the requested key.
  // An unknown kid can indicate normal Cloudflare key rotation, so refresh
  // once instead of treating the still-fresh cache as authoritative.
  if (cached && cached.expiresAt > nowSeconds && cached.keys.has(kid)) {
    return cached.keys.get(kid);
  }

  let response;
  try {
    response = await fetchImpl(jwksUrl, { signal: AbortSignal.timeout(5000) });
  } catch {
    return null;
  }
  if (!response.ok) return null;

  let payload;
  try { payload = await response.json(); } catch { return null; }
  if (!Array.isArray(payload?.keys)) return null;

  const keys = new Map(payload.keys
    .filter((entry) => entry?.kid && entry.kty === 'RSA'
      && (entry.alg === undefined || entry.alg === 'RS256')
      && (entry.use === undefined || entry.use === 'sig'))
    .map((entry) => [entry.kid, entry]));
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAge = Number(cacheControl.match(/max-age=(\\d+)/i)?.[1] || 300);
  keyCache.set(jwksUrl, { keys, expiresAt: nowSeconds + Math.min(Math.max(maxAge, 60), 3600) });
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
