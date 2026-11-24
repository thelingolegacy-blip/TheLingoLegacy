import assert from 'node:assert/strict';
import test from 'node:test';
import {
  authorizeSaaaeProvisioningActors,
  parseSaaaeOperatorRegistry,
  saaaeOperatorRegistryReadiness,
} from '../../src/auth/saaae-operator-registry.mjs';

const parse = (raw, options = {}) => parseSaaaeOperatorRegistry(raw, {
  trustedAttestationIssuer: 'workforce-identity-authority', ...options,
});

const validRoster = [
  { subject: 'immutable-human-requester-001', type: 'human', status: 'active', roles: ['requester'], person_ref: 'person-proof-001', independence_attestation_id: 'attestation-proof-001', attestation_issuer: 'workforce-identity-authority' },
  { subject: 'immutable-human-reviewer-002', type: 'human', status: 'active', roles: ['reviewer'], person_ref: 'person-proof-002', independence_attestation_id: 'attestation-proof-002', attestation_issuer: 'workforce-identity-authority' },
  { subject: 'immutable-workload-executor-003', type: 'workload', status: 'active', roles: ['executor'] },
];

test('missing or malformed registry fails closed', () => {
  assert.equal(parseSaaaeOperatorRegistry(JSON.stringify([validRoster[0]])).code, 'OPERATOR_ATTESTATION_TRUST_ANCHOR_UNAVAILABLE');
  assert.equal(parse(null).code, 'OPERATOR_REGISTRY_UNAVAILABLE');
  assert.equal(parse('{bad-json').code, 'OPERATOR_REGISTRY_INVALID');
  assert.equal(saaaeOperatorRegistryReadiness({ ok: false }).ready, false);
});

test('registry rejects a roster issued by an untrusted attestation authority', () => {
  const result = parse(JSON.stringify(validRoster), {
    trustedAttestationIssuer: 'untrusted-issuer',
  });
  assert.equal(result.code, 'OPERATOR_ATTESTATION_TRUST_ANCHOR_UNAVAILABLE');
});

test('registry rejects duplicate subjects and email-based identity fields', () => {
  const duplicate = [...validRoster, { ...validRoster[0], roles: ['reviewer'] }];
  assert.equal(parse(JSON.stringify(duplicate)).code, 'OPERATOR_REGISTRY_INVALID');
  const emailIdentity = [{ ...validRoster[0], email: 'reviewer@example.invalid' }];
  assert.equal(parse(JSON.stringify(emailIdentity)).code, 'OPERATOR_REGISTRY_INVALID');
  const sameHumanTwice = [validRoster[0], { ...validRoster[1], person_ref: validRoster[0].person_ref }];
  assert.equal(parse(JSON.stringify(sameHumanTwice)).code, 'OPERATOR_INDEPENDENCE_ATTESTATION_REQUIRED');
  const noAttestation = [{ ...validRoster[0], independence_attestation_id: undefined }];
  assert.equal(parse(JSON.stringify(noAttestation)).code, 'OPERATOR_INDEPENDENCE_ATTESTATION_REQUIRED');
});

test('registry remains unready without two distinct human identities and workload executor', () => {
  const oneHuman = parse(JSON.stringify([
    { subject: 'only-human', type: 'human', status: 'active', roles: ['requester', 'reviewer'], person_ref: 'only-person-proof', independence_attestation_id: 'only-attestation', attestation_issuer: 'workforce-identity-authority' },
    validRoster[2],
  ]));
  assert.equal(saaaeOperatorRegistryReadiness(oneHuman).code, 'INDEPENDENT_OPERATOR_ROSTER_REQUIRED');
});

test('valid registry authorizes three distinct actor identities', () => {
  const registry = parse(JSON.stringify(validRoster));
  assert.equal(saaaeOperatorRegistryReadiness(registry).ready, true);
  assert.deepEqual(authorizeSaaaeProvisioningActors(registry, {
    requesterSubject: validRoster[0].subject,
    reviewerSubject: validRoster[1].subject,
    executorSubject: validRoster[2].subject,
  }), {
    ok: true,
    actors: {
      requester: validRoster[0].subject,
      reviewer: validRoster[1].subject,
      executor: validRoster[2].subject,
    },
  });
});

test('self-approval and human-as-executor attempts are denied', () => {
  const dualRoleRoster = [
    { ...validRoster[0], roles: ['requester', 'reviewer'] },
    { ...validRoster[1], roles: ['requester', 'reviewer'] },
    validRoster[2],
  ];
  const registry = parse(JSON.stringify(dualRoleRoster));
  assert.equal(authorizeSaaaeProvisioningActors(registry, {
    requesterSubject: dualRoleRoster[0].subject,
    reviewerSubject: dualRoleRoster[0].subject,
    executorSubject: dualRoleRoster[2].subject,
  }).code, 'SAAAE_ACTOR_SEPARATION_REQUIRED');
  assert.equal(authorizeSaaaeProvisioningActors(registry, {
    requesterSubject: dualRoleRoster[0].subject,
    reviewerSubject: dualRoleRoster[1].subject,
    executorSubject: dualRoleRoster[1].subject,
  }).code, 'EXECUTOR_NOT_AUTHORIZED');
});
