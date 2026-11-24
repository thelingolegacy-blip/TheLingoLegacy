import { verifyCloudflareAccessJwt } from './cloudflare-access-jwt.mjs';
import {
  parseSaaaeOperatorRegistry,
  saaaeOperatorRegistryReadiness,
} from './saaae-operator-registry.mjs';

/**
 * Authenticate a human operator at a Worker behind Cloudflare Access.
 * The verified JWT subject is resolved against a server-owned registry;
 * email, display name, and caller-supplied role headers are never trusted.
 */
export async function authenticateSaaaeOperator(request, env, {
  verify = verifyCloudflareAccessJwt,
} = {}) {
  if (typeof env?.CLOUDFLARE_ACCESS_TEAM_DOMAIN !== 'string'
      || typeof env?.CLOUDFLARE_ACCESS_AUD !== 'string'
      || typeof env?.SAAAE_OPERATOR_REGISTRY_JSON !== 'string') {
    return { ok: false, status: 503, code: 'OPERATOR_AUTH_CONFIGURATION_UNAVAILABLE' };
  }

  const token = request.headers.get('cf-access-jwt-assertion');
  if (!token) return { ok: false, status: 401, code: 'ACCESS_TOKEN_REQUIRED' };

  let verified;
  try {
    verified = await verify(token, {
      teamDomain: env.CLOUDFLARE_ACCESS_TEAM_DOMAIN,
      audience: env.CLOUDFLARE_ACCESS_AUD,
    });
  } catch {
    return { ok: false, status: 503, code: 'ACCESS_IDENTITY_PROVIDER_UNAVAILABLE' };
  }
  if (!verified?.ok) {
    const unavailable = verified?.code === 'ACCESS_SIGNING_KEYS_UNAVAILABLE';
    return {
      ok: false,
      status: unavailable ? 503 : 401,
      code: unavailable ? 'ACCESS_IDENTITY_PROVIDER_UNAVAILABLE' : 'ACCESS_TOKEN_INVALID',
    };
  }

  const registry = parseSaaaeOperatorRegistry(env.SAAAE_OPERATOR_REGISTRY_JSON);
  if (!registry.ok) {
    return { ok: false, status: 503, code: registry.code };
  }
  const readiness = saaaeOperatorRegistryReadiness(registry);
  if (!readiness.ready) {
    return { ok: false, status: 503, code: readiness.code };
  }

  const operator = registry.operators.find((entry) => entry.subject === verified.subject);
  if (!operator || operator.status !== 'active') {
    return { ok: false, status: 403, code: 'OPERATOR_NOT_REGISTERED' };
  }
  return {
    ok: true,
    subject: operator.subject,
    type: operator.type,
    roles: [...operator.roles],
  };
}
