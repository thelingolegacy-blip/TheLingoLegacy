# LINGOlegacy Platform Operations Preview

This is a static, read-only staging control surface. It does not administer production.

## Published directory
Render publishes only `render-staging/`. The repository root is never published.

## Platform resources
- Render static preview: `lingo-legacy-platform-ops-preview` (Free static-site plan, manual deployment).
- Cloudflare staging Worker: `lingo-world-engine-staging` (workers.dev enabled; GET-only public registry).
- Cloudflare D1: `world-engine-db` schema installed separately from the production user database.
- Cloudflare KV: existing `STUDIO_KV` namespace bound only to the staging Worker.

## Safety
- No production Worker route or DNS record is attached to the staging Worker.
- No write endpoints exist in the staging Worker.
- Only published world records are returned; staged and internal knowledge-base records remain private.
- Firebase Hosting publishes only `build/web`, never the repository root.
- AI, payments, SMS and real-money wagering remain disabled.
- Render auto-deploy is disabled; deployments are manually triggered.

## Rebuild
The Render service is configured through the Render account API to publish `render-staging/` with no compilation step. The deployment can be reproduced from this repository branch.
