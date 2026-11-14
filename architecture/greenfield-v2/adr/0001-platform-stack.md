# ADR-0001: Greenfield Go + PostgreSQL platform core

- Status: Proposed
- Date: 2026-11-14

## Context
The current environment spans Next.js, Flutter, Supabase, Firebase, Cloudflare, and GitHub with overlapping identity/backend responsibilities. Previous audits identified fragmented authority, route/version drift, incomplete backend schemas, unverified mobile/API/game integrations, and unreliable runner startup.

## Decision
Use Next.js/TypeScript web, Flutter mobile, Go domain services on ECS Fargate, Cognito OIDC, RDS PostgreSQL, ElastiCache Redis, MSK Serverless Kafka, S3, Cloudflare for audited DNS/WAF, Terraform, GitHub Actions OIDC, and OpenTelemetry/Datadog.

## Rationale
One transactional data authority; one authentication authority; explicit service ownership; managed runtime; durable asynchronous events; reproducible infrastructure.

## Alternatives
- Continue Supabase + Firebase as co-equal backends: rejected due to duplicated authority.
- Cloudflare Workers + D1 for the entire platform: rejected as the first target for the full relational/game workload.
- EKS/Kubernetes: deferred until scale evidence justifies the operational burden; ECS Fargate is the simpler baseline.
- Active-active multi-cloud: rejected for launch. Start with one AWS primary region across three AZs and a separately tested recovery region.

## Consequences
Existing data and identities need controlled migration and account linking. Region, costs, retention, RPO/RTO, and backup policy require approval before provisioning. Live systems remain untouched until parity and rollback are proven.
