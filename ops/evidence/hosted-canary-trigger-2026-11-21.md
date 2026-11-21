# Hosted runner allocation canary trigger

- Purpose: exact-branch, zero-third-party-action diagnostic for GitHub-hosted runner job allocation.
- Workflow: `.github/workflows/hosted-canary-zero-uses.yml`
- Scope: `ubuntu-latest`, `ubuntu-24.04`, `ubuntu-22.04` only.
- This marker does not register or activate G02, use secrets, call external services, change infrastructure, or deploy.
- Acceptance requires instantiated jobs, non-empty runner names, Linux runner identity, completed steps, and the `ZERO_UNDERSCORE_USES_CANARY=PASS` summary marker for each matrix leg.
- Trigger commit is evidence of a push only; it is not itself a test result.
