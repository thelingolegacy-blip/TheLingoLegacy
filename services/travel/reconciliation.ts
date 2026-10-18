import type { Booking, BookingDiff } from "./types";

export function compareBookingState(expected: Booking, supplier: Booking, observed: Booking): BookingDiff[] {
  const fields: Array<keyof Booking> = ["status", "confirmedAmount", "supplierConfirmation"];
  return fields.flatMap((field) => {
    const expectedValue = expected[field];
    const supplierValue = supplier[field];
    const observedValue = observed[field];
    if (expectedValue === supplierValue && supplierValue === observedValue) return [];
    const severity = field === "status" ? "high" : field === "confirmedAmount" ? "critical" : "medium";
    return [{ field: String(field), expected: expectedValue, supplier: supplierValue, observed: observedValue, severity }];
  });
}

export function reconciliationAction(diffs: BookingDiff[]): "none" | "refresh" | "escalate" {
  if (!diffs.length) return "none";
  if (diffs.some((diff) => diff.severity === "critical")) return "escalate";
  return "refresh";
}
