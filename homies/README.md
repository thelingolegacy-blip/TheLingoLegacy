# Homies — isolated implementation

Status: **IMPLEMENTATION SCAFFOLD — NOT RELEASE-CERTIFIED**  
Branch: `feature/homies-design-system-grok`  
Scope: design tokens, icon primitives, buttons, navigation, Grok service contract, PostgreSQL/PostGIS schema, tests, and CI.

## Boundaries
- This package is isolated under `homies/`; it does not change production routes, hosting, DNS, Firebase configuration, or release policy.
- No production deployment or merge is authorized by this work.
- Grok's provider credentials must be stored server-side. Never ship an xAI API key to a client.
- User profile data and conversation history are private by default. Deletion must remove the app's stored history according to the documented retention contract.
- LGBTQ+ identity and sexual preferences are sensitive data: collect only what is necessary, provide clear controls, and never use sensitive data for unrelated model training.
- All AI replies must be clearly labeled **Grok**, and AI output is advisory rather than a safety guarantee.

## Files
- `database/001_initial_schema.sql`: initial PostgreSQL schema with PostGIS, validation constraints, indexes, timestamps, safety, subscription, webhook-idempotency, and separate Grok-history tables.
- `design-system/tokens.css`: color, type, radius, elevation, and motion tokens.
- `design-system/icons.tsx`: typed SVG icon primitives with outline/filled states.
- `design-system/components.tsx`: accessible button and five-tab navigation primitives.
- `grok/CONTRACT.md`: server-side API, streaming, privacy, safety, and acceptance contract.
- `tests/design-system.test.mjs`: dependency-free static contract tests.
- `.github/workflows/homies-validation.yml`: path-scoped validation with read-only permissions.

## Database migration safety
The SQL file is a versioned starting migration, not evidence of a deployed database. It has **not** been run against a PostgreSQL/PostGIS instance in this work. Before any shared or production database use:
1. Test against the exact supported PostgreSQL/PostGIS versions in a disposable database.
2. Review extension privileges, backup/restore, locking, migration rollback strategy, and query plans.
3. Add repository-specific integration tests and confirm application ORM/driver assumptions.
4. Enforce adult eligibility, authorization, consent, retention, deletion, and row-level access in trusted application/service layers; schema checks alone do not establish those controls.
5. Use managed secrets and a least-privilege runtime database role; do not connect as the schema owner.

The schema includes an index on `boost_expires_at` that deliberately avoids a time-dependent predicate. PostgreSQL does not permit volatile `NOW()` predicates in index definitions.

## Local validation
Run from the repository root:

```sh
node --test homies/tests/design-system.test.mjs
```

This repository snapshot does not establish a Homies-specific React Native/Next.js build target or dependency manifest. The TSX files are implementation primitives and must be integrated into the actual app package before claiming a framework build or device-level acceptance.

## Runner and release diagnostics
For G02, use the canonical runbook and existing tools rather than creating duplicate runner registrations:
- `docs/G02-ACCEPTANCE-CONTRACT.md`
- `docs/G02-SELF-HOSTED-RUNNER-RECOVERY.md`
- `ops/g02/diagnose-actions-dispatch.sh`
- `ops/g02/runner-control.sh status` (on the authorized runner host)

Homies validation uses GitHub-hosted `ubuntu-latest` only; it does not depend on the blocked canonical self-hosted runner. A successful Homies test does **not** imply G02 passes. Production remains protected until all independent release gates pass.
