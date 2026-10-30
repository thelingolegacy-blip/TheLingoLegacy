# LINGO Studio Operations Command Center

**Status:** Review-ready source proposal. This page is a read-only operations interface; it is not a production control plane and does not claim that unprovisioned systems are live.

## Purpose

Provide one premium Studio Operations surface for the platform's infrastructure and G02 execution, product realms, LINGOeye, LINGOmove, OS/device surface matrix, independent pipelines, observability, incident response, restoration and operator handoff.

The interface is deliberately read-only. It performs same-origin GET requests to existing documented platform endpoints. It does not dispatch workflows, mutate cloud resources, register runners, change DNS/routes/secrets, initiate camera/GPS/BLE capture, create trips/deliveries, or promote production.

## Design system

- Industrial Noir / Crimson Shadow, graphite panels, crimson highlights, restrained metallic gold and cyan telemetry.
- Responsive desktop/mobile layout; semantic HTML, keyboard-focus treatment, reduced-motion support and high-contrast state labels.
- Inline SVG diagrams are illustrative visual assets; they are not live maps, camera feeds or network telemetry.
- All non-runtime architecture claims are labelled as design targets, pending, illustrative or unverified.
- No external runtime libraries or third-party script dependencies.

## Runtime probes

The page makes GET-only requests to the repository's documented same-origin endpoints:

- `/api/v1/platform/status`
- `/api/v1/platform/gates`
- `/api/v1/platform/modules`
- `/healthz`
- `/api/v1/runtime`
- `/api/v1/platform/manifest`

Each response is displayed as endpoint reachability only. A 200 response is not proof that G02 ran, that an assistant or mobility provider is integrated, or that a release gate passed. The UI does not infer business success from HTTP success. If an endpoint is unavailable, it shows unavailable; it does not synthesize values.

G02's release verdict must be sourced from the dedicated sentinel/evidence workflow and independently correlated evidence, not merely from the generic status endpoint.

## Architecture boundaries

- GitHub owns source, workflows, code review, immutable commit references and build artifacts.
- G02 is a dedicated execution prerequisite. Required runner labels remain `self-hosted, linux, x64, lingo-g02`; no hosted-runner substitution.
- Cloudflare remains the preferred production edge/runtime. This page does not change Worker routes or DNS.
- Firebase is an identity/application data layer where explicitly configured and verified.
- R2 is the private object-storage target for media/evidence and proof-of-delivery objects.
- LINGOeye owns authorized capture, device registry, GPS/BLE observations, media evidence, replay and privacy policy.
- LINGOmove owns trip, delivery, fleet, dispatch, provider and fulfillment state.
- Cross-domain integration uses versioned events and opaque resource references. Each domain remains authoritative for its own records.

## Required operational endpoints before live control-plane claims

The following are target service contracts, not asserted live endpoints:

- `/api/ops/v1/infrastructure/summary`
- `/api/ops/v1/g02/evidence`
- `/api/ops/v1/pipelines`
- `/api/ops/v1/realms/lingoeye/health`
- `/api/ops/v1/realms/lingomove/health`
- `/api/ops/v1/surfaces/certification`
- `/api/ops/v1/incidents`
- `/api/ops/v1/recovery/readiness`

Implement only behind authenticated server-side APIs with tenant/realm RBAC, audit logging, schema versioning, rate limits, idempotency and environment scoping. Do not make an endpoint that returns secrets, raw personal location histories or public media URLs.

## G02 execution evidence contract

A valid acceptance package must bind the same workflow run, job, runner and commit SHA, and contain:

1. real positive runner ID and expected runner name;
2. assigned job with instantiated steps;
3. successful sentinel result and retrievable logs;
4. required artifact with retrievable bytes and checksum;
5. independent checksum and provenance verification;
6. explicit acceptance record.

Queued, cancelled-before-start, startup-failed, empty-job, missing-log or missing-artifact runs remain blocked/unknown. Do not infer PASS from a runner UI status, HTTP response, source commit or screenshot.

## Incident, restoration and handoff

Each service must have an owner, alert route, runbook, backup/retention policy, RPO/RTO and tested recovery method.

- VM/host loss: recreate from reviewed IaC; verify cloud activity log, identity, network and disk before installation.
- Docker failure: preserve daemon logs/config, repair package/repository, validate service and container isolation.
- Runner failure: inspect registration inventory before cleanup/re-enrollment; never create duplicate registrations; re-run sentinel and verify fresh evidence.
- Workflow startup failure: retain run IDs and raw job responses; investigate dispatch/runner availability rather than changing labels or bypassing gates.
- Queue/DLQ failure: pause consumers, preserve payload metadata, correct cause and replay idempotently.
- Media/proof corruption: quarantine, compare checksums, restore from immutable backup and verify evidence manifest.
- Provider/webhook failure: circuit-break, deduplicate, verify signatures and reconcile with provider source of truth.
- Production regression: stop promotion and restore last-known-good only through the approved release process.

Handoff requires primary and secondary operator ownership, least-privilege access, MFA, secret-manager procedures, alert tests, log retrieval, health checks, backup restore, evidence verification and a supervised recovery drill.

## Release workflow

`SOURCE → ACTUAL EXECUTION → RETRIEVABLE EVIDENCE → INDEPENDENT VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION`

This page is not an authorization mechanism. Keep production and last-known-good protected until all applicable gates pass. The G02 host and Azure provisioning remain blocked until the required cloud deployment connection is available and the infrastructure template, quota, region and cost have been reviewed.

## Validation still required

- HTML parsing, accessibility and responsive visual QA.
- Confirm page is served from the intended static asset path and Worker route.
- Verify each same-origin endpoint against its actual response schema.
- Add authenticated operational API contracts and service ownership.
- Test browser failure states and mobile layouts.
- Verify CSP/security headers and no secrets in browser-visible payloads.
- Run G02 sentinel and collect independent evidence.
- Complete device/platform certification for iOS, Android, Web/PWA, desktop and LG webOS.
- Keep production promotion separate and explicitly approved.
