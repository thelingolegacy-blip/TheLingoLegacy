# LINGO Direct Fulfillment

Status: **DESIGN / IMPLEMENTATION BRANCH ONLY — NOT ACTIVE IN PRODUCTION**

## Goal
Route eligible Shopify orders to the correct approved supplier, then synchronize fulfillment and tracking back to Shopify. Shopify remains the commerce system of record. The fulfillment router is supplier-neutral.

## Ordered rollout
The user approved this order of work:
1. Tapstitch — custom apparel.
2. Alibaba manufacturers — approved private-label products and accessories.
3. Additional suppliers — standardized adapter framework.

This sequence is an implementation priority, not confirmation that any supplier account, API, catalog, or commercial relationship is connected.

## Governance
- No production deployment or live supplier submission from this branch.
- Production/LKG remain protected while G02 runner evidence is blocked.
- Never route unpaid, cancelled, refunded, fraud-held, unsupported, or unapproved-regulated-product orders.
- Supplier adapters are disabled until supplier identity, API contract, credentials, product eligibility, shipping coverage, returns policy, and test-order evidence are approved.
- Do not store full webhook bodies or shipping addresses in logs.
- Shopify webhooks must be authenticated with HMAC-SHA256 and deduplicated by webhook ID.
- Use least-privilege credentials and keep secrets in Cloudflare secrets, never in source control.

## Target flow
1. Shopify sends `orders/paid`.
2. The Worker verifies `X-Shopify-Hmac-Sha256`, checks shop identity and webhook ID, and validates the order is eligible.
3. The event is recorded idempotently in D1.
4. The SKU routing registry maps each SKU to an approved supplier adapter and fulfillment policy.
5. The adapter submits an order using a stable idempotency key; transient errors retry, permanent errors go to manual review.
6. Supplier acknowledgements and tracking events update the routing record.
7. Shopify fulfillment is updated only after the supplier confirms shipment and supplies valid tracking data.
8. Reconciliation compares Shopify orders, supplier acknowledgements, and tracking states.

## Supplier rollout

### Supplier 1 — Tapstitch (custom apparel)
- Verify the correct merchant account and its current Shopify integration availability.
- Confirm eligible product types, variants, SKU format, production/shipping regions, branding options, returns/reprint policy, and cost/lead times.
- Connect through the provider's supported Shopify integration where available; do not invent an API endpoint or scrape private dashboards.
- Import/map only the selected apparel SKUs and variants.
- Run a sandbox or controlled test order; verify production acknowledgement, shipment, tracking, cancellation handling, and reconciliation before approving routes.

### Supplier 2 — Alibaba manufacturers (private-label products/accessories)
- Shortlist manufacturers only after product scope is known.
- Verify supplier identity, sample quality, compliance documentation, actual per-order dropshipping capability, packaging, shipping methods, returns, lead times, and destination coverage.
- Confirm the supplier supports an official API, compatible app, or agreed order-feed contract. Alibaba marketplace availability alone does not prove individual-order fulfillment support.
- Start with one approved supplier and one SKU family; use supplier-specific adapter credentials and idempotency.
- Keep each SKU route disabled until a test order and tracking round-trip pass.

### Supplier 3+ — Standardized adapters
- Implement a provider adapter contract for validation, submit, lookup, cancel-if-possible, and tracking.
- Use an explicit supplier allowlist; never forward order data to arbitrary URLs.
- Enforce supplier-specific eligibility, destination, inventory, and regulated-product policies.
- Add one supplier at a time after the same acceptance gates pass.

## Planned components
- `router.js`: authenticated webhook intake and safe event normalization.
- `schema.sql`: idempotency, routing, supplier, and audit tables.
- Supplier adapters: one adapter per verified provider; no generic arbitrary-URL forwarding.
- Reconciliation job: detects stuck orders, missing tracking, duplicate submissions, and status drift.
- Observability: correlation IDs, structured redacted logs, metrics, and alert thresholds.

## Required environment bindings
Configure only after account/zone/Worker identity and production source are reconciled:
- `FULFILLMENT_DB`: D1 database binding.
- `SHOPIFY_WEBHOOK_SECRET`: Shopify webhook signing secret.
- `SHOPIFY_EXPECTED_SHOP`: exact approved `*.myshopify.com` shop host.
- `FULFILLMENT_MODE`: must be `dry_run` until acceptance gates pass.
- Supplier-specific secrets and endpoints: only after each adapter is reviewed and allowlisted.

## Activation gates
1. Source/branch reviewed.
2. D1 schema validated in a non-production database.
3. HMAC positive and negative tests pass.
4. Duplicate webhook test proves one routing action.
5. Unpaid, cancelled, unsupported SKU, and regulated SKU tests fail closed.
6. Each supplier sandbox/test order is accepted with a stable idempotency key.
7. Tracking round-trip is verified against a Shopify test order.
8. Reconciliation, cancellation, retry, and alert tests pass.
9. Independent evidence is retained and reviewed.
10. Production deployment is separately authorized after G02 and all release gates pass.

This document is a plan and scaffold. It does not establish a live Shopify webhook, supplier connection, deployed Worker, or successful fulfillment.
