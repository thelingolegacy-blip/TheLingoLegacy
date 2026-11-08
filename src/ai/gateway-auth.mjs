const BEARER_PREFIX = 'Bearer ';
const MAX_TOKEN_CHARS = 8192;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9._:@/-]{1,256}$/;

/**
 * Authenticate an HTTP request for the LLG AI gateway.
 *
 * verifyToken MUST perform cryptographic signature verification against a
 * trusted issuer's published keys. This module validates the verified claims
 * and authorization context; it is not itself a JWT signature verifier.
 * Tenant membership is checked separately and fails closed.
 */
export async function authenticateGatewayRequest(request, options = {}) {
  const {
    verifyToken,
    expectedIssuer,
    expectedAudience,
    requiredScopes = [],
    resolveTenantMembership,
    nowSeconds = Math.floor(Date.now() / 1000)
  } = options;

  if (typeof verifyToken !== 'function'
    || typeof resolveTenantMembership !== 'function'
    || typeof expectedIssuer !== 'string' || !expectedIssuer
    || typeof expectedAudience !== 'string' || !expectedAudience
    || !Array.isArray(requiredScopes)
    || requiredScopes.some((scope) => typeof scope !== 'string' || !scope)) {
    return denied(500, 'AI_AUTH_CONFIGURATION_INVALID');
  }

  const authorization = request?.headers?.get?.('authorization');
  if (typeof authorization !== 'string' || !authorization.startsWith(BEARER_PREFIX)) {
    return denied(401, 'AUTHENTICATION_REQUIRED');
  }

  const token = authorization.slice(BEARER_PREFIX.length);
  if (!token || token.length > MAX_TOKEN_CHARS || /\\s/.test(token)) {
    return denied(401, 'AUTHENTICATION_REQUIRED');
  }

  let claims;
  try {
    claims = await verifyToken(token);
  } catch {
    return denied(401, 'AUTHENTICATION_REQUIRED');
  }

  if (!claims || typeof claims !== 'object'
    || claims.iss !== expectedIssuer
    || !audienceMatches(claims.aud, expectedAudience)
    || !Number.isFinite(claims.exp) || claims.exp <= nowSeconds
    || (claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf > nowSeconds))
    || !isIdentifier(claims.sub)
    || !isIdentifier(claims.tenant_id)) {
    return denied(401, 'AUTHENTICATION_REQUIRED');
  }

  const tokenScopes = normalizeStringSet(claims.scopes);
  if (requiredScopes.some((scope) => !tokenScopes.has(scope))) {
    return denied(403, 'AUTHORIZATION_DENIED');
  }

  let member;
  try {
    member = await resolveTenantMembership({
      userId: claims.sub,
      tenantId: claims.tenant_id
    });
  } catch {
    return denied(503, 'AI_AUTHORIZATION_UNAVAILABLE');
  }
  if (member !== true) return denied(403, 'AUTHORIZATION_DENIED');

  return {
    ok: true,
    status: 200,
    principal: Object.freeze({
      userId: claims.sub,
      tenantId: claims.tenant_id,
      roles: Object.freeze([...normalizeStringSet(claims.roles)]),
      scopes: Object.freeze([...tokenScopes]),
      sessionId: isIdentifier(claims.sid) ? claims.sid : null
    })
  };
}

function audienceMatches(value, expected) {
  return value === expected || (Array.isArray(value) && value.includes(expected));
}

function normalizeStringSet(value) {
  if (Array.isArray(value)) return new Set(value.filter((item) => typeof item === 'string'));
  if (typeof value === 'string') return new Set(value.split(/\\s+/).filter(Boolean));
  return new Set();
}

function isIdentifier(value) {
  return typeof value === 'string' && IDENTIFIER_PATTERN.test(value);
}

function denied(status, code) {
  return { ok: false, status, code };
}
