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


## Cache invalidation: lockfiles, not commit SHAs

Do not use `github.sha` or a commit SHA as the primary dependency-cache key. That creates a new key for every commit, even when dependencies have not changed, leading to cold caches and avoidable restore/upload work.

Prefer a dependency-lockfile hash. It remains stable across ordinary source-only commits and changes when the dependency graph is updated. Use the actual lockfile(s) used by the job, for example:

```yaml
key: deps-${{ runner.os }}-${{ runner.arch }}-node22-${{ hashFiles('path/to/pnpm-lock.yaml') }}
restore-keys: |
  deps-${{ runner.os }}-${{ runner.arch }}-node22-
```

Replace `path/to/pnpm-lock.yaml` with the confirmed repository-relative path. Do not add a pnpm cache to a job that does not use pnpm. If a workflow uses multiple lockfiles, hash all relevant lockfiles in its key.

## Docker / BuildKit layer cache

For image-build jobs, prefer Docker BuildKit's GitHub Actions cache backend when the job uses Docker Buildx. A representative build step is:

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build with reusable BuildKit cache
  uses: docker/build-push-action@v6
  with:
    context: .
    push: false
    cache-from: type=gha,scope=lingo-legacy-image
    cache-to: type=gha,mode=max,scope=lingo-legacy-image
```

This is a template, not a live workflow change: repository search did not identify an existing `docker/build-push-action` step or a Dockerfile path to attach it to. Confirm the real image build context and workflow before adopting it. Use a distinct cache `scope` for each independently built image so concurrent jobs do not overwrite each other's cache records.

For very large layers (for example, a roughly 1.9 GB image layer), caching alone may not fix a slow transfer. Inspect BuildKit cache hit/miss output, layer sizes, cache export/import duration, and available network throughput. Optimize Dockerfile ordering so frequently changing application source is copied after stable dependency installation; use multi-stage builds and exclude unnecessary files with `.dockerignore`. Avoid caching the whole Docker daemon data root or mutable runner state with `actions/cache`.

Measure cold and warm runs separately. Record build duration, cache hit ratio, bytes transferred when available, and cache export/import duration. Do not claim a speedup until run telemetry confirms it.
