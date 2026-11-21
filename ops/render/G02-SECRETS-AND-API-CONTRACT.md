# G02 — API Identity and Secret Contract

Status: SECRET NAMES AND PERMISSIONS ONLY. No credentials generated or stored here.

## Preferred identity
Use a dedicated GitHub App installed only on `thelingolegacy-blip/TheLingoLegacy`. The worker should mint a short-lived installation access token at runtime and use it only to request a short-lived repository runner registration token. Avoid a long-lived personal access token when GitHub App auth is available.

## Proposed Render secret variables

| Variable | Secret? | Purpose |
|---|---:|---|
| `GITHUB_APP_ID` | No | GitHub App identifier |
| `GITHUB_APP_INSTALLATION_ID` | No | Installation identifier for the target repository |
| `GITHUB_APP_PRIVATE_KEY` | YES | GitHub App signing key; preferably a protected secret file if supported |
| `GITHUB_REPOSITORY` | No | Fixed repository slug `thelingolegacy-blip/TheLingoLegacy` |
| `RUNNER_NAME` | No | Fixed value `lingo-legacy-g02` |
| `RUNNER_LABELS` | No | Fixed canonical labels |
| `RUNNER_GROUP` | No | Do not configure; repository is under a personal account, not an org runner group |
| `GITHUB_API_URL` | No | Default GitHub API origin unless an approved enterprise endpoint is introduced |

Do not create `RUNNER_TOKEN` as a persistent Render environment secret. The registration token must be minted just in time, held in process memory for the shortest practical interval, and never logged.

## Permissions to validate
- GitHub App repository permission: Actions — write, only if required for the runner registration-token endpoint.
- Metadata — read (GitHub App baseline).
- Installation limited to the one target repository.
- No Contents write, Administration write, Secrets write, Deployments write, or Organization permissions for the runner-token broker unless a separately documented requirement is proven.
- Do not give the runner workload a GitHub App private key. Separate the token-broker identity from the job execution environment if the architecture can support it; otherwise minimize exposure and document the residual risk.

The exact permission required by the current GitHub endpoint must be checked against current GitHub documentation before creating the App. Never assume a PAT scope or App permission.

## Render platform credentials
- Do not place a Render API key inside the runner container.
- Render service provisioning should use the owner-controlled Render workspace integration or dashboard.
- No Cloudflare API token is required for G02 runner registration or sentinel execution.
- No Firebase, Google AI Studio, production application, or wallet credentials belong in this worker.

## Secret lifecycle
1. Owner creates the GitHub App and installs it only on the target repository.
2. Owner configures the App ID, installation ID, and private key directly in Render's secret manager/dashboard.
3. Worker validates required variables without printing values.
4. Token broker creates short-lived installation token and registration token just in time.
5. Tokens are never written to disk, command-line arguments, GitHub artifacts, or logs.
6. Rotate/revoke through the owning provider; update the secret store; restart only after staged verification.
7. Audit App installation scope and permission changes.

## Logging and redaction
Never emit environment dumps, JWTs, installation tokens, runner registration tokens, private keys, authorization headers, signed URLs, or secret file contents. Logs may include token issuance success/failure and expiry timestamps, but never token values.

## Approval
Credential creation, installation, permission changes, secret entry, rotation, and revocation require explicit owner action in the owning provider. This document does not create or authorize those changes.
