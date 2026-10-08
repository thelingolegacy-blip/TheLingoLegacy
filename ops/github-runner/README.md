# Lingo Legacy G02 Self-Hosted Runner

Purpose: provide an isolated, ephemeral self-hosted runner lane for the G02 execution gate when GitHub-hosted runner dispatch is unavailable.

## Security
- Never commit a runner registration token.
- Use a short-lived GitHub runner registration token at launch time.
- Runner uses `--ephemeral` and removes itself on exit.
- Dedicated label: `lingo-g02`.
- Dedicated runner group: `Lingo-G02`.
- Do not use this runner for production secrets or unrelated repositories.

## Host requirements
- Linux x64 VM/server/container host.
- Outbound HTTPS access to GitHub.
- Docker Engine + Compose plugin if using Docker.
- Enough runtime to finish one CI job.

## Bootstrap
1. GitHub repository Settings -> Actions -> Runners -> New self-hosted runner.
2. Obtain the short-lived registration token.
3. On the runner host, create a local `.env` file with `RUNNER_TOKEN` and `RUNNER_NAME=lingo-g02-01`.
4. Never commit `.env`.
5. Run `docker compose up --build`.
6. Confirm the runner is online with labels `self-hosted, linux, x64, lingo-g02`.
7. Dispatch the **G02 Self-Hosted Runner Sentinel** workflow.
8. Do not treat Online/Idle or queue state as execution proof.
9. Accept G02 only after the complete evidence predicate is satisfied.

## G02 evidence predicate

```text
ACTUAL
∧ RETRIEVABLE
∧ CORRELATED
∧ INDEPENDENTLY VERIFIED
∧ FORMALLY ACCEPTED
        ↓
G02 ESTABLISHED
        ↓
G02 AUTHORIZED
        ↓
G02 PASS
```

The executing sentinel must establish:
- `runner_id > 0`
- populated `runner_name`
- Linux/x64 runner identity
- exact GitHub run ID
- exact GitHub job ID
- exact commit SHA correlation
- a retrievable `g02-execution-evidence-<run_id>` artifact
- retrievable workflow logs

The artifact records execution evidence, but **does not self-assert independent verification or formal acceptance**. Those remain separate governance predicates.

## Authority boundary

```text
EVIDENCE
   ↓
VERIFICATION
   ↓
ACCEPTANCE  ← AUTHORITY BOUNDARY
   ↓
AUTHORITY
   ↓
PROMOTION
```

Promotion cannot create, validate, or backfill upstream evidence. If any predicate is false or unproven:

```text
NO ACCEPTANCE
   ↓
NO AUTHORITY
   ↓
NO G02 PASS
   ↓
NO DOWNSTREAM PROMOTION
```

## Runner lifecycle

The package uses an ephemeral runner. The registration token is requested at launch, written only to a local permission-restricted `.env`, consumed by the runner, and removed after the process exits. The credential must never be committed or copied into evidence artifacts.

The package is pinned to Actions Runner v2.337.0. Runner availability can vary because GitHub rolls releases out progressively.
