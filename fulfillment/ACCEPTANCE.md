# LINGO Direct Acceptance Gates

Status: **NOT RUN — production activation prohibited**

## Static and schema checks
- [ ] JavaScript syntax check passes on the exact commit under review.
- [ ] D1 schema applies cleanly to a new non-production database.
- [ ] Foreign keys, unique webhook IDs, unique idempotency keys, and allowed status transitions are verified.
- [ ] No secrets, customer PII, shipping addresses, or raw webhook payloads appear in logs or source.

## Webhook security
- [ ] Valid Shopify HMAC is accepted.
- [ ] Missing or incorrect HMAC is rejected with 401.
- [ ] Wrong shop domain is rejected with 403.
- [ ] Unsupported webhook topic is rejected.
- [ ] Missing webhook ID is rejected.
- [ ] Replaying the same webhook ID produces no second routing action.
- [ ] Malformed JSON and malformed line items are rejected.

## Order policy
- [ ] Paid order with all SKU routes sandbox-approved is validated in dry-run mode.
- [ ] Unmapped SKU is held for review.
- [ ] Disabled/blocked route is held for review.
- [ ] Supplier not sandbox-approved is held for review.
- [ ] Unpaid, cancelled, refunded, fraud-held, and unsupported product classes are not routed.
- [ ] Any regulated-product class remains blocked until separately reviewed for legality, licensing, platform/payment acceptance, age controls, and shipping eligibility.

## Supplier adapter and tracking
- [ ] Supplier adapter is specific to a verified supplier and uses authenticated transport.
- [ ] Supplier submission is idempotent and cannot create duplicate supplier orders on retry.
- [ ] Timeout, rate-limit, 4xx, and 5xx outcomes follow documented retry policy.
- [ ] Supplier acknowledgement maps to the correct Shopify order and supplier.
- [ ] Tracking company, number, and URL are validated before Shopify fulfillment is updated.
- [ ] Cancellation/refund races are handled without claiming shipment that did not occur.

## Independent evidence
- [ ] Exact commit SHA is recorded.
- [ ] Test run has assigned runner, instantiated steps, completed sentinel, retrievable logs, and retained artifacts.
- [ ] Results are independently correlated to the tested commit and reviewed.
- [ ] G02 and downstream release gates pass before any production promotion.
- [ ] Production activation is separately authorized.

Passing a local test or creating a pull request does not satisfy the independent evidence or production gates.
