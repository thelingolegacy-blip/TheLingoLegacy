/**
 * LINGO AI Master — deterministic, non-executing task router.
 *
 * This module only classifies tasks and evaluates a deny-by-default policy.
 * It does not call models, invoke tools, access secrets, or perform mutations.
 */

const ROUTES = Object.freeze({
  fast_support: "instant-ai",
  complex_reasoning: "thinking-ai",
  creative: "sol",
  infrastructure: "terra",
  research_verification: "luna",
  coordination: "eliza",
});

const TOOL_POLICIES = Object.freeze({
  github_read: { scope: "github:read", mode: "read" },
  staging_read: { scope: "staging:read", mode: "read" },
  evidence_read: { scope: "evidence:read", mode: "read" },
  github_branch_write: { scope: "github:branch-write", mode: "write" },
  staging_deploy: { scope: "staging:deploy", mode: "write" },
  production_deploy: { scope: "production:deploy", mode: "protected" },
  production_routing: { scope: "production:routing", mode: "protected" },
  billing_change: { scope: "billing:write", mode: "protected" },
  payment_activation: { scope: "payments:activate", mode: "protected" },
  credential_change: { scope: "credentials:write", mode: "protected" },
  destructive_change: { scope: "destructive:write", mode: "protected" },
});

export function routeTask(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      status: "needs_clarification",
      agent: "eliza",
      reason: "Task input must be an object with a recognized taskType.",
    };
  }

  const taskType = typeof input.taskType === "string"
    ? input.taskType.trim().toLowerCase()
    : "";

  if (!Object.hasOwn(ROUTES, taskType)) {
    return {
      status: "manual_triage",
      agent: "eliza",
      reason: "Unknown or missing taskType; coordinator review is required.",
    };
  }

  return {
    status: "routed",
    agent: ROUTES[taskType],
    taskType,
    taskId: typeof input.taskId === "string" ? input.taskId : null,
  };
}

/**
 * Phase-0 policy: read-only tools may be allowed with an explicit matching
 * scope. All writes remain blocked until a separately reviewed execution and
 * approval service exists. Protected operations are never authorized here.
 */
export function authorizeTool(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { allowed: false, status: "deny", reason: "Invalid authorization request." };
  }

  const tool = typeof input.tool === "string" ? input.tool : "";
  const policy = TOOL_POLICIES[tool];

  if (!policy) {
    return { allowed: false, status: "deny", reason: "Tool is not on the allowlist." };
  }

  if (policy.mode === "protected") {
    return {
      allowed: false,
      status: "human_gate_required",
      reason: "Protected actions are not executable through the Phase-0 router.",
    };
  }

  if (policy.mode !== "read") {
    return {
      allowed: false,
      status: "not_implemented",
      reason: "Write execution is disabled until the execution and approval services are reviewed.",
    };
  }

  const scopes = Array.isArray(input.grantedScopes) ? input.grantedScopes : [];
  if (!scopes.includes(policy.scope)) {
    return { allowed: false, status: "deny", reason: "Required scope is missing." };
  }

  return {
    allowed: true,
    status: "allow_read_only",
    tool,
    requiredScope: policy.scope,
  };
}

export const ROUTER_VERSION = "0.1.0";
