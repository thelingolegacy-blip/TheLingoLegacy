# LINGO Runner and CI Recovery Architecture

## Recovery paths

| Path | Role | What it proves |
|---|---|---|
| GitHub-hosted Actions | Primary hosted execution | GitHub admits a job, assigns a hosted runner, executes steps and stores logs/artifacts |
| LINGO G02 self-hosted runner | Controlled independent execution | Dedicated LINGO VM accepts and executes a trusted, manual validation job |
| CircleCI | Independent CI fallback | Connected CircleCI project executes configured validation with logs and artifacts |

These are complementary execution paths, not interchangeable proof. A successful self-hosted run does not prove GitHub-hosted runner service recovery.

## G02 acceptance criteria

- Dedicated LINGO-controlled Ubuntu VM exists and has documented owner/cost.
- Repository-scoped runner is online and idle with labels `self-hosted, linux, x64, lingo-g02`.
- Manual-only probe receives a real job with nonzero runner ID.
- Job has completed steps and retrievable logs tied to a specific run and commit SHA.
- No production secrets or untrusted pull-request execution are enabled.
- Host service, patching, monitoring, backup and decommission procedure are documented.

## Current truthful status

Bootstrap installer, manual probe workflow and runbook are committed on the runner-infrastructure branch. No VM has been provisioned, no registration token has been generated, and no runner has been registered or tested. Those steps require an authorized cloud account, an approved spend limit, and local use of a short-lived GitHub registration token.

## Release boundary

CI recovery does not itself authorize merge, production deployment, DNS changes, Worker route changes, Firebase production changes, Supabase data migrations or payment activation. All remain subject to separate verification and release controls.
