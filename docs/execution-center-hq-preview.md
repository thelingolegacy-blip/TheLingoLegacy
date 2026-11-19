# LINGOlegacy Execution Center HQ — Preview

**Disposition:** isolated preview candidate; production remains PROTECTED HOLD.  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch:** `feat/execution-center-hq-preview-2026-11-19`  
**UI source commit:** `5e8b7c8c53a907a2bba3465c4c1c81a6259971ad`

## Implementation
- `studio-sites/execution-center/index.html` is the canonical UI source for the A01–A06 acceptance gates.
- `cloudflare/execution-center-preview-worker.js` is a separate, no-route Cloudflare Workers preview entrypoint.
- The preview Worker serves the immutable HTML source revision above and exposes `GET /api/snapshot` plus `GET /healthz`.
- Snapshot reads use public GitHub REST endpoints and public HTTPS GET probes only.
- Evidence references and reviewer notes are browser-local drafts and can be exported as JSON. They are not an authoritative evidence store.
- Gate states are read-only and initialized from the reconciled baseline. User-entered references cannot change a gate to PASS.

## Security and release boundaries
- Worker accepts GET and HEAD only. Other methods return 405.
- No GitHub write token, Cloudflare API token, Firebase credential, or other secret is embedded.
- No production routes, DNS, existing Workers, Firebase resources, secrets, payment settings, runner settings, or production deployments are modified.
- The preview must be deployed only to a unique Workers.dev hostname with no custom routes.
- The dashboard is noindex and must not be presented as production acceptance.
- Firebase Hosting remains blocked while main config points `hosting.public` at the repository root. Do not publish Firebase Hosting from main until the generated-output allowlist and dedicated staging identity are accepted.

## Acceptance still required
1. Candidate PR preview workflow must execute and produce an artifact for the exact PR SHA.
2. Deploy the separate Worker with Workers.dev only; verify no routes are attached.
3. Test the UI and snapshot endpoint in a real browser; inspect console/network/CSP behavior.
4. Test on physical iOS/Android and desktop browsers.
5. Independent review and security acceptance remain required before any further promotion.
