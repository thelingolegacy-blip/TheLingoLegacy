# LINGO Provider Federation & CI Authentication Runbook

**Status:** Prepared for review; no provider trust or production credentials have been provisioned.

## A. GitHub Actions baseline

- Issuer: `https://token.actions.githubusercontent.com`
- Canonical repository: `thelingolegacy-blip/TheLingoLegacy`
- Repository ID: `1279436411`
- Default branch: `refs/heads/main`
- OIDC audience for preflight: `lingo-ci-preflight`
- Workflow: `.github/workflows/ci-oidc-preflight.yml`
- Event: `workflow_dispatch`
- Permissions: `contents: read`, `id-token: write` only for the preflight job.

The preflight decodes the token claims for a diagnostic assertion; it does not verify the JWT signature. Every relying party must independently validate the signature against GitHub's published OIDC keys, issuer, audience, expiry and exact claim conditions. Do not treat a successful claim parse as external federation success.

## B. Google Cloud Workload Identity Federation for Firebase

### Required owner-verified inputs

- Approved non-production Google Cloud project ID and numeric project number.
- Dedicated Workload Identity Pool and OIDC Provider IDs.
- Dedicated service account for non-production CI.
- Exact Firebase resources required (Auth emulator/test project, Firestore emulator or test database, Functions deploy only if explicitly approved).
- Protected GitHub Environment name and approved deployment branch.
- Named administrators authorized to create IAM resources.

No value is inferred from `.firebaserc`: that file currently declares a production project whose deployment target is not independently verified.

### Provider settings

- Issuer URI: `https://token.actions.githubusercontent.com`
- Allowed audience: the exact provider resource name emitted by Google Cloud for the WIF provider. Do not reuse the diagnostic audience unless the provider is configured for it.
- Map `google.subject` from `assertion.sub`.
- Map repository identity from `assertion.repository` and `assertion.repository_id`.
- Map ref from `assertion.ref`, workflow from `assertion.workflow_ref`, and environment from `assertion.environment` when the job targets a protected environment.
- Attribute condition must require the exact repository name and ID, approved owner, exact branch, exact workflow path, and required environment. Deny pull-request refs for deployment identities.
- Separate test/read identity from staging deploy identity. Production identity remains unconfigured until separate release acceptance.
- Grant only required Firebase/Google Cloud roles at the narrowest resource scope. No Owner, Editor, primitive project-wide roles, service-account key, or JSON key.

### Negative tests

Reject a different repository, repository ID, owner, ref, workflow, audience, event, or missing protected environment. Confirm the service account cannot access production resources.

## C. Cloudflare Workers

The current connection authenticates a Cloudflare user, not GitHub CI. No approved GitHub-to-Cloudflare OIDC federation has been verified.

For staging, use a dedicated Cloudflare API token only if no supported federation path is approved:
- Limit to the exact account and staging zone.
- Grant only the Workers script/deployment and read permissions required by the workflow.
- Do not grant DNS edit, account administration, billing, user, or zone-wide permissions unless separately justified.
- Store the token in an owner-managed GitHub Environment secret or approved Secret Manager, never in source, workflow output, browser code, or AppDeploy frontend variables.
- Add protected environment approval and branch restrictions.
- Production token remains absent until release authorization.

## D. GitLab CI, CircleCI, Jenkins

These CI definitions are present in the repository, but no provider federation or protected-variable evidence was observed.

- GitLab: prefer GitLab OIDC ID tokens with audience restricted to the target provider; map project path/project ID, ref, pipeline source, and protected environment; prohibit fork merge-request jobs from obtaining deploy credentials.
- CircleCI: use OIDC context claims and a dedicated context restricted to project, branch, and approved environment; do not place deploy secrets in unrestricted contexts.
- Jenkins: use the cloud workload-identity plugin/agent federation where supported; isolate agents, scope credentials to folder/job, mask output, and prohibit secrets on untrusted pull-request builds. Do not store static keys in Jenkinsfile or shared global credentials.

Do not configure all three providers simply because configuration files exist. Keep unused CI systems disabled until one is selected as an active execution provider.

## E. AppDeploy

The secure secret-entry mechanism is available and values are entered by the owner through a pre-authorized form. The inspected account returned empty secret inventories for all 18 apps.

Before requesting any entries:
1. Identify the app's actual backend and provider dependencies.
2. Derive the exact secret-name list from source references and deployment configuration.
3. Create one secure entry batch for the app, with values entered by the owner.
4. Bind entries only to that app's backend.
5. Verify server-side availability without logging values.
6. Do not deploy if required entries are missing or expired.

## F. Firebase user identity

Firebase user ID tokens and GitHub Actions OIDC tokens are different trust domains:
- Firebase ID token issuer is `https://securetoken.google.com/<project-id>`.
- Audience is the Firebase project ID.
- Subject is the Firebase UID.
- Verify RS256 signature against Google's published Firebase secure-token JWKs, issuer, audience, expiry, issued-at and subject.
- Authorization is still required after verification.
- App Check is a separate app-attestation signal, not a substitute for Auth.

The repository includes a Firebase ID-token verifier. It must be exercised with real signed test tokens, key rotation, expiry, wrong project/audience, wrong issuer, unknown kid and cross-user authorization tests before production acceptance.

## G. Supabase

An active Supabase project is visible in the connected account, but it has not been mapped to an approved LINGO product. Do not create or modify Auth providers, redirect URLs, JWT secrets, RLS policies, service-role keys, or project settings until the project and product scope are confirmed. If adopted, use Supabase Auth for user identity only with server-side JWT validation and RLS on every exposed table; service-role keys remain server-only.

## H. Third-party API keys (AI, commerce, communications)

- Use separate project/account credentials for development, staging and production.
- Keep keys in approved Secret Manager and inject server-side only.
- Prefer scoped keys, restricted origins/IPs where supported, budgets, and rotation.
- Verify webhook signatures and timestamps; enforce idempotency and replay protection.
- Do not use a model-provider key in a browser, Unity client, Flutter app bundle, or static website.
- Do not activate Stripe, Shopify payments, Twilio, or other communications/commerce credentials without a product-specific authorization and test plan.

## I. Acceptance checklist

- [ ] CI job starts on GitHub-hosted runner and completes.
- [ ] OIDC token is issued only to intended workflow/job.
- [ ] No token or credential appears in logs, artifacts, summaries, or build output.
- [ ] Provider verifies JWT signature and all required claims.
- [ ] Wrong repo/ref/workflow/audience/environment is rejected.
- [ ] Non-production identity has only required roles and cannot reach production.
- [ ] Credential rotation/revocation procedure tested.
- [ ] Security tests and audit evidence attached to the relevant PR.
- [ ] Separate release acceptance authorizes any production identity or deployment.
