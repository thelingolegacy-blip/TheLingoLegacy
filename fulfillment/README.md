# LINGO Direct Fulfillment

Status: **DESIGN / IMPLEMENTATION BRANCH ONLY — NOT ACTIVE IN PRODUCTION**

## Goal
Route eligible Shopify orders to the correct approved supplier, then synchronize fulfillment and tracking back to Shopify. Shopify remains the commerce system of record. The fulfillment router is supplier-neutral.

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
3. The event is recorded idempotently in D1 and a routing job is queued.
4. The SKU routing registry maps each SKU to an approved supplier adapter and fulfillment policy.
5. The adapter submits an order using a stable idempotency key; transient errors retry, permanent errors go to manual review.
6. Supplier acknowledgements and tracking events update the routing record.
7. Shopify fulfillment is updated only after the supplier confirms shipment and supplies valid tracking data.
8. Reconciliation compares Shopify orders, supplier acknowledgements, and tracking states.

## Planned components
- `router.ts`: authenticated webhook intake and safe event normalization.
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
4. Duplicate webhook test proves one routing record.
5. Unpaid, cancelled, unsupported SKU, and regulated SKU tests fail closed.
6. Supplier sandbox accepts one test order with a stable idempotency key.
7. Tracking round-trip is verified against Shopify test order.
8. Reconciliation and alert tests pass.
9. Independent evidence is retained and reviewed.
10. Production deployment is separately authorized after G02 and all release gates pass.

This document is a plan and scaffold. It does not establish a live Shopify webhook, supplier connection, deployed Worker, or successful fulfillment.
