
# LINGO Legacy Alternate Routes, Tunnel Bridges, and Subscription Wave Plan

**Status:** Proposal / implementation blueprint  
**Production posture:** Protected hold. This document does not authorize deployment, DNS mutation, secret creation, billing activation, or promotion.

## Objective

Create independently verifiable recovery paths for build/test, connectivity, deployment, and subscription entitlements. Avoid single-provider or single-runner dependency without weakening fail-closed release gates.

## Constraints to preserve

- GitHub Actions G02 remains unresolved until a real runner executes a step and retrievable logs are independently verified.
- PR #332 remains a draft and must be reviewed separately; this plan does not replace or merge it.
- The repository is public. Standard GitHub-hosted runners for public repositories are free, so do not add paid capacity solely to address a pre-step dispatch failure.
- Cloudflare edge routing and Cloudflare Tunnel have distinct roles: public ingress belongs at the approved edge; private services should use authenticated, outbound-only connectivity.
- Existing DNS, Worker routes, production origins, Stripe live mode, and customer entitlements must not be changed during planning.

## Target architecture

Source of truth: GitHub repository
- Route A: GitHub Actions primary CI — commit SHA, tests, logs, artifacts
- Route B: independent CI fallback — same commit SHA, separate logs/artifacts
- Evidence verifier — checks SHA, provenance, integrity, completeness
- Release authorization gate
- Approved deployment pathway
- Cloudflare edge / Worker and approved application origin

Private admin/build services connect through Cloudflare Tunnel and authenticated private access. A second connector may improve connection resilience after its host and credentials are verified.

LINGO ID / account backend connects to hosted subscription checkout, signed billing webhooks, an idempotent subscription-state processor, durable entitlement records, and server-side access checks.

## Wave 0 — Inventory and diagnose

Actions:
1. Capture repository visibility, Actions settings, run/job metadata, and the current G02 evidence chain.
2. Inspect organization/account restrictions, runner groups, Actions policies, and billing/usage only where available.
3. Inventory current DNS records, Worker routes, origin mappings, Vercel project/deployment provenance, and any existing tunnels using read-only access first.
4. Record every result with timestamp, source, commit/run identifier, and a clear PASS / FAIL / BLOCKED / UNKNOWN state.

Acceptance gate:
- Root cause is evidenced, or the remaining diagnostic question is narrowed enough for a targeted GitHub Support escalation.
- No claim of a billing root cause without billing evidence.
- No production mutations.

## Wave 1 — Independent build and evidence route

Primary route: existing GitHub Actions workflow.

Fallback route: a separately configured CI provider, candidate GitLab CI, that builds and tests the same source commit. This is a candidate, not yet provisioned.

Required outputs:
- Exact source commit SHA and toolchain versions.
- Test results and machine-readable summary.
- Build artifact hashes and retrievable logs.
- Clear statement that fallback CI success does not itself satisfy GitHub branch protection or authorize deployment.
- No secrets in logs; least-privilege, short-lived credentials if later required.

Acceptance gate:
- Two independently observable routes can build/test the same commit.
- Artifacts can be retrieved and their SHA/provenance verified.
- Failure in either route is visible and cannot silently promote a release.

## Wave 2 — Tunnel and service bridges

Public ingress:
- Keep public hostnames routed only through the approved Cloudflare edge and explicitly mapped origins.
- Maintain a route inventory for apex, www, and approved application subdomains.
- Use health checks and independent external probes to distinguish Cloudflare edge response from origin health.

Private connectivity:
- Use Cloudflare Tunnel for approved private web/admin/build services; it is outbound-only and is not a replacement for CI execution.
- Apply Cloudflare Access identity controls, least privilege, and service-specific hostname mappings.
- Do not expose runner control ports, SSH, dashboards, or internal APIs directly to the public Internet.
- Add a second connector/replica only after host ownership, credential handling, and health checks are verified.
- Document recovery and rollback for tunnel, origin, and DNS changes before any production mutation.

Acceptance gate:
- Approved services work through the intended route.
- Unauthorized access is denied.
- Connector loss and origin failure are detected; recovery is demonstrated.
- External checks verify actual public reachability and correct origin behavior.

## Wave 3 — Subscription MVP (sandbox first)

Product baseline: LINGO Legacy Club. Proposed baseline price is $9.99/month, subject to explicit product/business approval before live activation.

Components:
1. Hosted checkout; never handle raw card data in LINGO application servers.
2. Server-side customer/subscription association with the authenticated Lingo ID.
3. Signed webhook verification and event deduplication/idempotency.
4. Durable subscription state machine, including at minimum: pending/incomplete, active, past_due, canceled, and expired where applicable.
5. Server-side entitlement checks. Client UI may display status but cannot grant paid access.
6. Customer portal or documented support flow for payment method changes and cancellation.
7. Audit trail for subscription-state transitions without logging payment secrets or sensitive payloads.
8. Reconciliation job or operator procedure to compare provider state with stored entitlement state.

Core webhook scenarios:
- Subscription created/updated/deleted.
- Invoice paid/payment succeeded.
- Invoice payment failed or action required.
- Duplicate, delayed, and out-of-order event delivery.
- Refund/cancellation and entitlement revocation behavior.

Acceptance gate:
- Sandbox checkout-to-entitlement test passes.
- Duplicate events do not duplicate grants or charges.
- Failed payment and cancellation tests produce the approved entitlement behavior.
- Webhook signatures are validated; secrets are stored outside source control.
- Live mode remains disabled until business, legal, support, privacy, and security approvals are documented.

## Wave 4 — Staged release and operations

1. Run browser, mobile, keyboard, screen-reader, security, and subscription lifecycle tests.
2. Verify deployment commit provenance and public reachability independently.
3. Check privacy and permission for any real family names or minors' information before public release; use approved aliases where permission is not documented.
4. Publish a release evidence bundle and explicit go/no-go decision.
5. Promote only after named authorization; otherwise retain protected hold.
6. Define rollback triggers, on-call owner, billing incident handling, and customer communication before enabling live subscriptions.

## Evidence and gate format

For each gate record:
- Gate ID and owner.
- Source reference (commit, workflow run, Cloudflare resource, or test run).
- Timestamp and environment.
- Expected result and observed result.
- Evidence URI/hash where available.
- Status: PASS, FAIL, BLOCKED, or UNKNOWN.
- Approver and explicit next action.

Canonical chain: SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → PASSED → AUTHORIZATION → PROMOTION.

## Out of scope until separately approved

- Merging PR #332 or this plan.
- Changing production DNS, Worker routes, tunnels, or origins.
- Creating or rotating live payment credentials.
- Enabling Stripe live mode or charging customers.
- Disabling required branch protection or release gates.
- Treating a successful external CI run as proof that GitHub Actions G02 is fixed.

## Recommended immediate order

1. Read-only infrastructure and billing/policy inventory.
2. Resolve or escalate the GitHub runner dispatch failure with captured evidence.
3. Build the fallback CI route in an isolated branch.
4. Validate Cloudflare routes and private tunnel requirements without production changes.
5. Implement subscription state and webhook handling in sandbox.
6. Run the release gate matrix and request explicit authorization for any live change.
