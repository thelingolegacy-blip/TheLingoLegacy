import type { Environment, TravelProduct } from "./types";

export type TravelEventType =
  | "travel.search.requested"
  | "travel.offer.found"
  | "travel.quote.created"
  | "travel.quote.expired"
  | "travel.hold.created"
  | "travel.payment.authorized"
  | "travel.booking.requested"
  | "travel.booking.confirmed"
  | "travel.booking.failed"
  | "travel.booking.cancelled"
  | "travel.booking.changed"
  | "travel.price.changed"
  | "travel.supplier.degraded"
  | "travel.reconciliation.drift_detected"
  | "travel.reconciliation.completed"
  | "travel.rewards.granted"
  | "travel.xp.earned";

export interface TravelEvent<T = Record<string, unknown>> {
  event_id: string;
  event_type: TravelEventType;
  event_version: "v1";
  timestamp: string;
  source: string;
  environment: Environment;
  actor: "user" | "system" | "worker";
  scope: TravelProduct | "booking" | "supplier" | "traveler" | "itinerary";
  payload: T;
  correlation_id: string;
  causation_id?: string;
  risk_level: "low" | "medium" | "high" | "critical";
  approval_required: boolean;
  audit_id: string;
}

export function createTravelEvent<T>(input: Omit<TravelEvent<T>, "event_id" | "event_version" | "timestamp">): TravelEvent<T> {
  return { ...input, event_id: crypto.randomUUID(), event_version: "v1", timestamp: new Date().toISOString() };
}
