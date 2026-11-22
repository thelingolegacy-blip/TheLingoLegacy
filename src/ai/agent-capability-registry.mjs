/**
 * askLINGO v2 agent capability registry decision helpers.
 * Pure validation only: records must be loaded and authenticated by trusted server adapters.
 * No agent registration persistence, credential issuance, or action execution occurs here.
 */
const FIELDS = Object.freeze(['tenantId','productId','resourceType','resourceId','operation','environment']);
const deny = (reason) => Object.freeze({ decision: 'DENY', reason });

export function validateAgentRegistration(agent, nowMs = Date.now()) {
  if (!record(agent) || !Number.isFinite(nowMs)) return deny('INVALID_AGENT_RECORD');
  if (!text(agent.id) || !text(agent.serviceIdentityId) || !text(agent.tenantId)) return deny('AGENT_IDENTITY_INCOMPLETE');
  if (agent.status !== 'active') return deny('AGENT_INACTIVE');
  if (!Number.isFinite(agent.expiresAt) || nowMs >= agent.expiresAt) return deny('AGENT_EXPIRED');
  if (!Array.isArray(agent.capabilities) || agent.capabilities.length === 0) return deny('AGENT_CAPABILITIES_EMPTY');
  const seen = new Set();
  for (const capability of agent.capabilities) {
    if (!record(capability) || !FIELDS.every((field) => text(capability[field]))) return deny('AGENT_CAPABILITY_SCOPE_INCOMPLETE');
    if (capability.tenantId !== agent.tenantId) return deny('AGENT_TENANT_SCOPE_MISMATCH');
    const key = JSON.stringify(FIELDS.map((field) => capability[field]));
    if (seen.has(key)) return deny('AGENT_CAPABILITY_DUPLICATE');
    seen.add(key);
  }
  return Object.freeze({ decision: 'ALLOW', reason: 'AGENT_REGISTRATION_VALID' });
}

/**
 * Exact-match capability authorization. No wildcard, inferred role, ambient
 * authority, or cross-tenant/product/resource inheritance is accepted.
 */
export function authorizeAgentCapability(agent, serviceIdentity, request, nowMs = Date.now()) {
  const registration = validateAgentRegistration(agent, nowMs);
  if (registration.decision !== 'ALLOW') return registration;
  if (!record(serviceIdentity) || serviceIdentity.status !== 'active'
      || serviceIdentity.id !== agent.serviceIdentityId) return deny('SERVICE_IDENTITY_MISMATCH');
  if (!record(request) || !FIELDS.every((field) => text(request[field]))) return deny('REQUEST_SCOPE_INCOMPLETE');
  if (request.tenantId !== agent.tenantId) return deny('REQUEST_TENANT_MISMATCH');
  const match = agent.capabilities.some((capability) => FIELDS.every((field) => capability[field] === request[field]));
  return match
    ? Object.freeze({ decision: 'ALLOW', reason: 'EXACT_AGENT_CAPABILITY_MATCH' })
    : deny('AGENT_CAPABILITY_NOT_GRANTED');
}

function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function text(value) { return typeof value === 'string' && value.trim().length > 0; }
