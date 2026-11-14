# Lingo Core v2 — Greenfield Platform

Status: **proposed / isolated architecture branch**  
Branch: `architecture/lingo-core-v2-greenfield`  
Production status: **HOLD — no production resources changed**

## Objective

Create one coherent, testable platform foundation for The Lingo Legacy: web, mobile, game services, identity, community, creator tools, rewards, monetization adapters, operations, and analytics. This is a clean target architecture, not a claim that providers are connected or deployed.

## Stack decision

| Layer | Standard |
|---|---|
| Web experience | Next.js + React + TypeScript |
| Mobile | Flutter / Dart |
| Public API and domain services | Go, versioned REST/OpenAPI; WebSocket gateway for realtime sessions |
| Identity | Amazon Cognito OIDC; platform-owned user/profile mapping and authorization |
| System of record | Amazon RDS PostgreSQL; SQL migrations and transactional outbox |
| Cache / ephemeral state | Amazon ElastiCache Redis |
| Event backbone | Amazon MSK Serverless (Kafka) for durable domain events |
| Object/media storage | Amazon S3 with private buckets, signed access, lifecycle policies |
| Edge / DNS / WAF | Existing Cloudflare account, after zone/route ownership audit |
| Compute | AWS ECS Fargate; separate web, API, workers, and realtime workloads |
| Infrastructure as code | Terraform, remote state, plan review, drift detection |
| CI/CD | GitHub Actions; hosted runners first, G02 only after runner certification |
| Observability | OpenTelemetry instrumentation; Datadog as the operational destination |
| Analytics | Product events through a governed event contract; warehouse destination selected later |
| Secrets | AWS Secrets Manager + task-scoped IAM roles; never repository secrets in app config |

## Non-negotiable design rules

1. PostgreSQL is the only authoritative transactional database.
2. Cognito is the only login identity provider. Application roles, entitlements, and permissions remain platform-owned.
3. Every service has an owner, API contract, data classification, SLO, health/readiness checks, and runbook.
4. All external providers are accessed through adapters; clients never call payment, rewards, or privileged provider APIs directly.
5. Events use versioned schemas, idempotency keys, retries, dead-letter handling, and replay controls.
6. No secrets in source, build artifacts, logs, or client bundles.
7. No production DNS, payment, identity, data, or deployment mutation until its explicit release gate is approved.
8. A green build is not a production certification. Each integration must pass contract, security, resilience, and end-to-end tests.

## Domain boundaries

- **Identity:** authentication, account linking, session lifecycle.
- **Profile & social:** profile, follows, community, moderation.
- **Game session:** matchmaking/session lifecycle, authoritative game state, anti-abuse hooks.
- **Wallet & ledger:** append-only accounting records; no client-authoritative balances.
- **Rewards:** eligibility, campaign rules, issuance, redemption, audit.
- **Commerce:** provider-neutral checkout and subscription adapters.
- **Creator / studio:** assets, publishing workflow, permissions, audit trail.
- **Notifications:** email/push/in-app delivery through adapters.
- **Operations:** feature flags, incident controls, audit, service health.
- **Analytics:** consent-aware event collection and governed schemas.

## First delivery slice

Build a vertical slice before migrating the ecosystem:
1. Web/mobile sign-in through Cognito test tenant.
2. Go API validates OIDC tokens and resolves platform user.
3. Profile read/write against PostgreSQL.
4. Transactional outbox publishes a profile event to Kafka.
5. Worker consumes event idempotently and records processing status.
6. OpenTelemetry traces the complete request/event path.
7. Playwright/API integration tests prove the full path in an ephemeral environment.

## What this branch does not do

It does not create AWS resources, connect or alter Cloudflare zones, change DNS, migrate production data, change authentication providers, create payment products, deploy workloads, or modify the live site. Those actions require reviewed plans and explicit approvals.
