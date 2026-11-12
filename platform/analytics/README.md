# LINGO Analytics — Firebase Functions v2 + BigQuery

This is an isolated analytics integration package. It is intentionally not wired into the production Firebase deployment configuration.

## Data boundary

- Accepts authenticated, App Check-verified event submissions only.
- Uses the authenticated UID only to authorize the request; it is never written to BigQuery.
- Rejects property keys suggesting credentials, contact details, dates of birth, payment, wallet or authentication data.
- Accepts only flat scalar properties with bounded key count and payload size.
- Uses server-side event timestamps.
- Does not accept balances, payment details, raw identity records, credentials or arbitrary event payloads.

This is a telemetry interface, not a source of truth for accounts, wallets, game balances, purchases or financial ledgers.

## Package

- Runtime: Node.js 20
- Firebase Functions: v2 callable function
- App Check: enforced
- BigQuery client: Application Default Credentials / runtime service identity
- Function export: `trackLingoAnalyticsEvent`
- BigQuery table: `events`

## Environment setup

Install and build from this directory:

```bash
npm install
npm run typecheck
npm run build
```

Configure the Firebase Functions parameter `BIGQUERY_DATASET_ID` separately for each environment. The Google Cloud project is taken from the deployed Functions runtime (`GCLOUD_PROJECT`). Do not commit credentials or service-account keys.

Create a dataset in the same Google Cloud project as the function, then apply `bigquery/events.schema.sql` after replacing its placeholders. Use distinct development, staging and production datasets.

## IAM

Grant the deployed Functions runtime service account only:
- Dataset-scoped `roles/bigquery.dataEditor` on the analytics dataset.
- Project-scoped `roles/bigquery.jobUser` only if future query jobs are introduced.

No IAM changes are performed by this repository package.

## Delivery semantics

The UUID event ID is passed as BigQuery's streaming insert ID to help deduplicate retries. BigQuery streaming insert IDs do not guarantee exactly-once delivery. Do not use this endpoint for financial or authoritative state changes. A durable queue/outbox and reconciliation process would be required for stronger delivery guarantees.

## Deployment integration gate

Before wiring this package into `firebase.json` or deploying:
1. Confirm the actual Firebase project and app registrations.
2. Confirm App Check is enabled for the calling application and callable function.
3. Confirm the runtime service account and least-privilege IAM grants.
4. Create and validate the environment-specific dataset/table.
5. Run local TypeScript checks and emulator tests.
6. Perform a development-only event write and verify the resulting row.
7. Add staging verification and cost/retention monitoring.
8. Obtain separate production release approval.

The current root Firebase Hosting configuration publishes the repository root, and the Firebase project/app configuration has unresolved placeholders. This analytics package therefore remains isolated and is not registered as a production Firebase codebase. No deployment, dataset creation, IAM mutation or production write is authorized by this change.
