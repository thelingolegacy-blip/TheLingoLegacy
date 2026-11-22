# askLINGO v2.0 — Isolated Staging Provisioning Record

**Date:** 2026-11-22  
**Authorization:** User approved isolated staging provisioning in this conversation.  
**Scope:** Staging-only; no production changes; no paid inference activation.

## Provisioned Cloudflare resources

| Resource | Name | Verified state |
|---|---|---|
| D1 | `asklingo-v2-staging-20261122` | Created; US jurisdiction; ENAM primary; read replication disabled |
| Worker | `asklingo-v2-staging` | Uploaded as a disabled, fail-closed scaffold; D1 binding attached |
| workers.dev | Worker subdomain | Explicitly disabled |
| Preview URLs | Worker previews | Explicitly disabled |
| Routes | Worker routes | None reported |
| Inference | Provider/model | Not configured; no provider secrets |
| Observability | Worker observability | Disabled |

D1 database ID: `e041e690-2a45-4c82-8b46-6e012d739972`  
Worker upload deployment ID: `33d8f27e52724b63b673fd2a06eccf81`  
Worker version tag: `b23f6acf5f194570bcc3e5cf2961750a`

The Worker currently exposes no public endpoint. Its code contains a diagnostic `/_health` response with HTTP 503 and returns 404 for all other paths. Since the workers.dev subdomain and previews are disabled and no routes are attached, no external request path was enabled. The Worker is not an askLINGO runtime and does not authenticate, query, persist, invoke tools, or execute actions.

## Database migration 0001

Source of truth: `migrations/asklingo-staging/0001_initial.sql`.

The migration was applied successfully and verified against D1. Six application tables, five secondary indexes, and two audit immutability triggers are present. All six application tables currently contain zero rows. The migration creates staging-only tables for:
- Firebase-authenticated principal bindings (identity records only; no passwords or tokens)
- exact-scope staging grants
- approval records with separation-of-duties constraints and single-consumption fields
- append-only audit events (UPDATE and DELETE triggers reject mutation)
- rate-limit buckets
- idempotency keys

No conversation/message content is stored. The schema alone does not implement atomic approval consumption, authorization middleware, audit ingestion, distributed rate limiting, retention, or trusted identity verification. Those require tested Worker adapters and transaction-safe application code before activation.

## Worker source-of-truth

- `workers/asklingo-v2-staging/src/index.mjs` is the source file for the uploaded fail-closed Worker scaffold.
- `workers/asklingo-v2-staging/wrangler.toml` pins the staging D1 binding and explicitly sets `workers_dev = false` and `preview_urls = false`.
- The Worker has no configured route, secret, or provider binding. The uploaded script is a disabled scaffold, not a callable service.

## Firebase Authentication — BLOCKED

The Firebase plugin is available in the ChatGPT plugin directory but is not currently connected in this session. No Firebase project was created, no provider was substituted, and no production Firebase project/settings were changed. User action is required to connect the Firebase plugin and authorize a dedicated staging project.

Required next steps:
1. Provision a dedicated Firebase project or staging tenant under the user's Google Cloud organization.
2. Enable Firebase Authentication and the selected sign-in provider(s).
3. Register staging web/mobile app identities and authorized domains.
4. Configure token verification using server-side Firebase Admin credentials supplied through a dedicated secret-management flow; never commit credentials.
5. Verify issuer, audience, signature, expiry, revocation, tenant binding, and account status before creating principal records.
6. Add an end-to-end staging test for disabled, expired, revoked, wrong-audience, wrong-tenant, and valid identities.

## Activation gate

**CLOUDFLARE STAGING INFRASTRUCTURE: PROVISIONED / VERIFIED (DISABLED SCAFFOLD)**  
**FIREBASE AUTH: BLOCKED**  
**ASKLINGO QUERY/EXECUTION: DISABLED**  
**PRODUCTION: UNCHANGED / NOT ENABLED**

Do not enable workers.dev, add routes, set secrets, populate real user records, connect a model provider, or enable the facade until the identity adapter, authorization, approval consumption, audit, rate-limit, privacy, and test gates are complete.
