const FORBIDDEN_KEY = /(password|passwd|token|secret|private.?key|credential|card.?number|cvv|ssn|date.?of.?birth|email.?body|message.?body)/i;
export function assertAuditSafe(value, path = '$') {
  if (!value || typeof value !== 'object') return true;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEY.test(key)) throw new Error('SENSITIVE_AUDIT_FIELD:' + path + '.' + key);
    assertAuditSafe(child, path + '.' + key);
  }
  return true;
}
export function createAuditEvent(input) {
  const event = {
    event_id:input.eventId, schema_version:'1.0.0', occurred_at:input.occurredAt,
    correlation_id:input.correlationId, tenant_id:input.tenantId, subject_uid:input.subjectUid,
    subject_type:input.subjectType, agent_id:input.agentId ?? null, event_type:input.eventType,
    action:input.action, resource_id:input.resourceId, project_id:input.projectId,
    realm_id:input.realmId, environment:input.environment, policy_version:input.policyVersion,
    decision:input.decision, reason_code:input.reasonCode, approval_id:input.approvalId ?? null,
    approver_uid:input.approverUid ?? null, before_digest:input.beforeDigest ?? null,
    after_digest:input.afterDigest ?? null, payload_digest:input.payloadDigest,
    source_commit:input.sourceCommit, workflow_run_id:input.workflowRunId ?? null,
    artifact_digest:input.artifactDigest ?? null, summary:String(input.summary || '').slice(0,500)
  };
  assertAuditSafe(event);
  return Object.freeze(event);
}
