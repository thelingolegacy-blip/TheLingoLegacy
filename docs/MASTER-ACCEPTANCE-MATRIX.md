# LINGO Legacy — Master Acceptance & Release Gate Matrix

**Baseline:** 2026-10-30 candidate branch  
**Policy:** Fail closed. A feature being present in source is not proof of runtime integration or production acceptance.  
**Promotion rule:** No merge-to-release, production deployment, traffic shift, billing activation, or public store release until every applicable gate has independently verifiable evidence and an authorized reviewer accepts it.

## Status vocabulary
- **SOURCE_PRESENT** — implementation exists in the candidate; no runtime claim.
- **PENDING** — evidence or external action is outstanding.
- **BLOCKED** — a prerequisite prevents execution or acceptance.
- **PASS** — evidence satisfies the exact predicate and is independently reviewable.
- **NOT_APPLICABLE** — documented rationale and reviewer approval required.

## Master gates

| Gate | Domain | Minimum acceptance evidence | Current baseline |
|---|---|---|---|
| G00 | Source authority | Approved repository, branch, immutable commit SHA, signed provenance/SBOM, license inventory | SOURCE_PRESENT |
| G01 | Repository governance | Protected release branch, required reviews, CODEOWNERS, least-privilege tokens, secret scanning, dependency policy | PENDING |
| G02 | CI runner dispatch | Assigned runner ID/name, instantiated job, executed sentinel, retrievable logs and artifacts | BLOCKED |
| G03 | Build and test | Node/static contracts, Flutter analyze/test/web build, Android build, reproducible build metadata, all required checks green | BLOCKED |
| G04 | Application contracts | Route/API schemas, error contracts, idempotency, versioning, contract and integration tests | PENDING |
| G05 | Identity and access | Firebase project verified, Auth providers, session lifecycle, MFA/admin controls, Firestore/Storage rules tests | BLOCKED |
| G06 | Data and privacy | Data inventory, purpose/retention/deletion, export, consent, privacy notice, age/child safeguards, DSAR workflow | PENDING |
| G07 | Wallet, rewards and coins | Server-authoritative append-only ledger, idempotency, replay protection, reconciliation, fraud/abuse limits; demo currency clearly segregated | BLOCKED |
| G08 | Commerce and billing | Stripe test-mode checkout, verified webhook signatures, idempotent fulfillment/refunds, tax/receipt and failure paths; live mode separately authorized | BLOCKED |
| G09 | Assistant and agents | Prompt-injection controls, abuse limits, data minimization, safety policy, scoped tools, approval gates, audit trail; autonomy off until certified | PENDING |
| G10 | Security | Threat model, SAST/dependency/container scans, DAST, authZ tests, CSP/CORS/CSRF, rate limits, secrets scan, penetration test findings closed | PENDING |
| G11 | Accessibility and UX | WCAG 2.2 AA audit, keyboard, screen reader, contrast, zoom/reflow, reduced motion, forced colors, touch targets | PENDING |
| G12 | Media and IP | Music/art/font/image licenses, creator releases, moderation/reporting, rights metadata, takedown process | PENDING |
| G13 | Web/PWA | Route smoke tests, browser matrix, install/update/offline behavior, cache invalidation, service-worker rollback | PENDING |
| G14 | Mobile | iOS/Android release builds, signing, deep links, push permissions, device matrix, crash-free telemetry, privacy manifests | BLOCKED |
| G15 | Smart TV / ThinQ | webOS and Tizen SDK builds/device tests/store checks; ThinQ API/device authorization tested separately | PENDING |
| G16 | Cloud and deployment | Preview asset/Worker bundle consistency, binding inventory, environment separation, deployment manifest, rollback rehearsal | BLOCKED |
| G17 | Observability and operations | Correlated logs/traces/metrics, alert routing, incident runbooks, SLOs, on-call ownership, status/diagnostics validation | PENDING |
| G18 | Resilience and recovery | Backup/restore proof, RPO/RTO, queue retry/dead-letter handling, disaster recovery exercise, data integrity checks | PENDING |
| G19 | Legal, policy and stores | Terms, privacy, community rules, accessibility statements, app-store disclosures, age ratings, platform approvals | PENDING |
| G20 | Final certification | Independent acceptance of all applicable gates, release notes, known-issues register, rollback point and signed authorization | BLOCKED |
| G21 | Post-activation | Live synthetic checks, error-budget watch, billing reconciliation, security alert review, rollback trigger and 24/72-hour signoff | BLOCKED |

## Cross-cutting acceptance requirements

### Product and world coverage
The flagship, Virtual Library, Virtual Music Studio, Loyalty Lane Apparel, Loyalty Lane Designs, Loyalty Lane Cycle, Kotton's Code, games, account/profile, support, operations and admin surfaces each need:
- route inventory and owner;
- responsive desktop/tablet/mobile review;
- empty, loading, error, unauthorized and success states;
- working navigation and back/deep-link behavior;
- API contract and end-to-end test;
- accessibility and analytics coverage;
- clear distinction between prototype, preview, and live commerce.

### Identity, data and permissions
- Firebase project ID and app IDs must match the intended environment; no placeholder values.
- Secrets belong in protected environment secret stores, never source control or client bundles.
- Authorization must be enforced server-side per role/resource; hiding a button is not access control.
- Admin, support, creator, member, child/guardian and service identities need explicit scopes and audit events.
- Account deletion must cover database records, auth identity, queued jobs, object storage and downstream processors, with completion evidence.
- Define data classification, retention, export, correction, deletion, consent and breach response.

### Wallet, points, coins and checkout
- Demo coins, Loyalty Bucks, Lingo Tokens, XP and any redeemable value must be separate ledgers and clearly labeled.
- Never trust client-submitted balances, prices, rewards or transaction outcomes.
- Use immutable ledger entries, unique idempotency keys, concurrency-safe balance projections and reconciliation.
- Real-money checkout remains disabled until Stripe test-mode acceptance, webhook verification, refund/dispute flows and legal review pass.
- No billing bypass, fabricated transactions, hidden value transfer or unapproved cash-equivalent claims.

### askLINGO and governed agents
- The current guided fallback is not a certified AI service.
- AI inference remains disabled until model/provider, data handling, prompt-injection defenses, safety evaluation, cost limits and privacy disclosures are approved.
- LINGOassist, LINGOsisters, LINGOsystem, SHIELDS, NEXUS and VOT-NEXT remain catalog roles only until each has a defined owner, tool allowlist, least-privilege identity, approval policy, audit trail, kill switch and evaluation suite.
- No autonomous write action, payment, message blast, deployment or account mutation without an explicit scoped authorization and human approval.

### Release and deployment
- Preview and production accounts, bindings, databases, buckets, queues and secrets must be separated.
- Verify every asset referenced by Worker HTML injection is included in the exact deployed asset bundle.
- Record commit SHA, build ID, artifact digest, environment, Worker version and route coverage.
- Exercise rollback against a known-good version before production promotion.
- Never promote a preview merely because a build succeeded.

## External owner actions that code cannot complete
1. Restore GitHub Actions dispatch / hosted-runner availability and verify the canonical G02 predicate.
2. Confirm GitHub Actions policy, runner-group access, repository/org restrictions and active self-hosted runner daemon if used.
3. Supply valid Firebase project configuration and protected environment secrets; approve Firebase rules and identity settings.
4. Confirm Cloudflare account access, exact Worker bindings, asset bucket/manifest and preview hostname; keep production unchanged.
5. Provide Stripe test-mode account access and product/price IDs; live billing requires a separate approval.
6. Provide Apple, Google Play, LG webOS and Samsung Tizen developer accounts, signing certificates, privacy disclosures and review submissions.
7. Provide authorized rights documentation for music, fonts, images, video and creator content.
8. Assign human owners for security, privacy, moderation, customer support, incident response and release acceptance.

## Current release decision
**NOT READY FOR PRODUCTION.** G02 is blocked; remote tests have not executed; Firebase and Stripe are not certified; platform builds/device tests and independent acceptance remain outstanding. Preserve the known-good production version and do not shift traffic.
