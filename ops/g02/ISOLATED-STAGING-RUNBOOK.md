# G02 isolated staging recovery path

## Safety boundary

This procedure is staging-only. It does not restart, re-register, relabel, or mutate the production runner `lingo-legacy-g02`, and it does not deploy production. Do not place runner registration tokens, Firebase service-account JSON, SSH private keys, or other credentials in this repository or workflow logs.

## Staging host prerequisites

1. Use a separately provisioned non-production Linux host and a dedicated GitHub Actions runner registration scoped to a test repository (preferred) or otherwise explicitly isolated staging scope.
2. Register it with labels `self-hosted`, `linux`, `x64`, and `lingo-legacy-g02-staging`. Its runner name must include `staging`. Do not reuse the production runner registration.
3. Confirm key-based SSH access through your approved access path. From an authorized operator workstation, use the real host and username values:
   `ssh -i <staging-private-key-path> <staging-user>@<staging-host> 'whoami && uptime'`
   Keep the private key outside the repository and never paste it into chat.
4. On the staging host, confirm the runner service and network access using read-only checks before attempting a workflow:
   `systemctl list-units --type=service --all 'actions.runner.*'`
   `pgrep -af 'Runner.Listener|Runner.Worker' || true`
   `getent hosts github.com api.github.com`
5. Configure Firebase only after selecting a dedicated staging Firebase project. Use workload identity/application default credentials where supported, or a secret manager. Never use production service-account credentials for staging tests.

## Sentinel execution

The workflow `.github/workflows/g02-isolated-staging-sentinel.yml` is manual-only and requires the input `confirm_staging_only=STAGING`. It targets only the staging label and checks runner identity, Python availability, DNS/HTTPS to GitHub, and evidence generation. It emits a JSON record with run ID, attempt, commit SHA, runner identity and checks, plus a SHA-256 sidecar, then uploads a run-correlated artifact.

Dispatch it only after a separate staging runner has registered and appears online. If it stays queued, do not change the production runner labels or weaken the job's `runs-on` selector.

## Firebase evidence adapter

This sentinel intentionally does not write to Firestore. First establish a dedicated staging project, Firebase Authentication/authorization policy, least-privilege service identity, Firestore rules, and a tested backend endpoint. The workflow must not receive broad Firebase admin credentials. Prefer the staging host agent posting signed evidence to an authenticated backend that validates run ID, attempt, commit SHA, runner identity, timestamp, and schema before recording it.

## Acceptance and promotion

A successful staging run proves only that the isolated staging runner can execute this sentinel. It does not prove that the production runner is healthy and does not satisfy production G02 acceptance. Production remains held until the existing production runner receives a real job, executes the canonical sentinel, produces retrievable logs and correlated artifacts, and the evidence is independently accepted.
