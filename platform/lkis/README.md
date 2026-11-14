# LKIS Runtime — repository-backed pilot

This is an isolated Node.js 20+ pilot runtime for the LINGO Knowledge & Intelligence System. It is not wired into Cloudflare, Firebase, public routing, or production deployments.

## Capabilities

- Validates incoming records against the repository-owned JSON Schema contract (the structural keywords used by the current schema).
- Stores records in a local JSON file with atomic replacement, restrictive file permissions, an initial revision number, and SHA-256 content digest.
- Exposes authenticated record search and a retrieval-only assistant context endpoint.
- Enforces classification ceilings for reader, confidential-reader, reviewer, and admin tokens.
- Allows only admin-authenticated creation of proposed records. It cannot publish or certify records.
- Exposes liveness and storage-readiness endpoints.

## Run locally

    cd platform/lkis
    npm test
    npm run check
    LKIS_READ_TOKEN='use-a-long-random-value' LKIS_ADMIN_TOKEN='use-a-different-random-value' npm start

The server binds to loopback (127.0.0.1) by default. Set PORT to change the local port and LKIS_DATA_FILE to select the data file. Do not use production credentials. Keep the data directory private and back it up before maintenance.

## API

- GET /healthz — unauthenticated liveness only.
- GET /readyz — storage-readiness check.
- GET /api/v1/records?q=...&domain=...&status=... — authenticated, classification-filtered search.
- GET /api/v1/assistant/context?q=... — retrieval-only context from verified records, with source/evidence references. It does not call an LLM or generate answers.
- POST /api/v1/records — admin-only creation; record must conform to schema and have status proposed.

Use Authorization: Bearer token. The reader token sees public/internal records; confidential-reader sees through confidential; admin sees all classifications and can create proposed records. A separate reviewer token can verify a proposed record only when the record contains evidence references. Set LKIS_REVIEW_TOKEN and LKIS_REVIEWER_ID to distinct reviewer credentials/identity. Verification appends a review-history entry and increments the revision; it is a knowledge-record decision, not release authorization.

## Explicit limitations

- Local file storage is single-instance pilot storage, not a multi-node database.
- No cloud ingestion connectors, vector index, LLM provider, dashboard, review workflow, audit export, backup scheduler, or multi-user identity integration is included.
- Schema validation covers the keywords present in the current knowledge schema; it is not a general-purpose JSON Schema implementation.
- The runtime is not a production service and must not be exposed publicly.
- No data is seeded: records must come from attributable sources and pass review before their status can become verified.

## Safety

No production routes, DNS, Cloudflare Workers, Firebase resources, secrets, payment systems, GitHub runners, or last-known-good release state are changed by this package. Production promotion and release acceptance remain separate, human-controlled gates.
