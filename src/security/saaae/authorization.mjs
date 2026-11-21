import { evaluateAuthorization, AUTHORIZATION_DECISIONS } from "./policy.mjs";

/**
 * Server-side authorization boundary for a protected request.
 *
 * authenticate verifies the incoming credential. resolveTrustedContext loads
 * principal roles, memberships, tenant/product/resource ownership and delegation
 * from trusted server-side records. auditDecision durably appends every outcome.
 * Client claims are never authoritative.
 */
export async function authorizeServerRequest({
  request,
  authenticate,
  resolveTrustedContext,
  loadPolicy,
  auditDecision,
  now = new Date(),
  requestId = globalThis.crypto?.randomUUID?.()
} = {}) {
  const indeterminate = (reason, policyVersion = null) => ({
    decision: AUTHORIZATION_DECISIONS.INDETERMINATE,
    reason,
    policyVersion,
    matchedRuleIds: []
  });

  if (typeof auditDecision !== "function" || typeof requestId !== "string" || !requestId) {
    return indeterminate("AUTHORIZATION_AUDIT_UNAVAILABLE");
  }

  const record = async (decision, details = {}) => {
    try {
      const persisted = await auditDecision({ requestId, decision, ...details });
      return persisted?.committed === true
        ? decision
        : indeterminate("AUTHORIZATION_AUDIT_UNAVAILABLE", decision.policyVersion);
    } catch {
      return indeterminate("AUTHORIZATION_AUDIT_UNAVAILABLE", decision.policyVersion);
    }
  };

  if (typeof authenticate !== "function"
    || typeof resolveTrustedContext !== "function"
    || typeof loadPolicy !== "function") {
    return record(indeterminate("AUTHORIZATION_DEPENDENCY_UNAVAILABLE"));
  }

  let identity;
  try { identity = await authenticate(request); }
  catch {
    return record(indeterminate("AUTHENTICATION_UNAVAILABLE"));
  }
  if (!identity || identity.ok !== true || typeof identity.uid !== "string" || !identity.uid) {
    return record({
      decision: AUTHORIZATION_DECISIONS.DENY,
      reason: "AUTHENTICATION_REQUIRED",
      policyVersion: null,
      matchedRuleIds: []
    }, { actorPrincipalId: null, actorPrincipalType: null });
  }

  let trusted;
  try { trusted = await resolveTrustedContext({ identity, request }); }
  catch {
    return record(indeterminate("TRUSTED_CONTEXT_UNAVAILABLE"), { actorPrincipalId: identity.uid, actorPrincipalType: "unknown" });
  }
  if (!trusted || !trusted.principal || !trusted.action || !trusted.resource || !trusted.context
    || trusted.authenticatedUid !== identity.uid) {
    return record(indeterminate("TRUSTED_CONTEXT_INVALID_OR_IDENTITY_MISMATCH"), {
      actorPrincipalId: identity.uid,
      actorPrincipalType: "unknown"
    });
  }

  let policy;
  try {
    policy = await loadPolicy({
      principal: trusted.principal,
      action: trusted.action,
      resource: trusted.resource,
      context: trusted.context
    });
  } catch {
    return record(indeterminate("POLICY_UNAVAILABLE"), {
      actorPrincipalId: trusted.principal.id,
      actorPrincipalType: trusted.principal.type,
      action: trusted.action,
      resourceId: trusted.resource.id,
      tenantId: trusted.resource.tenantId,
      productDomain: trusted.resource.productDomain,
      environment: trusted.context.environment
    });
  }

  const decision = evaluateAuthorization({
    principal: trusted.principal,
    action: trusted.action,
    resource: trusted.resource,
    context: trusted.context,
    policy,
    now
  });

  return record(decision, {
    actorPrincipalId: trusted.principal.id,
    actorPrincipalType: trusted.principal.type,
    action: trusted.action,
    resourceId: trusted.resource.id,
    tenantId: trusted.resource.tenantId,
    productDomain: trusted.resource.productDomain,
    environment: trusted.context.environment
  });
}
