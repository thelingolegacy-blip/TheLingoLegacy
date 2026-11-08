# Wave 0 Parallel Audit Matrix — 2026-10-23

**Status:** ACTIVE / PARTIAL READ-ONLY AUDIT  
**Production:** PROTECTED HOLD  
**G02:** BLOCKED  
**Branch:** `ops/lingo-assister-parallel-audit-2026-10-23`  
**Operating rule:** Observed facts, historical evidence, hypotheses and missing evidence must remain separate.

## Executive evidence snapshot

- GitHub repository is accessible; canonical default branch is `main`. Read access and administrative repository permissions are available through the connected integration, but that does not imply Actions settings or host access are available.
- Open recovery issue #350 reports multiple workflows failing with `startup_failure` and zero jobs; the report says no test assertions executed and requires authorized administrator-side policy/runner diagnostics. The failure cause remains unconfirmed.
- PR #349 remains draft/open/unmerged per the retrieved PR snapshot. Its own description states production must remain protected and the new tests have not executed due to startup failure.
- Cloudflare account read-only inventory returned one account ID `16cb6f247cd1b28fca864760c7269606` and three Worker scripts: `obsidian-closet-design-preview`, `thelingolegacy-web-recovery-preview`, and `thelingolegacyv-5`. Inventory proves resource existence only, not current route correctness or application health.
- `firebase.json` in main contains a Hosting configuration with public root `.`; this alone does not prove Firebase is the authoritative production host or that Firestore/Functions/rules are deployed.
- `README.md` documents Cloudflare Workers as the intended production runtime and names `thelingolegacyv-5` as canonical Worker. Verify against live route configuration before any mutation.
- Several expected paths could not be read from main because GitHub returned 404, including the referenced recovery checklist and workflow path; these may exist only on PR #349's branch or have a different path. Do not treat a failed path lookup as proof of absent functionality.
- No OS shell session or dedicated runner-host access was established in this audit. OS-level repair is therefore NOT RUN.

## Parallel matrix

| Workstream | Current evidence | Finding / confidence | Safe work completed | Gate / next action |
|---|---|---|---|---|
| Surface / web UX | Prior checkpoint recorded mobile 390×844 and desktop 1440×900 previews across five routes; known contrast failures at 2.13:1, 2.60:1, 2.73:1; keyboard-only and security headers not verified | Accessibility acceptance incomplete; evidence is historical until repeated against exact target | Carried acceptance requirements into agent charter | BLOCKED: rerun fresh browser checks on approved preview and exact commit; fix contrast, keyboard/focus, headers |
| Frontend source | Main README describes Worker-rendered dynamic runtime; expected Next.js app manifest was not established by prior source search | Ownership and frontend implementation topology need source inventory | No production source changed | Inventory repo trees, Worker entrypoint/config and separate web repo; resolve source-of-truth drift |
| API / backend | PR #349 proposes legacy route compatibility and fail-closed behavior; issue #350 records test workflows have zero jobs | Proposed contract fixes are not runtime-verified; durable ledger/metrics integration remains unverified | Captured contract into acceptance rules | BLOCKED: run unit/contract tests locally and in staging; verify auth, methods, CORS, headers, idempotency, durable ledger |
| Flutter | Prior context confirms Flutter app and `pubspec.yaml`; package file was not found at root-level expected path in this read | Flutter build/test/analyzer state not established | No Flutter files changed | Find exact app directory; record Flutter/Dart versions; run pub get --offline where possible, analyze, tests and platform builds |
| Firebase | Main `firebase.json` is Hosting-only in the retrieved content; no verified Functions package was found at root-level `functions/package.json` | Firestore/Auth/Functions/rules, project boundary and backups unverified | No Firebase mutation | Inspect actual firebase config, rules, indexes, Functions directory, emulator tests, project ID, App Check, backup/PITR evidence |
| Cloudflare / edge | Read-only account and Worker inventory succeeded; production Worker and separate preview Worker exist | Resource inventory verified; routes, deployed source, bindings, headers and current smoke not freshly verified in this turn | Read-only inventory only | Inspect route mappings, script settings/version/deployment metadata and preview config; do not mutate production |
| CI / G02 | Issue #350 documents zero-job `startup_failure`, no job logs and unresolved admin checks | Pre-step failure is evidenced in issue record; underlying cause not established | Read-only issue and PR inspection | Authorized admin: Actions policy, spending/restrictions, inheritance, runner groups/labels/service logs; then exact canonical sentinel evidence |
| OS / runner host | Prior records say direct shell access unavailable; no host tool/session present here | Host/service/disk/network state cannot be asserted | No host mutation | Operator performs redacted read-only diagnostics on existing host; no re-registration or speculative reset |
| Data / recovery | Prior checkpoint requires Firestore durable ledger, reconciliation and DR/PITR restore evidence before certification | Recovery capability not verified | Added data-safety and restore acceptance rules | Identify authoritative data stores; document backup freshness, perform isolated restore test with owner authorization |
| Security / governance | Production protected hold and no-promotion rule are documented; Cloudflare account metadata indicates account-level two-factor enforcement setting is false in the returned account object | Security posture requires owner review; setting alone does not prove user 2FA state or full account risk | No security settings changed | Owner reviews account security, tokens/scopes, branch protection, CSP/headers, secret handling and audit logs |
| Agent / operations | This branch contains `docs/agents/LINGOASSISTER-OPERATING-CHARTER.md` | Operating rules drafted, not yet wired to a runtime agent or automation | Charter committed in isolation | Review charter; decide approved agent host/tool permissions; implement least-privilege tools and evidence store |

## Required acceptance predicates

### G02 runner acceptance
Require all of: correct authorized host/service; runner `lingo-legacy-g02` online with labels `self-hosted, linux, x64, lingo-g02`; positive runner ID and populated runner name; job assigned; steps instantiated; sentinel success; retrievable logs; artifact checksum; exact run/job/commit correlation; independent reviewer. A queued job or zero-job failure is not acceptance.

### Preview acceptance
Require a named staging Worker and exact source repository/branch/SHA correlation; preview route isolated from production; fresh route smoke and health checks; browser console/network checks; keyboard-only and measured contrast checks; response/security-header capture; API contract tests; documented rollback. Historical five-route HTTP 200 results do not substitute for a fresh check.

### Backend/data acceptance
Require authoritative project/environment identity, tested authentication/authorization, durable ledger schema and idempotency, audit trail, reconciliation, error behavior, rules tests, backup freshness, and successful isolated restore evidence. Fail closed where any trusted dependency is absent.

### Release acceptance
No promotion until all relevant gates are PASS with evidence, independent review, explicit authorization for exact commit and target, and a verified rollback path. Production remains HOLD while any release-critical gate is BLOCKED/UNVERIFIED.

## Exact next actions

1. Authorized GitHub administrator inspects Actions policy, organization/enterprise inheritance, spending/usage restrictions, runner-group access and actual runner service logs; attach timestamps and redacted evidence to issue #350.
2. Read-only Cloudflare inspection resolves current production route → Worker mapping and records current deployed versions/settings. Preserve sentinel filters and disabled previews.
3. Locate exact frontend and Flutter source roots, Firebase project/config/rules/functions, and all workflow files on main and PR #349's head. Record a file inventory with commit SHAs rather than assuming directory names.
4. Execute the smallest safe local test set available; record exact commands, versions, exit codes and logs. Never report tests that were not executed.
5. Correct the measured contrast failures and missing API contract only on an isolated branch, add regression tests, and verify the exact SHA in isolated staging after target identity is proven.
6. Produce an evidence-linked gap list and independent review. Keep G02 and production blocked until their full predicates are met.

## Scope of this checkpoint

This document is a partial, evidence-linked audit and handoff, not a declaration that the whole platform has been fully tested or repaired. The work performed in this turn was read-only platform/repository inspection plus two documentation commits on an isolated branch. No production deployment, merge, DNS/Worker mutation, Firebase mutation, secret change, runner reset, or release-gate promotion was performed.
