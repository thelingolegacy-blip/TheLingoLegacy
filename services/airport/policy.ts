import type { Environment, RiskLevel } from "./types";

export type PolicyDecision = "ALLOW" | "DENY" | "REQUIRE_APPROVAL" | "ESCALATE" | "READ_ONLY";

export interface PolicyContext {
  environment: Environment;
  action: string;
  risk: RiskLevel;
  mode: "observe" | "assist" | "controlled_auto" | "emergency";
}

/**
 * Local safety boundary. The platform Policy Engine remains authoritative;
 * this function must never grant permissions beyond the platform decision.
 */
export function localReconciliationPolicy(context: PolicyContext): PolicyDecision {
  if (context.action.includes("physical") || context.action.includes("aviation")) return "DENY";
  if (context.action.includes("financial_payout")) return "DENY";
  if (context.action.includes("auth_bypass")) return "DENY";
  if (context.action.includes("destructive_db")) return "DENY";
  if (context.environment === "production" && context.risk === "high") return "REQUIRE_APPROVAL";
  if (context.risk === "critical") return "ESCALATE";
  return context.mode === "observe" ? "READ_ONLY" : "ALLOW";
}
