# The Lingo Legacy — Production Certification Standard

**Status:** Proposed control standard; NOT a certification, audit opinion, or release approval  
**Applies to:** thelingolegacy.com, web surfaces, APIs, Worker services, Firebase/Supabase services, Flutter clients, game systems, commerce, analytics, operations tooling and connected providers  
**Authority:** Repository source is the source of truth for code; provider consoles and live evidence are the source of truth for deployed state. Neither substitutes for the other.

## 1. Certification principles

1. No production certification by declaration. Every gate requires dated, attributable evidence tied to an immutable source revision and the deployed artifact/version.
2. Separate **implemented**, **configured**, **deployed**, **tested**, **accepted**, and **operational**. These are different states.
3. Fail closed. Unknown, stale, inaccessible, conflicting or missing evidence is BLOCKED—not PASS.
4. No secrets in source, logs, tickets, screenshots, evidence bundles or public reports.
5. Least privilege, separation of duties, peer review, immutable audit trails and reversible changes.
6. Production is not a test environment. Use isolated development/staging environments and synthetic data.
7. No paid provider, real-money gameplay, wallet cash-out, billing, external messaging, or customer data activation without separate written approval, compliance review, cost controls and provider-side acceptance.
8. A static page, mocked API, local browser storage, successful HTTP response or green dashboard tile is not proof of a functioning end-to-end service.

## 2. Certification state model

Use only these statuses:

- **NOT ASSESSED** — no assessment evidence.
- **IN PROGRESS** — work is underway; required proof is incomplete.
- **BLOCKED** — a known dependency, failure, permission or missing proof prevents acceptance.
- **PASS** — all defined acceptance criteria passed with current evidence.
- **EXEMPT** — formally approved scope exclusion, owner, rationale, expiry and compensating control recorded.
- **EXPIRED** — previously accepted evidence is outside its validity window or material system change invalidated it.

A gate can be PASS only if the evidence records: gate ID, scope, environment, commit SHA, artifact/deployment ID, test procedure and version, timestamp, operator, result, exceptions, reviewer and evidence location. Production certification expires after material changes or the defined review interval.

## 3. Release gate sequence

| Gate | Required acceptance | Minimum evidence |
|---|---|---|
| G00 Source authority | Canonical repository, ownership and branch identified | Repository metadata, commit SHA, CODEOWNERS |
| G01 Architecture | Approved service map, trust boundaries, data flows and owners | Architecture decision records, dependency inventory |
| G02 Build environment | Reproducible, supported, isolated build runner | Runner identity, image digest, toolchain versions |
| G03 CI quality | Formatting, lint, unit, integration, contract, accessibility and security checks pass | Successful run, jobs, logs, test reports, artifacts |
| G04 Supply chain | Dependencies pinned/locked, provenance and vulnerability review complete | Lockfiles, SBOM, scan results, provenance/attestation |
| G05 Security | Threat model, authN/authZ, secrets, headers, CORS, abuse controls and penetration findings accepted | Security test report, policy review, remediation sign-off |
| G06 Data | Schema, migrations, rules, retention, backup and restore validated | Migration plan, rules tests, backup/restore evidence |
| G07 Provider readiness | Each provider's project, environment, permissions, limits and webhook contracts verified | Provider-side configuration evidence and test transactions |
| G08 Release candidate | Artifact built once, immutable and tied to source | Artifact digest, release manifest, signed provenance |
| G09 Deployment | Approved deployment to intended environment, route and bindings verified | Deployment ID, active version, configuration snapshot |
| G10 Live acceptance | External, authenticated, negative, load and end-to-end tests pass | Timestamped probes, test account evidence, telemetry |
| G11 Operations | Alerts, dashboards, incident, support, rollback and DR rehearsed | Runbooks, alert delivery test, restore/rollback exercise |
| G12 Business/compliance | Terms, privacy, age/eligibility, game rules, consumer disclosures and monetization approvals complete | Legal/compliance sign-off and approved provider records |
| G13 Final authorization | Independent reviewer accepts all gates and exceptions | Signed release decision and evidence index |

No gate may be skipped silently. An exemption must name the approver, expiry, risk and compensating control. A failed or unverified critical gate blocks release.

## 4. Full-stack technical controls

### 4.1 Source control and engineering workflow
- Protect the production branch with required peer review, required status checks, CODEOWNERS for sensitive paths, restricted bypass and signed/traceable changes.
- Use short-lived feature branches and small, independently reviewable pull requests.
- Require issue linkage, acceptance criteria, risk classification, rollback plan and test plan.
- Never use direct production edits as a substitute for source-controlled change.
- Keep environment-specific configuration out of source; validate configuration schema and reject placeholders at build/release time.
- Pin action versions and dependencies; maintain lockfiles and an SBOM; review automated dependency updates.

### 4.2 Build and CI/CD
- Build in isolated, reproducible environments with pinned runtime/toolchain versions.
- Pipeline order: checkout immutable SHA → validate configuration → format/lint → unit tests → integration/contract tests → accessibility/UI tests → security/dependency scans → build → artifact inspection → SBOM/provenance → staging deploy → smoke/acceptance → approval → production deploy → post-deploy verification.
- Do not treat a workflow run with zero jobs as a test result. Record runner admission/startup failure separately from test failure.
- Do not retry deployment loops to bypass provider rate limits.
- Promote the exact artifact tested in staging; do not rebuild different bytes for production.
- Preserve logs, test reports, artifact digests and deployment IDs.

### 4.3 Frontend and web surfaces
- Verify canonical apex/www behavior, TLS, redirects, cache policy, headers, CSP, accessibility, responsive layouts and browser support.
- Test all navigation, forms, error states, loading states, empty states, keyboard use and reduced motion.
- Confirm no secrets, private data, source maps, repository internals or unapproved files are publicly served.
- Verify each route against its intended access class: public, authenticated user, operator-only or internal.
- Confirm server-side validation for every state-changing action; browser validation is usability only.

### 4.4 APIs and service contracts
- Maintain an endpoint registry with method, path, owner, environment, auth requirement, data classification, rate limit, idempotency behavior, timeout and error contract.
- Require schema validation, request size limits, safe parsing, output encoding, pagination limits and explicit method handling.
- Apply authentication and object-/function-level authorization on the server for every protected operation.
- Use idempotency keys for payment, order, reward and other retryable mutations.
- Use shared, edge/provider-enforced abuse controls for public endpoints; isolate-local memory limits are defense in depth only.
- Set bounded timeouts, retries with jitter, circuit breakers and safe fallbacks. Never retry non-idempotent mutations blindly.
- Return stable machine-readable errors; never expose stack traces, secrets or provider internals.

### 4.5 Identity and access
- Choose one canonical identity authority per environment and document issuer, project/tenant, audience, key rotation, token expiry, revocation and session policy.
- Validate cryptographic signatures and issuer/audience/expiry/subject claims; token shape or Bearer-header presence is not authentication.
- Authorize every resource and action server-side; deny by default.
- Require MFA for privileged operators, short-lived credentials, least privilege and periodic access reviews.
- Separate user, service, CI, support and emergency identities. Audit privileged actions.
- Test account creation, verification, login, logout, reset, session expiry, revocation, account deletion and cross-account isolation.

### 4.6 Data and storage
- Classify data and document collection purpose, lawful basis/consent where applicable, retention, deletion, export and access.
- Use least-privilege database and object-storage rules; deny by default.
- Test rules with authenticated, unauthenticated, owner, non-owner and privileged test identities.
- Encrypt in transit and at rest; manage keys and rotation outside source.
- Version migrations, test forward/backward compatibility, take backups before destructive changes and rehearse restore.
- Never put personal, family, minor or customer data in public fixtures, demo content, analytics payloads or issue comments.
- Do not mix production and staging identities, databases, buckets or secrets.

### 4.7 Cloud, edge and network
- Maintain an inventory of domains, DNS records, TLS certificates, Worker routes, Access policies, environments, bindings, origins, storage and deployed versions.
- Review edge asset manifests and prove the exact deployed file set; source ignore rules alone are insufficient.
- Protect operator surfaces with explicit Access policies and independently verify public health monitoring without opening administrative routes.
- Keep infrastructure changes versioned and reviewed; capture before/after state and rollback.
- Verify origin protection, CORS allowlists, security headers, cache isolation and request-size/timeout controls.
- Do not expose repository-root assets unless the publication manifest has been explicitly reviewed.

### 4.8 Mobile and game clients
- Pin supported Flutter/Dart toolchains and dependencies; build signed release artifacts in controlled CI.
- Verify Android/iOS identifiers, signing, permissions, deep links, network security, crash reporting, accessibility and store policy.
- Treat clients as untrusted: never store authoritative balances, entitlements, RNG outcomes or access decisions on device.
- Keep game logic, reward eligibility, RNG/outcome records and wallet mutations server-authoritative where those services are enabled.
- Test reconnect, duplicate requests, clock manipulation, replay, tampering, offline mode and account switching.
- Label demo/local-only features honestly; local score storage is not an account-backed leaderboard.

### 4.9 Monetization, rewards and commerce
- Keep billing, cash-out and real-money gameplay disabled until legal/compliance, provider, security, fraud, tax, refund, dispute and support acceptance is documented.
- Distinguish virtual/demo balances from cash value and clearly disclose restrictions, eligibility, odds/rules and promotional terms.
- Never represent a disabled checkout endpoint or staged reward as a completed transaction.
- Validate price, inventory, eligibility, coupon, taxes and totals on the server; do not trust client-supplied values.
- Require idempotent webhook handling, signature verification, replay protection, reconciliation and refund/chargeback procedures.
- Establish ledger invariants, immutable transaction history, adjustment approvals and daily reconciliation before any wallet or redeemable reward launch.
- Obtain written approval for any provider spend or paid integration activation.

### 4.10 Analytics and privacy
- Define event taxonomy, owner, purpose, consent state, data minimization and retention before instrumentation.
- Exclude secrets, authentication tokens, message content and unnecessary personal identifiers.
- Verify the exact analytics project/environment and test consent withdrawal and deletion.
- Monitor cost and event volume; do not assume an installed analytics connector is connected to the production project.

## 5. Operational controls

### 5.1 Observability
Every production service must have:
- Health/readiness semantics that distinguish process liveness from dependency readiness.
- Structured, redacted logs with correlation/request IDs.
- Metrics for traffic, errors, latency, saturation, dependency health and business-critical outcomes.
- Traces across service boundaries where practical.
- Dashboards with service owner, SLO, alert thresholds and runbook links.
- Alert delivery tested to an accountable on-call owner.

Do not log credentials, full payment data, sensitive user content or unnecessary personal data. Define retention and access controls.

### 5.2 SLO and error budgets
- Define service-level indicators for availability, latency, correctness and critical transaction completion.
- Set service-level objectives based on user impact and architecture; do not invent targets without owner approval.
- Define alert thresholds, burn-rate policy, escalation and freeze rules.
- Report measured performance over a stated time window; a single successful probe is not an availability SLO.

### 5.3 Incident management
- Classify severity, establish incident commander, technical lead, communications owner and scribe.
- Detect → acknowledge → contain → investigate → recover → validate → communicate → postmortem.
- Preserve evidence and timestamps; avoid destructive cleanup before investigation.
- Rotate compromised credentials only through an approved, tested procedure.
- Publish a blameless post-incident review with timeline, impact, root cause, contributing factors, corrective owners and due dates.
- Test the contact tree and escalation path.

### 5.4 Backup and disaster recovery
- Define RPO/RTO per data/service owner and obtain approval.
- Encrypt and isolate backups; protect deletion controls; monitor backup success.
- Test restore to an isolated environment and verify integrity, permissions and application consistency.
- Document regional/provider failure, DNS/route recovery, key recovery, dependency loss and manual operation procedures.
- A backup job is not proof of recoverability; only a successful restore test is.

### 5.5 Change and release management
- Classify change risk: standard, normal, emergency.
- Record owner, purpose, affected services/data, security/privacy impact, dependencies, test evidence, maintenance window and rollback.
- Require independent approval for production, identity, data, DNS, routing, secrets, billing and access-policy changes.
- Use canary/gradual rollout where supported; define abort thresholds before deployment.
- Verify the deployed version and smoke tests after change; monitor through the agreed observation window.
- Emergency changes receive retrospective review and evidence capture.

### 5.6 Support and business continuity
- Publish support channels, service hours, escalation contacts and response expectations.
- Maintain known-issue, outage, refund, account recovery, privacy request and abuse-report procedures.
- Train operators and test runbooks; avoid undocumented single-person dependencies.
- Keep customer communications accurate and do not promise unsupported functionality.

## 6. Mandatory test matrix

At minimum, each release candidate must include:

- Unit tests for business logic and validation.
- Integration tests for each provider adapter and data boundary.
- API contract tests for success, invalid input, unauthenticated, unauthorized, rate-limited, timeout and dependency-failure paths.
- Security tests for IDOR/BOLA, privilege escalation, injection, XSS, CSRF where relevant, SSRF, CORS, replay, brute force, secret exposure and insecure direct object references.
- Data isolation tests across users, tenants and environments.
- Accessibility tests for keyboard, screen reader, contrast, focus, reduced motion and form errors.
- Cross-browser/device smoke tests for supported targets.
- Load, soak and burst tests against agreed capacity and cost limits.
- Backup/restore and rollback exercises.
- End-to-end tests for the critical user journey, including failure and recovery paths.
- Negative tests proving disabled billing, cash-out, AI spend and other gated capabilities cannot be activated by stale clients or direct API calls.

## 7. Evidence register and freshness

Maintain a versioned evidence register with:
- Evidence ID and gate ID.
- Scope and environment.
- Source commit SHA and artifact digest.
- Deployed provider version/deployment ID.
- Procedure/tool/version and exact command or test case.
- Timestamp, operator, reviewer and result.
- Raw evidence location, retention and access classification.
- Exceptions, linked issue, owner and due date.
- Expiry or invalidation trigger.

Evidence becomes stale after relevant code, configuration, provider, identity, data, route or infrastructure changes. Public screenshots and manually typed status claims are not sufficient evidence.

## 8. Current known Lingo Legacy release blockers

These are current audit observations, not claims that all environments or providers have been fully inspected:

1. GitHub Actions jobs are failing to instantiate for recent runs; zero jobs means no tests ran.
2. Cloudflare Access behavior on external health paths and the intended public/operator/internal route matrix need provider-side verification.
3. Active Cloudflare Worker version, routes, bindings and deployed asset manifest need provider-side evidence tied to a reviewed commit.
4. Firebase Hosting currently declares repository root `.` as its public directory; the actual intended build output must be established before any change.
5. Firebase client configuration contains placeholders and the canonical environment/project relationship is unresolved.
6. Gateway JWT verification is intentionally fail-closed and not configured; do not treat Bearer-header presence as identity.
7. Root Worker and askLINGO rate limiters are isolate-local; shared controls and full endpoint inventory are not certified.
8. CSP allows inline scripts/styles and needs report-only compatibility assessment before hardening.
9. Branch protection/ruleset status and required checks need current authenticated verification.
10. Production observability, alert delivery, backup/restore and disaster recovery evidence are incomplete.
11. Privacy remediation for public staging source requires private review and built-bundle verification.
12. Billing and cash-out remain disabled; provider-side payment certification has not been completed.
13. Flutter/mobile build, signing, store compliance and end-to-end backend acceptance remain unverified.

## 9. Release decision rule

**NO-GO** if any critical security, privacy, identity, data integrity, payment, deployment provenance, backup/restore, monitoring or operational gate is BLOCKED, EXPIRED or NOT ASSESSED. A documented exemption requires an accountable approver and compensating control; it cannot override legal or provider requirements.

The final decision must identify the exact source SHA, artifact digest, deployment ID, environment, evidence index, unresolved risks, approvers and rollback owner. A release is certified only for that exact scope and version.

## 10. Approval record

- Engineering owner: pending
- Security reviewer: pending
- Data/privacy reviewer: pending
- Operations/on-call owner: pending
- Product/business owner: pending
- Compliance/legal reviewer (where applicable): pending
- Independent release approver: pending
- Certified source SHA / artifact / deployment: pending
- Decision / timestamp / expiry: pending
