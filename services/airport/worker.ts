import { createEvent, type AirportEvent } from "./events";

export type WorkerStatus = "registered" | "running" | "paused" | "draining" | "disabled" | "failed";

export interface AirportWorker {
  workerId: string;
  name: string;
  version: string;
  status: WorkerStatus;
  subscriptions: string[];
  lastHeartbeatAt?: string;
}

export function heartbeat(worker: AirportWorker, auditId: string): AirportEvent {
  worker.lastHeartbeatAt = new Date().toISOString();
  return createEvent({
    event_type: "airport.health",
    source: worker.workerId,
    environment: "staging",
    actor: "worker",
    scope: "airport",
    payload: { worker_id: worker.workerId, status: worker.status, heartbeat_at: worker.lastHeartbeatAt },
    correlation_id: auditId,
    risk_level: "low",
    worker_targets: ["observer-worker", "analytics-worker"],
    approval_required: false,
    audit_id: auditId,
  });
}
