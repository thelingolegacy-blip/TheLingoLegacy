# GitHub Actions Cache Policy — LINGO Legacy G02

## Status and scope

This policy is documentation-only. It does not change runner labels, job scheduling, workflow permissions, production configuration, or G02 acceptance criteria. Keep changes on the isolated recovery branch until reviewed.

Repository inspection of this branch did not find a root-level `pnpm-lock.yaml` or `package.json`. Therefore, do **not** insert the example below into a live workflow until the actual dependency manifest and lockfile path for that workflow have been confirmed. A cache keyed to a nonexistent lockfile would not provide the intended invalidation behavior.

## Key strategy

Use an exact key first, then a prefix restore key scoped to the same OS, architecture, and Node.js major version:

```yaml
key: pnpm-${{ runner.os }}-${{ runner.arch }}-node22-${{ hashFiles('pnpm-lock.yaml') }}
restore-keys: |
  pnpm-${{ runner.os }}-${{ runner.arch }}-node22-
```

- **Exact match:** reuse the dependency store for the same lockfile.
- **Prefix restore:** reuse a prior dependency store from the same OS/architecture/Node toolchain family if the lockfile hash changed.
- **Miss:** proceed with a clean dependency install.
- Keep dependency installation deterministic (for pnpm, use `pnpm install --frozen-lockfile`).

## Example for a workflow that actually uses pnpm

```yaml
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 22

- name: Enable pnpm
  run: corepack enable

- name: Get pnpm store path
  id: pnpm-store
  shell: bash
  run: echo "path=$(pnpm store path --silent)" >> "$GITHUB_OUTPUT"

- name: Restore pnpm dependency cache
  uses: actions/cache@v4
  with:
    path: ${{ steps.pnpm-store.outputs.path }}
    key: pnpm-${{ runner.os }}-${{ runner.arch }}-node22-${{ hashFiles('pnpm-lock.yaml') }}
    restore-keys: |
      pnpm-${{ runner.os }}-${{ runner.arch }}-node22-

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

Use the repository's verified lockfile path in both `hashFiles(...)` and the install command. If the workflow does not use pnpm, use that workflow's actual package manager and lockfile instead.

## What may be cached

- Package-manager dependency stores.
- Non-sensitive compiler/build caches whose inputs are included in the cache key.
- Safe, non-secret diagnostic outputs only when retention and access are appropriate.

## What must never be cached

- GitHub or GitLab tokens, runner registration tokens, private keys, credential files, cloud credentials, or secret-bearing environment dumps.
- The whole self-hosted runner directory or its authentication/configuration files.
- Unreviewed workspace contents that could contain credentials.

Prefer GitHub Actions artifacts for run-specific evidence. Artifacts should record run/job IDs, commit SHA, timestamps, runner identity, exit status, and checksums as appropriate. Do not treat a cache hit or successful cache restore as runner health evidence.

## G02 acceptance remains separate

Caching is a performance optimization and cannot satisfy the G02 gate. G02 stays blocked until all required predicates are independently verified: canonical runner `lingo-legacy-g02`, required labels `self-hosted`, `linux`, `x64`, `lingo-g02`, a real positive runner assignment, instantiated steps, successful sentinel execution, retrievable correlated logs/artifacts, and independent evidence verification.

The GitLab side runner is a separate validation lane. Its `paeagles-g02` tag must not be confused with the canonical GitHub runner or used to imply that GitHub assigned a job.
