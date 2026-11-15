import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { randomUUID } from 'node:crypto';
import { digest, evaluateAction, POLICY_VERSION, assertHumanApproval } from '../../src/policy-engine.mjs';
import { transitionHandoff } from '../../src/handoff-state-machine.mjs';
import { createAuditEvent } from '../../src/audit-contract.mjs';

initializeApp();
const db = getFirestore();
const PRODUCTION_HOLD = true; // Deliberate release lock; do not change in this branch.
const SOURCE_COMMIT = process.env.SOURCE_COMMIT || process.env.GITHUB_SHA || 'unreleased-source';
const nowIso = () => new Date().toISOString();
const requirePrincipal = request => {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated','Firebase Authentication is required.');
  const c = request.auth.token || {};
  const role = typeof c.dmcRole === 'string' ? c.dmcRole : null;
  const agentId = typeof c.agentId === 'string' ? c.agentId : null;
  const kind = agentId ? 'agent' : 'human';
  return { uid:request.auth.uid, tenantId:String(c.tenantId || ''), kind, agentId, role, status:c.accountStatus === 'active' ? 'active' : 'unknown', scopes:Array.isArray(c.dmcScopes) ? c.dmcScopes.filter(s => typeof s === 'string') : [] };
};
const audit = async (tx, principal, data) => {
  const event = createAuditEvent({
    eventId:randomUUID(), occurredAt:nowIso(), correlationId:data.correlationId || randomUUID(),
    tenantId:data.tenantId, subjectUid:principal.uid, subjectType:principal.kind,
    agentId:principal.agentId, eventType:data.eventType, action:data.action,
    resourceId:data.resourceId, projectId:data.projectId, realmId:data.realmId,
    environment:data.environment, policyVersion:POLICY_VERSION, decision:data.decision,
    reasonCode:data.reasonCode, approvalId:data.approvalId, approverUid:data.approverUid,
    payloadDigest:data.payloadDigest || '0'.repeat(64), sourceCommit:SOURCE_COMMIT,
    summary:data.summary || ''
  });
  tx.create(db.collection('dmcAuditEvents').doc(event.event_id), { ...event, createdAt:FieldValue.serverTimestamp() });
};
const assertAgent = principal => { if (principal.kind !== 'agent' || principal.status !== 'active' || !principal.agentId || !principal.tenantId) throw new HttpsError('permission-denied','An active, scoped agent identity is required.'); };

export const requestDmcApproval = onCall(async request => {
  const principal = requirePrincipal(request); assertAgent(principal);
  const a = request.data?.actionRequest;
  if (!a || typeof a !== 'object' || typeof a.action !== 'string' || typeof a.resourceId !== 'string' || !/^[a-z][a-z0-9_.:-]{2,127}$/.test(a.action) || !a.resourceId || !a.payload || typeof a.payload !== 'object' || Array.isArray(a.payload) || JSON.stringify(a.payload).length > 64000) throw new HttpsError('invalid-argument','A complete actionRequest is required.');
  if (!['R2','R3','R4'].includes(a.risk) || !['demo','development','staging','production'].includes(a.environment) || typeof a.projectId !== 'string' || !a.projectId || typeof a.realmId !== 'string' || !a.realmId || !a.tenantId || ((a.risk === 'R3' || a.risk === 'R4') && (!/^[a-f0-9]{64}$/.test(a.preconditionDigest || '') || typeof a.rollbackRef !== 'string' || !a.rollbackRef)) || a.tenantId !== principal.tenantId || !principal.scopes.includes(a.projectId + ':' + a.action)) throw new HttpsError('permission-denied','Requested action is outside the agent scope.');
  const id = randomUUID();
  const created = Date.now();
  const approval = {
    approvalId:id, requesterUid:principal.uid, requesterAgentId:principal.agentId,
    tenantId:a.tenantId, projectId:a.projectId, realmId:a.realmId, environment:a.environment,
    action:a.action, resourceId:a.resourceId, risk:a.risk, payloadDigest:digest(a.payload), preconditionDigest:a.preconditionDigest || null, rollbackRef:a.rollbackRef || null,
    policyVersion:POLICY_VERSION, status:'AWAITING_HUMAN', approverUid:null, approverRole:null,
    decisionReason:null, createdAt:new Date(created).toISOString(), expiresAt:new Date(created + 15*60*1000).toISOString(), consumedAt:null
  };
  const ref = db.collection('dmcApprovalRequests').doc(id);
  await db.runTransaction(async tx => {
    tx.create(ref, approval);
    await audit(tx,principal,{eventType:'APPROVAL_REQUESTED',action:a.action,resourceId:a.resourceId,projectId:a.projectId,realmId:a.realmId,environment:a.environment,tenantId:a.tenantId,decision:'DENY',reasonCode:'APPROVAL_REQUIRED',approvalId:id,payloadDigest:approval.payloadDigest});
  });
  return { approvalId:id, status:approval.status, expiresAt:approval.expiresAt, productionHold:PRODUCTION_HOLD };
});

export const decideDmcApproval = onCall(async request => {
  const principal = requirePrincipal(request);
  const id = request.data?.approvalId;
  const decision = request.data?.decision;
  if (typeof id !== 'string' || !['APPROVE','REJECT'].includes(decision)) throw new HttpsError('invalid-argument','approvalId and APPROVE or REJECT are required.');
  const ref = db.collection('dmcApprovalRequests').doc(id);
  let result;
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found','Approval request not found.');
    const current = snap.data();
    const authz = assertHumanApproval(principal,current.requesterUid);
    const scopedApproval = ['owner','designated_authority'].includes(principal.role) || principal.scopes.includes(current.projectId + ':approve:' + current.action);
    if (!scopedApproval) throw new HttpsError('permission-denied','Reviewer is not scoped to this project and action.');
    if (!authz.ok) throw new HttpsError('permission-denied',authz.reason);
    if (current.status !== 'AWAITING_HUMAN' || Date.parse(current.expiresAt) <= Date.now()) throw new HttpsError('failed-precondition','Approval is no longer actionable.');
    if (decision === 'APPROVE' && current.risk === 'R4' && !['owner','designated_authority'].includes(principal.role)) throw new HttpsError('permission-denied','R4 approval requires owner authority.');
    if (decision === 'APPROVE' && current.risk === 'R3' && /security|identity|credential|permission|privacy|secret/i.test(current.action) && !['owner','security_reviewer'].includes(principal.role)) throw new HttpsError('permission-denied','Security reviewer approval is required.');
    const status = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    tx.update(ref,{status,approverUid:principal.uid,approverRole:principal.role,approverKind:'human',decisionReason:String(request.data?.reason || '').slice(0,1000),decidedAt:nowIso()});
    await audit(tx,principal,{eventType:'APPROVAL_DECIDED',action:current.action,resourceId:current.resourceId,projectId:current.projectId,realmId:current.realmId,environment:current.environment,tenantId:current.tenantId,decision,reasonCode:decision,payloadDigest:current.payloadDigest,approvalId:id,approverUid:principal.uid});
    result = {approvalId:id,status,productionHold:PRODUCTION_HOLD};
  });
  return result;
});

export const authorizeDmcAgentAction = onCall(async request => {
  const principal = requirePrincipal(request); assertAgent(principal);
  const a = request.data?.actionRequest;
  if (!a || typeof a !== 'object') throw new HttpsError('invalid-argument','actionRequest is required.');
  const approvalId = request.data?.approvalId || null;
  let result;
  await db.runTransaction(async tx => {
    const approvalRef = approvalId ? db.collection('dmcApprovalRequests').doc(approvalId) : null;
    const approvalSnap = approvalRef ? await tx.get(approvalRef) : null;
    const approvalData = approvalSnap?.exists ? approvalSnap.data() : null;
    const approval = approvalData ? {
      approvalId, requesterUid:approvalData.requesterUid, requesterAgentId:approvalData.requesterAgentId,
      approverUid:approvalData.approverUid, approverRole:approvalData.approverRole, approverKind:approvalData.approverKind,
      status:approvalData.status, expiresAt:approvalData.expiresAt, consumedAt:approvalData.consumedAt,
      policyVersion:approvalData.policyVersion, tenantId:approvalData.tenantId, projectId:approvalData.projectId,
      realmId:approvalData.realmId, environment:approvalData.environment, action:approvalData.action,
      resourceId:approvalData.resourceId, payloadDigest:approvalData.payloadDigest, preconditionDigest:approvalData.preconditionDigest, rollbackRef:approvalData.rollbackRef
    } : null;
    result = evaluateAction({principal,actionRequest:a,approval},{productionHold:PRODUCTION_HOLD,productionReleaseAuthorized:false,auditAvailable:true,policyVersion:POLICY_VERSION});
    await audit(tx,principal,{eventType:'POLICY_DECISION',action:a.action,resourceId:a.resourceId,projectId:a.projectId,realmId:a.realmId,environment:a.environment,tenantId:a.tenantId,decision:result.allowed?'ALLOW':'DENY',reasonCode:result.reason_code,approvalId,payloadDigest:digest(a.payload || {})});
    if (result.allowed && result.reason_code === 'ALLOW_APPROVED_ACTION' && approvalId && approvalData) {
      if (approvalData.status !== 'APPROVED' || approvalData.consumedAt || Date.parse(approvalData.expiresAt) <= Date.now()) {
        throw new HttpsError('failed-precondition','Approval was already consumed, expired or is not approved.');
      }
      tx.update(approvalRef,{status:'CONSUMED',consumedAt:nowIso()});
      await audit(tx,principal,{eventType:'APPROVAL_CONSUMED',action:a.action,resourceId:a.resourceId,projectId:a.projectId,realmId:a.realmId,environment:a.environment,tenantId:a.tenantId,decision:'ALLOW',reasonCode:'APPROVAL_CONSUMED',approvalId,payloadDigest:digest(a.payload || {})});
    }
  });
  return result;
});

export const createDmcHandoff = onCall(async request => {
  const principal = requirePrincipal(request); assertAgent(principal);
  const d = request.data || {};
  const required = ['handoffId','projectId','realmId','taskId','receiverAgentId','humanOwnerUid','purpose','scope','allowedTools','expectedOutput','acceptanceCriteria','expiresAt'];
  if (required.some(k => d[k] === undefined || d[k] === null) || !Array.isArray(d.scope) || !d.scope.length || !Array.isArray(d.allowedTools) || !Array.isArray(d.acceptanceCriteria) || !d.acceptanceCriteria.length) {
    throw new HttpsError('invalid-argument','Required handoff fields are missing.');
  }
  if (!principal.scopes.some(s => s.startsWith(d.projectId + ':')) || d.scope.some(s => !principal.scopes.includes(s)) || d.allowedTools.some(t => !Array.isArray(request.auth.token.dmcTools) || !request.auth.token.dmcTools.includes(t))) {
    throw new HttpsError('permission-denied','Handoff cannot exceed the sender agent capability scope.');
  }
  if (!/^[a-z0-9-]{2,128}$/.test(d.handoffId) || typeof d.humanOwnerUid !== 'string' || !d.humanOwnerUid || d.humanOwnerUid.length > 128 || d.humanOwnerUid === principal.uid) throw new HttpsError('invalid-argument','Valid handoffId and distinct humanOwnerUid are required.');
  const ownerUser = await getAuth().getUser(d.humanOwnerUid).catch(() => null);
  const ownerClaims = ownerUser?.customClaims || {};
  const ownerRoleAllowed = ['owner','designated_authority'].includes(ownerClaims.dmcRole)
    || (ownerClaims.dmcRole === 'project_owner' && Array.isArray(ownerClaims.dmcScopes) && ownerClaims.dmcScopes.includes(d.projectId + ':handoff:own'));
  if (!ownerUser || ownerClaims.accountStatus !== 'active' || !ownerRoleAllowed) throw new HttpsError('permission-denied','Handoff must be assigned to an active, authorized human owner.');
  const knownAgents = new Set(['dusse-1','dusse-2','zay-1','zay-2','ava-1','ava-2','host-1','research-1','engineering-1','security-1','qa-1','creative-1','community-1','operations-1','analytics-1']);
  if (!knownAgents.has(d.receiverAgentId) || d.receiverAgentId === principal.agentId) {
    throw new HttpsError('invalid-argument','A distinct registered receiverAgentId is required.');
  }
  if (typeof d.projectId !== 'string' || !d.projectId || typeof d.realmId !== 'string' || !d.realmId || typeof d.taskId !== 'string' || !d.taskId || !['R0','R1','R2','R3','R4'].includes(d.risk || 'R1') || !Number.isFinite(Date.parse(d.expiresAt)) || Date.parse(d.expiresAt) <= Date.now() || Date.parse(d.expiresAt) > Date.now() + 7*24*60*60*1000) {
    throw new HttpsError('invalid-argument','Handoff expiry must be within the next seven days.');
  }
  const prohibitedActions = [...new Set([...(Array.isArray(d.prohibitedActions) ? d.prohibitedActions : []),'production.deploy','secrets.mutate','financial.transfer','payment.activate','wallet.transfer','g02.activate','destructive.delete'])];
  const record = {
    handoffId:d.handoffId, tenantId:principal.tenantId, projectId:d.projectId, realmId:d.realmId,
    taskId:d.taskId, requesterUid:principal.uid, senderAgentId:principal.agentId,
    receiverAgentId:d.receiverAgentId, humanOwnerUid:d.humanOwnerUid, purpose:String(d.purpose).slice(0,2000),
    scope:[...new Set(d.scope)], allowedTools:[...new Set(d.allowedTools)], prohibitedActions,
    inputRefs:Array.isArray(d.inputRefs) ? d.inputRefs : [], expectedOutput:String(d.expectedOutput).slice(0,2000),
    acceptanceCriteria:d.acceptanceCriteria.map(x=>String(x).slice(0,500)), risk:d.risk || 'R1',
    status:'CREATED', createdAt:nowIso(), expiresAt:d.expiresAt, attempt:0, version:1,
    parentHandoffId:null, lastIdempotencyKey:null, acceptedByUid:null, completedByUid:null
  };
  const ref = db.collection('dmcHandoffs').doc(d.handoffId);
  await db.runTransaction(async tx => {
    tx.create(ref,record);
    await audit(tx,principal,{eventType:'HANDOFF_TRANSITION',action:'handoff.create',resourceId:d.handoffId,projectId:d.projectId,realmId:d.realmId,environment:'development',tenantId:principal.tenantId,decision:'TRANSITION',reasonCode:'CREATED',payloadDigest:digest({scope:record.scope,allowedTools:record.allowedTools})});
  });
  return {ok:true,handoffId:d.handoffId,status:'CREATED',version:1};
});

export const transitionDmcHandoff = onCall(async request => {
  const principal = requirePrincipal(request);
  if (principal.status !== 'active') throw new HttpsError('permission-denied','Active account status is required.');
  const { handoffId, to, idempotencyKey } = request.data || {};
  if (typeof handoffId !== 'string' || typeof to !== 'string' || typeof idempotencyKey !== 'string') throw new HttpsError('invalid-argument','handoffId, to and idempotencyKey are required.');
  const ref = db.collection('dmcHandoffs').doc(handoffId);
  let response;
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found','Handoff not found.');
    const current = snap.data();
    if (principal.tenantId !== current.tenantId) throw new HttpsError('permission-denied','Tenant mismatch.');
    if (['COMPLETED','REJECTED','CANCELLED','BLOCKED','EXPIRED'].includes(to) && principal.kind === 'human' && !['owner','designated_authority','project_owner'].includes(principal.role)) throw new HttpsError('permission-denied','Human owner authority is required for this handoff decision.');
    const next = transitionHandoff(current,{to,idempotencyKey},principal);
    if (!next.ok) throw new HttpsError('failed-precondition',next.code);
    if (next.replayed) { response = {ok:true,replayed:true,status:current.status}; return; }
    tx.update(ref,next.record);
    await audit(tx,principal,{eventType:'HANDOFF_TRANSITION',action:'handoff.transition',resourceId:handoffId,projectId:current.projectId,realmId:current.realmId,environment:'development',tenantId:current.tenantId,decision:'TRANSITION',reasonCode:to,payloadDigest:digest({from:current.status,to})});
    response = {ok:true,replayed:false,status:to,version:next.record.version};
  });
  return response;
});

export const getDmcControlStatus = onCall(async request => {
  const principal = requirePrincipal(request);
  if (principal.status !== 'active' || !['owner','designated_authority','auditor','security_reviewer'].includes(principal.role)) throw new HttpsError('permission-denied','DMC operator role required.');
  return {service:'DMC_CONTROL_PLANE',state:'SOURCE_IMPLEMENTED_NOT_DEPLOYED',backend:'FIRESTORE_ADAPTER_SOURCE_ONLY',agentRuntime:'NOT_CONNECTED',productionHold:PRODUCTION_HOLD,policyVersion:POLICY_VERSION};
});
