# Flagship exact-root recovery package

## Live control-plane evidence

Read-only Cloudflare inspection on 2026-10-29 found the exact route `thelingolegacy.com/` assigned to `lingo-flagship-root`, while `thelingolegacy.com/*` and `www.thelingolegacy.com/*` are assigned to `thelingolegacyv-5`.

The active exact-root Worker deployment was reported as version `658acd1a-997b-45cd-b8fc-e59c59b26b45` at 100% allocation. The corresponding HTML was captured at `live-snapshot-2026-10-29.html` as a source-recovery artifact. It contains no detected credential patterns during the capture preflight.

## Source and preview boundaries

- `live-snapshot-2026-10-29.html` is an evidence snapshot of the currently deployed root page. It is not itself the canonical source for future releases.
- The reviewed branch's root `index.html` is the source-controlled unified-flagship candidate.
- `preview-worker.js` imports the repository's existing `worker.js` runtime.
- `wrangler.flagship-preview.toml` creates a separate Worker name, uses `workers_dev = true`, and declares no custom-domain routes. Its asset directory follows the existing `.assetsignore` publication boundary.

## Promotion boundary

Do not deploy this preview config against the production Worker name, add production routes, change DNS, or promote the candidate until static tests, preview build, browser navigation/accessibility checks, live source parity, G02 runner execution evidence, and explicit release authorization pass.
