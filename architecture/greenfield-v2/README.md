# Lingo Core v2 — Greenfield Platform

Status: proposed, isolated architecture branch. Production: HOLD.

## Goal
A single coherent platform foundation for web, mobile, games, community, creator tools, rewards, commerce adapters, operations, and analytics. This document describes a target; it does not claim resources are provisioned or connected.

## Target stack
- Web: Next.js, React, TypeScript
- Mobile: Flutter / Dart
- Domain APIs, workers, realtime gateway: Go; REST/OpenAPI plus WebSockets
- Identity: Amazon Cognito OIDC; application-owned roles, entitlements, and user mapping
- Transactional system of record: Amazon RDS PostgreSQL
- Cache and ephemeral presence: Amazon ElastiCache Redis
- Durable events: Amazon MSK Serverless (Kafka), versioned schemas
- Private assets: Amazon S3
- Compute: AWS ECS Fargate; private subnets for data services
- Edge/DNS/WAF: existing Cloudflare account, only after route and zone ownership audit
- IaC: Terraform with remote state, reviewed plans, drift detection
- CI/CD: GitHub Actions using OIDC; hosted runners first, G02 only after certification
- Telemetry: OpenTelemetry to existing Datadog destination

## Core rules
1. PostgreSQL is the sole transactional authority.
2. Cognito is the sole login identity provider; authorization remains platform-owned.
3. External services are accessed through adapters; clients never hold privileged credentials.
4. Events require schema versions, idempotency, bounded retries, DLQ and replay procedures.
5. Each service has an owner, contract, data classification, SLO, health/readiness checks, and runbook.
6. No secrets in source, artifacts, logs, or client bundles.
7. A passing build is not a production certification.
8. No production DNS, identity, data, payment, or deployment changes until release approval.

## Domain boundaries
Identity; profiles/social; game sessions; wallet/ledger; rewards; commerce; creator/studio; notifications; operations; analytics.

## First vertical slice
Cognito test sign-in → Go API OIDC validation → profile read/write in PostgreSQL → transactional outbox → Kafka event → idempotent worker → continuous OpenTelemetry trace. Prove with automated API, contract, and end-to-end tests in an isolated environment.

## Explicit exclusions
This branch does not provision AWS resources, change Cloudflare, alter DNS, migrate production data, replace live authentication, create payment products, deploy workloads, or modify the live site.
