# LINGO Asset Registry API

A fail-closed Cloudflare Worker + D1 metadata registry. The browser interface is served separately from \`studio-sites/asset-registry/\`; protect both the page and \`/api/*\` with the same Cloudflare Access application.

## Capabilities

- Cloudflare Access JWT signature, issuer, audience and lifetime validation.
- Server-side role mapping: admin, reviewer, creator and read-only viewer.
- Ownership enforcement; clients cannot nominate an owner.
- Versioned source metadata with mandatory SHA-256 and immutable version rows.
- Append-only rights evidence, review decisions, publication history and audit events.
- Segregation of duties: owners cannot approve their own assets.
- Publication requires rights evidence plus current rights, quality and brand approvals, with at least two distinct reviewers.
- Rollback creates a new publication-history event and points the asset to a prior published version; it never deletes version history.

## Configure a staging environment

1. Create a **new staging-only D1 database**. Do not reuse the empty production databases.
2. Apply \`migrations/0001_asset_registry.sql\` to that staging database.
3. Copy \`wrangler.toml.example\` to a private deployment configuration and insert the staging database ID, Cloudflare Access team domain and Access application audience.
4. Create a Cloudflare Access self-hosted application for the registry page and API path. Require identity-provider authentication and restrict access to the approved email population.
5. Configure encrypted Worker secrets \`REGISTRY_ADMINS\`, \`REGISTRY_REVIEWERS\` and \`REGISTRY_CREATORS\` as comma-separated verified email addresses. Keep the lists disjoint where practical. Do not put identities or credentials in Git.
6. Deploy only to a staging Worker name and a non-production hostname. Keep the production route unattached.
7. Verify unauthenticated requests return 401, unknown identities receive viewer access only, owners cannot approve their own assets, and publish fails closed when any gate is missing.

## API

- \`GET /api/me\`
- \`GET /api/assets?q=...\`
- \`POST /api/assets\`
- \`GET /api/assets/:assetId\`
- \`POST /api/assets/:assetId/versions\`
- \`POST /api/assets/:assetId/rights\`
- \`POST /api/assets/:assetId/decisions\`
- \`POST /api/assets/:assetId/publish\`
- \`POST /api/assets/:assetId/rollback\`
- \`GET /api/audit\` (reviewer/admin)

Version rows, rights evidence, review decisions, publication history and audit events are append-only at the database layer. Asset metadata remains mutable only through the API's owner/admin authorization checks.

## Current limitations / explicit non-claims

- This MVP stores asset metadata and immutable source references; it does not upload binary files. R2 is not enabled on the current Cloudflare account.
- It does not create legal rights. A reviewer must inspect the referenced evidence.
- It does not activate a production Worker, DNS route, public bucket, payment flow or automated media publishing.
- D1 staging database, Access application, protected role allowlists, staging deployment, live probes and independent security review must exist before this can be called operational.
- Cloudflare Access protects the UI and API at the edge; the Worker independently verifies the signed JWT and role allowlists. Configure both layers.
