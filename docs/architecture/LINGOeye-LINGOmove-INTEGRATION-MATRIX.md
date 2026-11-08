# LINGOeye + LINGOmove Integration and Surface Matrix

**Status:** Proposed integration contract. This document does not assert deployed integrations.

## Domain boundaries

- **LINGOeye** owns camera/device enrollment, authorized capture, media evidence, GPS/beacon observations, event correlation, replay, privacy policy and evidence access audit.
- **LINGOmove** owns trip, delivery, fleet, dispatch, route, provider, booking, payment-state and fulfillment lifecycles.
- **Shared platform services** provide identity, tenant/realm authorization, event transport, notifications, observability, artifact provenance and release governance. They do not own product-specific state machines.
- **G02 infrastructure** is a controlled build/operations dependency only; neither product may bypass its runner acceptance gate or use the runner as a production workload host.
- **Cloudflare production** remains protected. No DNS, Worker, route, secret, billing or production change is authorized by this specification.

## Event contract between realms

LINGOmove publishes scoped events such as `trip.status.changed`, `delivery.status.changed`, `vehicle.assignment.changed`, `route.deviation.detected` and `proof.pending`. LINGOeye may publish `device.health.changed`, `media.clip.sealed`, `beacon.proximity.observed`, `geofence.event.detected` and `incident.evidence.linked`.

Cross-domain messages carry event/schema version, event ID, occurred/received timestamps, tenant/realm scope, source/target domain, correlation/causation IDs, policy/retention class and an opaque resource reference. Precise location and media are not copied into broad event payloads; consumers resolve them through authorization-checked APIs. Delivery is at-least-once with idempotent consumers; ordering is guaranteed only within a documented aggregate key.

Neither domain can mutate the other's authoritative state. LINGOeye may attach evidence to a LINGOmove incident, but cannot mark a delivery complete. LINGOmove may request an authorized clip, but cannot silently enable a camera or location collection.

## Surface matrix

| Surface | LINGOeye role | LINGOmove role | Restrictions |
|---|---|---|---|
| iOS | camera/location/BLE enrollment and authorized capture | customer, driver/courier and fleet workflows | explicit OS permissions; background behavior platform-bound |
| Android | camera/location/BLE enrollment and authorized capture | customer, driver/courier and fleet workflows | explicit OS permissions; background behavior platform-bound |
| Web/desktop | recorder administration, search, replay, evidence review | booking, dispatch, fleet, support and monitoring | browser permissions; server-side authorization |
| PWA | reduced device capture and monitoring | customer/operations subset | no assumption of background GPS/BLE/camera |
| LG webOS / ThinQ | read-only authorized wallboard/replay viewer | read-only transport/delivery board | no device capture, driver controls or background tracking assumed |
| Cloudflare Workers | authenticated APIs, signed media access, policy edge | trip/order/dispatch APIs and tracking links | no direct sensor capture; no public raw media bucket |
| Firebase | identity, registry, events, workflow state, presence | trip/order/job/fleet state and presence | explicit security rules and server authority |
| R2 | private media/evidence objects | private proof-of-delivery objects | lifecycle, checksum, encryption and scoped signed URLs |
| Queues / orchestration | ingest, correlate, alert and replay jobs | dispatch, provider webhook and notification jobs | idempotency, retry and dead-letter handling |
| GitHub Actions | device/media/security/build/evidence pipeline | contract/API/mobile/provider/ops pipelines | no untrusted code on privileged G02 host |

## Pipeline separation

Shared policy templates may be reused, but release pipelines remain domain-specific:

- `eye-device-media`: device adapter, recorder, upload, redaction, retention and replay.
- `eye-location-beacon`: GPS/BLE permissions, event validation, geofence and stale-state behavior.
- `eye-console-ops`: search, alert inbox, dashboard, evidence export and access audit.
- `move-contracts`: trip/delivery schemas and state transitions.
- `move-api-backend`: gateway, backend orchestration, queue consumers and Firestore rules.
- `move-customer-mobile`: booking and customer tracking.
- `move-driver-mobile`: assignment, navigation context, location and offline sync.
- `move-dispatch-web`: dispatch/fleet/support console.
- `move-provider-adapters`: provider sandbox, webhook, idempotency and reconciliation.
- `move-wallboard`: LG webOS read-only surface.
- `shared-identity-observability`: shared contracts only; independently versioned and backward-compatible.

Every pipeline must produce an immutable artifact, SBOM, provenance, test results, deployment manifest and evidence bundle. Promotion is a separate approval from build success. A failed domain pipeline must not silently block or promote unrelated products unless an explicit shared-contract dependency is implicated.

## Operations and incident correlation

Use one correlation ID across request, domain event, queue job, worker execution, notification, media object and incident record. Retain source event IDs and timestamps. Dashboards distinguish:
- service availability from business workflow success;
- device online from recording enabled;
- location available from location fresh;
- route ETA from confirmed arrival;
- upload completed from evidence checksum verified;
- delivery status from provider settlement;
- pipeline queued from runner execution;
- artifact built from artifact independently accepted.

Cross-domain incident replay presents a synchronized timeline but preserves source clocks, accuracy, confidence and missing intervals. A video clip, GPS fix or beacon event is evidence with provenance and uncertainty, not automatic proof of fault or identity.

## Security and privacy gates

1. Tenant/realm/role/purpose authorization on every read and write.
2. No camera, microphone, GPS or BLE capture without documented purpose, applicable notice/consent and visible controls.
3. No public media bucket, raw RTSP exposure, unrestricted tracking link or permanent signed URL.
4. Minimize location precision, sampling frequency, retention and viewer access.
5. Separate driver location access from general order/customer records.
6. Enforce idempotency, webhook signature verification, replay protection and audit trails.
7. Encrypt sensitive data and rotate credentials through an approved secret manager.
8. Negative tests must prove unauthorized users cannot discover devices, watch clips, resolve precise locations, enumerate trips or export evidence.
9. Privacy/legal/security review and device/platform certification precede pilot.
10. Break-glass access is time-bound, reason-coded, alerted and independently reviewed.

## Release gate

Required sequence: source review → tests → immutable artifact → staging execution → telemetry and workflow verification → evidence retrieval → independent verification → acceptance → authorization → promotion. Production and last-known-good remain protected until the full sequence is satisfied.
