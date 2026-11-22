import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeAgentCapability, validateAgentRegistration } from '../../src/ai/agent-capability-registry.mjs';

const NOW = 1_800_000_000_000;
const capability = Object.freeze({
  tenantId: 'tenant-a', productId: 'asklingo', resourceType: 'task',
  resourceId: 'task-7', operation: 'plan', environment: 'staging'
});
function agent(overrides = {}) {
  return {
    id: 'agent-1', serviceIdentityId: 'service-1', tenantId: 'tenant-a',
    status: 'active', expiresAt: NOW + 60_000, capabilities: [{ ...capability }],
    ...overrides
  };
}
const service = { id: 'service-1', status: 'active' };

test('accepts a complete active registration with scoped capabilities', () => {
  assert.equal(validateAgentRegistration(agent(), NOW).decision, 'ALLOW');
});
test('rejects missing identity, inactive or expired registrations', () => {
  assert.equal(validateAgentRegistration(agent({ id: '' }), NOW).reason, 'AGENT_IDENTITY_INCOMPLETE');
  assert.equal(validateAgentRegistration(agent({ status: 'revoked' }), NOW).reason, 'AGENT_INACTIVE');
  assert.equal(validateAgentRegistration(agent({ expiresAt: NOW }), NOW).reason, 'AGENT_EXPIRED');
});
test('rejects empty, incomplete, cross-tenant, or duplicate capabilities', () => {
  assert.equal(validateAgentRegistration(agent({ capabilities: [] }), NOW).reason, 'AGENT_CAPABILITIES_EMPTY');
  assert.equal(validateAgentRegistration(agent({ capabilities: [{ ...capability, operation: '' }] }), NOW).reason, 'AGENT_CAPABILITY_SCOPE_INCOMPLETE');
  assert.equal(validateAgentRegistration(agent({ capabilities: [{ ...capability, tenantId: 'tenant-b' }] }), NOW).reason, 'AGENT_TENANT_SCOPE_MISMATCH');
  assert.equal(validateAgentRegistration(agent({ capabilities: [{ ...capability }, { ...capability }] }), NOW).reason, 'AGENT_CAPABILITY_DUPLICATE');
});
test('allows only an exact capability match from the bound active service identity', () => {
  assert.equal(authorizeAgentCapability(agent(), service, { ...capability }, NOW).decision, 'ALLOW');
  assert.equal(authorizeAgentCapability(agent(), { ...service, id: 'other' }, { ...capability }, NOW).reason, 'SERVICE_IDENTITY_MISMATCH');
  assert.equal(authorizeAgentCapability(agent(), { ...service, status: 'disabled' }, { ...capability }, NOW).reason, 'SERVICE_IDENTITY_MISMATCH');
});
test('denies capability escalation across tenant, product, resource, operation, or environment', () => {
  for (const patch of [
    { tenantId: 'tenant-b' }, { productId: 'other' }, { resourceId: 'other' },
    { resourceType: 'account' }, { operation: 'delete' }, { environment: 'production' }
  ]) {
    assert.equal(authorizeAgentCapability(agent(), service, { ...capability, ...patch }, NOW).decision, 'DENY');
  }
});
test('denies malformed requests and invalid agent records', () => {
  assert.equal(authorizeAgentCapability(agent(), service, null, NOW).reason, 'REQUEST_SCOPE_INCOMPLETE');
  assert.equal(authorizeAgentCapability(null, service, capability, NOW).reason, 'INVALID_AGENT_RECORD');
});
