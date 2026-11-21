import { evaluateAuthorization, AUTHORIZATION_DECISIONS } from "./policy.mjs";

/**
 * Server-side authorization boundary for a protected request.
 *
 * authenticate must verify the incoming credential. resolveTrustedContext must
 * load principal roles, memberships, tenant/product/resource ownership and
 * delegation from trusted server-side records. Client claims are not authority.
 * auditDecision must durably append every decision before an ALLOW is returned.
 */
export async function authorizeServerRequest({
  request,
  authenticate,
  resolveTrustedContext,
  loadPolicy,
  auditDecision,
  now = new Date()
} = {}) {
  const denied = (reason, policyVersion = null) => ({
    decision: AUTHORIZATION_DECISIONS.INDETERMINATE,
    reason,
    policyVersion,
    matchedRuleIds: []
  });

  if (typeof authenticate !== "function"
    || typeof resolveTrustedContext !== "function"
    || typeof loadPolicy !== "function"
    || typeof auditDecision !== "function") {
    return denied("AUTHORIZATION_DEPENDENCY_UNAVAILABLE");
  }

  let identity;
  try { identity = await authenticate(request); }
  catch { return denied("AUTHENTICATION_UNAVAILABLE"); }
  if (!identity || identity.ok !== true || typeof identity.uid !== "string" || !identity.uid) {
    const result = {
      decision: AUTHORIZATION_DECISIONS.DENY,
      reason: "AUTHENTICATION_REQUIRED",
      policyVersion: null,
      matchedRuleIds: []
    };
    try {
      const persisted = await auditDecision({ identity: null, decision: result, request });
      if (persisted?.committed !== true) return denied("AUTHORIZATION_AUDIT_UNAVAILABLE");
    } catch { return denied("AUTHORIZATION_AUDIT_UNAVAILABLE"); }
    return result;
  }

  let trusted;
  try { trusted = await resolveTrustedContext({ identity, request }); }
  catch { return denied("TRUSTED_CONTEXT_UNAVAILABLE"); }
  if (!trusted || !trusted.principal || !trusted.action || !trusted.resource || !trusted.context) {
    return denied("TRUSTED_CONTEXT_INVALID");
  }

  let policy;
  try { policy = await loadPolicy({
    principal: trusted.principal,
    action: trusted.action,
    resource: trusted.resource,
    context: trusted.context
  }); }
  catch { return denied("POLICY_UNAVAILABLE"); }

  const result = evaluateAuthorization({
    principal: trusted.principal,
    action: trusted.action,
    resource: trusted.resource,
    context: trusted.context,
    policy,
    now
  });

  try {
    const persisted = await auditDecision({
      identity,
      principal: trusted.principal,
      action: trusted.action,
      resource: trusted.resource,
      context: trusted.context,
      decision: result,
      request
    });
    if (persisted?.committed !== true) return denied("AUTHORIZATION_AUDIT_UNAVAILABLE", result.policyVersion);
  } catch {
    return denied("AUTHORIZATION_AUDIT_UNAVAILABLE", result.policyVersion);
  }

  return result;
}
