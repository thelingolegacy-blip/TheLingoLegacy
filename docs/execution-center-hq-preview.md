# LINGOlegacy Execution Center HQ — Preview

**Disposition:** isolated Cloudflare Pages preview; production remains PROTECTED HOLD.  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Original feature branch:** `feat/execution-center-hq-preview-2026-11-19`  
**Read-only repair branch:** `fix/execution-center-evidence-freshness-2026-11-21`.

## Implementation
- `studio-sites/execution-center/index.html` is the canonical UI source for the A01–A06 acceptance gates.
- `studio-sites/execution-center/functions/api/snapshot.js` is a read-only Pages Function. It reads public GitHub REST data and public HTTPS health endpoints only.
- Cloudflare Pages project: `lingo-execution-center-preview`.
- Preview branch restricted to the original feature branch; project path filter limited to `studio-sites/execution-center/**`.
- Production deployments are explicitly disabled for this Pages project.
- Evidence references and reviewer notes are browser-local drafts and can be exported as JSON. They are not an authoritative evidence store.
- Gate states are read-only and initialized from the reconciled baseline. User-entered references cannot change a gate to PASS.

## Snapshot correctness repairs
- Replaced the hardcoded PR number list with the repository's open-pull-request API.
- The API reads at most three pages of 100 open PRs each and reports the page count, observed count, row count, and whether the inventory was truncated.
- The dashboard renders at most 30 PR rows to bound the page.
- Every public health probe returns an explicit result. Network exceptions remain visible with an error state rather than being filtered out.
- GitHub source failures (main commit, Actions runs, open PR inventory, Firebase config and project alias) are converted into explicit unavailable/error rows in the probe register. They are not represented as empty successful data.
- Source and probe errors remain observational only; they do not change gate status.

## Security and release boundaries
- The preview project has no custom domain; it uses an isolated `pages.dev` hostname.
- Public snapshot reads use no authenticated token. No GitHub write token, Cloudflare API token, Firebase credential or other secret is embedded.
- No production routes, DNS, existing production Workers, Firebase resources, secrets, payment settings, runner settings or production deployments are modified.
- Firebase Hosting remains blocked while main config points `hosting.public` at the repository root. Do not publish Firebase Hosting from main until the generated-output allowlist and dedicated staging identity are accepted.
- The dashboard is noindex and does not authorize deployment. Executive release authorization remains a separate governance action.

## Acceptance still required
1. Validate the Pages Function syntax and unit-test response normalization, pagination bounds, partial-source failures, and probe failures.
2. Rebuild and publish only the isolated Pages preview under its existing project restrictions; this requires separate deployment authorization and is not performed by this repair.
3. Verify the preview URL and `/api/snapshot` endpoint in a real browser; inspect console/network/CSP behavior.
4. Test on physical iOS/Android and desktop browsers.
5. Independent security and release acceptance remain required before any further promotion.

## Validation boundary
The repair is source-only. GitHub file readback can verify the committed text, but does not establish JavaScript syntax, Pages Function runtime behavior, API rate-limit behavior, browser behavior, or physical-device acceptance.
