# LINGOmove — Transportation, Delivery and Mobility Operations Center

- **Status:** Proposed product architecture; no carrier, fleet, route, payment or live tracking integration is verified.
- **Product domain:** LINGOmove
- **Purpose:** Unified transportation, dispatch, delivery, tracking, monitoring and mobility coordination across approved LINGO surfaces.
- **Release posture:** Design only. No vehicle, driver, courier, customer, location, payment, booking or carrier account is connected by this specification.

## 1. Product definition

LINGOmove is the transportation center and operational mobility realm for LINGO. It coordinates trip discovery, transport options, dispatch, delivery jobs, fleet/driver availability, route progress, proof of delivery, exceptions, support and operational monitoring.

LINGOmove owns mobility workflows and service contracts. LINGOeye supplies authorized visual/event evidence as an optional integration; LINGOmove must continue to operate when cameras, GPS, beacons or video are unavailable.

### Product areas

1. **Transportation Center:** trip planner, route options, multimodal journeys, reservations/booking handoff, cancellations, changes, refunds and service support.
2. **Delivery Center:** pickup/drop-off, dispatch, parcel/order lifecycle, courier assignment, capacity, proof of delivery and exception handling.
3. **Fleet Center:** vehicles, drivers/couriers, availability, inspections, maintenance, safety status and operating zones.
4. **Tracking Center:** opt-in live location, ETA, route progress, geofence events, stale-state indicators and customer sharing links.
5. **Dispatch Center:** job queue, assignment rules, manual override, load balancing, route sequencing and escalation.
6. **Monitoring Center:** operational dashboard, maps, alerts, service levels, provider status, pipeline telemetry and incident timeline.
7. **Discovery and Replay:** search by trip/order/vehicle/driver/route/incident; replay authorized timeline of status, location and LINGOeye evidence.
8. **Partner Network:** adapters for airlines, rail, bus, rideshare, local fleet, courier and last-mile carriers; each requires provider authorization and commercial terms.

## 2. Transportation and delivery lifecycle

### Trip lifecycle
`DRAFT → OPTIONS_READY → SELECTED → BOOKING_PENDING → CONFIRMED → IN_PROGRESS → COMPLETED`
Alternate terminal/intermediate states: `CANCELLED`, `CHANGE_PENDING`, `REFUND_PENDING`, `DISRUPTED`, `EXPIRED`.

Never mark a trip confirmed from a search result or quote. Confirmation requires provider confirmation/reference and verified payment state where payment applies.

### Delivery lifecycle
`CREATED → VALIDATED → READY_FOR_DISPATCH → ASSIGNED → ACCEPTED → PICKUP_ARRIVED → PICKED_UP → IN_TRANSIT → DELIVERY_ARRIVED → DELIVERED`
Exception states: `ASSIGNMENT_FAILED`, `UNASSIGNED`, `DELAYED`, `CUSTOMER_UNAVAILABLE`, `ADDRESS_ISSUE`, `DAMAGED`, `LOST`, `RETURN_REQUESTED`, `RETURN_IN_TRANSIT`, `RETURNED`, `CANCELLED`, `DISPUTED`.

Every transition is server-authoritative, timestamped, actor-attributed, idempotent and auditable. Clients cannot directly set terminal states. Proof of delivery can be a recipient signature, approved one-time code, barcode scan, or authorized photo with notice/consent and retention rules; no single method is universally required.

## 3. Roles and access boundaries

- Customer: own trip/order, approved tracking and support.
- Driver/courier: assigned jobs only; route and status actions for active work.
- Dispatcher: assigned operating region/queue; manual reassignment with reason.
- Fleet manager: owned vehicles, inspections, maintenance and availability.
- Partner operator: only partner-scoped bookings/jobs through contractually approved APIs.
- Support: customer service and exception handling; limited location/history access.
- Finance: payment/refund/settlement records; no unnecessary precise location access.
- Auditor: read-only, time-bounded evidence and audit access.
- Platform administrator: policies/integrations; all privileged actions logged.

Enforce tenant, realm, region, job, provider and role scope server-side. Driver/courier location collection must be disclosed, purpose-limited, restricted to active work or another documented lawful basis, and visibly controlled as required. Customers receive only time-limited tracking links scoped to the specific order/trip. Do not provide public person-search or unrestricted vehicle tracking.

## 4. Reference architecture

### Client surfaces
- Flutter iOS and Android: customer booking, courier/driver app, fleet tools, push notifications, foreground and policy-compliant background location.
- React/Next.js web: customer portal, dispatch center, partner console, fleet admin, operations dashboards.
- Flutter Web/PWA: supported browser workflows with explicit reduced capability; background location is not assumed.
- LG webOS / ThinQ: read-only transportation wallboard, arrival/departure board, delivery status overview and approved visual dashboards; not a driver control surface.
- Desktop: dispatcher, support, finance and fleet management.

### Backend
- Cloudflare Workers: edge gateway, authentication enforcement, API routing, throttling and signed tracking-link issuance.
- Firebase Auth: identity and session management.
- Firestore: trip/order/job/vehicle/driver assignment and state records with explicit ownership.
- Firebase RTDB: short-lived live presence and active trip telemetry where appropriate.
- Cloud Functions / backend services: dispatch orchestration, provider adapters, payment webhooks, ETA updates, notification fanout and lifecycle transitions.
- Cloudflare Queues / Durable Objects: event processing, per-job ordering, retry orchestration, dispatch coordination where measured needs justify it.
- Cloudflare R2: delivery attachments, authorized proof-of-delivery media and LINGOeye-linked evidence; private buckets and lifecycle.
- Analytics: aggregate service metrics and demand; minimize personal data.
- GitHub Actions: independent mobile, web, API, provider-adapter and operations pipelines.

Use a canonical mobility domain model and provider adapters. External provider data is not authoritative for internal payment or fulfillment state until validated. Use webhook signature verification, replay protection, idempotency keys, dead-letter queues and reconciliation jobs.

## 5. Canonical data contracts

Core entities:
- `Trip`: trip_id, traveler_id, itinerary segments, option refs, provider refs, booking state, payment state, timestamps.
- `TripOption`: mode, provider, origin/destination, departure/arrival, duration, transfers, fare/currency, restrictions, quote expiry and source freshness.
- `DeliveryOrder`: order_id, shipper/customer refs, pickup/dropoff, package class/size/weight, service level, instructions and consent/policy references.
- `DeliveryJob`: job_id, order_id, route_id, assignment, status, promised window, ETA, exception and proof refs.
- `Vehicle`: vehicle_id, fleet_id, type/capacity, compliance/inspection status and availability.
- `Courier/Driver`: identity reference, qualifications, availability, active assignment; location stored separately under restricted access.
- `Route`: route_id, ordered stops, distance/duration estimate, constraints, version and source.
- `LocationPing`: event_id, asset/actor ref, coordinates, accuracy, speed/heading where lawful, source, timestamp, consent/purpose, freshness and retention class.
- `TrackingShare`: opaque token hash, order/trip scope, allowed fields, expiry, revocation and access log.
- `ProviderEvent`: provider, external event ID, signature status, received/occurred timestamps, normalized state and correlation ID.
- `ProofOfDelivery`: method, evidence object ref, checksum, captured time, actor, recipient acknowledgement and retention class.

All entities use schema versions, server timestamps, actor attribution, correlation IDs and idempotency. Avoid putting precise location into broad customer/order documents readable by unrelated services.

## 6. Delivery tracking and ETA

- Use GPS only with OS permission, visible disclosure and an approved operational purpose.
- Collect at a cadence appropriate to the active workflow, battery and network; do not default to continuous high-frequency tracking.
- Show last update time, accuracy radius, source and stale/offline state.
- ETA is an estimate with source and confidence; it must not be presented as a guarantee.
- Recompute after material route/status changes; avoid excessive provider calls.
- Geofences use hysteresis and dwell time to reduce GPS jitter; preserve raw signal and derived event separately.
- Offline clients queue signed/idempotent status events; server reconciles conflicts and rejects invalid lifecycle transitions.
- Customer tracking links expire, are revocable, avoid exposing driver identity/phone unless authorized, and reveal only minimum route/progress details.
- If location permission is revoked or GPS unavailable, show tracking unavailable/last-known with timestamp; do not fabricate a current position.

## 7. Dispatch and route optimization

Dispatch may consider capacity, service level, pickup/dropoff windows, distance, vehicle restrictions, driver/courier qualification, operating zone, accessibility, safety, workload and fairness. Every automated recommendation must expose reason codes and allow authorized human override with an audit reason.

Start with deterministic rules and measured heuristics. Do not claim optimal routing unless validated against real operating constraints. Do not optimize using protected/sensitive personal attributes. Provide a safe fallback to manual dispatch if routing, maps, ETA or AI providers fail.

## 8. Provider and payment integrations

Provider adapters require documented API access, partner agreement, authentication, rate limits, sandbox, webhook verification, idempotency, error mapping, reconciliation, SLA and support owner. Never scrape or simulate a provider booking as a confirmed reservation.

Payment integrations must use tokenized provider-hosted or PCI-compliant flows. Do not store raw card numbers, CVV or bank credentials. Separate authorization, capture, void, refund, dispute and settlement states. A provider booking and a payment success are distinct facts; reconcile both before declaring a paid confirmed booking.

No carrier, airline, rail, rideshare, payment, map or notification credentials are configured by this architecture.

## 9. Alerts, monitoring and LINGOeye integration

Alert classes: unassigned job, missed pickup window, ETA threshold breach, route deviation, vehicle/courier offline, geofence exception, failed delivery, proof missing, webhook signature failure, provider outage, payment reconciliation mismatch, queue backlog, app crash, API latency/error spike and data freshness failure.

LINGOeye can attach authorized camera clips, snapshots, beacon events and incident replay to a trip/order/vehicle event. It must not be a hard dependency for dispatch or delivery completion. A visual evidence link is optional, case-scoped, expiring and audited.

Dashboards include:
- live operational map with freshness and accuracy;
- trip/delivery funnel and aging queues;
- assignment and fulfillment performance;
- ETA error distribution and on-time rate;
- failed/duplicate webhook and dead-letter queues;
- provider health, latency and rate-limit state;
- app/API/worker health and deployment version;
- privacy access, tracking-share expiry and evidence access audit.

Metrics should be aggregated wherever possible. Do not expose named individual route histories on general-purpose wallboards.

## 10. Cross-platform and OS surface matrix

| Surface | Customer booking | Driver/courier | Dispatch/admin | Live tracking | Wallboard |
|---|---|---|---|---|---|
| iOS native | full planned | full planned, OS-permission bound | limited | active-trip opt-in | not primary |
| Android native | full planned | full planned, OS-permission bound | limited | active-trip opt-in | not primary |
| Web / desktop | full planned | browser-limited | full | permission/session scoped | full |
| PWA | supported subset | constrained | supported subset | foreground/browser limits | full |
| LG webOS / ThinQ | browse/status only if UX certified | none | none | read-only overview | read-only |
| Apple CarPlay / Android Auto | limited safe trip context if certified | no complex dispatch UI | none | navigation/status only under platform rules | none |
| Partner APIs/webhooks | partner-specific | partner-specific | partner-scoped | contracted fields only | none |

All OS/platform claims require a certification register by model, OS version, SDK, permission flow, distribution channel and test evidence. Driver interfaces must minimize interaction while moving and comply with platform safety rules.

## 11. Independent pipelines — separate realm

LINGOmove is a distinct realm with its own release, data, permissions, SLOs and rollback boundaries. It integrates through versioned contracts; it is not folded into a generic all-products pipeline.

Pipelines:
1. `move-contracts`: schemas, state machines, compatibility and migration tests.
2. `move-api-edge`: Workers, auth, rate limits, API security and contract tests.
3. `move-backend`: orchestration, Firestore rules, functions, queue consumers and emulator tests.
4. `move-customer-mobile`: iOS/Android booking and tracking surfaces.
5. `move-driver-mobile`: driver/courier workflows, location permissions, offline sync and safety checks.
6. `move-web-dispatch`: dispatch, fleet, support and customer web surfaces.
7. `move-tv-wallboard`: LG webOS read-only build and device certification.
8. `move-provider-adapters`: each provider sandbox, auth, webhook, idempotency and reconciliation.
9. `move-notifications`: push/email/SMS provider contract, opt-in, delivery receipts and retry.
10. `move-observability`: metrics, traces, dashboards, alert tests and runbook validation.
11. `move-security-privacy`: threat model, permissions, retention, location abuse tests and secret scanning.
12. `move-release-evidence`: SBOM, provenance, immutable artifacts, deployment smoke tests, checksum and independent acceptance.

Matrix dimensions: app surface × OS/device × environment × provider adapter × region/tenant. Use only supported combinations; unsupported combinations are explicitly marked unsupported, not silently green.

## 12. Failure and restoration

- Provider API unavailable: circuit-break, retain search/booking state, show provider unavailable and offer supported alternatives; never fabricate a confirmation.
- Webhook duplicated/out of order: deduplicate by provider event ID/idempotency key; reconcile against provider API.
- Dispatch queue stalled: pause auto-assignment, preserve pending jobs, drain DLQ after correction with rate limits.
- Driver offline: show last-seen and stale status; dispatch backup only under policy; do not claim live tracking.
- GPS drift: show accuracy, apply geofence hysteresis, request manual confirmation for consequential transitions.
- Map/ETA provider down: use cached route with stale label or manual operations; do not claim current ETA.
- Payment uncertain: hold booking state pending reconciliation; never capture/refund twice.
- Proof upload fails: retain job in proof-pending state, retry safely, provide alternate approved proof method.
- Mobile app update fails: keep prior accepted app release and backend compatibility; support minimum supported client version.
- Data corruption: stop affected writes, preserve audit/backup, restore to isolated environment, reconcile event stream before reopening.
- Security incident: revoke tracking links/tokens, suspend affected integrations, preserve logs, rotate secrets and notify incident owner.

Restore requires tested backups for authoritative records, configuration, object evidence and key-management metadata. Test restore into an isolated environment, reconcile idempotent event streams and verify object checksums before reopening operations. RPO/RTO/retention are TBD until service owner approves and test evidence exists.

## 13. Acceptance and rollout

Wave 0 — service definition, operator roles, legal/privacy review, provider inventory, cost model, safety case and data map.
Wave 1 — core contracts, auth, trip/order state machines, audit and emulator harness.
Wave 2 — customer booking/search and delivery creation using sandbox/mock providers explicitly labelled as test.
Wave 3 — dispatch queue, assignment, driver/courier app and offline sync.
Wave 4 — opt-in location, tracking links, geofences and ETA freshness.
Wave 5 — provider adapters, booking confirmation, webhook reconciliation and payment integration.
Wave 6 — LINGOeye evidence linking, alerting, replay and incident workflows.
Wave 7 — iOS/Android/web/PWA/LG webOS certification, operations wallboard, restore and handoff.
Wave 8 — staged pilot with limited region/provider, measured SLOs, incident drills and independent release acceptance.

Acceptance evidence includes actual sandbox transactions, verified provider webhooks, lifecycle tests, duplicate/out-of-order handling, location permission/revocation, stale GPS behavior, proof integrity, payment reconciliation, cross-surface tests, alert delivery, restore test, dashboards, runbooks and independent review. Source-only tests or screenshots do not establish live provider or production capability.

## 14. Open decisions

Initial geography and operating hours; owned vs partner fleet; delivery types and package restrictions; provider list and agreements; map/ETA provider; payment provider; driver/courier employment/contract model; insurance and safety policy; customer/driver notice and consent; retention and legal jurisdictions; LG webOS model targets; notification providers; support hours; cost ceiling; RPO/RTO. No booking, dispatch, payment or live tracking is enabled until these are resolved.
