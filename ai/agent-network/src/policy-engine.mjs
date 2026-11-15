import { createHash } from 'node:crypto';

export const POLICY_VERSION = 'dmc-policy-1.0.0';
export const RISK_ORDER = Object.freeze({ R0: 0, R1: 1, R2: 2, R3: 3, R4: 4 });
const HUMAN_APPROVER_ROLES = new Set(['owner', 'designated_authority', 'governance_reviewer', 'security_reviewer']);
const SECURITY_ACTION = /security|identity|credential|permission|privacy|secret|financial|payment|wallet/i;
const PROTECTED_ACTION = /production|deploy|dns|cloudflare|firebase_publish|secret|credential|payment|financial|wallet_transfer|g02|runner_activation|destructive|delete|migration/i;

export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonicalJson(value[k])).join(',') + '}';
}
export function digest(value) {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}
export function isHumanApprover(principal) {
  return principal?.kind === 'human' && HUMAN_APPROVER_ROLES.has(principal.role) && principal.status === 'active';
}
export function evaluateAction(input, context = {}) {
  const p = input?.principal || {};
  const a = input?.actionRequest || {};
  const deny = (reason_code) => decision(false, reason_code, p, a, input?.approval || null, context);
  if (p.status !== 'active' || !p.uid || !p.tenantId) return deny('IDENTITY_INVALID');
  if (p.kind !== 'agent' || !p.agentId) return deny('IDENTITY_INVALID');
  if (!a.tenantId || a.tenantId !== p.tenantId || !a.projectId || !a.realmId) return deny('SCOPE_MISMATCH');
  if (!Array.isArray(p.scopes) || !p.scopes.includes(a.projectId + ':' + a.action)) return deny('SCOPE_MISMATCH');
  if (!['demo','development','staging','production'].includes(a.environment)) return deny('ENVIRONMENT_MISMATCH');
  if (!Object.hasOwn(RISK_ORDER, a.risk)) return deny('RISK_POLICY_DENY');
  if (a.environment === 'production' && context.productionHold !== false) return deny('PRODUCTION_HOLD');
  if (PROTECTED_ACTION.test(a.action) && a.risk !== 'R4') return deny('RISK_POLICY_DENY');
  if (a.risk === 'R0') return decision(true, 'ALLOW_SCOPED_READ', p, a, null, context);
  if (a.risk === 'R1') return decision(true, 'ALLOW_DRAFT', p, a, null, context);
  if ((a.risk === 'R3' || a.risk === 'R4') && (!/^[a-f0-9]{64}$/.test(a.preconditionDigest || '') || typeof a.rollbackRef !== 'string' || !a.rollbackRef)) return deny('RISK_POLICY_DENY');
  if (!context.auditAvailable) return deny('AUDIT_UNAVAILABLE');
  const approval = input.approval;
  if (!approval) return deny('APPROVAL_MISSING');
  if (approval.status === 'CONSUMED' || approval.consumedAt) return deny('APPROVAL_REPLAY');
  if (approval.status !== 'APPROVED' || !approval.approverUid) return deny('APPROVAL_INVALID');
  if (approval.requesterUid !== p.uid || approval.requesterAgentId !== p.agentId) return deny('IDENTITY_INVALID');
  if (approval.requesterUid === approval.approverUid) return deny('SELF_APPROVAL');
  if (approval.approverKind !== 'human' || !HUMAN_APPROVER_ROLES.has(approval.approverRole)) return deny('ROLE_FORBIDDEN');
  if (!Number.isFinite(Date.parse(approval.expiresAt)) || Date.parse(approval.expiresAt) <= (context.nowMs ?? Date.now())) return deny('APPROVAL_EXPIRED');
  if (approval.policyVersion !== (context.policyVersion || POLICY_VERSION)) return deny('POLICY_VERSION_MISMATCH');
  if (approval.tenantId !== a.tenantId || approval.projectId !== a.projectId || approval.realmId !== a.realmId) return deny('SCOPE_MISMATCH');
  if (approval.environment !== a.environment) return deny('ENVIRONMENT_MISMATCH');
  if (approval.action !== a.action || approval.resourceId !== a.resourceId) return deny('RESOURCE_MISMATCH');
  if (approval.risk !== a.risk) return deny('RISK_POLICY_DENY');
  if (approval.preconditionDigest !== a.preconditionDigest || approval.rollbackRef !== a.rollbackRef) return deny('APPROVAL_INVALID');
  if (approval.payloadDigest !== digest(a.payload ?? {})) return deny('APPROVAL_INVALID');
  if (a.risk === 'R3' && SECURITY_ACTION.test(a.action) && approval.approverRole !== 'security_reviewer' && approval.approverRole !== 'owner') return deny('ROLE_FORBIDDEN');
  if (a.risk === 'R4' && approval.approverRole !== 'owner' && approval.approverRole !== 'designated_authority') return deny('ROLE_FORBIDDEN');
  if (PROTECTED_ACTION.test(a.action) && context.productionHold !== false) return deny('PRODUCTION_HOLD');
  return decision(true, 'ALLOW_APPROVED_ACTION', p, a, approval, context);
}
function decision(allowed, reason_code, p, a, approval, context) {
  return {
    decision_id: context.decisionId || 'dmc_' + digest({ uid:p.uid || null, action:a.action || null, resource:a.resourceId || null, at:context.nowMs ?? Date.now() }).slice(0,24),
    allowed, reason_code, policy_version:context.policyVersion || POLICY_VERSION,
    evaluated_at:new Date(context.nowMs ?? Date.now()).toISOString(),
    subject_uid:p.uid || '', agent_id:p.agentId || null, action:a.action || '',
    resource_id:a.resourceId || '', tenant_id:a.tenantId || '', project_id:a.projectId || '',
    realm_id:a.realmId || '', environment:['demo','development','staging','production'].includes(a.environment) ? a.environment : 'development', risk:Object.hasOwn(RISK_ORDER,a.risk) ? a.risk : 'R0',
    approval_id:approval?.approvalId || null, audit_required:true
  };
}
export function assertHumanApproval(principal, requesterUid) {
  if (!isHumanApprover(principal)) return { ok:false, reason:'ROLE_FORBIDDEN' };
  if (principal.uid === requesterUid) return { ok:false, reason:'SELF_APPROVAL' };
  return { ok:true };
}
