# API endpoint contract — v1

The canonical API is served by the Cloudflare Worker `thelingolegacyv-5` through `worker.js`. This document describes the Worker contract; it does not assert that external integrations are healthy or that release gates have passed.

## Discovery and read-only endpoints

| Path | Methods | Contract |
|---|---|---|
| `/api/v1` | GET, HEAD, OPTIONS | Discover supported endpoints and methods |
| `/api/v1/runtime` | GET, HEAD, OPTIONS | Runtime manifest; integration flags mean binding presence only |
| `/api/v1/platform/manifest` | GET, HEAD, OPTIONS | Platform manifest |
| `/api/v1/platform/status` | GET, HEAD, OPTIONS | Platform and release status |
| `/api/v1/platform/gates` | GET, HEAD, OPTIONS | Immutable fail-closed gate state |
| `/api/v1/platform/modules` | GET, HEAD, OPTIONS | Platform module inventory |
| `/api/v1/site/context` | GET, HEAD, OPTIONS | Public site context |

Read-only endpoints return HTTP 405 for unsupported methods and include an `Allow` header. HEAD requests return the same status/headers as GET without a response body. JSON responses use `Cache-Control: no-store`.

## POST endpoints

| Path | Methods | Contract |
|---|---|---|
| `/api/create-checkout-session` | POST, OPTIONS | Creates a Stripe checkout session only when required server-side configuration is present |
| `/api/beacon-text-alerts` | POST, OPTIONS | Validates consent and destination details before staging/sending alerts |

POST endpoints advertise `Allow: POST, OPTIONS` for unsupported methods. Credentials are not returned by discovery or runtime manifests.

## Release safety

The gate endpoint reports the Worker’s configured release gate values and explicitly denies production promotion/activation while blocked. An endpoint returning HTTP 200 is not evidence that Firebase, Stripe, Twilio, D1, KV, R2, or any other integration is operational. The `integration_semantics` field means only that a binding/configuration value is present.

Production must remain Protected HOLD until the canonical evidence and authorization gates pass.
