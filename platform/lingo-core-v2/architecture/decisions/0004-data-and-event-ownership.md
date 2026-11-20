# ADR-0004: Data ownership and event contracts

**Status:** PROPOSED  
**Date:** 2026-11-15

## Context
A connected ecosystem needs shared data exchange without coupling products to each other's schemas or allowing silent cross-domain access.

## Proposal
- Every data domain has one authoritative owner and documented classification, retention and deletion rules.
- Product services own their transactional records; other products consume approved APIs/events, not direct table access.
- Use PostgreSQL for transactional workloads when appropriate; select object storage, cache, search and event broker only against measured requirements and cost.
- Publish versioned OpenAPI and JSON Schema contracts.
- Use an outbox for atomic event creation with domain writes; consumers use idempotency keys, retry/backoff, dead-letter and replay controls.
- Events carry event ID, type, schema version, occurrence time, producer, aggregate identity and trace/correlation context.
- Minimize PII in events and logs; never place credentials or tokens in payloads.

## Consequences
Exactly-once delivery is not assumed. The system targets durable at-least-once delivery with idempotent consumers and observable replay.

## Acceptance
Schema compatibility tests, atomicity tests, duplicate/replay tests, retention review, access controls and restore evidence.
