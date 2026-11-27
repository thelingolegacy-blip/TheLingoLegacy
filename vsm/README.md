# LINGO LEGACY Sovereign VSM — Phase 0 + Phase 1 foundations

Local-first release control plane in the canonical repository. This is additive: existing production Worker, assets, worlds and site code remain untouched.

## Implemented in source

- Dockerized Node.js control API and dashboard.
- Persistent local release registry, SHA-256 content-integrity evidence store and hash-chained audit events with verification endpoint.
- Release Package JSON Schema and fail-closed gate defaults.
- Read-only mount of the existing repository at `/workspace`.
- Public HTTP health probes against the configured base URL.
- Owner-token protection for release creation, runtime probes, gate attestations, Sonic Boom configuration, bot invocation and release acceptance.
- Local LINGO ID owner principal (`lingo://id/<handle>`) with an Ed25519 keypair.
- SAAAE starter policy with default-deny role/capability mapping and explicit denials for production mutation.
- Signed local release-acceptance envelopes; owner ID is stamped on packages and gate attestations.
- Self-hosted Gitea Forge service in Docker Compose, with loopback-only web and SSH ports on a dedicated internal-only Docker network.
- Sonic Boom lane configuration and in-process priority/concurrency scheduler module; disabled by default.
- Read-only bot registry with Release, Probe, Studio and Math bot role/capability declarations.
- First deterministic bot worker with task allowlists, routed through the Sonic Boom scheduler and owner-authenticated API.
- CPU-based mathematical validation engine for probability vectors and discrete virtual game-balance distributions; no cash wagering or cash-out model.
- Production promotion endpoint intentionally absent.

**Implementation boundary:** LINGO ID currently bootstraps one local Owner principal and uses the existing owner bearer token for API authentication. It is not yet a full interactive session/federation system or multi-operator IAM. The Ed25519 private key is stored in the private local VSM data volume with restrictive file permissions; encrypted backup/key rotation is still required before remote or multi-host operation. Gitea is a separate private Git service; Forge SSO, GitHub/GitLab API compatibility, mirroring and protected-branch policy integration are not yet complete. The bot worker executes a small allowlist of deterministic local tasks; no model host, arbitrary tool execution, or autonomous privileged action is enabled. Sonic Boom's queue module is implemented and configurable, but is not yet wired into every center's job execution.

## Boot

1. Run `cp vsm/.env.example vsm/.env` from the repository root.
2. Replace `VSM_OWNER_TOKEN` with a unique random secret of at least 32 characters. Set `LINGO_ID_HANDLE` to the desired 2–32 character owner handle before first boot; it becomes the local root identity.
3. From the repository root run:

```sh
docker compose --env-file vsm/.env -f vsm/docker-compose.yml up --build -d
```

4. Open:
   - Mission Control: http://127.0.0.1:8787
   - Existing repository static preview: http://127.0.0.1:8788
   - LINGO Forge (Gitea first-run setup): http://127.0.0.1:3000
   - Forge SSH: 127.0.0.1:2222

Gitea registration is disabled and repository viewing requires sign-in. Complete the first-run setup locally and create the initial Forge administrator. Do not reuse the VSM owner token as the Forge password. Keep all credentials in a password manager.

Or use the launcher: `sh vsm/lingo-vsm up`. Other commands: `status`, `logs`, `dispatch "Title" COMMIT_SHA [BRANCH] [TARGET]`, `probe RELEASE_ID`, `attest RELEASE_ID GATE PASS|FAIL|HOLD EVIDENCE_REF RATIONALE`, and `accept RELEASE_ID`.

The local API is loopback-bound by Compose; do not expose it publicly. Mission Control displays LINGO ID, Sonic Boom lane state, bot registry, SAAAE policy and audit-chain verification. Owner controls use a bearer token held in browser session storage for the current tab session.

## API

- `GET /api/health`
- `GET /api/identity` — public owner principal and local-first identity status.
- `GET /api/session` — validates the Owner token and returns the local session capability set.
- `GET /api/security/policy` — read-only SAAAE role/capability policy.
- Math Bot allowlist includes probability validation and virtual outcome distribution analysis; output is simulation-only.
- `GET /api/sonic-boom` — lane state.
- `POST /api/sonic-boom` — owner-token protected; accepts `enabled`, optional `owner_priority`, and `max_parallel_jobs` (1–16).
- `GET /api/bots` — declared bot registry.
- `POST /api/bots/run` — owner-token protected, allowlisted deterministic tasks; proposal/validation only, no model inference or privileged mutation.
- `GET /api/audit/verify` — verifies the append-only audit hash chain.
- `GET /api/evidence/:id` — owner-token protected evidence retrieval with SHA-256 integrity verification.
- `GET /api/centers`
- `GET /api/releases`
- `POST /api/releases` — Owner-token protected draft-package creation.
- `POST /api/releases/:id/probe` — Owner-token protected public probes; results are persisted as hashed evidence records.
- Gate attestations are also persisted as hashed, release-scoped evidence records.
- `POST /api/releases/:id/gates/:gate` — owner-token protected attestation for `g02`, `security`, or `static`.
- `POST /api/releases/:id/accept` — owner-token protected; refuses unless every required gate is PASS and signs the acceptance payload with the local Owner Ed25519 key.
- Static preview: `http://127.0.0.1:8788/` serves existing repository files from the read-only mount. The Worker runtime is not emulated.

## Safety invariants

- No production deployment, DNS change, route mutation, secret rotation or data migration.
- No production promotion API exists.
- G02, security and static gates start UNKNOWN; runtime only passes after probe evidence.
- Acceptance is impossible unless all required gates explicitly PASS.
- Local acceptance is not production authorization or a deployment.
- The VSM data volume is separate from the source repository.
- API, Forge web and Forge SSH ports are bound to host loopback only by Compose.
- The probe runner checks public HTTP endpoints; a green probe is not proof of full product or backend functionality.
- Sonic Boom changes scheduling priority/concurrency only; it never bypasses security, G02, evidence or acceptance gates.

The Docker image build automatically runs JavaScript syntax checks and the Node test suite before producing the runtime image.

## Local verification commands

From the repository root, run `cd vsm && npm run check && npm test`. To validate the Compose model without starting services, run `docker compose --env-file vsm/.env -f vsm/docker-compose.yml config --quiet`. These commands have not yet been executed in the hosted repository workspace.

## Verification status

Phase 1 source files and configuration are committed on the feature branch. Mission Control displays LINGO ID, lane state, SAAAE policy and audit-chain verification. Docker image build, Compose validation, live Gitea bootstrap, Node test execution, browser QA and end-to-end release acceptance have **not** yet been executed in a Docker runtime. Do not mark the VSM operational until those checks pass and evidence is attached.

## Next implementation waves

- Phase 1 completion: execute Node tests and Docker/Compose checks; connect the scheduler to an audited job API; wire dashboard identity/lane status; validate Forge setup and backup.
- Phase 2: full SAAAE policy enforcement, multi-operator LINGO ID sessions, Forge mirroring/protected branches, local Worker-compatible runtime, mathematical validation gates, and studio asset registry.
- Phase 3: local model host, constrained bot workers, art/audio/math/motion pipelines, evidence-native studio dispatch, and staging-only promotion bridge.
- Phase 4: encrypted backup/recovery, observability/cost guardrails, threat model, tested rollback and independently accepted production bridge. Production authority remains separately gated.
