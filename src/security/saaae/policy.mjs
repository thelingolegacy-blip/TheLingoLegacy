/**
 * SAAAE policy decision point — pure, fail-closed RBAC/ABAC evaluation.
 *
 * Inputs must be assembled by a trusted server-side adapter. Never pass raw
 * client claims, client-selected tenant IDs, or unverified agent metadata as
 * authoritative principal/resource/context attributes.
 *
 * This module evaluates policy only. It does not authenticate identities,
 * persist decisions, create approvals, write audit events, or execute actions.
 */

const PRINCIPAL_TYPES = new Set(["human", "service", "agent"]);
const EFFECTS = new Set(["allow", "deny"]);
const DECISIONS = Object.freeze({
  ALLOW: "ALLOW",
  DENY: "DENY",
  INDETERMINATE: "INDETERMINATE"
});

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every(nonEmptyString);
}

function isJsonScalar(value) {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function validAttributeMap(value) {
  return value === undefined || (isRecord(value)
    && Object.entries(value).every(([key, item]) => nonEmptyString(key) && isJsonScalar(item)));
}

function matchesSelector(rule, key, value) {
  if (rule[key] === undefined) return true;
  return isStringArray(rule[key]) && rule[key].includes(value);
}

function matchesAttributeConditions(conditions, principal, resource, context) {
  if (conditions === undefined) return true;
  if (!isRecord(conditions)) return false;

  const sources = {
    principalAttributes: principal.attributes || {},
    resourceAttributes: resource.attributes || {},
    contextAttributes: context.attributes || {}
  };

  for (const [sourceName, expected] of Object.entries(conditions)) {
    if (!Object.hasOwn(sources, sourceName) || !isRecord(expected)) return false;
    const actual = sources[sourceName];
    for (const [key, expectedValue] of Object.entries(expected)) {
      if (!isJsonScalar(expectedValue)
        || !Object.hasOwn(actual, key)
        || actual[key] !== expectedValue) return false;
    }
  }
  return true;
}

function validRule(rule) {
  if (!isRecord(rule) || !nonEmptyString(rule.id)
    || !EFFECTS.has(rule.effect)
    || !isStringArray(rule.actions) || rule.actions.length === 0
    || !isStringArray(rule.resourceTypes) || rule.resourceTypes.length === 0
    || !isStringArray(rule.productDomains) || rule.productDomains.length === 0
    || !isStringArray(rule.environments) || rule.environments.length === 0
    || !isStringArray(rule.tenantIds) || rule.tenantIds.length === 0) return false;

  for (const key of ["principalIds", "principalTypes", "roles"]) {
    if (rule[key] !== undefined && !isStringArray(rule[key])) return false;
  }
  if (rule.principalTypes?.some(type => !PRINCIPAL_TYPES.has(type))) return false;

  // An allow rule must identify who may act; broad tenant-only allow rules
  // are invalid. Deny rules may intentionally target a whole scoped domain.
  if (rule.effect === "allow"
    && !["principalIds", "principalTypes", "roles"].some(key => rule[key]?.length)) return false;

  if (!validAttributeMap(rule.conditions?.principalAttributes)
    || !validAttributeMap(rule.conditions?.resourceAttributes)
    || !validAttributeMap(rule.conditions?.contextAttributes)) return false;
  if (rule.conditions !== undefined && !isRecord(rule.conditions)) return false;

  for (const key of ["notBefore", "expiresAt"]) {
    if (rule[key] !== undefined && (!nonEmptyString(rule[key]) || Number.isNaN(Date.parse(rule[key])))) return false;
  }
  return true;
}

function ruleIsActive(rule, nowMs) {
  if (rule.notBefore !== undefined && Date.parse(rule.notBefore) > nowMs) return false;
  if (rule.expiresAt !== undefined && Date.parse(rule.expiresAt) <= nowMs) return false;
  return true;
}

function ruleMatches(rule, principal, action, resource, context) {
  if (!matchesSelector(rule, "actions", action)
    || !matchesSelector(rule, "resourceTypes", resource.type)
    || !matchesSelector(rule, "productDomains", resource.productDomain)
    || !matchesSelector(rule, "environments", context.environment)
    || !matchesSelector(rule, "tenantIds", resource.tenantId)) return false;

  if (rule.principalIds !== undefined && !rule.principalIds.includes(principal.id)) return false;
  if (rule.principalTypes !== undefined && !rule.principalTypes.includes(principal.type)) return false;
  if (rule.roles !== undefined && !rule.roles.some(role => principal.roles.includes(role))) return false;

  return matchesAttributeConditions(rule.conditions, principal, resource, context);
}

/**
 * @returns {{decision: "ALLOW"|"DENY"|"INDETERMINATE", reason: string,
 *   policyVersion: string|null, matchedRuleIds: string[]}}
 */
export function evaluateAuthorization({ principal, action, resource, context, policy, now = new Date() } = {}) {
  const indeterminate = (reason, policyVersion = null) => ({
    decision: DECISIONS.INDETERMINATE,
    reason,
    policyVersion,
    matchedRuleIds: []
  });

  if (!isRecord(principal) || !nonEmptyString(principal.id)
    || !PRINCIPAL_TYPES.has(principal.type)
    || principal.status !== "active"
    || !isStringArray(principal.tenantIds)
    || !isStringArray(principal.roles)
    || !validAttributeMap(principal.attributes)) {
    return indeterminate("PRINCIPAL_UNVERIFIED_OR_INVALID");
  }

  if (!nonEmptyString(action) || !isRecord(resource)
    || !nonEmptyString(resource.id) || !nonEmptyString(resource.type)
    || !nonEmptyString(resource.tenantId) || !nonEmptyString(resource.productDomain)
    || !validAttributeMap(resource.attributes)) {
    return indeterminate("ACTION_OR_RESOURCE_CONTEXT_INVALID");
  }

  if (!isRecord(context) || !nonEmptyString(context.tenantId)
    || !nonEmptyString(context.productDomain) || !nonEmptyString(context.environment)
    || !validAttributeMap(context.attributes)) {
    return indeterminate("TRUSTED_REQUEST_CONTEXT_INVALID");
  }

  if (context.tenantId !== resource.tenantId
    || context.productDomain !== resource.productDomain
    || !principal.tenantIds.includes(resource.tenantId)) {
    return {
      decision: DECISIONS.DENY,
      reason: "TENANT_OR_DOMAIN_BOUNDARY_MISMATCH",
      policyVersion: isRecord(policy) && nonEmptyString(policy.version) ? policy.version : null,
      matchedRuleIds: []
    };
  }

  if (!isRecord(policy) || !nonEmptyString(policy.version)
    || policy.status !== "active" || !Array.isArray(policy.rules)
    || policy.rules.some(rule => !validRule(rule))) {
    return indeterminate("POLICY_UNAVAILABLE_OR_INVALID", isRecord(policy) ? policy.version ?? null : null);
  }

  const nowMs = now instanceof Date ? now.getTime() : Date.parse(now);
  if (!Number.isFinite(nowMs)) return indeterminate("POLICY_EVALUATION_TIME_INVALID", policy.version);

  const matching = policy.rules.filter(rule => ruleIsActive(rule, nowMs)
    && ruleMatches(rule, principal, action, resource, context));
  const denied = matching.filter(rule => rule.effect === "deny");
  if (denied.length) {
    return {
      decision: DECISIONS.DENY,
      reason: "EXPLICIT_DENY_RULE",
      policyVersion: policy.version,
      matchedRuleIds: denied.map(rule => rule.id)
    };
  }

  const allowed = matching.filter(rule => rule.effect === "allow");
  if (!allowed.length) {
    return {
      decision: DECISIONS.DENY,
      reason: "NO_MATCHING_ALLOW_RULE",
      policyVersion: policy.version,
      matchedRuleIds: []
    };
  }

  return {
    decision: DECISIONS.ALLOW,
    reason: "MATCHING_ALLOW_RULE",
    policyVersion: policy.version,
    matchedRuleIds: allowed.map(rule => rule.id)
  };
}

export { DECISIONS as AUTHORIZATION_DECISIONS };
