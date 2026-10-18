import type { Environment, RiskLevel } from "./types";

export type AirportEventType =
  | "airport.created" | "airport.updated" | "airport.health"
  | "terminal.opened" | "terminal.closed"
  | "gate.opened" | "gate.closed" | "gate.boarding_started" | "gate.boarding_completed"
  | "flight.scheduled" | "flight.departed" | "flight.arrived" | "flight.delayed"
  | "citizen.checked_in" | "citizen.boarded" | "citizen.disembarked"
  | "passport.issued" | "passport.stamped"
  | "mission.started" | "mission.completed"
  | "xp.earned" | "reward.granted"
  | "airport.drift_detected" | "airport.reconciled" | "airport.repair_failed";

export interface AirportEvent<T = Record<string, unknown>> {
  event_id: string;
  event_type: AirportEventType;
  event_version: "v1";
  timestamp: string;
  source: string;
  environment: Environment;
  actor: "user" | "system" | "worker";
  scope: "airport" | "terminal" | "gate" | "flight" | "citizen" | "passport" | "mission";
  payload: T;
  correlation_id: string;
  causation_id?: string;
  risk_level: RiskLevel;
  worker_targets: string[];
  approval_required: boolean;
  audit_id: string;
}

export function createEvent<T>(input: Omit<AirportEvent<T>, "event_id" | "event_version" | "timestamp">): AirportEvent<T> {
  return {
    ...input,
    event_id: crypto.randomUUID(),
    event_version: "v1",
    timestamp: new Date().toISOString(),
  };
}
