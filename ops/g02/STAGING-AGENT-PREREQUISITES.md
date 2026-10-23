# Staging recovery agent prerequisites

The workflow `.github/workflows/sentinel-check.yml` runs only by manual dispatch and only on a separately registered Linux/x64 runner with labels `self-hosted`, `linux`, `x64`, and `lingo-legacy-g02-staging`. The runner's name must contain `staging`.

Before dispatch:
- Configure repository Actions variable `FIREBASE_STAGING_PROJECT_ID` with the dedicated non-production Firebase project ID. It must not be `lingo-legacy-production`.
- Configure Application Default Credentials (prefer workload identity) on the staging runner with least privilege to create documents only in the `g02_staging_evidence` collection. Do not place service-account JSON, SSH private keys, or registration tokens in the repository or workflow variables.
- Ensure Firestore rules/IAM and the backend identity are appropriate for this staging-only evidence writer. The Firebase Admin SDK uses server-side IAM; client Firestore rules alone do not constrain an Admin SDK principal.
- Review outbound connectivity and package-install policy on the staging host.
- Dispatch manually with `confirm_staging_only=STAGING`.

The agent is diagnostic-only: it does not restart or register services. It refuses to run unless the environment is explicitly staging, the project ID is configured and not the production project, and the runner name includes staging. It creates a new Firestore document per run/attempt instead of overwriting a shared runner document.

This workflow has not been run by this change. No staging host registration, Firebase write, or host execution is claimed. A staging pass does not establish production G02 acceptance.
