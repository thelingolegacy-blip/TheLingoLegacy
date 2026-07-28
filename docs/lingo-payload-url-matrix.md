# Lingo Legacy OS Payload URL Matrix

This document defines reserved payload URL contracts for the Lingo Legacy OS ecosystem. These routes are not active endpoints in the static Vercel foundation.

## Static mode

- No Vercel Functions are added.
- No `/api` directory is required.
- No external service calls are made.
- The source of truth is `config/payload/matrix.json`.
- The visual guide is `/payload-matrix/`.

## Activation guardrails

A reserved payload URL can become live only after these controls exist:

1. Authentication and service ownership.
2. Schema validation for every payload body.
3. Rate limits and abuse controls.
4. Audit logs for writes and sensitive reads.
5. Monitoring, alerts, and rollback path.
6. Safety review for AI, wallet, XP, identity, and data-write flows.

## System groups

- Lingo Legacy OS: command, XP, wallet, identity, global events.
- Lingo.ai: inference, ops, automation, LLM function proposals.
- Activepieces: hooks, piece runs, flow execution.
- Backend stack: Caddy, Postgres, Redis, object storage.
- Flutter app layer: app events, user actions, sync.
- Firebase: function, auth, Firestore bridge contracts if still connected.
- Avalon Cultural Systems: registry, membership, events.
- Code Crew: missions, profiles, operations.
- Peaches’ Mystery Keys: key and spotlight contracts.

## Safety notes

AI payload contracts are flavor and operations contracts only. AI must not control payouts, rewards, wallet balances, XP grants, volatility, jackpot selection, identity access, or user safety outcomes.

Database, cache, object storage, wallet, XP, identity, and membership payloads are reserved until authenticated backend services and audit trails are deliberately implemented.
