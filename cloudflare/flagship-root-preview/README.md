# LINGO Flagship Site Preview

- Worker: `lingo-flagship-site-preview`
- Environment: public `workers.dev` preview only
- Source branch: `site/flagship-navigation-and-destination-repair-2026-11-06`
- Source commit: `3d5baea77b3cd9d41bfe817ac3c4aad31e0794fc`
- Production routes: none
- Custom domains: none
- Methods: GET and HEAD only; all writes return 405
- Upstream: fixed read-only proxy to `https://thelingolegacy.com` for existing static/game assets
- Embedded from this branch: flagship homepage, universe portal and destination detail page

The preview is intentionally noindex and read-only. It does not expose production mutations, accept payments, create accounts, activate AI provider calls, or alter production routing. All paths other than the embedded homepage, portal and destination page are fetched from the canonical site using a fixed upstream hostname.

Deploy only with this dedicated preview configuration. Do not add production routes or custom domains to this Worker.
