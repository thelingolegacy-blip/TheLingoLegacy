# Cloudflare and Public-Site Verification — 2026-10-19

## Scope and safety
Read-only checks only. No DNS, Worker, Pages, billing, account, or production settings were changed. No purchase or paid service activation occurred.

## Cloudflare access
- The Cloudflare API identity endpoint responded.
- One account was visible to the connected identity, and it contains an active, unpaused full zone for `thelingolegacy.com`.
- This connected profile is not the same identity the user originally named. Resource visibility is evidence of access to this zone, not proof of account ownership alignment.

## Domain and routing findings
- Apex DNS: one proxied A record with content `192.0.2.0`, annotated as a Cloudflare Worker route.
- `www.thelingolegacy.com`: proxied CNAME to `thelingolegacy.com`, annotated as the canonical www alias.
- `casino.thelingolegacy.com`: proxied CNAME to `proxy-v2.appdeploy.ai`.
- Apex and www Worker routes are present and point to the `thelingolegacy` Worker.
- The zone API reports 42 DNS records in use; quota was not returned.
- The apex A record uses an address in the TEST-NET documentation range. Because the record is proxied and associated with a Worker route, do not change it without confirming Cloudflare's intended Worker routing configuration.

## Worker and Pages inventory
- Multiple Workers are present, including `thelingolegacy`, `thelingolegacyv-5`, `lingo-g02-control-agent-2026-10-10`, `lingo-legacy-integration-check`, `lingo-recovery-preview`, and `lingo-recovery-sandbox-2026-10-10`.
- `thelingolegacy` currently has routes for apex and www.
- `thelingolegacyv-5` has multiple subdomain routes.
- Three Pages projects were returned. One integration-test project's latest preview deployment was queued/idle and marked skipped due to path configuration; this is not a successful deployment. A That's My Lingo preview deployment completed successfully on 2026-10-18. Preview success does not certify production.
- Cloudflare billing/subscription endpoints returned authentication error 10000. Billing status, subscription tier, and free-tier usage remain unverified.

## Public website check
- A public fetch of `https://thelingolegacy.com/` returned the Lingo Legacy Universe Hub HTML and visible site content.
- A public fetch of `https://www.thelingolegacy.com/` could not be completed by the fetch service; www reachability is not independently verified.
- A fetched homepage is not a substitute for full browser, mobile, route, form, accessibility, security, or end-to-end validation.

## Release and recovery gates
- G02 runner acceptance remains blocked/unverified. The Cloudflare control-agent Worker is not a Linux x64 GitHub Actions runner.
- Do not promote preview or change production until runner execution evidence, site-level QA, and account alignment are independently verified.
- Last-known-good remains protected; fail-closed policy remains in effect.

## Next safe actions
1. Confirm that the connected Cloudflare profile is authorized for the intended estate.
2. Resolve Cloudflare billing/subscription permission errors before making any claim about free-tier usage.
3. Verify apex and www through an independent browser/network path, then run route-level smoke and mobile QA.
4. Recover G02 with an actual online matching runner and independently retrievable logs/artifacts.
5. Only then prepare a reviewed production promotion plan.