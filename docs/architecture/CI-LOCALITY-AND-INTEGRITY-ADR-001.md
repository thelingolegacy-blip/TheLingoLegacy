# ADR-001: CI Locality, Cache Integrity, and Workload Economics

- **Status:** Architecture decision frozen; implementation and runtime acceptance pending
- **Date:** 2026-10-13
- **Scope:** LINGO Legacy CI, canonical G02 runner, package-manager caches, container builds, test scheduling
- **Authority:** Isolated recovery branch only. This ADR does not authorize merge, runner registration changes, production deployment, or gate bypass.

## Decision

Optimize CI by keeping reusable, non-sensitive build state close to the compute that consumes it, while making each job's workspace and outputs deterministic. Prefer persistent local package-manager stores and Docker/BuildKit layer caches on a dedicated, persistent Linux x64 self-hosted runner when their measured end-to-end cost is lower than remote cache import/export. Do not add remote cache transport merely because a cache feature exists.

The canonical GitHub runner identity and labels remain exact:

- Name: lingo-legacy-g02
- Labels: self-hosted, linux, x64, lingo-g02

A GitLab side runner is a separate lane and cannot satisfy GitHub G02 assignment or acceptance.

## Frozen design principles

### 1. Locality first; remote cache only with measured benefit

Persistent local storage should retain:
- Package-manager global content stores (for example, pnpm store, npm cache, or another verified package manager's content-addressed store).
- Docker build layers and BuildKit local state for the relevant builder.
- Compiler caches only where keys fully represent compiler version, platform, configuration, and relevant inputs.

Do not default to caching whole dependency installation directories, checked-out workspaces, or the entire Docker daemon root through a remote Actions cache. Do not transfer multi-gigabyte layer blobs through an external cache backend unless measured end-to-end timings demonstrate a net win over native registry caching or local reuse.

Measure the complete critical path: download, decompression, cache lookup, import/export, installation/build/test, artifact upload, and cleanup. A cache hit alone is not proof of improved wall-clock time.

### 2. Persistent runner does not mean persistent workspace

The runner may persist approved cache directories on local drives between jobs. The workspace must be treated as disposable and untrusted each job:
1. Acquire an exclusive workspace/runner lease; never run overlapping jobs against the same mutable workspace.
2. Check out the exact commit and verify repository, ref, and commit identity.
3. Remove stale workspace contents before checkout using a path-guarded cleanup operation; refuse to clean if the resolved path is empty, /, outside the configured work root, or is a symlink escaping that root.
4. Start from a controlled environment and pinned toolchain versions.
5. Use deterministic installs (npm ci, pnpm install --frozen-lockfile, or the equivalent only after the actual manifest and lockfile are verified).
6. Run tests/builds and capture exit status, timing, cache hit/miss telemetry, and correlated evidence.
7. Remove workspace outputs, temporary credentials, and job-specific scratch data on both success and failure. Preserve only explicitly approved cache stores and evidence artifacts.
8. Never persist runner authentication/configuration as a cache artifact; never log or archive tokens, private keys, or secret-bearing environment values.

Cache stores must be treated as performance data, not trusted inputs. Use package-manager integrity checks and lockfiles; constrain writable caches to the trusted runner account and do not share writable cache directories with untrusted jobs.

### 3. Trust boundary for persistent runners

A persistent runner that executes arbitrary pull-request code can leak credentials or poison shared caches. The canonical runner must only execute trusted, appropriately authorized workflows under a documented repository trust policy. Do not run untrusted fork PR code on the persistent G02 host. Do not expose production secrets to validation jobs. If the current repository's public-PR trigger cannot meet these constraints, the G02 workflow must be gated to trusted events/refs or use an isolated disposable runner for untrusted validation. This is a required security review item, not an automatic workflow edit in this ADR.

### 4. Cache keys must describe inputs, not commit identity

- Package manager: key or namespace by OS, architecture, package-manager version, runtime/toolchain version, and the actual lockfile hash.
- Docker/BuildKit: cache identity must include the image/build context identity and must use isolated scopes per independent image.
- Compiler/test cache: include compiler version, target platform, configuration, and all relevant input fingerprints.
- Avoid commit-SHA-only dependency keys; source-only commits should not invalidate unchanged package stores.
- Never invent a lockfile path. The workflow's real manifest and lockfile must be found before adding a cache or deterministic install step.

### 5. Test parallelism must be evidence-driven

Do not equate more shards with lower latency. Measure per-test/per-shard setup time, execution time, queue time, artifact time, and variance. Assign shards to minimize the maximum end-to-end shard duration, including repeated setup and cleanup. A shard should be introduced only when saved critical-path time exceeds duplicated setup, cache contention, artifact handling, and CI-minute cost. Start with balanced historical durations and a defined tolerance; re-evaluate when distributions shift.

A single 12-minute test beside 3-minute tests is a load-balancing signal, not proof that an arbitrary matrix is efficient. Preserve deterministic test selection and report which tests ran in each shard. Avoid duplicate execution across shards unless explicitly intended.

### 6. Integrity and evidence are hard gates

Record at minimum:
- workflow/run/job IDs, repository, ref, commit SHA, runner ID/name/labels;
- toolchain and package-manager versions;
- cache hit/miss and bytes or transfer duration when available;
- stage timings, shard/test assignment, exit status;
- artifact names, checksums, and retrievable log references.

The evidence chain remains:

SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → PASSED → AUTHORIZATION → PROMOTION

A cache hit, benchmark script, documentation commit, queued job, or runner status of Online Idle does not satisfy G02. G02 requires a real job assignment to the canonical runner, positive runner ID, populated runner name, instantiated steps, sentinel execution, retrievable correlated logs/artifacts, and independent verification.

## Current repository fit and implementation boundary

Source inspection on the recovery branch found:
- Static CI runs repository-local Node.js 22 validation scripts without a dependency-install step.
- An auto-repair workflow conditionally runs npm tests if package.json and a test script exist; a verified lockfile path was not identified.
- ops/github-runner/bootstrap.sh currently builds and starts an **ephemeral** runner container.
- The runner Docker image is built on the dedicated host with docker compose build github-runner; no existing GitHub Actions Buildx image-build job was identified in the inspected paths.

Therefore this ADR deliberately does not add an unverified package-manager cache, guessed lockfile, test-sharding matrix, or type=gha cache to an unrelated workflow. The current ephemeral runner implementation does **not** yet implement the persistent-runner target described here. Before changing it, review host access controls, runner lifecycle, persistent volume boundaries, workspace cleanup, concurrency/lease behavior, and trusted-event policy. Any migration must preserve the canonical runner name/labels and prove the full G02 acceptance predicate before downstream gates can advance.

## Acceptance plan

1. Inventory the real dependency manifests, lockfiles, test inventory, Docker build context, available local disk, and current runner host configuration.
2. Approve the persistent runner security boundary and ensure only trusted jobs can execute on it.
3. Implement persistent cache volumes/directories separately from disposable job workspace; guard cleanup paths and enforce single-job workspace ownership.
4. Benchmark at least three representative runs for each proposed cache path and record cold/warm stage timings, bytes moved, hit/miss evidence, and total wall time.
5. Add test sharding only after duration telemetry exists; compare critical-path time and total CI-minute cost against the unsharded baseline.
6. Independently verify runner assignment, steps, logs, artifacts, and evidence correlation. Keep G02 and all downstream gates blocked until acceptance is formally met.

## Non-goals

- No cache-based shortcut around validation.
- No weakening runner labels or replacing the canonical GitHub runner with a GitLab runner.
- No caching secrets, runner auth/configuration, or whole mutable workspaces.
- No forced cache pruning on the recovery host to manufacture a cold benchmark.
- No merge, deployment, activation, or production mutation by virtue of this ADR.
