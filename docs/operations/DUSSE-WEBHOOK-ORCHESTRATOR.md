# DUSSE webhook orchestrator — security and implementation contract

**Status: proposed design only — not deployed, not connected, and not authorized to operate production.**

## Purpose

DUSSE is the LINGO operations event coordinator. It receives authenticated lifecycle events from approved systems, correlates them with repository/run/commit identifiers, summarizes failures, opens or updates evidence records, and prepares operator-facing recovery recommendations.

DUSSE is not a privileged autonomous deployment agent. A webhook event, model output, issue comment, or alert must never independently authorize a production write, rollback, secret rotation, runner registration, DNS change, payment action, or release-gate promotion.

## Trust boundaries

1. **Producers:** explicitly allowlisted GitHub webhook event types and approved monitoring sources.
2. **Ingress:** dedicated HTTPS endpoint behind Cloudflare; request-size limits, method/path allowlist, rate limiting, and origin/service authentication.
3. **Verifier:** validate the producer's HMAC signature over the exact raw request body using a secret stored only in the runtime secret store. Compare signatures in constant time. Reject missing, malformed, or invalid signatures.
4. **Replay control:** enforce timestamp tolerance where supported; persist delivery IDs with a uniqueness constraint and reject duplicate deliveries. Do not rely on an in-memory cache for replay protection.
5. **Normalizer:** accept only documented event schemas and extract bounded identifiers. Treat all payload text, logs, issue bodies, commit messages, and model output as untrusted data.
6. **Evidence store:** append-only event envelope with delivery ID, source, event type, received timestamp, repository, run/job/commit IDs, verification outcome, and content digest. Store only the minimum payload needed; redact tokens, credentials, personal data, and secret-like values.
7. **Analyzer:** summarize evidence and suggest next steps. It has read-only access to approved metadata and logs. Retrieved content is data, never executable instructions.
8. **Action broker:** no direct production credentials. Any future action must be a separately scoped, allowlisted operation with a human approval record, short-lived authorization, idempotency key, and independent post-action verification.

## Initial event allowlist

Start with GitHub `workflow_run`, `workflow_job`, `check_run`, `check_suite`, and `pull_request` events, restricted to the canonical repository and named workflows. Expand only after event schemas, permissions, retention, and threat model are reviewed.

Ignore unknown event types. Never accept a webhook event as proof that a job executed successfully: confirm job assignment, completed steps, logs, artifacts, and run/job/commit correlation from the authoritative provider API.

## Required controls

- Dedicated webhook secret per producer and environment; no shared personal access token.
- Minimum GitHub App permissions: read-only Actions, Checks, Contents, and Pull Requests as required. Add write permissions only for a narrowly defined issue/comment operation after review.
- No `workflow_dispatch`, repository administration, secrets, environments, deployments, runner administration, billing, DNS, or Cloudflare write permissions in the analyzer identity.
- Egress allowlist to required provider APIs; deny arbitrary URL fetches and user-controlled callback destinations.
- Payload size, execution time, concurrency, and queue depth limits; dead-letter queue and bounded retries.
- Structured logs with correlation IDs; never log signature headers, secrets, access tokens, or raw unredacted payloads.
- Retention and deletion policy documented before storing logs; privacy review for user/community content.
- Alert on signature failures, replay attempts, unexpected repositories, unknown events, queue saturation, and repeated provider errors.

## Failure behavior

Fail closed. Invalid signatures, duplicate delivery IDs, unsupported events, missing correlation fields, stale evidence, or unavailable verification APIs must produce a rejected or **UNVERIFIED** record—not a success state. Never infer that a missing job means a completed job.

## Rollback policy

DUSSE may detect a failed release and prepare a rollback recommendation containing the affected deployment/version, evidence links, blast-radius assessment, last-known-good reference, and exact operator steps.

DUSSE must not execute rollback automatically. A human release owner must approve the exact target and action through a separately authenticated control plane. After approval, a dedicated deployment system performs the action; DUSSE then retrieves provider evidence and records whether the rollback actually completed. If evidence is incomplete, retain PROTECTED HOLD.

## Delivery phases

1. **Design review:** approve event sources, data classification, retention, and threat model.
2. **Read-only prototype:** local/unit tests with synthetic fixtures; no live webhook secret or production integration.
3. **Isolated staging:** dedicated non-production endpoint, test GitHub App, replay store, queue, and synthetic events.
4. **Security acceptance:** signature/replay tests, permission review, payload fuzzing, SSRF tests, secret-redaction tests, rate-limit and failure tests.
5. **Read-only production observation:** only after independent approval; no write scopes or deployment access.
6. **Optional controlled actions:** separate approval workflow and action-specific identity; never grant broad autonomous access.

## Acceptance evidence

A future implementation is accepted only with retrievable source revision, completed tests, webhook delivery IDs, signature/replay test results, permission manifest, secret-store references (never secret values), staging logs, queue/dead-letter evidence, retention controls, and independent security review.

**Current state:** this document is an implementation contract. No DUSSE endpoint, webhook subscription, secret, queue, database, alert, agent permission, or rollback automation is configured by this change.
