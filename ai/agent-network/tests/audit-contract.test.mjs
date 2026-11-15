import test from 'node:test';
import assert from 'node:assert/strict';
import { assertAuditSafe, createAuditEvent } from '../src/audit-contract.mjs';
test('rejects secret-like keys in audit payloads',()=>assert.throws(()=>assertAuditSafe({metadata:{access_token:'abc'}}),/SENSITIVE_AUDIT_FIELD/));
test('rejects password field',()=>assert.throws(()=>assertAuditSafe({password:'no'}),/SENSITIVE_AUDIT_FIELD/));
test('creates frozen event without raw action payload',()=>{const e=createAuditEvent({eventId:'e-1',occurredAt:'2026-11-15T12:00:00Z',correlationId:'c-1',tenantId:'t',subjectUid:'u',subjectType:'agent',agentId:'qa-1',eventType:'POLICY_DECISION',action:'repo.read',resourceId:'repo',projectId:'p',realmId:'r',environment:'staging',policyVersion:'dmc-policy-1.0.0',decision:'ALLOW',reasonCode:'ALLOW_SCOPED_READ',payloadDigest:'a'.repeat(64),sourceCommit:'abcdef1234567',summary:'scoped read'});assert.equal(Object.isFrozen(e),true);assert.equal('payload' in e,false);});
