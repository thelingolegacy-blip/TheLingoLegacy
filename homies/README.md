# Homies — isolated implementation

Status: **IMPLEMENTATION SCAFFOLD — NOT RELEASE-CERTIFIED**  
Branch: `feature/homies-design-system-grok`  
Scope: design system, PostgreSQL/PostGIS schema, Expo mobile scaffold, Grok contract, tests, and CI.

## Boundaries
- All work is isolated under `homies/`; it does not change production routes, hosting, DNS, Firebase configuration, or release policy.
- No production deployment or merge is authorized by this work.
- Grok provider credentials must remain server-side. Never ship an xAI API key to a client.
- Profile data and conversation history are private by default; sensitive context sharing requires explicit opt-in.
- LGBTQ+ identity and sexual preferences are sensitive data: collect only what is necessary and provide clear controls.
- AI replies must be clearly labeled Grok and are not a safety guarantee.

## Main artifacts
- `database/001_initial_schema.sql`: initial PostgreSQL/PostGIS schema, constraints, geospatial indexes, separate Grok history, and webhook idempotency ledger.
- `design-system/tokens.css`: color, type, radius, elevation, and motion tokens.
- `design-system/icons.tsx`: typed SVG icon primitives.
- `design-system/components.tsx`: button and five-tab navigation primitives.
- `grok/CONTRACT.md`: server-side API, streaming, privacy, safety, and acceptance contract.
- `mobile/`: Expo Router + TypeScript + NativeWind mobile app shell.
- `tests/design-system.test.mjs`: dependency-free static contract tests.
- `.github/workflows/homies-validation.yml`: path-scoped validation with read-only permissions.
- `IMPLEMENTATION-STATUS.md`: current status and explicit verification gaps.

## Mobile app
See [mobile/README.md](mobile/README.md). The scaffold includes Explore, Map, Chat, Circles, Profile, Grok, paywall, conversation, and profile routes. API, real-time chat, location provider, Grok streaming, authentication, and billing are not connected. Preview controls that would create real external side effects remain disabled.

## Database migration safety
The SQL file is a versioned starting migration, not evidence of a deployed database. It has not been run against a PostgreSQL/PostGIS instance. Before shared or production use, validate the exact versions in a disposable database, review privileges/backup/rollback/locking/query plans, and enforce age eligibility, authorization, consent, retention, deletion, and row-level access in trusted application layers. Use a least-privilege runtime database role.

The boost-expiry index intentionally avoids a time-dependent predicate because PostgreSQL does not permit volatile `NOW()` predicates in index definitions.

## Validation
Run the static design contract tests from the repository root:

```sh
node --test homies/tests/design-system.test.mjs
```

The Expo app must also have dependencies installed, a reproducible lockfile, passing TypeScript and platform bundling checks, and device/simulator evidence before build readiness can be claimed. These checks have not been performed as part of this scaffold update.

## Runner and release diagnostics
For G02, use the canonical runbooks and existing tools:
- `docs/G02-ACCEPTANCE-CONTRACT.md`
- `docs/G02-SELF-HOSTED-RUNNER-RECOVERY.md`
- `ops/g02/diagnose-actions-dispatch.sh`
- `ops/g02/runner-control.sh status` on the authorized runner host

Homies CI does not satisfy G02. The latest observed workflow attempt ended in `startup_failure` with zero jobs and artifacts; no passing test run is claimed. Production remains protected until all independent release gates pass.
