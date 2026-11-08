import { planReconciliation } from "./reconciliation";
import type { AirportState } from "./types";

const base: AirportState = {
  airportId: "lingo-phl-foundation",
  version: "2.0.0",
  environment: "staging",
  status: "active",
  health: "healthy",
  terminals: 6,
  gates: 10,
  activeFlights: 0,
  citizens: 0,
  observedAt: new Date().toISOString(),
  desiredVersion: "2.0.0",
  actualVersion: "2.0.0",
  driftStatus: "in_sync",
};

describe("airport reconciliation", () => {
  it("returns no action when desired, actual and observed state agree", () => {
    expect(planReconciliation({ desired: base, actual: base, observed: base, mode: "controlled_auto" }).action).toBe("none");
  });

  it("plans worker restart for unhealthy staging state", () => {
    const unhealthy = { ...base, health: "failed" as const };
    const plan = planReconciliation({ desired: base, actual: unhealthy, observed: unhealthy, mode: "controlled_auto" });
    expect(plan.action).toBe("restart_workers");
  });

  it("requires approval for high-risk production reconciliation", () => {
    const desired = { ...base, environment: "production" as const };
    const actual = { ...desired, health: "failed" as const };
    const plan = planReconciliation({ desired, actual, observed: actual, mode: "controlled_auto" });
    expect(plan.policyRequired).toBe(true);
  });
});
