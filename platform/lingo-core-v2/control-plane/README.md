# LINGO MASTER CONTROL PLANE — service registry contract

The Control Plane is the operational inventory and policy surface for the LINGO portfolio. It is not a privileged backdoor and must not become a single point of failure.

## Initial contract
Every registered service declares:
- Stable service ID and display name.
- Owning team and repository path.
- Runtime and lifecycle environment.
- API/event contracts.
- Liveness and readiness probes.
- Data classification and data owner.
- Dependencies and trust boundaries.
- SLO/runbook references.
- Connection status with evidence references.
- Production authorization state.

## Control Plane safety
- Read-only inventory and health aggregation by default.
- Mutations require scoped roles, explicit approvals, audit records and idempotency keys.
- No direct secret-value display.
- No arbitrary command execution through the dashboard.
- No ability to bypass GitHub branch protections or release gates.
- Health aggregation must degrade gracefully if the Control Plane is unavailable.
- Each product retains its own deployment and data lifecycle.

The initial registry is `../registry/services.yaml`. A UI, database, or cloud runtime is intentionally not provisioned in this phase.
