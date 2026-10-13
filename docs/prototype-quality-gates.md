# Prototype Quality Gates

## Purpose

This repository has a Cloudflare Worker runtime plus a large static application surface. These checks create a repeatable, dependency-light baseline for the prototype without requiring the G02 self-hosted runner to be online.

## Local verification

Requires Node.js 20 or newer.

```bash
npm run check
npm test
npm run test:static
npm run test:runtime-contract
npm run test:platform-policy
# or run the full local sequence:
npm run verify
```

The checks cover JavaScript syntax, core runtime/configuration contracts, static-site integrity, documented API routes, and the Cloudflare-only execution policy. The repository contract tests use Node's built-in test runner and do not require third-party packages.

## GitHub Actions

`.github/workflows/prototype-quality.yml` uses a GitHub-hosted Ubuntu runner for pull requests to `main`, pushes to `main` and this isolated quality branch, and manual dispatch. It is intentionally read-only: repository contents permission only, checkout credentials disabled, no secrets, no Cloudflare authentication, no deployment command, and no production mutation.

This workflow is a separate diagnostic track from G02. Its success does not qualify the self-hosted runner, satisfy G02 acceptance, or authorize release promotion.

## Deployment configuration boundary

- `worker.js` remains the runtime entrypoint.
- `wrangler.jsonc` remains the Cloudflare Worker configuration.
- Because the current asset directory is the repository root, `.assetsignore` explicitly excludes the Worker source, Wrangler config, CI workflows, operational scripts, tests, and developer-only environment files from static asset publication. Keep this exclusion list aligned with any future asset-directory or build-layout change.
- This quality workflow does not deploy, alter DNS, change secrets, activate payment or wallet flows, or modify the production Worker.
- Deployment must remain a separate, explicitly authorized release operation after the full evidence chain has been satisfied.

## Evidence and acceptance

A green check is evidence only for the exact commit and job that produced it. Record the run URL, job ID, runner identity/environment, instantiated steps, logs, artifacts, and commit SHA before treating the run as independently verifiable. A missing job, empty steps, unavailable logs, or an uncorrelated status is not a pass.

Required release chain:

`SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → PASSED → AUTHORIZATION → PROMOTION`

G02 remains blocked until its own conjunctive acceptance predicate is met. Prototype quality checks must not weaken or substitute for that gate.
