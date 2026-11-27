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
- Sonic Boom lane configuration and in-process priority/concurrency scheduler module; disabled by default and fail-closed if persisted settings are invalid.
- Read-only bot registry with Release, Probe, Studio and Math bot role/capability declarations.
- First deterministic bot worker with task allowlists, routed through the Sonic Boom scheduler and owner-authenticated API.
- CPU-based mathematical validation engine for probability vectors and discrete virtual game-balance distributions; no cash wagering or cash-out model.
- Local-first Studio asset metadata registry with division, type, source URI, optional submitter-declared SHA-256 (not verified until binary ingestion), rights-status and owner-proposal fields; binary upload and publication are not enabled.
- Production promotion endpoint intentionally absent.

**Implementation boundary:** LINGO ID currently bootstraps one local Owner principal and uses the existing owner bearer token for API authentication. It is not yet a full interactive session/federation system or multi-operator IAM. The Ed25519 private key is stored in the private local VSM data volume with restrictive file permissions; encrypted backup/key rotation is still required before remote or multi-host operation. Gitea is a separate private Git service; Forge SSO, GitHub/GitLab API compatibility, mirroring and protected-branch policy integration are not yet complete. The bot worker executes a small allowlist of deterministic local tasks; no model host, arbitrary tool execution, or autonomous privileged action is enabled. Sonic Boom's queue module is implemented and configurable, but is not yet wired into every center's job execution.

## Governed run contract

`orchestration/run-contract.mjs` and `schemas/run-config.schema.json` define the initial machine-checked run policy: bounded duration (45-minute default, 90-minute absolute maximum), global tool-call cap (1,200), default estimated cost ceiling ($15), up to five uniquely identified tracks with criticality, per-track tool/cost budgets, production dry-run defaults, explicit secret-name allowlists, secret preflight, track-scoped environment construction, bounded retry decisions, and structured event redaction. The default empty/near-empty evidence-log policy is enabled for every step (8 output bytes minimum) unless a step explicitly declares `require_nonempty_log: false`; it allows three total attempts; transient infrastructure failures are limited to three retries and a four-minute retry window; authentication and other permanent failures do not retry.

**Integration boundary:** the policy layer is now connected to an experimental local parallel process runner and owner-authenticated run API. It supports up to five separate track working directories with per-track allowlisted environment injection (logical separation only; processes still share the host OS user and are not OS/container sandboxes) from the parent process, credential preflight with process-output secret-exposure abort and redacted evidence, local run-scoped events/status/summary files, 30-day local artifact pruning, bounded retry logic, estimated cost and process-launch budgets, a CPU/memory/disk preflight, optional selected-service network reachability checks for staging tracks (Firebase service-account JSON is syntax-checked; full Firebase credential exchange is not implemented), wall-clock watchdog plus orphan-process watchdog, per-step soft-timeout warning (80% of hard timeout by default) and hard timeout, explicit destructive-step authorization, idempotency declarations for mutating steps, and cooperative pause/resume/cancel with SIGTERM/SIGKILL escalation. Credentials are not read from `.env` by the run command and must be injected by the invoking CI/platform secret store. This is not yet a complete production orchestrator: there is no remote artifact upload, durable external watchdog, platform secret-store retrieval/short-lived token minting, push/email owner notifications (a local owner-outbox file is exposed by the authenticated run-status endpoint and requires human polling), automatic metering of third-party tool calls or actual spend; arbitrary code launched by a track is not constrained by an OS sandbox and can access resources available to the VSM process, or independently tested crash recovery. Production-target runs are blocked in the API and production promotion remains disabled.

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

VSM Control and Forge share the isolated internal Docker network for private service-to-service traffic. Forge web/SSH ports remain bound to host loopback only.
   - OpenNext + Wrangler Worker preview (optional profile): http://127.0.0.1:8790

Gitea registration is disabled and repository viewing requires sign-in. Complete the first-run setup locally and create the initial Forge administrator. Do not reuse the VSM owner token as the Forge password. Keep all credentials in a password manager.

Or use the launcher from the repository root: `sh vsm/lingo-vsm doctor` for prerequisites, `sh vsm/lingo-vsm verify` for local syntax/unit/API tests plus container build and Compose validation, `sh vsm/lingo-vsm up` to start the core services, and `sh vsm/lingo-vsm worker-preview` to start the optional OpenNext/Wrangler runtime. Other commands: `status`, `logs`, `dispatch "Title" COMMIT_SHA [BRANCH] [TARGET]`, `probe RELEASE_ID`, `attest RELEASE_ID GATE PASS|FAIL|HOLD EVIDENCE_REF RATIONALE`, and `accept RELEASE_ID`.

To start the real OpenNext/Cloudflare Worker-compatible local preview as well, ensure `VSM_WEB_REPO_PATH` points to the sibling `TheLingoLegacy-Web` checkout, then run `docker compose --profile worker-preview --env-file vsm/.env -f vsm/docker-compose.yml up -d`. The profile copies the Web source into a separate writable runtime volume, excludes `.env*` and `.dev.vars*`, installs the locked dependencies, builds with OpenNext and starts Wrangler Dev with an `ENVIRONMENT=staging` marker. This marker does not provision or prove staging backend bindings; validate all app endpoints and bindings before using the preview with data. It is loopback-only on port 8790; rebuild/recreate the service after source changes. This is a local Worker runtime preview, not a production deployment. It loads no local `.env*` or `.dev.vars*` files and supplies no production secrets. The staging marker alone does not guarantee that every application backend points to staging.

The local API is loopback-bound by Compose; do not expose it publicly. Mission Control displays LINGO ID, Sonic Boom lane state, bot registry, SAAAE policy and audit-chain verification. Owner controls use a bearer token held in browser session storage for the current tab session.

## API

- `GET /api/health`
- `POST /api/runs` — owner-only, starts a local/staging-target dry-run validation plan with up to five isolated process tracks; production target is rejected.
- `GET /api/runs/:run_id` — owner-only live status and completed summary.
- `POST /api/runs/:run_id/pause|resume|cancel` — owner-only whole-run controls.
- `POST /api/runs/:run_id/tracks/:track_id/pause|resume|cancel` — owner-only per-track controls, including cancellation of queued tracks.
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
- `GET /api/studio/assets` — read-only Studio asset metadata registry.
- `POST /api/studio/assets` — requires the `studio.propose` capability; records a metadata proposal and audit event. No binary upload or publication.
- `GET /api/centers`
- `GET /api/releases`
- `POST /api/releases` — Owner-token protected draft-package creation.
- `POST /api/releases/:id/probe` — Owner-token protected public probes; results are persisted as hashed evidence records.
- Gate attestations are also persisted as hashed, release-scoped evidence records.
- `POST /api/releases/:id/gates/:gate` — owner-token protected attestation for `g02`, `security`, or `static`.
- `POST /api/releases/:id/accept` — owner-token protected; refuses unless every required gate is PASS and signs the acceptance payload with the local Owner Ed25519 key.
- Static preview: `http://127.0.0.1:8788/` serves existing canonical repository files from the read-only mount.
- Worker preview: `http://127.0.0.1:8790/` runs the separate Web repository through OpenNext and Wrangler when the optional `worker-preview` profile is enabled.

## Safety invariants

- No production deployment, DNS change, route mutation, secret rotation or data migration.
- No production promotion API exists.
- G02, security and static gates start UNKNOWN; runtime only passes after probe evidence.
- Acceptance is impossible unless all required gates explicitly PASS.
- Local acceptance is not production authorization or a deployment.
- The VSM data volume is separate from the source repository.
- API, static preview, optional Worker preview, Forge web and Forge SSH ports are bound to host loopback only by Compose.
- The probe runner checks public HTTP endpoints; a green probe is not proof of full product or backend functionality.
- Sonic Boom changes scheduling priority/concurrency only; it never bypasses security, G02, evidence or acceptance gates.

The Docker image build automatically runs JavaScript syntax checks and the Node test suite before producing the runtime image.

## Local verification commands

From the repository root, run `cd vsm && npm run check && npm test`. To validate the Compose model without starting services, run `docker compose --env-file vsm/.env -f vsm/docker-compose.yml config --quiet`. These commands are configured but have not yet been executed in the hosted repository workspace. The `verify` command runs locally and builds the VSM image; it does not start services or deploy anything.

## Verification status

Phase 1 source files and configuration are committed on the feature branch. Mission Control displays LINGO ID, lane state, SAAAE policy, audit-chain verification and Studio asset metadata. An optional OpenNext/Wrangler preview profile is configured but not yet executed. Docker image build, Compose validation, live Gitea bootstrap, Node test execution, browser QA and end-to-end release acceptance have **not** yet been executed in a Docker runtime. Do not mark the VSM operational until those checks pass and evidence is attached.

## Next implementation waves

- Phase 1 completion: execute Node tests and Docker/Compose checks; connect the scheduler to an audited job API; wire dashboard identity/lane status; validate Forge setup and backup.
- Phase 2: full SAAAE policy enforcement, multi-operator LINGO ID sessions, Forge mirroring/protected branches, Worker preview runtime verification, mathematical validation gates, and Studio asset binary-ingestion/rights-review workflow.
- Phase 3: local model host, constrained bot workers, art/audio/math/motion pipelines, evidence-native studio dispatch, and staging-only promotion bridge.
- Phase 4: encrypted backup/recovery, observability/cost guardrails, threat model, tested rollback and independently accepted production bridge. Production authority remains separately gated.


### Local parallel run runner (experimental; not production-authorized)

`orchestration/runner.mjs` adds a local process runner with up to five parallel tracks, unique run/track working directories, no-shell `node`/`npm` step execution, allowlisted per-track environment variables, secret-value log redaction, preflight credential validation, per-track/global call and cost budgets, a wall-clock watchdog, step timeouts, bounded retries, run-scoped JSONL events, a pollable status file, and a summary artifact. `createRunController` exposes pause/resume/cancel controls to an in-process caller. Cancellation sends SIGTERM and schedules SIGKILL after the 30-second grace period.

A run config is JSON metadata only; credentials must arrive through the parent process environment from the CI/platform secret store. Never put secret values in the JSON file. Example:

```json
{
  "run_id": "vsm-local-check-001",
  "run_type": "local-validation",
  "target": "local",
  "tracks": [
    { "id": "source-check", "criticality": "critical", "required_secrets": [], "steps": [
      { "id": "syntax", "command": "npm", "args": ["run", "check"], "timeout_ms": 300000 }
    ] },
    { "id": "unit-tests", "criticality": "important", "required_secrets": [], "steps": [
      { "id": "tests", "command": "npm", "args": ["test"], "timeout_ms": 300000 }
    ] }
  ]
}
```

Run with `sh vsm/lingo-vsm run run-config.json` (the config path is relative to the `vsm/` directory). This command does not source `.env`; required credentials must be injected by the invoking CI/platform environment. The current runner writes local artifacts under `vsm/artifacts/<run_id>`; it does not yet upload to a remote artifact store, implement a persistent external watchdog, or deliver owner notifications. Cost enforcement uses explicit per-step `cost_usd` estimates and cannot infer third-party spend automatically. Tool-call accounting counts each launched process and configured service preflight request; integrations must charge additional external API calls through the budget ledger. Cost enforcement uses configured step estimates and cannot infer actual third-party spend. Treat this runner as a controlled local validation facility, not production release authority.


## Local volume backup and guarded restore

The local backup utility archives the VSM control data and Gitea data/config volumes while the services are stopped, writes SHA-256 checksums, and stores the archives outside the repository by default under `~/.local/share/lingo-vsm/backups`. The backup directory and archive files are owner-only. These archives contain sensitive identity keys and service data; protect them accordingly.

```sh
sh vsm/lingo-vsm backup
```

Restore verifies the manifest, checksums and all archive structures before modifying named volumes. It is destructive and requires an explicit environment opt-in:

```sh
ALLOW_DESTRUCTIVE=true sh vsm/lingo-vsm restore BACKUP_ID
```

The restore path stops VSM and Forge before replacing volume contents and restarts services that were running. The backup/restore utility is source-implemented but has not yet been executed against a real Docker daemon in this environment; treat it as unverified until a backup is created and a restore drill is completed. It is not an off-site backup or disaster-recovery service.


## Backup and recovery

- Create a local backup: `sh vsm/backup.sh backup`. The script stops only the VSM control and Forge services that were running, archives the three named persistent volumes, verifies SHA-256 checksums and archive readability, then restarts the services that were running.
- Restore is destructive and requires an explicit environment flag: `ALLOW_DESTRUCTIVE=true sh vsm/backup.sh restore BACKUP_ID`. The script verifies the manifest, checksums and archive readability before stopping services and replacing volume contents.
- Backups default to `$HOME/.local/share/lingo-vsm/backups`; set `VSM_BACKUP_DIR` to choose another local directory.
- Backups are **not encrypted**. Keep them on an access-controlled local disk and encrypt them before off-device or cloud storage. The manifest/checksum is an integrity check, not a signed immutable backup.
- The script does not back up source code (GitHub remains source of truth), `.env` credentials, or the optional Worker preview runtime volume. Restore does not change production services.
