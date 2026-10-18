# Last-Known-Good (LKG) Restore Runbook

**Current state:** LKG protected; restore target identity not independently established in this control-plane session.  
**Execution status:** NOT EXECUTED.  
**Safety rule:** Do not select “latest successful,” a READY deployment label, or an unverified AppDeploy version as LKG.

## Entry conditions

1. Declare an incident and freeze production mutations.
2. Capture read-only snapshots of current DNS, Worker routes/settings/deployment version, application health, Firebase project/schema version, active feature flags, and deployment metadata.
3. Identify a candidate LKG from a prior accepted release record—not from a guessed version.
4. Verify all of the following from independently retrievable evidence:
   - exact Git commit SHA;
   - immutable build/artifact identifier and SHA-256;
   - accepted CI run and test results for that SHA;
   - Worker deployment/version identity and source SHA;
   - DNS and route configuration snapshot;
   - Firebase migration/schema compatibility and backup/snapshot identity if data changes are involved;
   - known-good live probes and acceptance record;
   - approved rollback procedure and operator authorization.
5. If any identity is missing or contradictory, stop. Keep traffic and mutation state unchanged.

## Restore procedure

1. Obtain two-person review of the target LKG manifest and current-vs-target diff.
2. Restore the exact immutable artifact and the matching runtime configuration in an isolated recovery environment first.
3. Verify the restored candidate's source/artifact/runtime correlation, TLS, health endpoints, core user journeys, authz, data compatibility, and observability.
4. Obtain independent acceptance and explicit authorization for the specific transition.
5. Apply only the approved rollback operation. Do not change DNS or Worker routes as a workaround for a billing/runner problem.
6. Immediately run external live probes from an independent network and compare expected headers, route ownership, runtime version, and response content.
7. If verification fails, freeze further mutations and follow the approved incident procedure; do not repeatedly toggle routes or redeploy.
8. Preserve pre-restore and post-restore snapshots, command output, timestamps, actor, request/correlation IDs, and SHA-256 checksums.
9. Seal the restored LKG only after independent verification and acceptance; retain the prior manifest.

## Current blocker summary (2026-10-10)

- G02 runner assignment/execution/log evidence remains unverified.
- The observed Cloudflare live Worker name `thelingolegacy` differs from repository `wrangler.jsonc` Worker name `thelingolegacyv-5`.
- The Vercel project reports deployment metadata READY but the deployment returns HTTP 402 `DEPLOYMENT_DISABLED`; this is not an acceptable recovery target.
- Independent public reachability is not verified by the current connected fetch path.
- No exact accepted artifact digest and matching full LKG evidence bundle was established by this reconstruction.

**Decision:** Do not restore or promote yet. Keep LKG protected. Restore only after the owner/release evidence store supplies an exact previously accepted manifest and the required execution gates pass.
