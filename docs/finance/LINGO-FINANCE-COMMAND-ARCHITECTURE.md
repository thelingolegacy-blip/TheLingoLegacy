# LINGO FINANCE COMMAND — Enterprise Financial Operating System

**Status:** Architecture scaffold; not deployed or connected to payment rails  
**Owner scope:** THE LINGO LEGACY portfolio  
**Source branch:** `finance-command/bootstrap-2026-11-24`  
**Date:** 2026-11-24

## 1. Mission

Provide one governed financial operating layer across every approved LINGO brand, product, customer channel, partner, and internal cost center. Keep portfolio-level reporting consolidated while preserving legal-entity, product, jurisdiction, currency, and environment boundaries.

This scaffold is deliberately non-operational: it defines contracts and a candidate schema. It does not create merchant accounts, connect banks, charge customers, issue payouts, file taxes, provision secrets, or change production infrastructure.

## 2. Portfolio coverage

The hierarchy must support (without assuming every item is a legal entity): THE LINGO LEGACY parent; LINGOlegacy; LINGOlane; LINGOslots; LINGOarcade; LINGOlibrary; LINGOmedia; LINGOworld; LINGO Studios; LINGO Towers; LegacyXclub; LINGO ID; Universal Legacy Wallet / Lingo Coins; and additional approved products.

Revenue channels include apparel and merchandise, publishing, games, media, learning, memberships, subscriptions, services, events, donations, licensing, and enterprise offerings. Internal spend includes GitHub, Cloudflare, compute, runners, databases, Firebase, observability, design/build tooling, vendors, and operating expenses.

A brand/product is a reporting dimension, not automatically a separate corporation, merchant account, bank account, or tax registrant. Legal structure must be confirmed by qualified owners before configuration.

## 3. Bounded domains

1. **Finance Control Tower:** consolidated reporting, close, portfolio hierarchy, and financial policy.
2. **Billing & Receivables:** customer billing accounts, invoices, plans, credits, refunds, receivables, and dunning.
3. **Payments Adapters:** provider-neutral interface for checkout, authorization/capture, refunds, disputes, settlement, and payouts.
4. **Commerce & Entitlements:** order/subscription events mapped to product access with idempotent grant/revoke.
5. **Revenue & Reconciliation:** immutable journal, provider events, settlement and payout matching, fee and refund reconciliation.
6. **Cost & Vendor Management:** cost centers, vendor inventory, usage, budgets, commitments, and allocation.
7. **Wallet & Virtual Value Governance:** distinct ledgers and policies for fiat money, stored value, loyalty points, and non-cash game credits.
8. **Tax, Legal & Compliance:** jurisdiction-specific tax and disclosure workflows, privacy, retention, consumer protection, and applicability assessments.
9. **Financial Security:** SAAAE, least privilege, separation of duties, approvals, audit, idempotency, and rate limiting.
10. **Finance Intelligence:** product/brand P&L, recurring revenue metrics where applicable, gross/net revenue, fees, refunds, chargebacks, margin, and forecasts based only on verified inputs.

## 4. Canonical financial event

The first event contract is `ops/finance/schema/finance-event-v1.schema.json`. Every inbound event must include a stable event ID, source, environment, occurrence timestamp, legal-entity reference (once verified), product/cost-center reference, event type, currency, integer minor-unit amount, and idempotency key.

Do not put payment-card data, bank credentials, access tokens, session secrets, or unnecessary customer personal data in event payloads. Store provider object references and minimal correlation metadata only.

## 5. Ledger invariants

- Posted journal entries are immutable. Corrections use linked reversal/correction entries.
- Each journal entry is balanced: total debits equal total credits in the same currency.
- Amounts use integer minor units; never use binary floating-point for money.
- Every posted line belongs to one journal entry and one currency.
- Source events are idempotent and uniquely correlated.
- Provider dashboard totals are evidence inputs, not the system-of-record ledger.
- Reconcile invoices, payment events, refunds, disputes, fees, settlements, and payouts.
- Do not silently net fees, refunds, taxes, or chargebacks into gross revenue.
- FX conversions require explicit source/target currencies, rate, timestamp, and provenance.

## 6. Security and approval controls

- Default-deny financial permissions.
- Separate requester, reviewer/approver, and workload executor identities.
- Require maker-checker approval for refunds above policy thresholds, payouts, pricing/plan changes, provider configuration, ledger adjustments, and production money movement.
- All approval records are scoped, expiring, single-purpose, and auditable.
- Never store PAN/CVV or raw bank credentials. Use provider-hosted collection and tokenized references.
- Sandbox, staging, and production identities, data, webhook endpoints, and provider accounts must be isolated.
- Webhooks must be signature-verified, replay-safe, idempotent, and durably recorded before downstream processing.
- No automatic spending-limit increase, paid-plan upgrade, merchant activation, or customer charge.

## 7. Special product boundary: That’s My Lingo

Preserve the existing preview-only virtual-credit Vegas Studio Mode: no wagering, cash-out, prize redemption, or representation of credits as money. Keep virtual credits segregated from fiat and from any regulated stored-value product. Any change in functionality requires a separate legal/compliance review and explicit owner authorization.

## 8. Delivery plan

| Phase | Deliverable | Exit condition |
|---|---|---|
| F0 | Portfolio/legal/provider facts | Unknowns explicitly listed; entity and jurisdiction map owner-verified |
| F1 | Ledger, event, billing, approval contracts | Schema review, accounting review, threat model |
| F2 | Read-only cost/revenue visibility | Sources and reconciliations documented; no writes to providers |
| F3 | Sandbox billing | Invoice, payment, duplicate webhook, refund, dispute, entitlement, reconciliation tests pass |
| F4 | One-product pilot | Legal/tax review, support/refund operations, independent acceptance, rollback plan |
| F5 | Portfolio rollout | Product-by-product acceptance and explicit release authorization |
| F6 | Financial operations | Close, audit, forecasts, cost optimization, incident drills |

## 9. Current implementation boundaries

**Allowed in this branch:** architecture, schemas, deterministic local validation, tests, documentation, and sandbox-only adapter design after provider selection.

**Not authorized by this branch:** live merchant onboarding, bank connection, payment processing, subscription activation, customer-data import, production secrets, tax filing, payout/refund execution, paid infrastructure changes, production migrations, or deployment.

The finance workstream may proceed in parallel with MASTERFORGE recovery. It does not bypass G02/G03/G04 or existing production hold/release controls.

## 10. Acceptance checklist

- [ ] Legal entities and jurisdictions verified by authorized owner/advisers.
- [ ] Product and cost-center catalog approved; unknowns retained as unknown.
- [ ] Chart of accounts reviewed by accounting owner.
- [ ] Event schema and ledger constraints validated.
- [ ] Currency/minor-unit and FX policies documented.
- [ ] SAAAE role matrix and maker-checker workflow independently tested.
- [ ] Provider contracts, webhook verification, idempotency, refunds, disputes, and reconciliation tested in sandbox.
- [ ] Privacy, retention, tax, consumer disclosures, and security review complete.
- [ ] Pilot product and rollback plan explicitly approved.
- [ ] Separate production authorization recorded before any live money movement.

## 11. Initial status

Architecture scaffold: **created on isolated feature branch**.  
Schema application to any database: **not performed**.  
Payment provider or bank: **not selected or connected**.  
Production billing and money movement: **not activated**.  
Tests and CI: **not run yet**.
