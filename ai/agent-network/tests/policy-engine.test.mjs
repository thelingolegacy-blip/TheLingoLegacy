import test from 'node:test';
import assert from 'node:assert/strict';
import { digest, evaluateAction, POLICY_VERSION } from '../src/policy-engine.mjs';
const now = Date.parse('2026-11-15T12:00:00.000Z');
const principal = { uid:'agent-user', tenantId:'tenant-a', agentId:'engineering-1', kind:'agent', status:'active', scopes:['project-a:content.publish','project-a:data.delete','project-a:identity.rotate'] };
const actionRequest = { tenantId:'tenant-a', projectId:'project-a', realmId:'lingoarcade', environment:'staging', action:'content.publish', resourceId:'asset-9', risk:'R2', payload:{ content:'approved draft', revision:3 }, preconditionDigest:'b'.repeat(64), rollbackRef:'rollback-asset-9' };
const approval = { approvalId:'approval-123456', requesterUid:'agent-user', requesterAgentId:'engineering-1', approverUid:'human-owner', approverRole:'owner', approverKind:'human', risk:'R2', status:'APPROVED', expiresAt:'2026-11-15T13:00:00.000Z', policyVersion:POLICY_VERSION, tenantId:'tenant-a', projectId:'project-a', realmId:'lingoarcade', environment:'staging', action:'content.publish', resourceId:'asset-9', payloadDigest:digest(actionRequest.payload), preconditionDigest:actionRequest.preconditionDigest, rollbackRef:actionRequest.rollbackRef };
const ctx = { nowMs:now, productionHold:false, auditAvailable:true };
test('denies unknown identity',()=>assert.equal(evaluateAction({principal:{...principal,status:'unknown'},actionRequest},ctx).reason_code,'IDENTITY_INVALID'));
test('denies cross-tenant action',()=>assert.equal(evaluateAction({principal,actionRequest:{...actionRequest,tenantId:'tenant-b'}},ctx).reason_code,'SCOPE_MISMATCH'));
test('denies missing project capability',()=>assert.equal(evaluateAction({principal,actionRequest:{...actionRequest,action:'payment.send'}},ctx).reason_code,'SCOPE_MISMATCH'));
test('denies production while protected hold is active',()=>assert.equal(evaluateAction({principal,actionRequest:{...actionRequest,environment:'production'}},{...ctx,productionHold:true,policyVersion:POLICY_VERSION}).reason_code,'PRODUCTION_HOLD'));
test('denies missing approval for external effect',()=>assert.equal(evaluateAction({principal,actionRequest},{...ctx,auditAvailable:true}).reason_code,'APPROVAL_MISSING'));
test('denies requester self-approval',()=>assert.equal(evaluateAction({principal,actionRequest,approval:{...approval,approverUid:'agent-user'}},ctx).reason_code,'SELF_APPROVAL'));
test('denies altered payload after approval',()=>assert.equal(evaluateAction({principal,actionRequest:{...actionRequest,payload:{content:'changed'}},approval},ctx).reason_code,'APPROVAL_INVALID'));
test('denies approval replay',()=>assert.equal(evaluateAction({principal,actionRequest,approval:{...approval,status:'CONSUMED',consumedAt:'2026-11-15T12:01:00Z'}},ctx).reason_code,'APPROVAL_REPLAY'));
test('denies expired approval',()=>assert.equal(evaluateAction({principal,actionRequest,approval:{...approval,expiresAt:'2026-11-15T11:59:00Z'}},ctx).reason_code,'APPROVAL_EXPIRED'));
test('denies policy version drift',()=>assert.equal(evaluateAction({principal,actionRequest,approval:{...approval,policyVersion:'old-policy'}},ctx).reason_code,'POLICY_VERSION_MISMATCH'));
test('denies audit sink failure',()=>assert.equal(evaluateAction({principal,actionRequest,approval},{...ctx,auditAvailable:false}).reason_code,'AUDIT_UNAVAILABLE'));
test('denies wrong environment binding',()=>assert.equal(evaluateAction({principal,actionRequest,approval:{...approval,environment:'development'}},ctx).reason_code,'ENVIRONMENT_MISMATCH'));
test('permits only scoped low-risk read without approval',()=>assert.equal(evaluateAction({principal,actionRequest:{...actionRequest,action:'content.publish',risk:'R0'}},ctx).allowed,true));

test('permits matching approved external action exactly once at policy layer',()=>assert.equal(evaluateAction({principal,actionRequest,approval},{...ctx,policyVersion:POLICY_VERSION}).reason_code,'ALLOW_APPROVED_ACTION'));
test('denies approval issued to a different agent',()=>assert.equal(evaluateAction({principal:{...principal,agentId:'qa-1'},actionRequest,approval},ctx).reason_code,'IDENTITY_INVALID'));
test('denies non-human approval principal',()=>assert.equal(evaluateAction({principal,actionRequest,approval:{...approval,approverKind:'agent'}},ctx).reason_code,'ROLE_FORBIDDEN'));
test('denies risk-class change after approval',()=>assert.equal(evaluateAction({principal,actionRequest:{...actionRequest,risk:'R3'},approval},ctx).reason_code,'RISK_POLICY_DENY'));

test('denies sensitive action without precondition digest and rollback reference',()=>assert.equal(evaluateAction({principal,actionRequest:{...actionRequest,risk:'R3',preconditionDigest:null,rollbackRef:null},approval:{...approval,risk:'R3',preconditionDigest:null,rollbackRef:null}},ctx).reason_code,'RISK_POLICY_DENY'));
test('denies changed rollback reference after approval',()=>assert.equal(evaluateAction({principal,actionRequest:{...actionRequest,rollbackRef:'different-rollback'},approval},ctx).reason_code,'APPROVAL_INVALID'));

test('denies R4 action approved by non-owner',()=>{
 const a={...actionRequest,action:'data.delete',risk:'R4',preconditionDigest:'c'.repeat(64),rollbackRef:'restore-point-1'};
 const ap={...approval,action:a.action,risk:'R4',payloadDigest:digest(a.payload),preconditionDigest:a.preconditionDigest,rollbackRef:a.rollbackRef,approverRole:'governance_reviewer'};
 assert.equal(evaluateAction({principal,actionRequest:a,approval:ap},{...ctx,productionHold:false}).reason_code,'ROLE_FORBIDDEN');
});
test('denies sensitive R3 action without security reviewer',()=>{
 const a={...actionRequest,action:'identity.rotate',risk:'R3',preconditionDigest:'d'.repeat(64),rollbackRef:'identity-rollback-1'};
 const ap={...approval,action:a.action,risk:'R3',payloadDigest:digest(a.payload),preconditionDigest:a.preconditionDigest,rollbackRef:a.rollbackRef,approverRole:'governance_reviewer'};
 assert.equal(evaluateAction({principal,actionRequest:a,approval:ap},{...ctx,productionHold:false}).reason_code,'ROLE_FORBIDDEN');
});
