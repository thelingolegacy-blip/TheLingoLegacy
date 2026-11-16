# LINGO CI authentication and OIDC setup

## Status

- GitHub Actions OIDC preflight: prepared on an isolated review branch; not yet run.
- External cloud federation: not configured.
- Firebase production project and GCP trust identifiers: not independently verified.
- Cloudflare deployment authentication: not configured.
- Long-lived credentials: none created or stored by this change.
- Production deployment, runner activation, DNS changes, and secret mutations: not performed.

## Authentication architecture

1. GitHub Actions is the CI workload identity issuer.
2. A workflow requests a short-lived OIDC JWT with a dedicated audience.
3. A cloud provider validates the GitHub issuer, audience, repository, branch, workflow, and protected environment claims.
4. The provider exchanges the JWT for short-lived, least-privilege credentials.
5. CI uses those credentials only for the explicitly authorized resource and environment.

Do not use personal access tokens, personal cloud keys, service-account JSON keys, or shared credentials as the default CI identity. Do not print, upload, cache, or persist raw OIDC tokens or exchanged access tokens.

## Included preflight

Workflow: `.github/workflows/ci-oidc-preflight.yml`

- Manual `workflow_dispatch` only.
- `contents: read` and `id-token: write` only.
- Requests a GitHub OIDC token with audience `lingo-ci-preflight`.
- Validates issuer, audience, repository, and event claims.
- Prints only an allowlisted set of non-secret claims.
- Does not contact Firebase, Google Cloud, Cloudflare, or any deployment API.
- Does not create secrets, change repository settings, activate G02, or deploy.

This proves GitHub's OIDC token issuance and claim shape only. It does not prove an external provider trusts the identity, nor that application CI jobs can start reliably.

## Google Cloud / Firebase federation — required setup after project verification

Use Google Cloud Workload Identity Federation (WIF), not a downloaded service-account key.

Before configuring the provider, an authorized project administrator must verify and supply:
- Canonical Google Cloud project ID and project number.
- Workload Identity Pool ID and OIDC Provider ID (or approval to create dedicated CI-only resources).
- Dedicated service account identity.
- Exact resource scope needed by each workflow.
- Protected GitHub environment name and approved deployment branch.

Configure the provider with:
- Issuer: `https://token.actions.githubusercontent.com`
- Audience: the exact provider resource audience.
- Attribute mapping for repository, repository owner, ref, workflow, and environment claims.
- Attribute condition restricted to `thelingolegacy-blip/TheLingoLegacy`, the approved branch, the exact workflow path, and the protected environment for deployment.
- A dedicated service account with only the required Firebase/Google Cloud permissions; separate read/test and deploy identities.
- No project-wide Editor/Owner role and no service-account key creation.

Do not bind the Firebase production service account until the actual project, Hosting target, Firestore rules, and product data boundaries have been verified. Use a non-production project for initial integration tests.

## Cloudflare

Cloudflare deployment authentication currently requires a narrowly scoped API token unless the account supports an approved federation mechanism. If a token is required:
- Create it in Cloudflare's dashboard under an authorized account owner.
- Scope it to the exact zone/account and only the deployment permissions required.
- Store it as a GitHub Environment secret, never in source, workflow output, artifacts, or chat.
- Use a separate token per environment and rotate/revoke it through the owner-controlled process.
- Keep production deployment behind a protected GitHub Environment with required reviewers.

No Cloudflare token is requested or created by this PR.

## GitHub repository controls — owner action

After review and merge of this workflow:
1. Confirm Actions are enabled and GitHub-hosted runners can instantiate jobs.
2. Create protected environments such as `ci-staging` and `production`; require reviewers for production.
3. Restrict production deployment branches to the approved release branch.
4. Require pull-request review, status checks, and no force pushes on protected branches.
5. Keep workflow permissions read-only by default; grant `id-token: write` only to jobs that exchange OIDC credentials.
6. Do not enable or register G02 as part of this work.

## Acceptance gates

- [ ] Workflow exists on default branch and can be manually dispatched.
- [ ] GitHub-hosted job is instantiated and completes.
- [ ] OIDC preflight validates expected issuer, audience, repository, and event.
- [ ] No raw token appears in logs, summaries, artifacts, or repository files.
- [ ] Provider federation trust is constrained to repository + approved ref + exact workflow + environment.
- [ ] Non-production authentication succeeds with a least-privilege identity.
- [ ] Negative tests reject an unapproved repository, branch, workflow, and audience.
- [ ] Production environment approval and deployment permissions are independently verified.
- [ ] No production release occurs without separate release acceptance.

## Important limitation

A source change cannot restore GitHub Actions service-side job startup, configure repository/environment secrets or protection settings, or create cloud-side federation resources without the relevant administrative access. The preflight must be merged through the normal review process and run on GitHub before any successful authentication claim is made.
