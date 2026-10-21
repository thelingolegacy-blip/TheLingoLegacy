# Smart cache policy
Status: policy-only; cache activation remains disabled until measured and reviewed.
## Goals
Optimize repeated CI work without making builds non-deterministic or crossing trust boundaries.
## Allowed candidates
- Package-manager download caches keyed by operating system, architecture, toolchain, and the actual lockfile hash.
- Docker BuildKit layer cache keyed by the Dockerfile, build context, dependency lockfiles, and pinned base-image digest.
- Deterministic compiler outputs when input completeness and invalidation behavior are demonstrated.
## Prohibited
- Secrets, access tokens, private keys, runner registration state, Terraform state, mutable workspaces, or credentials.
- Restoring cache data created by untrusted pull-request jobs into privileged or release jobs.
- Treating cache hits, fast execution, or configuration validation as proof of runner health.
## Activation gate
1. Identify real manifests and lockfiles; do not invent a package cache for a project with no install step.
2. Record a cold baseline and at least one warm run.
3. Compare elapsed time, cache hit rate, cache size/storage cost, and correctness.
4. Verify key invalidation after changing the relevant input.
5. Review trust-boundary separation and cleanup behavior.
6. Enable only the cache types with repeatable measured benefit and no integrity/security regression.
The existing G02 runner benchmark remains a host-side activity and must not run automatically on production hosts. No cache is enabled by this policy file.
