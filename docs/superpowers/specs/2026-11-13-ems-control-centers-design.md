# LINGO EMS Control Centers — Wave 1 Design

**Date:** 2026-11-13  
**Status:** Approved execution direction under the founder’s explicit request to proceed; read-only implementation only  
**Authority:** `thelingolegacy-blip/TheLingoLegacy`  
**Parent:** EMS charter #550, implementation issue #552, resource registry PR #553

## Intent
Turn the existing resource registry and control-plane API contract into a usable mobile/desktop operations console for the Main Hub, Resource Center and Release Center. Extend PR #553 rather than creating a competing registry or a second source of truth.

## Current foundation
PR #553 adds `config/ops/resource-registry.json`, its JSON Schema, the foundation-center integration architecture and a read-only API contract. The registry is an evidence-qualified snapshot, not a live provider API. Current Actions runs repeatedly fail before job creation; G02 is FAIL / UNVERIFIED. Cloudflare staging Worker v7 has been deployed to an isolated workers.dev script but its HTTP health remains unverified. Firebase identity and production Hosting remain blocked.

## Goals
1. Render the existing registry into a real, usable Resource Center.
2. Provide Main Hub summary counts derived from registry records, with explicit freshness and unknown-state treatment.
3. Provide Release Center evidence visibility using only existing release records and source links; absent evidence must remain absent/blocked.
4. Add search/filter, resource detail, evidence links, environment and status labels, mobile navigation and accessible semantics.
5. Load only the local JSON registry; never render or request secret values.
6. Keep all operations read-only; no mutation controls, provider credential collection, DNS, deployment, database, payment or runner actions.

## Non-goals
- No claim of live GitHub/Cloudflare/Firebase synchronization.
- No write endpoints, role escalation, approvals, secret storage, or release authorization.
- No production Worker deployment changes. The source Worker must fail closed for `/ops/ems-console/*` before static asset fallback until Cloudflare Access authentication and authorization are implemented and independently verified.
- No fake staff roster, fabricated resource owner, health state, security scan, artifact or approval.

## Approaches considered
1. **Static read-only console over the canonical JSON registry — selected for Wave 1.** Delivers a useful UI without credentials or backend mutation; labels the registry as a dated snapshot and marks provider sync unavailable.
2. **Cloudflare Worker API with provider adapters.** Correct next step after scoped read-only credentials, auth, rate-limit strategy, audit and environment isolation are designed; not safe to fabricate or enable now.
3. **Firebase-backed operations database.** Deferred because Firebase project identity, data ownership and production boundaries are unresolved; adding a second source of truth would violate current governance.

## Architecture
The UI reads `/config/ops/resource-registry.json` only in local/offline preview. Because the current Worker serves static assets from the repository root, it blocks `/ops/*`, `/config/ops/*`, `/docs/ops/*` and `/docs/superpowers/*` with a 404 before asset fallback (including encoded/case variants). No client-side-only access control is treated as security. Future access requires verified Cloudflare Access identity and an authenticated API; do not bypass the public route guard. The registry schema remains the contract. UI-derived counts are calculated from actual resource records. The screen shows generation time, source repository/branch and a persistent “snapshot / provider sync not connected” notice. Unknown, stale, scaffold-only, blocked and configured-unverified values are distinct states.

## Acceptance
- The console loads the canonical registry JSON and fails visibly if unavailable or invalid.
- The public Worker returns 404 for all internal operations, registry and planning asset prefixes before static asset fallback until verified Access authentication is available.
- Every displayed resource is sourced from a registry record.
- Summary counts reconcile exactly to the registry.
- Search and filters operate on actual fields.
- Resource details show dependencies, references, evidence and secret-reference metadata only.
- No secret values or mutation endpoints are present.
- Mobile and desktop layouts are usable and accessible.
- All provider sync, live health and release approvals remain UNKNOWN/BLOCKED until evidence exists.
