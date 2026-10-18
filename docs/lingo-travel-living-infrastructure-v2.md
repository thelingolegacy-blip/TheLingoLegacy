# Lingo Travel OS 2.0 — Full-Stack Living Infrastructure

## Objective
Keep frontend, backend, Event Fabric, Policy Engine, Firebase, Cloudflare, CI/CD, Command Center, and Travel domain state aligned through explicit contracts.

## Runtime topology

Frontend → Travel API → Event Gateway → Policy Engine → Travel Workers → Supplier Adapters
                    ↓                         ↓
                 Firebase                  Audit/Telemetry
                    ↓                         ↓
              Command Center ← Observability ← Cloudflare Edge

## Frontend contract
- Render only server-authoritative travel state.
- Never invent inventory, price, booking status, payment status, or rewards.
- Every mutation receives an action/result correlation ID.
- Surface stale/revalidation state explicitly.
- Booking UI must require a verified booking result before displaying confirmed.

## Backend contract
- Validate all input at the API boundary.
- Normalize supplier responses into canonical Offer/Trip contracts.
- Revalidate price and availability immediately before hold/booking.
- Route critical mutations through Policy Engine.
- Persist authoritative state and emit corresponding events.
- Verify supplier confirmation before transitioning a booking to confirmed.

## Firebase integration
Firebase is the application-state and identity-adjacent persistence layer where already established by the platform. Travel data must be scoped by project/environment and must not bypass authorization. Suggested collections:
- travel_projects
- travelers
- trips
- itineraries
- offers
- bookings
- supplier_connections
- travel_events
- reconciliation_runs

Do not store raw payment-card data in Travel.

## Cloudflare integration
Cloudflare is the edge/runtime boundary where configured by the platform. Travel endpoints should use environment-specific bindings, rate limiting, request validation, and observability. Production mutations must remain behind Policy Engine authorization.

Suggested service boundaries:
- travel-api
- travel-event-gateway
- travel-reconciliation
- travel-worker-runtime

## CI/CD integration
Required promotion path:
commit → static checks → unit tests → contract tests → security checks → integration tests → staging → smoke tests → approval → production → verification → audit

Production deployment must be reversible and must not include destructive database changes without an explicit migration gate.

## Observability
Emit metrics/logs/traces for:
- search latency
- supplier availability
- quote changes
- revalidation failures
- booking success/failure
- supplier latency/error rate
- policy decisions
- worker retries
- reconciliation drift
- verification failures

## Reconciliation
Desired state, actual state, and observed supplier state are compared. Repairs are policy-controlled. Financial mutations and irreversible booking changes require explicit approval unless an existing certified policy explicitly permits the operation.

## Integration invariants
1. Frontend and backend share versioned contracts.
2. Events are the source of cross-service coordination.
3. Policy Engine is authoritative for protected actions.
4. Audit IDs follow critical actions end-to-end.
5. Firebase/Cloudflare are infrastructure components, not alternate authorization authorities.
6. Supplier adapters are replaceable and independently health-checked.
7. No production activation until certification passes.

## Certification gate
Identity ✓
Event Fabric ✓
Policy ✓
Travel API ✓
Supplier adapter contract ✓
Booking verification ✓
Security ✓
QA ✓
Observability ✓
Audit ✓
Deployment/rollback ✓

A checkmark is earned by an automated test or verified runtime signal; it is not a documentation-only status.