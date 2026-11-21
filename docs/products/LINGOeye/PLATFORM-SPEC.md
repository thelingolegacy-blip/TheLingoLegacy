# LINGOeye — Recorder, Awareness and Evidence Platform

- **Status:** Proposed product architecture; implementation and device certification not yet verified.
- **Product domain:** LINGOeye
- **Purpose:** Consent-based capture, situational awareness, event detection, visual evidence, replay, and operational observability across approved LINGO systems.
- **Release posture:** Design only. No camera, microphone, GPS, beacon, recording, notification, or surveillance capability is activated by this specification.

## 1. Product definition

LINGOeye is the visual and event-awareness system for authorized LINGO operations. It connects approved cameras and devices, GPS/location signals, BLE beacons, service telemetry, operational alerts, snapshots, and replay into one evidence-oriented console.

It is not a covert surveillance product. Recording and tracking must be visible, purpose-limited, access-controlled, auditable, and legally reviewed for the jurisdiction and deployment context. It must not enable stalking, hidden recording, unauthorized employee monitoring, or tracking people without a lawful basis and required notice/consent.

### Primary capabilities

1. **Recorder:** authorized camera enrollment, live preview where supported, scheduled/event recording, clip lifecycle, storage policy and device health.
2. **GPS awareness:** device/asset location, freshness, accuracy radius, permitted geofences, breadcrumb history subject to retention, and location-sharing state.
3. **Beacon discovery:** BLE beacon enrollment, proximity events, signal confidence, calibration, battery state and anti-spoofing controls. Beacon observations are not proof of a person's identity or exact location.
4. **Alerts:** threshold/rule-based notifications for device offline, tamper, geofence entry/exit, unexpected movement, storage/stream failure, safety events and workflow exceptions.
5. **Discovery:** search and correlate approved cameras, clips, snapshots, assets, trips, deliveries, incidents, locations and telemetry by time, asset ID, event ID and authorized tags.
6. **Replay:** synchronized timeline across video clips, GPS points, beacon observations, dispatch events, sensor telemetry and operator actions. Preserve source timestamps, clock skew and provenance.
7. **Snapshots and visuals:** still frames, redacted preview images, event thumbnails, route overlays, heatmaps, system topology, timeline and evidence package.
8. **Operations observability:** service health, pipeline status, edge/worker errors, device connectivity, ingestion lag, storage use, alert delivery, API latency and CI/CD release evidence.

## 2. User roles and authorization

- **Platform administrator:** enrolls integrations and manages policy; cannot silently bypass audit.
- **Operations dispatcher:** sees assigned operations, approved camera feeds and trip/delivery events.
- **Security/safety operator:** responds to authorized incidents and preserves evidence.
- **Fleet/device manager:** enrolls and maintains owned/managed devices and beacons.
- **Auditor/investigator:** time-bounded, case-scoped read access with immutable audit trail.
- **End user/driver/field worker:** sees their own active sharing/recording indicators and can access applicable notices and controls.
- **Viewer:** receives explicitly shared, redacted and time-limited visuals only.

Use Firebase Auth identity and server-authoritative roles/claims; enforce tenant, realm, asset, case and purpose scope in APIs and storage. Client-side hiding is not authorization. Sensitive access requires step-up authentication where appropriate. All access to live streams, clips, location histories, exports, and evidence must be audited.

## 3. Privacy, safety and evidence rules

- Recording is off until an authorized operator enables a documented purpose, device scope, retention policy and notice/consent requirement.
- Provide conspicuous recording/location indicators and accessible pause/stop controls where the device and law require them.
- Default to data minimization: event-triggered short clips and coarse location where sufficient; avoid continuous collection by default.
- Define retention by data class and purpose. Expire raw video, location traces, beacon events and derived thumbnails independently. Legal holds require an authorized case and review date.
- Encrypt in transit and at rest; use short-lived signed media URLs; do not make object buckets public.
- Apply face/license-plate/identity redaction when appropriate and required; keep original unredacted evidence in a more restricted vault.
- Never infer identity from a beacon or GPS point alone. Show accuracy, confidence, source, freshness and possible clock drift.
- Prevent audio capture by default; microphone recording requires separate explicit capability, consent/purpose review and policy.
- Restrict exports, watermark where appropriate, record exporter/recipient/time/purpose, and support revocation for shared links.
- Support deletion requests and retention expiry unless a valid legal hold applies. Log hold creation, access and release.
- Provide abuse reporting, operator review, rate limits, anomaly detection and break-glass access with retrospective review.

## 4. Reference architecture

### Client and device surfaces
- Flutter mobile apps for iOS and Android: camera enrollment, permission prompts, foreground/background location within platform policy, BLE scanning where permitted, visible capture state, incident reporting and limited offline queue.
- Flutter Web / React-Next web console: operations dashboard, device registry, map, timeline, alert inbox, evidence search and admin.
- PWA: supported browser-based operational surfaces with reduced capabilities; no assumption of unrestricted background GPS/camera access.
- LG webOS / ThinQ TV: read-only wallboard, status panels and authorized live/recorded viewing only where platform DRM/codec/security and app distribution support it. No background tracking or camera capture.
- Desktop: operator console and evidence review; camera access only with explicit browser permission.
- Edge devices/cameras: vendor-supported ONVIF/RTSP/WebRTC or signed device SDK adapters; capability and firmware certification required per model.

### Services and data
- Cloudflare Workers: authenticated edge API, request validation, rate limits, routing and signed-upload/download issuance.
- Cloudflare R2: encrypted/private media object storage, lifecycle policies, multipart uploads and retention enforcement.
- Cloudflare Queues / Durable Objects: event ingestion, ordered per-device/session coordination, alert fanout and retry orchestration where justified.
- Firebase Auth: identity and session management.
- Firestore: device registry, user consent/purpose records, event metadata, cases, alert rules and evidence manifests.
- Firebase RTDB: transient device presence and live operational state only; not the long-term evidence store.
- Cloud Functions or controlled backend workers: validation, correlation, retention jobs, alert delivery, redaction and evidence packaging.
- Analytics store: separately governed, minimized aggregate metrics; do not use operational telemetry as a shadow people-tracking database.
- GitHub Actions matrix: lint, unit, emulator, contract, security, platform build and artifact verification.

Choose a single authoritative owner for each entity and use an outbox/idempotency model to avoid double-processing between services. Keep media blobs out of Firestore documents.

## 5. Canonical event contract

Every event should carry:
- `event_id` (globally unique, idempotency key)
- `event_type`, `schema_version`, `occurred_at`, `received_at`
- `tenant_id`, `realm_id`, `device_id` or `asset_id`
- `source_type`, `source_id`, `source_sequence`
- `location` (lat/lon, accuracy, source, consent/purpose reference) only when allowed
- `beacon_id`, `rssi`, calibration and confidence where applicable
- `media_ref` (opaque object ID, checksum, duration, codec, redaction state) where applicable
- `correlation_id`, `causation_id`, `trace_id`
- `policy_version`, `retention_class`, `access_scope`
- `integrity_hash` and signature/provenance reference where supported

Reject unknown schema versions, malformed coordinates, stale/future timestamps outside tolerance, missing authorization scope, and duplicate event IDs. Preserve original source time and server receipt time; never silently rewrite event chronology.

## 6. Recorder and media pipeline

1. Enroll device after owner/admin authorization, capability discovery and firmware/security review.
2. Verify supported stream protocol, codec, resolution, frame rate, time sync, storage limits and encryption.
3. Start capture only after policy and recording-state checks.
4. Upload via short-lived scoped credentials to private object storage; resume multipart transfer safely.
5. Verify object checksum and metadata; quarantine mismatches.
6. Generate preview/thumbnail and redacted derivative as separate objects with provenance.
7. Correlate media time range to GPS, beacon, trip, delivery and incident events.
8. Seal evidence manifest with object hashes, source identifiers, policy version and access history.
9. Apply retention and legal hold independently to source and derivative assets.
10. Provide replay only to authorized roles; signed URLs expire and are never logged.

Avoid direct camera-to-public-bucket access. Do not expose RTSP ports publicly. A gateway/VPN/private relay may be needed; select per device and threat model.

## 7. Alerts and discovery

Rules are versioned, testable and scoped. Every alert contains severity, rule version, source event, timestamp, confidence, asset/device, owner, acknowledgement state, escalation deadline and resolution evidence. Deduplicate flapping signals, suppress only with documented maintenance windows, and retain suppressed-event audit.

Discovery supports filters by authorized realm, time range, device/asset, event class, incident/case and geospatial region. Search results must enforce the same permissions as direct object access. Exports require purpose, scope, expiry, watermark/audit and integrity manifest.

## 8. Replay and evidence

Replay is a synchronized view, not a claim that every sensor is perfectly aligned. Display clock source, skew estimate, GPS accuracy, beacon confidence, missing intervals and late-arriving events. The operator can compare video, map, beacon timeline, delivery/dispatch state, alert history and operator actions. Preserve original timestamps and source order.

Evidence export contains:
- manifest and schema version;
- original object checksums and derivative relationships;
- event IDs and correlation IDs;
- source and receipt timestamps;
- access/export audit references;
- redaction state and policy/retention basis;
- verifier instructions and checksum results.

## 9. Reliability and failure handling

- Device offline: mark stale after policy threshold; show last-seen and uncertainty; queue alert; never display stale location as live.
- GPS denied/unavailable: show location unavailable; do not silently fall back to inferred position.
- Beacon missing/spoof suspected: reduce confidence, mark source suspect and request operator/device review.
- Camera stream failure: preserve error and last valid frame timestamp; retry with bounded exponential backoff; no false green status.
- Upload interruption: resume multipart upload; deduplicate by object/event ID; verify checksum before indexing.
- Storage full/quota: stop or reduce capture according to policy, alert owner and preserve already sealed evidence.
- Clock skew: retain source and server times; annotate replay uncertainty.
- Alert provider outage: persist notification intent and retry via dead-letter/replay process; never lose the underlying event.
- Unauthorized access: deny, log, alert security, revoke session/URL and preserve audit.
- Retention job failure: alert and retry; do not silently extend retention without policy approval.

## 10. Cross-surface capability matrix

| Surface | Camera capture | GPS | BLE beacon | Live view | Replay/search | Admin |
|---|---|---|---|---|---|---|
| iOS native | permission-gated | OS permission/background limits | OS permission/background limits | supported SDK/browser capability | full authorized | limited |
| Android native | permission-gated | OS permission/background limits | OS permission/background limits | supported SDK/browser capability | full authorized | limited |
| Flutter Web / desktop browser | browser permission only | browser permission only | browser/device support varies | supported protocols only | full authorized | full |
| PWA | foreground/browser constraints | limited background support | browser support varies | browser support | authorized subset | limited |
| LG webOS / ThinQ | no assumption of capture | no assumption | no assumption | read-only viewer if certified | read-only viewer | none |
| Edge camera / gateway | vendor capability | optional attached GNSS | optional BLE gateway | stream adapter | upload/replay | device-specific |
| Cloudflare edge | no direct sensor capture | event/API only | event/API only | signed relay/control plane | metadata and signed access | policy APIs |

This matrix is a target capability statement, not proof that each device, SDK, codec, store or OS build is certified. Maintain a device certification register with model, OS version, app version, permissions, test evidence and known limitations.

## 11. Release pipeline and acceptance

Use separate pipelines for mobile, web, edge APIs, ingestion workers, media processing, policy/rules, analytics and device firmware/adapters. Shared contracts are versioned; a realm-specific deployment cannot promote unrelated realms.

Required pipeline stages:
1. source and dependency policy;
2. static analysis, secret scan and license scan;
3. unit tests and schema/contract compatibility;
4. Firebase Emulator integration tests;
5. media pipeline tests with synthetic/non-personal fixtures;
6. privacy/authorization negative tests;
7. device/OS matrix build and smoke tests;
8. SBOM, provenance, signing and immutable artifacts;
9. staging deployment and synthetic telemetry;
10. replay/retention/restore test;
11. independent evidence verification;
12. explicit acceptance and authorization before promotion.

Acceptance requires evidence of actual capture only in an approved test environment, consent and indicator checks, permission revocation, event ingestion, GPS accuracy display, beacon confidence, alert delivery/retry, media checksum, replay alignment, redaction, retention expiry, access audit, restore, and cross-surface compatibility. No PASS from a mock, source-only test or screenshot.

## 12. Initial implementation waves

- **Wave 0 — governance:** data inventory, DPIA/privacy review, threat model, role matrix, retention schedule, device list, vendor SDK decision.
- **Wave 1 — foundation:** device registry, event schema, policy engine, private R2 bucket, auth, audit and health telemetry.
- **Wave 2 — recorder:** one approved test camera/device, explicit capture indicator, short clip upload, checksum, thumbnail and lifecycle.
- **Wave 3 — location/beacons:** opt-in test GPS and BLE beacon, accuracy/confidence, geofence rules, stale state.
- **Wave 4 — alert/replay:** alert inbox, timeline, map and synchronized clip replay.
- **Wave 5 — surface matrix:** iOS, Android, web/PWA and LG webOS read-only certification.
- **Wave 6 — operations:** dashboards, incident runbooks, backup/restore, evidence export and handoff.
- **Wave 7 — scale:** multi-realm quotas, regional processing, high availability and cost/performance tuning after measured demand.

## 13. Open decisions

Device/camera models and protocol; legal jurisdictions; recording purposes; audio policy; retention periods; redaction requirements; user notice/consent flows; approved cloud region; registry and monitoring provider; alert channels; operator groups; mobile background behavior; LG webOS target models; media bandwidth/cost ceiling. Do not invent these values.
