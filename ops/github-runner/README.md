# Lingo Legacy G02 Self-Hosted Runner

Purpose: provide an isolated, ephemeral self-hosted runner lane for the G02 execution gate when GitHub-hosted runner dispatch is unavailable.

## Security
- Never commit a runner registration token.
- Use a short-lived GitHub runner registration token at launch time.
- Runner uses --ephemeral and removes itself on exit.
- Dedicated label: lingo-g02.
- Dedicated runner group: Lingo-G02.
- Do not use this runner for production secrets or unrelated repositories.

## Host requirements
- Linux x64 VM/server/container host.
- Outbound HTTPS access to GitHub.
- Docker Engine + Compose plugin if using Docker.
- Enough runtime to finish one CI job.

## Bootstrap
1. GitHub repository Settings -> Actions -> Runners -> New self-hosted runner.
2. Obtain the short-lived registration token.
3. On the runner host, create a local .env file:
   RUNNER_TOKEN=<token>
   RUNNER_NAME=lingo-g02-01
4. Never commit .env.
5. Run: docker compose up --build
6. Confirm the runner is online with labels self-hosted, linux, x64, lingo-g02.
7. Dispatch the G02 Self-Hosted Runner Sentinel workflow.
8. Accept G02 only when runner.id > 0, runner.name is populated, the sentinel executes, and logs are retrievable.

The package is pinned to Actions Runner v2.337.0, a current upstream release as of September 2026. GitHub notes that runner releases are progressive, so availability can vary by repository.
