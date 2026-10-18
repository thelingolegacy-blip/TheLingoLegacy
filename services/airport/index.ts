import type { AirportState } from "./types";

export const AIRPORT_SERVICE = "service:airport" as const;

export function health() {
  return { service: AIRPORT_SERVICE, status: "healthy", timestamp: new Date().toISOString() };
}

export function status(state: AirportState) {
  return {
    service: AIRPORT_SERVICE,
    airport_id: state.airportId,
    environment: state.environment,
    status: state.status,
    health: state.health,
    drift_status: state.driftStatus,
    observed_at: state.observedAt,
    last_reconciled_at: state.lastReconciledAt ?? null,
    audit_id: state.auditId ?? null,
  };
}
