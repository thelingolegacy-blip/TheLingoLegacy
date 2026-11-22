# Lingo Core v2 — Greenfield Platform

Status: proposed, isolated architecture branch. Production: HOLD.

## Goal
A coherent, portable foundation for web, mobile, games, community, creator tools, rewards, commerce adapters, operations and analytics. This document describes a target; it does not claim that infrastructure is provisioned or connected.

## Canonical technology direction
- Web: Next.js, React and TypeScript.
- Mobile: Flutter and Dart.
- Core APIs and workers: Go, initially organized as a modular application with versioned REST/OpenAPI contracts.
- Transactional data: PostgreSQL, introduced one domain at a time with explicit ownership and migration evidence.
- Reliable events: transactional outbox in PostgreSQL; broker selection deferred until measured throughput, ordering, retention and operational needs justify it.
- Identity: OIDC-compatible adapter with issuer-plus-subject identity mapping; provider and production authority remain unchanged until account linking, recovery and security are proven.
- Public edge: existing Cloudflare estate, subject to verified zone, route, Worker and origin ownership.
- Existing backends: Firebase, Supabase and Workers remain bounded to individually verified responsibilities; no duplicate authority for the same data domain.
- CI and source governance: GitHub Actions hosted runners first; GitHub remains canonical source and evidence.
- Observability: OpenTelemetry-compatible traces, metrics and structured redacted logs.

## Provider policy
Provider selection is intentionally open. AWS, Cloudflare-native services, Firebase, Supabase and managed PostgreSQL alternatives may be evaluated against workload fit, security, data residency, portability, free-tier limits and total monthly cost. No account, region, paid service bundle, IaC engine or recurring spend is approved by this proposal.

## Minimum non-production vertical slice
A disposable test identity issuer → Go API → PostgreSQL profile transaction + outbox row → local test publisher/consumer → correlated trace. Start with local or disposable resources. Add a managed broker, cache, object store or separately deployed services only after evidence and cost/security review.

## Core rules
1. One authoritative transactional store per migrated data domain.
2. Identity authentication is separate from platform authorization.
3. External services are accessed through bounded adapters; clients never hold privileged credentials.
4. Events require schema versions, idempotency, bounded retries, dead-letter and replay procedures before delivery is called operational.
5. Each service has an owner, contract, data classification, SLO, health/readiness checks and runbook.
6. No secrets in source, artifacts, logs or client bundles.
7. A passing build is not integration or production certification.
8. No production DNS, identity, data, payment or deployment changes until separately approved.

## Domain boundaries
Identity; profiles/social; game sessions; wallet/ledger; rewards; commerce; creator/studio; notifications; operations; analytics.

## Explicit exclusions
This branch does not provision cloud resources, change Cloudflare, alter DNS, migrate production data, replace live authentication, create payment products, deploy workloads or modify the live site.
