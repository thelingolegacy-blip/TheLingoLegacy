# LINGO LEGACY Sovereign VSM — Phase 0

Local-first release control plane in the canonical repository. This is additive: existing production Worker, assets, worlds and site code remain untouched.

## Current Phase 0 scope

- Dockerized Node.js control API and dashboard.
- Persistent local release registry and append-only audit events.
- Release Package JSON Schema.
- Read-only mount of the existing repository at `/workspace`.
- Public health probes against the configured base URL.
- Fail-closed gate defaults.
- Owner-token protection for state-changing API operations.
- Production promotion endpoint is intentionally not implemented.

## Boot

1. Copy `.env.example` to `.env`.
2. Replace `VSM_OWNER_TOKEN` with a unique random secret of at least 32 characters.
3. From the repository root run:

```sh
docker compose --env-file vsm/.env -f vsm/docker-compose.yml up --build -d
```

4. Open http://127.0.0.1:8787.

Or use the launcher: `sh vsm/lingo-vsm up`. Other commands: `status`, `logs`, `dispatch "Title" COMMIT_SHA [BRANCH] [TARGET]`, `probe RELEASE_ID`, and `accept RELEASE_ID`.

The dashboard currently creates draft release packages. Owner gate attestations and acceptance use the bearer token at the API layer. The local API is loopback-bound by Compose; do not expose it publicly.

## API

- `GET /api/health`
- `GET /api/centers`
- `GET /api/releases`
- `POST /api/releases` — create draft package.
- `POST /api/releases/:id/probe` — run configured public probes.
- `POST /api/releases/:id/gates/:gate` — owner-token protected attestation for `g02`, `security`, or `static`; requires decision, evidence reference and rationale.
- `POST /api/releases/:id/accept` — owner-token protected; refuses unless every required gate is PASS.
- `GET /preview/` — serves the existing repository static files from the read-only mount.

## Safety invariants

- No production deployment, DNS change, route mutation, secret rotation or data migration.
- No production promotion API exists in Phase 0.
- G02, security and static gates start UNKNOWN; runtime only passes after probe evidence.
- Acceptance is impossible unless all required gates explicitly PASS.
- The VSM data volume is separate from the source repository.
- API port is bound to host loopback only by Compose.
- Do not expose this service to a public interface or reverse proxy.
- The probe runner checks public HTTP endpoints; a green probe is not proof of full product or backend functionality.

## Phase 0 exit criteria

- Docker image builds and healthcheck passes.
- Dashboard loads on localhost.
- Existing site can be viewed via `/preview/`.
- Draft package can be created and persisted.
- Probe results are timestamped and attached to a package.
- Acceptance refuses while any gate is UNKNOWN/FAIL/HOLD.

## Roadmap

Phase 1: real local Worker emulator, static bundle preview, CLI, richer evidence browser and local G02 authority review.

Phase 2: center adapters, SAAAE policy model, staging-only Firebase and Cloudflare read-only inventory, reproducible test runner.

Phase 3: signed acceptance records, PR generation, staging deployment bridge and rollback evidence.

Phase 4: production bridge only after explicit separate authorization, threat model, secrets management, tested rollback and independent acceptance.
