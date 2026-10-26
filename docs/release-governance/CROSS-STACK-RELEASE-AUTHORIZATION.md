# Cross-Stack Release Authorization Standard

**Status:** DESIGN / NOT AN ACTIVE RELEASE AUTHORIZATION  
**Effective posture:** FAIL-CLOSED; production HOLD; last-known-good (LKG) protected  
**Owner:** Authorized Lingo Legacy release administrator (to be confirmed)  
**Applies to:** All LINGO Legacy stacks, platform surfaces, environments, and supported OS targets.

## 1. Purpose

Establish one evidence-driven authorization contract across the Surface Matrix. A green build, merged pull request, preview deployment, static check, heartbeat, or self-reported status is not by itself permission to promote production.

The canonical evidence chain is:

`SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → PASSED → AUTHORIZATION → PROMOTION`

Every transition must reference immutable, independently verifiable evidence tied to the exact source commit, build, artifact, environment, and release candidate.

## 2. Authorization decision

The decision engine has only three outcomes:

- **BLOCKED:** any required gate fails, is unknown, is stale, or lacks evidence.
- **ELIGIBLE_FOR_APPROVAL:** all technical gates pass and evidence is complete; this is not release permission.
- **AUTHORIZED:** an identified human approver explicitly authorizes the exact release candidate and target environment after independent verification.

No default PASS, implicit approval, or automatic promotion is permitted. A later commit or changed artifact invalidates authorization unless re-verified and re-authorized.

## 3. Surface Matrix contract

Each registered surface must record:

- stable `surface_id`, display name, owning team, criticality, and lifecycle state;
- repository, source ref and commit SHA, build workflow/run/attempt, artifact digest, and provenance;
- stack/runtime, target OS/device/browser/container, environment, deployment target, and dependencies;
- required gate set, test evidence, security and accessibility evidence, telemetry, rollback/LKG reference;
- evidence timestamps, verifier identity, approver identity, decision, reason, and expiry/revalidation conditions.

Registry entries are inventory assertions, not proof of a deployed or operational surface. Unknown owners, routes, dependencies, targets, or environments must remain `UNKNOWN` until reconciled with authoritative sources.

## 4. Cross-stack coverage

The release manifest must enumerate applicable surfaces from the following groups. This is a coverage taxonomy, not a claim that every item is currently deployed.

| Stack / surface group | Required validation domains |
|---|---|
| Web / Next.js / TypeScript | dependency integrity, lint, typecheck, build, route contracts, browser E2E, headers, accessibility |
| Flutter mobile | platform-specific build, signing/configuration, auth, persistence, navigation, device tests |
| Game runtimes (GDevelop / Unity / LINGO engines) | deterministic game rules, wallet/transaction integrity, save/load, progression, abuse controls, performance |
| Firebase / Auth / Firestore / Cloud Functions | non-placeholder configuration, least privilege, rules, emulator/integration tests, idempotency, secrets handling |
| Cloudflare Workers / Pages / DNS / Access | workflow validation, route and audience inventory, Access policy verification, rollback reference, production change evidence |
| Vercel / hosting / domains | project/team access, domain ownership and routing, build identity, deployment target, rollback and health checks |
| Shopify / commerce / webhooks | checkout and webhook signature/replay protection, permissions, inventory/payment integration tests |
| APIs / integrations / shared runtime | contract tests, compatibility, authz, rate limits, schema/version compatibility, observability |
| Data / analytics / telemetry | event schema, privacy minimization, delivery checks, alert coverage, dashboard/runbook validation |
| CI/CD / agent and automation surfaces | workflow schema, runner assignment, least-privilege tokens, artifact provenance, approval boundaries, audit trail |

The final release manifest must be generated from the reconciled registry, not from this illustrative table alone.

## 5. Operating-system and execution-target matrix

Test only targets that are declared in the reconciled Surface Matrix, and record explicit `NOT_APPLICABLE` with rationale for the rest.

| Target | Minimum evidence |
|---|---|
| Linux (hosted and self-hosted runners) | runner identity, executed steps, logs, artifact correlation, dependency/build/test results |
| Windows | supported build/test result, filesystem and path behavior, security checks |
| macOS | supported build/test result, signing/notarization where applicable, platform permissions |
| Android | supported API/device coverage, signing, install/upgrade, auth and persistence |
| iOS | supported simulator/device coverage, signing, permissions, install/upgrade |
| Containers | reproducible image digest, non-root execution where applicable, vulnerability/configuration scan, health check |
| Cloudflare Workers / edge runtime | runtime compatibility, route/audience verification, security policy and health evidence |
| Browsers | supported browser/version matrix, keyboard-only flow, contrast, reduced motion, responsive behavior |
| Game/device targets | declared runtime/device matrix, gameplay regression, persistence, performance, wallet integrity |

A target omitted from the manifest is not implicitly tested or accepted.

## 6. Mandatory release gates

The authoritative repository gate matrix remains controlling. This standard adds cross-stack evidence requirements and does not weaken, rename, bypass, or supersede existing G00–G11 gates.

- G00 source authority and G01 repository identity must be verified.
- **G02 runner dispatch:** require assigned runner with `runner_id > 0`, populated `runner_name`, instantiated steps, executed sentinel, retrievable logs, and correlated run/attempt/commit artifacts.
- G03–G05: require real CI execution, independent certification evidence, and accepted release candidate.
- G06–G10: require explicit deployment permission, live validation, synchronization, activation, and post-activation checks as defined by the authoritative gate matrix.
- G11: require recorded acceptance by the authorized release authority.
- Any Firebase placeholder, unresolved security-critical audience/identity mapping, unverified production target, failed mandatory accessibility test, missing rollback path, or absent administrator approval blocks release.

If evidence cannot be retrieved, status is `UNKNOWN`, not PASS. A diagnostic workflow that has not executed cannot satisfy an execution gate.

## 7. Release authorization record

For each release, create a signed or otherwise auditable record containing:

- authorization ID and schema version;
- release candidate ID, repository, commit SHA, build/run/attempt IDs, artifact digest;
- exact surfaces, OS/device targets, and environments in scope;
- all mandatory gate results with evidence references and verification timestamps;
- security, accessibility, privacy, compatibility, monitoring, and rollback assessments;
- unresolved risks and explicit exceptions, if policy permits them;
- independent verifier and human approver identities, decision time, scope, and expiry;
- post-deployment validation and rollback decision.

Authorization is limited to the named candidate, surfaces, targets, and environment. It cannot be reused for a different commit or artifact.

## 8. Current recorded decision

**DECISION: BLOCKED — NOT AUTHORIZED FOR PRODUCTION**

Reason: repository evidence available for this design indicates G02 remains blocked by GitHub Actions startup/dispatch behavior, with observed runs reporting empty job and artifact lists. This document does not claim a new successful runner execution or independently certify every stack/OS.

Required before reconsideration:
1. Obtain a real G02 run with assigned runner, executed steps, retrievable logs, and correlated artifacts.
2. Reconcile the Surface Matrix against actual repositories, routes, runtime targets, OS support, owners, and environments.
3. Complete all mandatory gate evidence and security/accessibility checks for the exact candidate.
4. Verify production target and rollback/LKG.
5. Obtain explicit human approval for the exact candidate and environment.

No merge, deployment, DNS mutation, credential change, runner mutation, or production activation is authorized by this design.

## 9. Review and change control

Review this standard alongside the existing Surface Matrix proposals and authoritative gate matrix. Resolve overlap before selecting a canonical registry. Policy changes require a reviewed pull request, validation tests, independent approval, and an auditable change record. Never mark a gate passed merely to make the release progress.
