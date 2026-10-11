# Tapstitch Supplier 1 — Connection and Acceptance Runbook

Status: BLOCKED — merchant connection not verified. Documentation only; no supplier order submitted.

## 1. Live preflight finding (2026-10-11)

The connected Shopify Admin connector resolves to the **Loyalty Lane** store at `vercel-store-f0dc9593.myshopify.com` (USD, United States). A read-only product search for `vendor:ODMPOD` returned **0 products**.

This is not proof that Tapstitch is uninstalled, but it means this connected catalog currently provides no evidence of Tapstitch-published products. Confirm that Loyalty Lane is the intended Shopify store for the LINGO Direct/Tapstitch connection before installing or authorizing an app. Do not create or publish products as a workaround.

## 2. Official connection path

Tapstitch's current official guide documents two paths:
- From Tapstitch: Stores → My Store → Connect to Shopify, then complete the Shopify app authorization.
- From Shopify Admin: Apps and sales channels → Shopify App Store → find the official Tapstitch app → Install, then sign in/register with Tapstitch to complete linking.

Use only the official Tapstitch listing and authenticate as the store owner/authorized administrator. Review the requested data permissions before approving. Do not share app credentials, tokens, or customer data in issues or logs.

Official references:
- Tapstitch connection guide: https://www.tapstitch.com/help-center/faq/detail/How-can-I-connect-my-Shopify-store-to-Tapstitch
- Official Shopify App Store listing: https://apps.shopify.com/odmpod-dropshipping

## 3. Product and variant mapping acceptance

For each intended Tapstitch item (start with one low-risk sample SKU):
- Publish/link the product from Tapstitch to the confirmed Shopify store.
- Confirm each Shopify variant maps to a published Tapstitch product variant.
- Confirm variant option values (size, color), SKU, price, currency, product vendor, and fulfillment location/service.
- Tapstitch's sync guidance identifies the vendor as `ODMPOD` and requires variants to match published Tapstitch variants with the correct fulfillment service/location. Verify these values from the live app; do not bulk-edit the catalog blindly.
- Record production cost, shipping method/rates, supported destination, estimated production and transit times, cancellation cutoff, and return/reprint policy from the merchant account.

## 4. Safe end-to-end test

Do not use a real customer order as the first test. After the store/app link and product mappings are verified:
1. Place an explicitly authorized low-value test order using the supplier's supported test procedure or an owner-controlled order.
2. Verify it appears once in Tapstitch and is accepted for production; capture the Shopify order ID and Tapstitch order reference.
3. Verify production/shipment status and carrier/tracking number in Tapstitch.
4. Verify Shopify receives the matching fulfillment and tracking number/carrier/URL; confirm no duplicate fulfillment and customer notification behavior.
5. Reconcile order ID, line-item variant/SKU, supplier reference, tracking number, timestamps, and final statuses.
6. Record sanitized evidence in the isolated PR. Never include access tokens, payment data, or full customer addresses.

## 5. Gate decision

Supplier 1 is **PASS** only when all are true:
- Correct merchant store confirmed.
- Official Tapstitch app is installed and linked to that store.
- Intended apparel variants are mapped and eligible.
- Costs, destinations, lead times, and exception policies are recorded.
- Test order is accepted once, shipped, and tracking is reconciled back to the same Shopify order.
- Evidence is independently reviewable.

Until then: `production_enabled=false`; no automatic supplier submission; no production deployment; keep LINGO Direct in dry-run/blocked mode.

## 6. Current outcome

- Connected Shopify store identity: observed.
- `vendor:ODMPOD` products: 0 returned in read-only catalog search.
- Tapstitch app installation/account link: not verified.
- Product/variant mapping: not verified.
- Test order and tracking: not performed.
- Supplier 1 gate: BLOCKED.
