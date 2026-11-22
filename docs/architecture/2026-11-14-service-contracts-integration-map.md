# LINGO Shared Service Contracts & Integration Map

**Baseline:** 2026-11-14  
**Authority:** The Lingo Legacy GitHub repository  
**Status:** Architecture contract; implementation and release acceptance remain separate.

## 1. Contract principles

1. Product frontends call stable LINGO-owned service contracts; they do not call each other's databases directly.
2. Every mutating operation is authenticated, authorized, validated, rate-limited, idempotent where retry is possible, and auditable.
3. Identity, game progression, virtual wallet balances, and commerce orders are separate domains.
4. Virtual Demo Coins and other demo counters are not money, stored value, deposits, or redeemable rewards.
5. Public status responses disclose capability state, not secret values or internal configuration.
6. Every request and event carries a correlation ID; sensitive payloads are excluded from logs.
7. Schema and API changes are versioned and backward-compatible where possible.
8. No service may infer permission from a frontend-only flag.

## 2. System boundaries

| Service | Owns | Must not own |
|---|---|---|
| Stack Engine | Service registry, environment config, health/readiness, feature gates, gate audit | Product balances, user credentials, game rules |
| LINGO ID | Authentication identity, account lifecycle, sessions, recovery | Wallet balances, game outcomes, payments |
| Universal Legacy Wallet | Virtual ledger, balance projections, idempotency, reconciliation | Authentication credentials, game RNG/rules, merchant payment data |
| Game Engine | Game rules, spin/session state, settlement intent and progression events | Identity credentials, external payment processing |
| askLINGO / LLG Gateway | Provider routing, adapter contracts, usage budgets, model metadata | User identity source of truth, wallet ledger, unbounded provider spend |
| Commerce | Catalog, inventory, orders, refunds, tax and fulfillment records | Demo Coin balances, game payout settlement |
| Content/Rights Registry | Assets, rights, attribution, consent and publication status | Account passwords, payment credentials |
| Community/Support | Moderation, reports, tickets, escalation | Direct access to wallet ledger or identity secrets |

## 3. Canonical API envelope

For JSON APIs, use a stable envelope:

~~~json
{
  "ok": true,
  "data": {},
  "error": null,
  "meta": {
    "request_id": "opaque-correlation-id",
    "api_version": "v1"
  }
}
~~~

Error envelope:

~~~json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "STABLE_MACHINE_CODE",
    "message": "Safe user-facing explanation"
  },
  "meta": {
    "request_id": "opaque-correlation-id",
    "api_version": "v1"
  }
}
~~~

Never return stack traces, SQL details, secret names/values, tokens, internal file paths or raw provider errors to public clients.

## 4. Identity contract

- Authentication tokens are verified server-side for signature, issuer, audience, expiry and expected project/tenant.
- User identity is represented by an immutable provider subject mapped to a LINGO user ID.
- Every authorization decision is server-side and scoped to the requested resource.
- Sessions support creation, refresh, expiry, revocation and logout.
- Account recovery must not reveal whether an email or phone number exists.
- Staging and production tenants are separate; staging rejects production project IDs.
- Public sign-in remains disabled until a verified staging flow passes desktop/mobile tests and security review.

Suggested routes:
- POST /api/v1/identity/session
- GET /api/v1/identity/me
- POST /api/v1/identity/session/refresh
- POST /api/v1/identity/session/revoke

## 5. Virtual wallet contract

- Ledger entries are append-only; balances are derived from accepted entries or a reconciled projection.
- Store integer units only; reject floating-point amounts.
- Each mutation requires a unique idempotency key and an authenticated owner.
- Debit and credit operations use atomic transactions and explicit reason codes.
- Replays return the original result; they never create a second debit or credit.
- Reconciliation compares ledger totals to projections and flags any discrepancy.
- Demo Coin and cosmetic balances cannot be transferred, sold, withdrawn, redeemed, or represented as cash value.

Suggested routes:
- GET /api/v1/wallet/balances
- GET /api/v1/wallet/ledger
- Internal-only POST /api/v1/wallet/entries with service authorization and idempotency.

## 6. Game and session contract

- The game service owns rules version, random outcome generation, payout calculation and settlement.
- The session service owns durable player-session lifecycle and checkpoint state.
- A spin settlement row is not a resumable player session.
- Session transitions use optimistic versioning and append-only lifecycle events.
- Spin debit, payout, XP and session checkpoint/version must commit atomically.
- Session states: active, suspended, completed, expired.
- Disabled features reject new spins but preserve session and ledger state.
- Re-enable requires current authentication, current gate evaluation and valid session version.

Suggested routes:
- POST /api/v1/games/:game_id/sessions
- GET /api/v1/games/:game_id/sessions/:session_id
- POST /api/v1/games/:game_id/sessions/:session_id/suspend
- POST /api/v1/games/:game_id/sessions/:session_id/resume
- POST /api/v1/games/:game_id/sessions/:session_id/complete
- POST /api/v1/games/:game_id/spins

## 7. AI gateway contract

- Provider adapters implement a shared interface and are independently enabled.
- The LLG-owned gateway owns routing, fallback policy, model comparison, agent orchestration, usage accounting and budget enforcement.
- API keys are stored in approved secret management and never returned to clients.
- Apply per-user and per-workspace quotas, provider cost ceilings, timeouts and retry budgets.
- Minimize data sent to providers; redact sensitive fields and respect user consent.
- Log model/provider identifiers, latency, token counts and cost estimates without logging private prompt contents by default.
- A provider being configured does not mean the AI feature is enabled.

## 8. Commerce contract

Commerce is separate from the virtual game economy.

- Catalog and inventory are read-only until a merchant and fulfillment process are accepted.
- Checkout creates an order intent; payment provider confirmation is verified server-side.
- Order state changes are idempotent and reconciled against provider webhooks.
- Refund, cancellation, shipping, tax, disputes and customer support flows are required before public checkout.
- No game balance or XP event can trigger a real-world payment or prize.
- Checkout and payout gates remain disabled.

## 9. Content, community and support contracts

- Content publication requires a rights record, owner, source, consent basis, age/privacy review and approval state.
- User-generated content requires reporting, moderation, block/mute, escalation and retention policies.
- Support records use scoped access, minimal personal data and defined retention.
- Public community and child-facing features remain disabled until moderation and privacy reviews pass.

## 10. Event envelope

Events are versioned and carry only necessary identifiers:

~~~json
{
  "event_id": "opaque-unique-id",
  "event_type": "game.session.suspended",
  "event_version": 1,
  "occurred_at": "2026-11-14T00:00:00Z",
  "producer": "game-session-service",
  "correlation_id": "opaque-request-id",
  "subject": {
    "lingo_user_id": "opaque-user-id",
    "resource_id": "opaque-resource-id"
  },
  "data": {}
}
~~~

Consumers must be idempotent. Event payloads must not contain access tokens, passwords, payment card data or unnecessary personal information.

## 11. Integration and release checklist

- [ ] Service owner and data classification documented.
- [ ] Contract schema and version documented.
- [ ] Authentication and authorization verified server-side.
- [ ] Tenant/environment isolation tested.
- [ ] Input schema, size and rate limits enforced.
- [ ] Idempotency and atomicity tests pass.
- [ ] Logs redact secrets and personal data.
- [ ] Readiness probes match actual dependencies.
- [ ] Feature gate defaults closed.
- [ ] Failure and rollback behavior tested.
- [ ] CI evidence is tied to exact commit.
- [ ] Independent acceptance recorded before activation.
