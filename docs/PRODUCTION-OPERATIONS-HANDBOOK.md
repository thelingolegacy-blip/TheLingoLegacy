# The Lingo Legacy — Production Operations & Knowledge Handbook

**Edition:** 1.0  
**Prepared:** 2026-11-05  
**Status:** Operational handbook draft; production remains protected  
**Canonical flagship repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Canonical branch:** `main`  
**Enterprise foundation:** separate repository, proposed name `lingo-enterprise` (creation not assumed)

> This handbook is the working source for how The Lingo Legacy is built, reviewed, operated, secured, documented, and released. It is not a production authorization. Update it whenever architecture, credentials, routes, owners, release criteria, or verified runtime state changes.

---

## 1. Operating principles

1. **GitHub is the source of truth** for flagship source code, change history, reviews, and release evidence.
2. **Cloudflare is the intended authoritative edge and web runtime.** Vercel and Netlify must not silently become production authorities. Any remaining integrations are treated as legacy or preview-only until explicitly reviewed and retired.
3. **Separate product foundations from enterprise infrastructure.** Keep the flagship product repository focused on its existing site and products. Keep shared infrastructure, agent orchestration, enterprise policies, and common services in a separate enterprise repository.
4. **Free-tier-first.** Do not activate paid services, subscriptions, compute, databases, domains, or add-ons without an explicit cost review and approval.
5. **Fail closed.** If evidence is missing, contradictory, stale, or not independently retrievable, mark the gate UNVERIFIED/FAIL and do not promote.
6. **No secrets in Git.** Store credentials in approved provider secret stores. Never paste secret values into issues, logs, commits, screenshots, or this handbook.
7. **No public exposure of private infrastructure.** Host services, databases, local AI, Redis, and runner management interfaces remain private; expose only deliberately designed, authenticated application interfaces.
8. **Accessibility, privacy, safety, and maintainability are release requirements**, not later polish.

## 2. Canonical architecture

### Flagship product layer

- **Web:** React/Next or static web surfaces where appropriate, delivered through the approved Cloudflare architecture.
- **Mobile:** Flutter; mobile Firebase configuration and platform builds must be independently verified before release.
- **Games:** Unity target where a native game runtime is required; web experiences remain isolated and clearly labelled.
- **Identity:** LINGO ID / account session integration remains disabled until provider configuration, callback routes, secure cookie/session handling, logout, and mobile flows pass testing.
- **Payments:** no checkout or real-money wagering is active by assumption. Any future payments require a separate legal, security, fraud, tax, and provider-readiness review.
- **askLINGO:** embedded contextual assistant is a product capability target; do not claim a live model/backend until the API, authentication, safety boundaries, logs, and runtime are verified.

### Enterprise foundation layer

Proposed separate repository: `lingo-enterprise`.

Expected scope:
- shared identity and authorization contracts;
- agent orchestration and message/event contracts;
- infrastructure-as-code and environment policy;
- deployment/release automation;
- observability, incident handling, backups, and recovery;
- secrets and service-integration standards;
- product registry, API contracts, design tokens, and governance.

The enterprise repository must not take ownership of the flagship production route or modify flagship production state by default. Connect repositories through versioned APIs, contracts, and controlled release interfaces.

### Infrastructure intent versus verified state

The intended G02 design includes Proxmox, a dedicated GitHub Actions runner, Docker, Ollama, Redis, PostgreSQL, and Cloudflare Tunnel. These are architecture targets, not proof of a healthy or running host. Verify each service on the host before marking it operational.

Cloudflare Workers/Pages, DNS, routes, bindings, secrets, and traffic allocations must be inspected independently. A successful source build does not prove the active route is serving that build.

## 3. Environments and release boundaries

Use explicit environments:
- **Local:** developer workstation; synthetic/test data only.
- **CI:** hosted validation; no production secrets or deployment permissions.
- **Preview:** isolated review deployment; clearly marked preview; no production data.
- **Staging:** production-like validation with isolated credentials and data.
- **Production:** live user-facing services; protected and separately authorized.

Rules:
- A preview URL is not a production URL.
- A build success is not a route health check.
- A workflow starting is not a job being assigned.
- A runner being online is not a successful sentinel.
- A merged PR is not deployment approval.
- A deployment API response is not end-to-end acceptance.

## 4. G02 runner acceptance standard

Required runner identity:
- Name: `lingo-legacy-g02`
- Labels: `self-hosted, linux, x64, lingo-g02`
- Expected service: `actions.runner.lingo-legacy-g02.service`

Do not register or dispatch a runner until the host owner has verified the machine, secured the registration flow, and confirmed that no duplicate runner registration exists.

G02 is **ACCEPTED** only when all evidence is available and correlated:
1. runner ID is greater than zero;
2. runner name is populated and exactly matches the intended runner;
3. required labels are present;
4. service is healthy on the actual host;
5. an Ubuntu hosted smoke test is run separately from the self-hosted test;
6. the G02 job is assigned to the intended runner;
7. steps are instantiated and completed, not merely queued;
8. logs and artifacts can be retrieved;
9. run, job, commit, and environment identifiers correlate;
10. a harmless sentinel passes and an independent reviewer can retrieve its evidence.

A queued run, runner ID zero, empty runner name, zero jobs, missing artifacts, or startup failure before job creation is **NOT ACCEPTED**. Do not interpret workflow startup failures as application test failures.

## 5. Change management workflow

Every change follows this sequence:

1. **Request:** define the problem, affected products, owner, risk, expected outcome, and rollback.
2. **Inspect:** collect read-only evidence from the relevant source, provider, or host.
3. **Plan:** write a small change plan and identify the exact files/resources.
4. **Isolate:** create a feature branch or staging environment. Never experiment on `main` or production.
5. **Implement:** make the smallest coherent change; do not mix unrelated refactors.
6. **Test:** run deterministic tests, linting, type checks, security checks, and relevant integration tests.
7. **Review:** inspect the complete diff, dependency changes, permissions, secrets, and deployment effects.
8. **Verify independently:** retrieve the run logs, artifacts, route checks, and evidence from the authoritative system.
9. **Approve:** obtain the required release approval for the exact commit and environment.
10. **Release:** deploy through the approved Cloudflare pathway only after all gates pass.
11. **Observe:** verify live routes, errors, latency, security headers, and core user journeys.
12. **Record:** update the release manifest and this handbook with verified facts.

Never combine code merge, infrastructure mutation, secret rotation, DNS changes, and production promotion into one unreviewable action.

## 6. Release gate checklist

A release candidate must satisfy all applicable gates:

- [ ] Correct repository, branch, commit SHA, and product scope recorded.
- [ ] Pull request is reviewed; no unresolved blocking review comments.
- [ ] Static HTML, route, link, JavaScript, and configuration checks execute and pass.
- [ ] Mobile analysis/tests/build pass where mobile code is affected.
- [ ] Security and dependency checks pass; no secrets or sensitive data in source.
- [ ] Accessibility and responsive checks pass at phone, tablet, desktop, and supported TV layouts.
- [ ] Identity, authorization, privacy, and data-retention implications reviewed.
- [ ] Payment and monetization paths remain disabled unless separately approved and verified.
- [ ] Preview/staging smoke tests pass against the intended deployment.
- [ ] Cloudflare Worker, route, DNS, bindings, compatibility date, and traffic allocation are verified.
- [ ] Rollback target and recovery steps are documented.
- [ ] Logs, artifacts, test reports, screenshots, and hashes are retrievable.
- [ ] Independent acceptance is recorded.
- [ ] Production promotion is explicitly approved for the exact commit.

Any unchecked mandatory gate means **NO-GO**.

## 7. Cloudflare production verification

Before and after any approved release, record:
- zone and hostname;
- route pattern and Worker/service name;
- active deployment/version ID;
- traffic allocation;
- bindings and secret names (never secret values);
- compatibility date and runtime flags;
- build artifact/source commit correlation;
- response status and content checks for apex, www, and critical paths;
- redirect behavior and cache/security headers;
- rollback version and owner.

Test apex and www separately. An exact-root route may override a catch-all route; do not assume the two hostnames or root paths behave identically. Do not alter DNS, routes, bindings, secrets, or traffic allocations during a read-only audit.

## 8. Security, privacy, and account registration

- Use least-privilege accounts, scoped tokens, MFA, and individual attribution.
- Use a unique service identity for each automation or integration where supported.
- Keep tokens out of command history, CI output, issue comments, and documentation.
- Revoke exposed or obsolete credentials through the provider's approved process; do not print replacement values.
- Do not register duplicate GitHub runners, OAuth apps, identity tenants, payment accounts, or domains to work around an unclear state.
- Keep private host services behind private networking and authenticated access.
- Use synthetic data in preview and staging.
- Do not activate accounts for children or collect family/minor data until privacy, consent, and applicable legal requirements are reviewed.
- Keep identity, wallet, rewards, payments, and protected profile routes disabled until end-to-end security tests pass.

## 9. Agent operating model

Intended roles:
- **LINGOassist:** primary user-facing orchestration and policy enforcement.
- **LINGOassister:** isolated developer/refactoring worker; feature branches only.
- **LINGOassisthem:** infrastructure/security monitor; read-only observation by default and fail-closed escalation.
- **askLINGO:** contextual assistant embedded in product experiences.

These role definitions do not establish that autonomous agents are installed, running, connected, or authorized. Before declaring an agent operational, verify:
- process/runtime identity and health;
- model/provider configuration and cost limits;
- authenticated message transport;
- role-based permissions;
- audit logs and trace IDs;
- timeout, retry, and circuit-breaker behavior;
- prompt-injection and untrusted-input handling;
- human approval for writes, external actions, billing, and production changes.

No agent may self-approve a production release or grant itself permissions.

## 10. Backup, recovery, and incident response

Maintain recoverable copies of:
- GitHub source and release tags;
- Cloudflare configuration and deployed source snapshots;
- database backups and restore instructions;
- service configuration and infrastructure state;
- non-secret operational manifests;
- design assets and product documentation.

For each incident:
1. identify affected environment and user impact;
2. preserve timestamps, logs, run IDs, and hashes;
3. stop unsafe automation or isolate affected components;
4. do not delete evidence or overwrite the last-known-good release;
5. restore only from a verified backup or known-good deployment;
6. validate health and critical user journeys;
7. document root cause, corrective action, owner, and follow-up verification.

Do not claim a backup is usable until a restore test has been completed.

## 11. Product quality and design system

Shared platform direction: **obsidian `#050507`, carbon `#15171D`, metallic slate `#273246`, and electric gold `#F7C84B`**, with clean white typography. Preserve each product's own established identity and naming; migrate product-specific surfaces only after visual and accessibility QA.

Required design checks:
- mobile-first responsive layouts;
- keyboard and screen-reader accessibility;
- visible focus states and sufficient contrast;
- clear loading, empty, error, and success states;
- no dead links or misleading calls to action;
- no fake live data, fake balances, or unimplemented controls presented as active;
- consistent navigation and identity without tightly coupling product runtimes;
- smart-TV layouts only where the product explicitly supports remote-control navigation.

## 12. Knowledge refresh and handbook maintenance

Review this handbook:
- **Every release:** update changed architecture, gates, evidence links, and rollback instructions.
- **Weekly:** review open risks, dependency/security advisories, integration status, and stale documentation.
- **Monthly:** review provider pricing/free-tier limits, account ownership, access permissions, backups, and recovery readiness.
- **After an incident:** record root cause, new safeguards, and the evidence required to prevent recurrence.

Every operational fact must include:
- status: VERIFIED / UNVERIFIED / BLOCKED / RETIRED;
- source of truth;
- checked-at timestamp in UTC;
- environment and resource identity;
- evidence link or artifact;
- responsible owner;
- next review date.

Use these definitions consistently:
- **VERIFIED:** evidence was retrieved and independently checked.
- **UNVERIFIED:** evidence is missing, stale, or insufficient.
- **BLOCKED:** a known prerequisite prevents safe progress.
- **RETIRED:** intentionally decommissioned and verified inactive.

Never convert a target, intention, or old screenshot into a VERIFIED status.

## 13. Current baseline — 2026-11-05

| Area | Current disposition | Next proof required |
|---|---|---|
| Flagship GitHub repo | Accessible; `main` is source of truth | Restore/verify branch protection and required checks |
| Production release | Protected hold | Complete release gates and explicit approval |
| G02 runner | FAIL / UNVERIFIED | Host evidence, runner assignment, completed sentinel, logs/artifacts |
| PR #458 | Draft | Actual hosted test execution and independent evidence |
| PR #460 | Draft source snapshot | Review exact deployed-source provenance and staging verification |
| PR #461 | Draft homepage/identity candidate | Execute route verifier, responsive/accessibility QA, resolve preview-provider conflict |
| PR #463 | Draft public-repository G02 execution hold | Private control-plane and independently verified runner acceptance; do not enable public runner jobs |
| PR #464 | Draft shared design-token update | Execute verifier, Flutter analysis, browser/device and accessibility QA |
| PR #465 | Draft askLINGO runtime truth and API contract | Implement and verify endpoint/provider/auth before enabling any UI |
| PR #466 | Draft consolidated asset-boundary and local preflight hardening | Execute all verifier/tests in working CI; Firebase placeholders remain a blocker |
| PR #467 | Draft DUSSE and private edge gateway contracts | Implement in isolated staging; complete security and host/network acceptance |
| PR #419 | Closed as superseded by PR #466 | Verifier and regression-test changes preserved in #466 |
| Cloudflare apex/www | Existing routes have distinct root/catch-all behavior | Fresh live route and configuration audit |
| Identity/login | Disabled | Verified provider/runtime/callback/session/logout tests |
| Firebase mobile | Not production verified | Real project config, security rules, platform tests |
| Supabase | Prior status was inactive; recheck before use | Explicit cost/state review and owner approval |
| Local AI / Ollama | Intended architecture, not verified | Host process, API health, model inventory, access controls |
| Redis/PostgreSQL | Intended architecture, not verified | Host health, private binding, backup and restore evidence |
| Agent ecosystem | Roles defined; runtime not verified | Process, transport, permissions, logs, and safe-action tests |
| Payments | Not authorized as production | Legal/provider/security review and explicit approval |
| Enterprise foundation repo | Separate repo planned | Create only as an isolated, reviewed foundation |

This baseline is a dated snapshot, not a live monitoring feed. Refresh evidence before relying on any row.

## 14. Evidence and state-change manifest

For every state-changing operation, record a manifest entry with:
- UTC timestamp;
- actor and authorization;
- repository/host/provider and environment;
- change type and exact resource;
- before/after identifiers;
- source commit or deployment ID;
- test/run/job identifiers;
- evidence artifact/log links;
- SHA-256 hashes where applicable;
- rollback target;
- independent verifier and acceptance result.

For read-only investigations, retain raw output and the time/source of collection. Redact secrets and personal data before storing evidence.

## 15. Immediate execution order

1. Reconcile repository protection, CI startup failures, and the exact canonical validation workflow.
2. Verify PR #458's corrected tests in a hosted Ubuntu job; keep it draft until evidence exists.
3. Review PR #460's recovered Worker snapshot and ensure the deployed source remains unchanged.
4. Execute and inspect PR #461's route verifier; run responsive, accessibility, and live staging route checks.
5. Remove Vercel/Netlify deployment authority only after inventorying and safely disabling their triggers; do not mistake a preview comment for production authority.
6. Perform a read-only Cloudflare audit of apex, www, root, catch-all, Worker versions, bindings, and traffic.
7. Verify G02 host health and runner registration without duplicate registration or dispatching an unverified runner.
8. Establish the separate enterprise repository and its minimum policy/CI foundation after the flagship release controls are stable.
9. Bring identity, Firebase mobile, local AI, databases, and agent runtimes online one bounded subsystem at a time.
10. Run production certification, recovery rehearsal, and an explicit release approval before any live promotion.

---

**Release rule:** If the evidence cannot be retrieved and independently checked, the status remains UNVERIFIED and production stays protected.
