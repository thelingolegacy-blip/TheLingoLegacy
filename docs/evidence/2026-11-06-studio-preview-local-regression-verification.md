# Studio Preview — Local Regression Verification — 2026-11-06

## Scope

Independent local execution of the exact staging Worker source and routing regression test from PR #473. This supplements, but does not replace, GitHub-hosted CI or the existing Cloudflare Browser Rendering evidence.

- Repository: `thelingolegacy-blip/TheLingoLegacy`
- PR: #473 — `recovery/studio-preview-static-assets-2026-11-06`
- Environment: isolated local test mirror
- Production mutation: none
- Cloudflare DNS/routes/Worker changes: none
- AppDeploy changes: none
- Budget consumed: $0

## Source identity

- Worker file: `cloudflare/workers/lingo-studio-control-center-staging.js`
- GitHub blob SHA: `4a1edeb315e6810cc6ad59158c79e79bacccd855`
- Local SHA-256: `908f592c4c572ba27d470fd0de729919ab9c54650449e7d286b5e475ad001011`
- This SHA-256 matches the source digest recorded in `docs/evidence/2026-11-06-studio-preview-final-probes.md`.
- Regression test: `scripts/tests/studio-preview-routing.test.mjs`
- GitHub blob SHA: `578ab4639964f439bae6ac58c193107dd3852b6c`
- Local SHA-256: `14d1118364122001a3161cb57b2ee0d0bb93d1e3005ad0bf98185260e6b82ad2`

## Execution

Runtime: Node.js v22.16.0

Command executed from the isolated mirror:

```bash
node scripts/tests/studio-preview-routing.test.mjs
```

Result: **PASS**

- `STUDIO_PREVIEW_ROOT_STATIC_ASSETS=PASS`
- `STUDIO_PREVIEW_STATIC_DATA_ALLOWLIST=PASS`
- `STUDIO_PREVIEW_PROTECTED_PATHS=PASS`
- `STUDIO_PREVIEW_REDIRECT_BLOCK=PASS`
- `STUDIO_PREVIEW_GET_HEAD_ONLY=PASS`

The test stubs upstream fetches. It validates routing, allowlist, header stripping, redirect rejection, protected-path denial and read-only method enforcement. It does not itself prove live origin availability.

## Cloudflare deployment correlation

Read-only Cloudflare API inventory independently reported:

- Worker: `lingo-studio-control-center-staging`
- Version: `6`
- Version ID: `e142ffd0-8e76-495d-a9f0-e6a3c9ef3558`
- Deployment ID: `a61fd6e1-65b8-47e1-9cd0-a04f1b307669`
- Allocation: `100%`
- Custom domain: `studio-preview.thelingolegacy.com`, enabled

The Worker content endpoint returned the same source text as the branch Worker file. The pre-existing Browser Rendering evidence is recorded separately in `docs/evidence/2026-11-06-studio-preview-final-probes.md`.

## CI status and limitations

GitHub Actions attempts associated with PR #473 were startup failures before job creation:

- `42158989915` — `Crimson Smoke UI — static validation`
- `42158991025` — `G02 Runner Image Build (no publish)`
- `42158988675` — `Lingo Legacy Static CI`

The Jobs API returned zero jobs and the Artifacts API returned zero artifacts for each checked run. Therefore this local PASS is not GitHub CI acceptance, G02 acceptance, independent release acceptance, or production authorization.

## Disposition

- Local routing regression: **PASS**
- Staging Worker deployment inventory: **VERIFIED**
- Existing Browser Rendering evidence: **RECORDED IN SEPARATE EVIDENCE FILE**
- GitHub Actions CI: **BLOCKED — startup failure / no jobs**
- Full mobile/responsive and independent security review: **PENDING**
- PR #473: **DRAFT / UNMERGED**
- Production: **UNCHANGED / PROTECTED**
