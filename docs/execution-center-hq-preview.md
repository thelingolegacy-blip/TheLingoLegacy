# LINGOlegacy Execution Center HQ — Preview

**Disposition:** isolated Cloudflare Pages preview; production remains PROTECTED HOLD.  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch:** `feat/execution-center-hq-preview-2026-11-19`.

## Implementation
- `studio-sites/execution-center/index.html` is the canonical UI source for the A01–A06 acceptance gates.
- `studio-sites/execution-center/functions/api/snapshot.js` is a read-only Pages Function. It reads public GitHub REST data and public HTTPS health endpoints only.
- Cloudflare Pages project: `lingo-execution-center-preview`.
- Preview deployment is limited to this branch and the `studio-sites/execution-center/**` path.
- Production deployments are explicitly disabled for this Pages project.
- Evidence references and reviewer notes are browser-local drafts and can be exported as JSON. They are not an authoritative evidence store.
- Gate states are read-only and initialized from the reconciled baseline. User-entered references cannot change a gate to PASS.

## Security and release boundaries
- The preview project has no custom domain; it uses an isolated `pages.dev` hostname.
- Public snapshot reads use no authenticated token. No GitHub write token, Cloudflare API token, Firebase credential or other secret is embedded.
- No production routes, DNS, existing production Workers, Firebase resources, secrets, payment settings, runner settings or production deployments are modified.
- Firebase Hosting remains blocked while main config points `hosting.public` at the repository root. Do not publish Firebase Hosting from main until the generated-output allowlist and dedicated staging identity are accepted.
- The dashboard is noindex and does not authorize deployment. Executive release authorization remains a separate governance action.

## Acceptance still required
1. Cloudflare Pages preview build must finish and publish its immutable deployment.
2. Verify the preview URL and `/api/snapshot` endpoint in a real browser; inspect console/network/CSP behavior.
3. Test on physical iOS/Android and desktop browsers.
4. Independent security and release acceptance remain required before any further promotion.
