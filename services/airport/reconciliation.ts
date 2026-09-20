import type { AirportState, ReconciliationPlan, StateDiff } from "./types";
import { localReconciliationPolicy } from "./policy";

export interface ReconciliationInput {
  desired: AirportState;
  actual: AirportState;
  observed: AirportState;
  mode: "observe" | "assist" | "controlled_auto" | "emergency";
}

export function compareStates(input: ReconciliationInput): StateDiff[] {
  const fields: Array<keyof AirportState> = ["status", "health", "desiredVersion", "actualVersion"];
  return fields.flatMap((field) => {
    const desired = input.desired[field];
    const actual = input.actual[field];
    const observed = input.observed[field];
    if (actual === desired && observed === actual) return [];
    const risk = field === "health" ? "high" : "medium";
    return [{ field: String(field), desired, actual, observed, risk }];
  });
}

export function planReconciliation(input: ReconciliationInput): ReconciliationPlan {
  const diffs = compareStates(input);
  const auditId = crypto.randomUUID();
  const reconciliationId = crypto.randomUUID();
  if (diffs.length === 0) {
    return { reconciliationId, airportId: input.actual.airportId, environment: input.actual.environment, diffs, action: "none", policyRequired: false, auditId };
  }

  const critical = diffs.some((d) => d.risk === "critical");
  const unhealthy = diffs.some((d) => d.field === "health");
  const action = critical ? "escalate" : unhealthy ? "restart_workers" : "resync_config";
  const risk = critical ? "critical" : unhealthy ? "high" : "medium";
  const decision = localReconciliationPolicy({ environment: input.actual.environment, action, risk, mode: input.mode });

  return {
    reconciliationId,
    airportId: input.actual.airportId,
    environment: input.actual.environment,
    diffs,
    action: decision === "DENY" || decision === "ESCALATE" ? "escalate" : action,
    policyRequired: decision === "REQUIRE_APPROVAL" || decision === "ESCALATE",
    auditId,
  };
}
