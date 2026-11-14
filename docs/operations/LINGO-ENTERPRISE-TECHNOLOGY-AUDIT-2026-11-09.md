# LINGO Enterprise Technology Audit & Reconciliation — 2026-11-09

**Audit type:** Read-only provider/configuration audit with documentation-only remediation  
**Canonical repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch under review:** `feat/lingo-master-registry-wave0-2026-11-08`  
**Observed branch head before this report:** `4e6efbcc4fb6e5793a7c542efe11aa5f19e45879`  
**Repository default branch:** `main`  
**Production disposition:** PROTECTED HOLD  
**G02 disposition:** FAIL / UNVERIFIED  
**Change scope:** No production configuration, DNS, Worker route, deployment, secret, identity, database, payment, runner or billing mutation.

## 1. Executive result

The connected account surfaces are reachable, and useful configuration evidence was retrieved. The technology estate is **not yet enterprise-verified or synchronized**. There are material source-to-provider discrepancies, incomplete CI evidence, unverified identity/data authority, incomplete observability, and several security/access controls that need owner review.

This report deliberately distinguishes:
- **Observed:** returned directly by a provider API or repository read.
- **Correlated:** two or more sources agree on a specific identity, route, branch or configuration.
- **Drift:** repository and provider configuration differ.
- **Unverified:** the connector did not expose sufficient data or an authenticated probe could not complete.
- **Blocked:** acceptance depends on missing evidence, owner decision or separate authorization.

A connected plugin or reachable account is not proof of a production integration.

## 2. GitHub source and release authority

### Observed
- Authenticated GitHub identity is the `thelingolegacy-blip` account.
- Repository `thelingolegacy-blip/TheLingoLegacy` is accessible with admin, maintain, push and pull permissions.
- Repository is **public**, unarchived, default branch `main`.
- The owner inventory returned 38 repositories. The portfolio contains overlapping/duplicate-looking implementations and several empty repositories; canonical product-to-repository ownership needs explicit mapping.
- Master Registry PR #511 is open, draft, mergeable according to metadata, targets `main`, and is unmerged. At the time of audit it had 30 commits and 18 changed files.
- PR #511 head was `4e6efbcc4fb6e5793a7c542efe11aa5f19e45879`; base was `90226f6efdd6d480f36275c225550dc271f8c05e`.
- The current commit combined status returned a failing context named `Vercel – the-lingo-legacy`. This is a status failure, not evidence of a GitHub Actions run result.
- Earlier recorded CI runs on the PR branch failed at startup with zero instantiated jobs. The PR history records latest known startup failures, including Static CI run `42539177947` and earlier Crimson Smoke / G02 runs. The current commit-specific workflow-run lookup did not establish a successful run.
- The GitHub connector exposes repository, commit, PR, status and workflow job reads, but the available tool surface did not expose branch-protection/ruleset, Actions runner inventory, secrets/environment inventory or security-alert settings for direct verification.

### Disposition
- Keep GitHub canonical for code, ADRs, policy, changes and release evidence.
- Do not merge PR #511 while it is draft and required CI/review evidence is absent.
- Keep G02 FAIL / UNVERIFIED. Do not dispatch workflows, rerun failed jobs, restart/register runners or rotate/reuse runner credentials without host/token reconciliation and separate approval.
- Public repository visibility is a material confidentiality control. Complete a repository-wide secret/history scan and assess whether any non-public source, business records, customer data, internal topology or licensed assets were ever committed. Placeholder Firebase client values are not proof of a secret leak; they also are not proof of a safe repository.
- Verify main branch protection, required checks, CODEOWNERS, rulesets, signed commits/tags, Dependabot, secret scanning, push protection, code scanning, environment reviewers and deployment protection from an authorized GitHub settings view.

## 3. Cloudflare — observed live configuration

### Account and zone
- Cloudflare authenticated identity was reachable.
- One account was returned: `Thelingolegacy@gmail.com's Account`.
- Zone `thelingolegacy.com` exists and is `active`.
- Read-only API inventory returned 34 DNS records, 21 Worker routes, 12 Worker scripts, two custom Worker domains and a Workers subdomain `thelingolegacy`.
- No DNS record, route, Worker setting, secret, deployment or security policy was changed.

### Worker routes and scripts
- Apex wildcard `thelingolegacy.com/*` routes to `thelingolegacyv-5`.
- Exact apex root `thelingolegacy.com/` routes to `lingo-flagship-root`.
- `www.thelingolegacy.com/*` routes to `thelingolegacyv-5`.
- `atlas.thelingolegacy.com/*` routes to `lingo-ecosystem-atlas`.
- `launch.thelingolegacy.com/*` routes to `lingo-static-backup-proxy`.
- Other product subdomains also route to the primary Worker. Preserve the complete 21-route inventory in `config/registry/cloudflare-route-inventory.v1.json`.
- Live Worker script inventory includes `thelingolegacyv-5`, `lingo-flagship-root`, `lingo-ecosystem-atlas`, `lingo-static-backup-proxy`, studio/game/world staging Workers, and `lingo-resilience-gateway`.
- The `resilience.thelingolegacy.com` Worker custom domain is attached to `lingo-resilience-gateway`; no corresponding DNS record appeared in the returned DNS inventory. Verify DNS/custom-domain resolution and deployment provenance separately.
- `studio-preview.thelingolegacy.com` is attached as a custom Worker domain to `lingo-studio-control-center-staging`, but the domain API labels its environment `production`. This is a metadata classification discrepancy; do not infer that the service is an approved production surface.
- Worker script upload metadata shows newer uploaded versions than the deployed versions documented in the existing Cloudflare reconciliation record. Upload is not deployment. The existing record identifies active `thelingolegacyv-5` v137 and `lingo-flagship-root` v1 while newer uploaded versions are candidates. Reconfirm deployment IDs, traffic percentages and source provenance before any release.

### DNS findings
- Apex A record `thelingolegacy.com` -> `192.0.2.0`, proxied. This is a TEST-NET-1 documentation address and is not a valid public origin target. Treat origin/fallback as blocked; do not guess a replacement.
- `www` CNAME points to apex and is proxied.
- `app.thelingolegacy.com` CNAME points to `my-flutter-app.pages.dev`; Pages project ownership and build provenance are unverified.
- `admin.thelingolegacy.com` CNAME points to `admin-thelingolegacy.firebaseapp.com`; Firebase project/site ownership and current intended authority are unverified.
- `casino.thelingolegacy.com` CNAME points to AppDeploy proxy; app/account identity and deployment state need separate reconciliation.
- `launch` points to `thelingolegacy-static-backup.pages.dev`; verify its current project, build provenance and whether it is an approved fallback.
- Two legacy `_vercel` TXT verification records remain. Do not remove until domain ownership dependencies are confirmed.
- DMARC is `p=none`; SPF uses Google include with softfail. Verify DKIM and mail sender inventory before staged DMARC enforcement.

### Repository alignment
- Main-branch `wrangler.jsonc` names `thelingolegacyv-5`, entrypoint `worker.js`, compatibility date `2026-09-01`, and declares only apex wildcard and www routes.
- Live zone inventory has 21 routes, including 18 routes assigned to the primary Worker plus exact-root, Atlas and Launch routes. This is a material route/configuration inventory gap.
- Do not run Wrangler deploy or reconcile route arrays from the two-route file alone. First reconstruct intended ownership of every route and all non-primary Workers, bindings, assets and custom domains.
- The repository README claims Vercel is retired, but the commit status still reports a Vercel check failure and legacy DNS verification records remain. Treat Vercel as a residual integration/status source to retire only after dependency mapping, not as an active approved production host.

### Live endpoint probe
- An unauthenticated request to `https://thelingolegacy.com/healthz` redirected to a Cloudflare Access login hostname.
- The web probe could not read `/api/v1/runtime`, `/api/v1/platform/status` or the www health endpoint.
- Therefore health, runtime version, response headers, route precedence, API behavior and public availability were **not verified**. Access may be intentionally protecting the domain or may be blocking public health checks; confirm policy intent and configure an approved authenticated synthetic probe. Do not disable Access to make a probe pass.

## 4. Firebase, Supabase and data authority

### Firebase repository evidence
- Root `firebase.json` configures Hosting with `public: "."`, which is an excessively broad deployment scope unless an explicit allowlist/build directory is established and tested.
- `.firebaserc` references `lingo-legacy-production`, but the Firebase provider-side project identity and account access were not verified in this audit.
- `firebase.client.json` and `lib/firebase_options.dart` were previously inspected and contain placeholder client configuration. They do not prove a working Firebase app.
- No root `firestore.rules` was found in the inspected repository state. An Oasis-specific rules file exists under the game project and does not protect the flagship root project.
- Firebase Auth providers, App Check, Firestore indexes/rules, Storage rules, Functions, backups, restore evidence, quotas and project billing/ownership remain unverified.
- Root Firebase Hosting must remain contract-only until public asset scope and project identity are reconciled. Do not publish repository root.

### Supabase provider evidence
- One Supabase project exists: `zoksxavxmgnkrthselek`, region `us-west-2`, PostgreSQL 17, status `ACTIVE_HEALTHY`.
- Security, performance and health advisor calls returned empty lint arrays.
- Empty advisor arrays are not a penetration test, RLS certification, backup/restore test or proof of application use.
- The Supabase project purpose and relation to Firebase are not established. No evidence of application traffic, migration ownership or canonical domain authority was retrieved.

### Required decision
- Resolve Firebase vs Supabase vs managed PostgreSQL by domain. Define one authoritative writer per data domain and prohibit accidental dual-write.
- Required evidence: project owner confirmation; application IDs; auth issuer/audience; RLS/Firestore rules; migrations; indexes; edge/functions; secrets; backup retention; restore test; data export; API connection; and negative cross-user authorization tests.
- No database migration, project provisioning or production authentication change until ADR approval and isolated test evidence.

## 5. Render and deployment surfaces

- Render workspace `My Workspace` is reachable.
- One service was returned: `lingo-legacy-platform-ops-preview`, static site, linked to the canonical GitHub repository and branch `recovery/platform-ops-preview-2026-11-02`.
- Auto-deploy is off; service is not suspended.
- Build command is an echo-only static preview command; publish path is `render-staging`.
- IP allow list includes `0.0.0.0/0` (all IPv4 addresses). Treat the preview as publicly reachable at the network allowlist layer; verify authentication at the application/edge layer and do not expose operational controls without strong access control.
- This preview is not evidence of production hosting or a tested failover.
- The previous Vercel 402/suspension and retirement decision remains separate from Render's actual deployment health; do not infer one provider is a working fallback for the other.

## 6. Datadog observability

- Seven host monitors were discovered across CPU, disk latency, disk usage, load, network receive, network send and memory.
- All seven returned status `No Data`.
- Monitor descriptions contain generic runbooks and placeholder notification handles such as `@your-team-handle`.
- This establishes monitor configuration presence but does not establish telemetry ingestion, host-agent health, alert delivery, on-call ownership, dashboards, SLOs or incident response.
- Required: identify intended monitored hosts/services; install/verify agents or OTel exporters; confirm metrics arrive; test one safe alert path; replace placeholder notification targets; define service ownership, SLOs, error budgets and escalation; validate log/trace retention and sensitive-data redaction.

## 7. Analytics and market intelligence

### PostHog
- Connected PostHog organization exposes one project named `Default project`, ID `713777`.
- `ingested_event=false`; onboarding incomplete; no tags; timezone UTC.
- This is evidence that a project exists but no events have been ingested. No LINGO app instrumentation, event taxonomy, consent, identity merge or dashboard is verified.
- Do not create SDK code with an invented token or assumed region. Verify project API host and token via authorized project details, identify the actual app(s), and then instrument using environment variables and consent-aware event contracts.

### Amplitude
- Organization is on a Starter plan; one accessible project `default`, app ID `902649`; organization quota reported as 2,000,000.
- The returned context does not prove LINGO event ingestion, event taxonomy, production SDK, or dashboards.
- Decide whether Amplitude is redundant with PostHog for each product. Prefer one canonical event taxonomy and explicitly document any dual instrumentation.

### Ahrefs
- Connected plugin, but subscription usage/limits endpoint returned `Insufficient plan`.
- No SEO project/site ownership, verified domain, crawl, rank or backlink evidence was obtained.
- Use available Google Search Console/Bing Webmaster Tools and owned-site verification as low-cost alternatives. Do not report SEO performance until verified.

## 8. Commerce and CRM

### Shopify
- Connected store is `Loyalty Lane`, domain `vercel-store-f0dc9593.myshopify.com`, Advanced plan, USD, United States, EST.
- Store identity is confirmed at connector level; storefront custom-domain mapping, products, inventory, shipping/tax, payment configuration, webhook delivery, privacy, fulfillment, refunds and public-launch status are not certified by this basic store-info read.
- Reconcile the Shopify domain with the DNS and product registry before publishing or campaign changes.

### HubSpot
- Account `The Lingo Legacy`, Standard account, USD, US/Eastern.
- No teams were returned; brands were not configured/available in this account response (Brands add-on not present).
- This confirms an account connection, not a complete CRM rollout, customer-data sync, ticketing, pipeline or team ownership.
- Define CRM objects, lifecycle stages, consent and data retention; establish owners and sync contracts before importing customer records.

## 9. Linear project coordination

- Linear team `Lingo Legacy` (key `LIN`) is present.
- The inspected project list returned no projects.
- Linear is connected but the enterprise audit program has not yet been established as a project. Do not claim workstream synchronization until project and issue IDs are confirmed.
- Keep GitHub canonical; Linear is planning/dependency tracking only. Use GitHub issue/PR links as durable code/release references.

## 10. Cross-system correlation requirements

Every implementation, deployment and operational claim must carry this correlation envelope:

```json
{
  "product_id": "registry-stable-id",
  "surface_id": "web|ios|android|game|api|admin",
  "repository": "owner/repo",
  "branch": "branch-name",
  "commit_sha": "full-40-character-sha",
  "build_id": "provider-build-id",
  "artifact_digest": "sha256:...",
  "environment": "dev|test|staging|production",
  "provider_resource_id": "exact-resource-id",
  "deployment_id": "provider-deployment-id",
  "runtime_version": "reported-version",
  "route_or_domain": "host/path",
  "workflow_run_id": "github-run-id",
  "test_evidence": ["test-report-reference"],
  "approval_reference": "change-or-review-id",
  "observed_at_utc": "ISO-8601",
  "status": "observed|verified|blocked|unknown"
}
```

Do not correlate by project name alone. Require exact IDs and full commit SHA. Keep separate identities for source commit, build artifact, uploaded Worker version, active deployment, live route and live runtime. A matching name is not provenance.

## 11. Priority remediation queue

| Priority | Finding | Required correction | Acceptance evidence |
|---|---|---|---|
| P0 | Apex DNS origin is TEST-NET-1 | Identify real intended origin/fallback; document ownership; separately approve DNS change | Verified origin, owner, staged test, rollback |
| P0 | Worker route/config drift | Reconcile all 21 routes, custom domains, 12 scripts, active versions and wrangler config | Exact route matrix; source-to-version provenance; candidate probes |
| P0 | GitHub CI startup failures / G02 | Diagnose Actions service, registration, credentials and job instantiation without duplicate runner | Runner ID/name/labels, completed jobs/steps, logs, artifacts, exact SHA |
| P0 | Firebase Hosting publishes repository root | Narrow to explicit build artifact/allowlist and scan public exposure | Dry-run file manifest, negative secret tests, review |
| P0 | Public repository security posture unverified | Review secret history, assets, personal/customer/internal data and branch protections | Secret scan/history report, settings evidence, remediation |
| P1 | Cloudflare Access blocks unauthenticated health probes | Confirm intended access model; create authorized synthetic probe | Authenticated health/runtime evidence and policy owner |
| P1 | Supabase healthy but purpose/authority unknown | Domain ownership ADR, RLS and backup/restore verification | Approved ADR and negative auth tests |
| P1 | Datadog 7 monitors show No Data | Restore telemetry and notification routing | Fresh metrics, test alert, named owner/on-call |
| P1 | PostHog project has no ingested events | Confirm project and SDK host/token; instrument one approved app with consent | Test event, source commit, event schema, consent tests |
| P1 | Render preview allowlist is 0.0.0.0/0 | Verify preview auth and operational data exposure | Access policy test; least-privilege ingress |
| P1 | Linear has no projects | Establish portfolio project and linked issues | Project/issue IDs linked to GitHub issues/PRs |
| P2 | Shopify store domain not reconciled | Confirm custom domain, catalog and fulfillment configuration | Domain verification and end-to-end test order in test mode |
| P2 | HubSpot lacks team/brand structure | Define ownership, object schema and sync model | Named owners, CRM data map and consent rules |
| P2 | Ahrefs plan blocks usage endpoint | Use accessible site-owner/search console alternatives or owner-provided access | Verified site property and dated SEO report |
| P2 | Amplitude/PostHog overlap | Decide one canonical analytics event schema and tool purpose | Approved analytics ADR and dedupe contract |

## 12. Access and information required to finish the audit

The following are not passwords or secrets to paste into chat. Grant scoped connector access, invite the authorized account, or provide sanitized exports/screenshots.

### GitHub
- Confirm canonical repository per product and any repos to archive or consolidate.
- Grant read access to organization/repository settings, branch protections/rulesets, Actions runners and runner groups, environments, required reviewers, secrets metadata, Dependabot, secret scanning, code scanning, audit log and billing/usage.
- Provide runner host/service access only through an approved secure administrative channel; never paste PATs, runner registration tokens or private keys into chat.
- Confirm whether public repository visibility is intentional for all 38 repositories.

### Cloudflare
- Confirm account/zone ownership and intended authority for apex, www, all subdomains and each Worker.
- Provide read-only access to DNS, Workers scripts/versions/deployments, routes, custom domains, bindings, vars/secrets metadata, Access policies, WAF, rate limiting, cache, analytics/logs, certificates, account roles and billing/quotas.
- Do not share API tokens in chat. Reconnect a scoped connector if the required read endpoints are missing.
- Identify intended origin IP/hostname and backup origin with ownership proof.

### Firebase / Google Cloud
- Confirm exact Firebase project ID, project number, app registrations, Hosting site IDs, owner and billing state.
- Grant read access to Authentication providers, Firestore rules/indexes, Storage rules, Functions, App Check, Hosting releases/targets, service accounts/roles, audit logs, quotas, backups and restore.
- Provide emulator/staging project and non-production test accounts for executable auth/rules tests.
- Never provide service-account JSON, private keys or production tokens in chat.

### Supabase
- Confirm whether project `zoksxavxmgnkrthselek` is LINGO-owned and what product/domain it serves.
- Provide project owner confirmation and read access to schema, migrations, RLS, policies, auth settings, edge functions, secrets metadata, logs, backups, PITR and billing/quotas.
- Use a dedicated least-privilege audit role; never paste database passwords or service-role keys.

### Render / hosting
- Confirm whether `lingo-legacy-platform-ops-preview` is still required and whether its public network allowlist is intentional.
- Provide read access to deploy history, build logs, environment variable names (not values), custom domains, access controls and service events.
- Identify intended production origins and hosting owners.

### Datadog
- Identify expected hosts/services and grant read access to hosts, agents, dashboards, monitors, SLOs, logs, traces, integrations, synthetics, alert destinations, incidents and usage.
- Provide a safe test-alert recipient/owner. Do not send real alert tests to public customers.

### PostHog / Amplitude / Ahrefs
- Confirm which LINGO product uses which analytics project and which tool is canonical.
- Provide PostHog project details (region/host, token metadata, SDK settings, events, data retention, consent settings) through the connector—not raw secret values.
- Confirm Amplitude app ID `902649` belongs to the intended LINGO property and whether it receives events.
- Verify Ahrefs site property ownership or provide Search Console/Bing Webmaster read access.

### Shopify / HubSpot
- Confirm Loyalty Lane store ownership, custom domain, products, inventory, shipping/tax, payments test configuration, webhooks and order fulfillment ownership.
- Provide HubSpot object/pipeline/property, user/seat, team, sync and consent configuration read access; confirm who owns CRM operations.

### Linear
- Confirm team `LIN` is the intended portfolio team. Permit project/issue creation only after the project hierarchy and ownership map are approved.
- Keep all GitHub issue/PR references linked; do not create a second source of code truth.

## 13. Required evidence package and completion criteria

For every product and environment, collect:
1. Stable product/surface/repository/resource IDs.
2. Exact branch and full commit SHA.
3. CI run, job, step, artifact and digest.
4. Build configuration and dependency lockfile.
5. Provider resource, deployment ID and active version.
6. DNS/route/custom-domain and TLS mapping.
7. Identity issuer, audience, authorization and negative tests.
8. Data domain, schema/migration, RLS/rules and backup/restore.
9. SLO, telemetry, alert owner and test incident.
10. Security scan, SBOM, secret scan, privacy/accessibility and threat model.
11. Cost, quotas, billing owner and approved ceiling.
12. Change approval, rollback target and post-change verification.

**Release gate:** INTAKE → INVENTORY → CORRELATION → ARCHITECTURE → ESTIMATE → AUTHORIZATION → BUILD → TEST → SECURITY REVIEW → INDEPENDENT ACCEPTANCE → PUBLISH → LIVE VERIFICATION → OPERATE.

A release is not accepted by documentation alone. Every required check must execute against the exact candidate SHA and resource IDs, with logs and artifacts. A failed or inaccessible check remains failed/unknown.

## 14. Final disposition

- GitHub remains canonical; PR #511 remains draft/unmerged.
- Current source commit status includes a Vercel failure context; prior startup failures have not been repaired or proven clear.
- Cloudflare zone is active but its DNS/route/Worker configuration is not reconciled with repository declarations.
- Supabase project reports ACTIVE_HEALTHY and no advisor lints, but its authority and purpose are unresolved.
- Firebase project runtime configuration and security are unverified; root Hosting scope is unsafe to promote as-is.
- Datadog monitors exist but all seven report No Data.
- PostHog project exists but reports no ingested events.
- Amplitude has one Starter project; production ingestion is unverified.
- Shopify store and HubSpot account are reachable; their operational integrations are not certified.
- Linear team exists but no projects are present.
- Ahrefs usage/limits lookup is blocked by the connected plan.
- Live health probes are blocked by Cloudflare Access and therefore not a pass.
- No production mutation, merge, deploy, runner activity, DNS change, payment activation, database migration or spend occurred.

**Overall status: AUDIT IN PROGRESS — MATERIAL DRIFT / INCOMPLETE EVIDENCE — PRODUCTION HOLD.**
