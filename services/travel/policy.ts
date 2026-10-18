import type { Environment } from "./types";

export type PolicyDecision = "ALLOW" | "DENY" | "REQUIRE_APPROVAL" | "ESCALATE" | "READ_ONLY";

export function localTravelPolicy(input: {
  environment: Environment;
  operation: "search" | "revalidate" | "hold" | "book" | "cancel" | "refund";
  amount?: number;
  mode: "observe" | "assist" | "controlled_auto" | "emergency";
}): PolicyDecision {
  if (input.operation === "refund" && input.environment === "production") return "REQUIRE_APPROVAL";
  if (input.mode === "observe" && input.operation !== "search") return "READ_ONLY";
  if (input.operation === "book" && input.environment === "production") return "REQUIRE_APPROVAL";
  return "ALLOW";
}
