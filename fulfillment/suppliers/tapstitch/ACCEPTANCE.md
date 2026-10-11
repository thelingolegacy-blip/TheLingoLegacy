# Tapstitch Supplier 1 — Connection and Acceptance Runbook

Status: **BLOCKED — owner authorization in Shopify/Tapstitch and a real order-to-tracking test remain outstanding.** Documentation only; no supplier order submitted.

## 1. Live preflight (2026-10-11)

The connected Shopify Admin connector resolves to **Loyalty Lane** at `vercel-store-f0dc9593.myshopify.com` (USD, United States). The user confirmed this is the intended **Loyalty Lane Apparel** store.

Read-only catalog checks:
- `vendor:ODMPOD`: **0 products returned**.
- A broad catalog search returned apparel products whose current vendors include other Shopify Collective suppliers; no returned record proves a Tapstitch link.
- The connector cannot inspect the Tapstitch account or Shopify app-install status.

These findings do not prove Tapstitch is uninstalled. They do mean the live store catalog currently provides no verified Tapstitch-published product/variant mapping. Do not treat existing apparel from other vendors as Tapstitch products or change their vendor/SKU/fulfillment settings as a workaround.

## 2. Official connection and permission review

Official Tapstitch instructions say to connect either from Tapstitch **Stores → My Store → Connect to Shopify**, or by installing the official Tapstitch app from Shopify Admin, then completing Tapstitch sign-in/registration. Confirm the store shown in Tapstitch is the correct Loyalty Lane store and that the connection state is active.

Official resources:
- Connection guide: https://www.tapstitch.com/help-center/faq/detail/How-can-I-connect-my-Shopify-store-to-Tapstitch
- Shopify App Store listing: https://apps.shopify.com/odmpod-dropshipping

The current Shopify App Store listing says the app requests access to customer data (including names, email, phone and physical address), products/inventory/collections, order/fulfillment/shipping data, files, locations, Markets settings, and sales-channel publications. Review those permissions in Shopify's authorization screen before approval. The integration cannot be authorized by the repository code; the store owner/authorized administrator must complete this account-level step.

## 3. Product and variant mapping acceptance

Start with one owner-approved sample apparel design/SKU. Publish/link it from Tapstitch to the confirmed Shopify store using Tapstitch's native product publishing flow. Confirm:
- Each Shopify variant is linked to the matching published Tapstitch product/design.
- Variant SKU and variant identity remain exactly as published by Tapstitch; do not casually edit/recreate variants.
- Shopify product vendor is `ODMPOD` and each variant's inventory/fulfillment service is set to `ODMPOD`, as required by Tapstitch's Shopify sync troubleshooting guide.
- Size identifiers remain aligned; color names may be presentation-adjusted only if the underlying color remains accurate.
- Production cost, currency, shipping rates/methods, destination coverage, estimated production/transit time, branding/packaging, cancellation cutoff, and returns/reprint policy are recorded from the live merchant account.

Official mapping/sync guidance:
- Publish and update products: https://www.tapstitch.com/help-center/faq/detail/How-to-link-your-Tapstitch-designs-with-the-products-in-your-online-store
- Common order sync failures: https://www.tapstitch.com/help-center/faq/detail/synchronize
- Variant/SKU/vendor/fulfillment-service rules: https://www.tapstitch.com/help-center/faq/detail/Failures

Do not bulk-edit existing catalog products. Do not manually force the `ODMPOD` vendor or inventory service onto unrelated products.

## 4. Safe end-to-end test

Only after the app connection and mapping are confirmed:
1. Use Tapstitch's supported test procedure or an owner-controlled low-value order; do not use an unsuspecting customer order.
2. Confirm the order is paid and unfulfilled. Tapstitch's guidance says only paid, unfulfilled orders are eligible for sync.
3. Verify it appears once in Tapstitch and record Shopify order ID plus Tapstitch reference.
4. Verify production acknowledgement, then shipment status, carrier and tracking number.
5. Verify the matching Shopify order receives the correct fulfillment/tracking information and inspect notification behavior.
6. Reconcile order ID, line-item variant/SKU, supplier reference, tracking number, timestamps and final statuses.
7. Capture sanitized evidence in the isolated PR; never store tokens, payment data, or full customer addresses.

## 5. Supplier 1 acceptance gate

PASS only when all are independently evidenced:
- Correct Loyalty Lane store is connected and active in Tapstitch.
- Selected apparel product and all intended variants are Tapstitch-published and correctly linked.
- SKU/vendor/fulfillment-service invariants are correct.
- Costs, destination coverage, lead times, and exception policies are documented.
- One authorized test order is synced once, accepted, shipped, and tracking is reconciled to the same Shopify order.
- Evidence is independently reviewable.

Until then: `production_enabled=false`; no automatic supplier submission; no production deployment; keep LINGO Direct in dry-run/blocked mode.

## 6. Current evidence ledger

| Control | Observed state |
|---|---|
| Intended store | Confirmed by user: Loyalty Lane Apparel |
| Connected Shopify identity | Read-only check returned Loyalty Lane / `vercel-store-f0dc9593.myshopify.com` |
| `vendor:ODMPOD` catalog search | 0 products returned |
| Tapstitch app install / authorization | Not verified; requires Shopify Admin authorization |
| Tapstitch store connection state | Not verified |
| Product and variant mapping | Not verified |
| Supplier cost/shipping/policy details | Not verified |
| Test order / shipment / tracking round-trip | Not performed |
| Supplier 1 gate | **BLOCKED** |
| Automated submission / production deployment | Disabled / blocked |

This runbook documents the required work and live read-only observations. It does not establish a connected app, completed test order, deployed Worker, or successful fulfillment.
