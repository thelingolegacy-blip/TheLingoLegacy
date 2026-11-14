# ADR-0001: Adopt a Go + PostgreSQL AWS platform core

- Status: Proposed
- Date: 2026-11-14
- Decision owner: The Lingo Legacy platform owner

## Context

The current platform has overlapping identity, backend, edge, and deployment responsibilities across Next.js, Flutter, Supabase, Firebase, Cloudflare, and GitHub. Prior audits identified fragmented authority, route/version drift, incomplete backend schemas, unverified mobile/API/game integrations, and unreliable CI runner startup. Extending that topology without a single source of truth increases operational risk.

## Decision

Adopt a greenfield AWS-first platform core:
- Next.js/TypeScript web and Flutter mobile clients.
- Go domain/API services on ECS Fargate.
- Cognito OIDC for authentication.
- RDS PostgreSQL as the sole transactional source of truth.
- ElastiCache Redis for cache, rate-limit coordination, and ephemeral realtime presence.
- Amazon MSK Serverless for durable asynchronous domain events.
- S3 for private object/media storage.
- Cloudflare retained only as audited DNS/WAF/edge entry point initially.
- Terraform for all infrastructure; GitHub Actions for CI/CD.
- OpenTelemetry with Datadog for observability.

## Why

- One authoritative transactional data store.
- Explicit backend ownership instead of overlapping BaaS responsibilities.
- Go provides a compact, strongly typed service runtime suitable for game/session APIs and workers.
- Managed AWS primitives reduce day-two operations while preserving portable application contracts.
- Kafka gives independently deployable consumers durable, replayable event streams.
- Terraform makes infrastructure changes reviewable and reproducible.

## Alternatives considered

- Continue Supabase + Firebase: rejected as the target due to duplicated backend/identity authority.
- Cloudflare Workers + D1 as the entire platform: rejected for the first target because the product needs durable domain services, relational transactions, game workloads, and mature operational boundaries.
- Kubernetes/EKS: deferred. ECS Fargate is the simpler managed compute baseline until scale and workload evidence justify Kubernetes.
- Active-active multi-cloud: rejected for launch; use one primary AWS region across three AZs and a separately tested recovery region.

## Consequences

- Existing Supabase/Firebase data and auth require a controlled migration plan; no blind cutover.
- AWS cost, region, retention, backup, and recovery objectives must be approved before provisioning.
- Kafka and managed AWS services add provider dependency; domain APIs and event schemas remain provider-neutral where practical.
- The current live stack remains untouched until parity and rollback are proven.
