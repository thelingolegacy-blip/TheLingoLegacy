export type Environment = "dev" | "staging" | "production";
export type Health = "healthy" | "degraded" | "failed" | "unknown";
export type Status = "active" | "paused" | "draining" | "disabled" | "degraded";
export type DriftStatus = "in_sync" | "drifted" | "critical";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface AirportState {
  airportId: string;
  version: string;
  environment: Environment;
  status: Status;
  health: Health;
  terminals: number;
  gates: number;
  activeFlights: number;
  citizens: number;
  observedAt: string;
  desiredVersion: string;
  actualVersion: string;
  driftStatus: DriftStatus;
  lastReconciledAt?: string;
  auditId?: string;
}

export interface StateDiff {
  field: string;
  desired: unknown;
  actual: unknown;
  observed: unknown;
  risk: RiskLevel;
}

export interface ReconciliationPlan {
  reconciliationId: string;
  airportId: string;
  environment: Environment;
  diffs: StateDiff[];
  action: "none" | "restart_workers" | "resync_config" | "escalate";
  policyRequired: boolean;
  auditId: string;
}
