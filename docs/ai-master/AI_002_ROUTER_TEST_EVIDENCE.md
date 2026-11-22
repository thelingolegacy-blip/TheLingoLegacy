# AI Master Router — Local Test Evidence

- **Work package:** AI-002
- **Disposition:** LOCAL TESTS PASS; CI NOT RUN; independent acceptance pending
- **Timestamp (UTC):** 2026-11-06T12:57:45.578Z
- **Repository:** thelingolegacy-blip/TheLingoLegacy
- **Branch:** ai-master/bootstrap-phase0-1-2026-11-06
- **Router Git blob SHA:** f70031a238406fe63b30d2ef7806de5f53871162
- **Test Git blob SHA:** 5cd1c47cc63e50ec18026dbf5d6dc7a2c68c7f88
- **Runtime:** Node.js v22.16.0
- **Command:** `node --test ai-master/test/router.test.mjs`
- **Result:** 9 tests passed; 0 failed; 0 skipped.

## Test coverage
1. All six declared task types route to their intended logical agents.
2. Unknown task types fall back to ELIZA manual triage.
3. Malformed task input requests clarification.
4. Read-only GitHub access requires its exact scope.
5. Missing scopes deny access.
6. Unknown tools are denied, including arbitrary shell.
7. GitHub branch writes and staging deploys remain disabled.
8. Production, routing, billing, payments, credentials and destructive actions remain behind the human gate.
9. Router version is explicit.

## Source correlation
The Git blob hashes generated from the local test harness matched the GitHub blob SHAs returned for the corresponding branch files. This correlates the tested source and test file with the branch content.

## Scope limitations
- Tests ran locally in an isolated temporary harness, not in GitHub Actions.
- No model provider was called.
- No tool was executed by the router.
- No credentials, secrets, production endpoints or billing were accessed.
- This is unit-test evidence only; security review, integration tests, CI execution and independent acceptance remain outstanding.
