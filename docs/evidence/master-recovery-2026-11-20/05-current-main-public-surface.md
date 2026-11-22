# Current-main public-surface source check — 2026-11-20

**Severity:** P0 source exposure risk. **Disposition:** do not deploy or mutate production without separate owner authorization.

## Main-branch facts

Read-only source inspection of main at baseline `1a60e2314cb3f9b5e3efe648ade83121080cb7b2` found:

- `worker.js` contains no restricted-path policy import/gate and forwards non-API paths to `env.ASSETS.fetch(request)`.
- `wrangler.jsonc` sets `assets.directory` to repository root `.`.
- Main `.assetsignore` does not exclude the seven exact internal register/identity directories in the approved #574 restricted list.
- Main release manifest still includes all seven routes:
  - `/integration-configurations/`
  - `/integration-ids-register/`
  - `/integration-links-register/`
  - `/dashboard-integration-links/`
  - `/exact-dashboard-links/`
  - `/auth0-details/`
  - `/auth0-implementation/`
- All seven corresponding `index.html` files exist on main. The `admin-command-center` and `economy-command-center` entrypoints also exist, but those two directories are already excluded by main `.assetsignore`.

## Candidate repair

PR #574's branch `security/two-layer-public-surface-repair-2026-11-14` adds:
- A shared restricted-path policy.
- A Worker deny gate before static asset lookup.
- Static exclusions and release-manifest cleanup for the approved narrow path list.
- Separate Worker and static-publication PR workflows.

PR #574 remains draft/unmerged. Its current-head Actions runs `44803224502` (Static Publication Policy) and `44803220520` (Worker Route Security) both ended in `startup_failure`; no job steps executed. The PR body also states the static publication policy is not a complete generated public-file allowlist and the asset root remains unchanged pending inventory/dry-run.

## Assessment boundary

This establishes source configuration and file presence only. It does not prove current external reachability or the exact response body from the production edge; no live content fetch was performed here. The earlier #574 design record documents a prior public fetch that exposed integration provider identifiers/operational metadata, but not secrets or credential compromise.

## Required action

Treat this as P0. Preserve the narrow approved classification; obtain independent security review; restore hosted Actions; run the two focused workflows and a safe preview; verify the Worker blocks before asset lookup and the static publication boundary excludes the approved paths. No production deployment, Worker route/version mutation, DNS change, merge, or release promotion is authorized by this evidence record.
