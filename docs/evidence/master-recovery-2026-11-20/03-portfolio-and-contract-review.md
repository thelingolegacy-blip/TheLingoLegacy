# Portfolio registry and engineering contract follow-up — 2026-11-20

## PR #602 — 14-realm registry and directory

Source inspected on `build/lingo-ecosystem-foundation-2026-11-15` at head `832a21ffef50e01c6fc0507402cc6ceabd7f5bcc`.

### Source counts

- Registry JSON parses and contains 14 realm objects with 14 unique IDs.
- `worlds/index.html` contains 14 `data-realm-card` entries.
- The public page source includes search/filter controls and a status label on each card.
- This is source-level inspection only; no Node tests, workflow execution, browser, accessibility, or route QA was performed.

### Status consistency

Registry `lingo-slots.status` is `scaffolded-unverified`, while the public card label is `Preview · demo only`. Align the public label to the canonical readiness status or update the registry only when the preview acceptance criteria are met. The page must not imply independent preview QA without evidence.

### Product hierarchy / ownership

The registry lists `lingocampus` and `lingoshield` under LINGOworld while also defining separate `lingo-campus` and `lingo-shield` realm records. The current schema/validator does not define or validate parent-child ownership relationships or cross-realm product ownership. Confirm whether these are LINGOworld subproducts, separately governed realms, or shared capabilities; encode the relationship explicitly before treating the registry as canonical. This is a reconciliation item, not a claim that the IDs are duplicate strings.

### Stacked ancestry

PR #602 is diverged from its current #548 parent head:
- Parent #548 current head: `9444bdda707e2573bd3e80e7fb585b708aaa251c`
- Child #602 head: `832a21ffef50e01c6fc0507402cc6ceabd7f5bcc`
- Merge base: `41b7418a229c894c5c4b279ff368b5f7a1621c33`
- Comparison: child 14 commits ahead and 21 behind.

No rebase, retarget, or merge was performed.

## PR #596 — CORE V2 API source issue

The 4 KiB body-limit test in `server_test.go` contains two consecutive backslashes before embedded quotes in a Go double-quoted literal, unlike the neighboring valid test. This appears to terminate the string early and leave invalid Go source. Correct the escaping and run gofmt/tests in the isolated environment. Review comment posted: #596 comment 7051198865.

The API has source for OIDC verification wiring, HTTPS issuer validation, PostgreSQL TLS validation, issuer+subject profile isolation, and transactional outbox writes. The outbox dispatcher/delivery, retry/dead-letter/replay, and real-provider/JWKS rotation acceptance remain incomplete. No Go test, race, vet, build, or PostgreSQL integration test was run.

## PR #611 — dispatch contract source issues

- Two cost tests expect the stale `finite non-negative` error while the validator returns an `exactly zero` cost-ceiling error.
- `validate_job()` accepts `status=COMPLETE` directly without requiring evidence or reviewer identity; the separate transition guard can be bypassed by submitting an already-complete envelope. The schema likewise permits COMPLETE without a signed completion record or identity evidence.
- The package is a validator/catalog only, not a live scheduler or identity/permission enforcement runtime.

Review comment posted: #611 comment 7051202896. No tests or workflow executed.

## Disposition

- #602: source count passes; status and ownership semantics require reconciliation; parent branch diverged; runtime/browser QA unverified.
- #596: source review identifies likely compile-blocking test defect; parent branch diverged; runtime unverified.
- #611: source review identifies test-message mismatch and completion-state bypass; runtime unverified.

No main-branch changes, code fixes, rebases, merges, workflow dispatches, runner activity, provider mutations, deployments, DNS changes, or payment activation occurred.
