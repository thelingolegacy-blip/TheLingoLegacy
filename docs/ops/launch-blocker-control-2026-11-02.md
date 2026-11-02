# LINGOlegacy launch-blocker control record — 2026-11-02

## Operating boundary

This record captures live connector/API observations and explicit owner actions. No security control, credential, DNS record, production route, billing setting, or store publication was bypassed. PR #432 remains a draft; production/LKG remains protected.

## P0 — Credential and account security

### GitLab project runner credential
- Project: `zavionecook/FameMoneyFortune` (ID 75092923).
- The project metadata response exposed its runner registration credential. Treat the credential as compromised; the value is deliberately excluded from source, logs, and this record.
- Confidential incident: [GitLab issue #2](https://gitlab.com/zavionecook/FameMoneyFortune/-/issues/2).
- The connected GitLab actions do not expose the project runner-token reset endpoint. An authorized project owner must reset/revoke it in GitLab's project CI/CD runner settings or the supported GitLab API, then inventory and re-register only approved runners.
- Both visible legacy FameMoneyFortune projects have no pipeline jobs in their latest recorded pipelines. The owner project pipeline is failed with `started_at=null`; the group fork pipeline is also failed with `started_at=null`. This is not evidence of runner execution.

### GitLab account MFA
- Authenticated account: `zavionecook`.
- GitLab profile reports `two_factor_enabled=false`.
- MFA enrollment must be completed by the account owner in GitLab security settings. The connected API does not provide an authenticated enrollment flow.

### Cloudflare account MFA
- Cloudflare account has one member, Super Administrator; the member's MFA enrollment is false.
- The connected Cloudflare API does not expose the user's own MFA enrollment action. Enable MFA through the Cloudflare account security UI and confirm recovery methods before changing Access policy.

## P1 — Cloudflare Access and DNS

### Access policies
- 11 Access applications were inventoried.
- Nine policies are named `Make this Worker public`, with `decision=bypass` and `include=everyone`; one is the `All Workers` application.
- These are explicit public-surface policies, not automatically proof of compromise. Do not globally replace them with allow/deny policies until each Worker route is classified public vs. private and admin/API endpoints are isolated.
- No Access policy was changed in this pass.

### DNS / origin
- Zone `thelingolegacy.com` is active.
- Existing Worker routes include `thelingolegacy.com/* -> thelingolegacyv-5`, exact root `thelingolegacy.com/ -> lingo-flagship-root`, and `www.thelingolegacy.com/* -> thelingolegacyv-5`.
- A live homepage fetch returned the LINGOlegacy candidate landing page. This validates the homepage path through the current edge route, not an origin server or failover.
- Apex A record remains a proxied documentation-placeholder address. Do not replace it without a defined origin/Worker architecture and rollback plan.
- `admin` and `app` are DNS-only CNAMEs to Firebase/Pages; `studio-preview` remains DNS-only and points to a Vercel DNS target. These require ownership/route confirmation before changes.

## P1 — R2
- A non-destructive create-bucket API attempt for an empty staging bucket returned HTTP 403, Cloudflare error code 10042: enable R2 through the Cloudflare Dashboard.
- No bucket was created; no API token was generated; no billing or plan change was made.
- After owner activation, create an empty private staging bucket first. Do not attach a public custom domain or issue object credentials until CORS, access policy, lifecycle, and cost controls are reviewed.

## P1 — Firebase and mobile publishing

### Firebase / Flutter
- Existing Android application ID: `com.thelingolegacy.app`.
- `lib/firebase_options.dart` still contains placeholder API keys and app IDs.
- `google-services.json` is absent.
- `android/app/build.gradle` uses debug signing for release builds; this is not Play Store ready.
- iOS Xcode project and generated plugin registrant are stubs, not a complete iOS build target.
- PR #432 changes Firebase Hosting's public directory from repository root to `build/web`. That hardening is isolated on the PR branch and is not active on main until separately reviewed and merged.
- Firebase project/app registration requires the connected Firebase account and actual Android/iOS/Web app records. Do not invent API keys or app IDs.

### App Store Connect / Google Play
- No store connector or verified store account session is available in this workspace.
- No store registration, app submission, signing, tax/banking setup, or publication was performed.
- Required next steps: register/confirm the bundle/package IDs; configure Android upload signing and iOS distribution signing; complete privacy, content rating, data-safety, support URL, screenshots, and store agreements; then submit through the respective owner accounts.

## P0 — G02 / GitHub Actions

Latest sampled runs on the platform recovery branch:
- `41422993354` Platform operations preview validation — `startup_failure`, zero jobs, zero artifacts.
- `41422991844` Lingo Legacy Static CI — `startup_failure`, zero jobs, zero artifacts.
- `41422989963` Crimson Smoke UI — `startup_failure`, zero jobs, zero artifacts.
- `41422988479` G02 Runner Image Build — `startup_failure`, zero jobs, zero artifacts.
- `41422980251` lingo-autorepair-deploy — failed, zero jobs, zero artifacts.

No actual job assignment, runner ID, runner name, steps, sentinel, logs, or artifacts were returned. The GitHub connector does not expose a workflow-dispatch write action or persistent G02 host shell. No runner restart, token regeneration, or execution claim is made. Restore the host and assignment path, then capture a new assignment probe, sentinel logs, artifacts, and independent API verification.

## Current release posture

- PR #432 is open, draft, and mergeable; it is not merged.
- Render staging operations portal is live; provider-side logs remain unverified.
- Cloudflare staging World Engine schema and GET-only Worker remain separate from production.
- Production routes, DNS, Worker allocations, D1 production data, secrets, billing, payments, and release authorization remain unchanged.

## 2026-11-02 follow-up — Access policy inventory precision

A second read-only pass fetched the Access application objects and each application's policy list directly.

- 11 applications were returned. The API response did not include an application domain for any of the 11, so hostname-to-application mapping remains unresolved.
- The nine bypass/everyone policies are attached to:
  - All Workers
  - thats-my-lingo - Cloudflare Workers
  - sparkling-rain-29a3 - Cloudflare Workers
  - thelingolegacyv5 - Cloudflare Workers
  - thelingolegacy - Cloudflare Workers
  - legacyweb1 - Cloudflare Workers
  - nextjs-lingolegacy - Cloudflare Workers
  - thelingolegacy-v2 - Cloudflare Workers
  - thelingolegacy-v3 - Cloudflare Workers
- thelingolegacyv4 - Cloudflare Workers and astro-blog-starter-template - Cloudflare Workers did not return an Everyone-bypass policy in this inventory.
- Four policies named Email domain use an email_domain.domain value that is a full email address (for example, therealzavione@thelingolegacy.com or thelingolegacy@gmail.com) rather than a domain value. Treat these as malformed/misconfigured policy selectors pending provider validation; do not assume they grant access or provide effective protection.
- Account-member allow policies are also present on several applications, but do not neutralize an Everyone-bypass policy.
- No Access application or policy was modified. Before remediation, obtain an owner-approved route inventory mapping each application to exact hostnames and classifying every endpoint as public, authenticated-user, admin, or internal. Replace broad bypass only for confirmed private/admin surfaces, test allowed and denied identities, and retain rollback evidence.
- Account owner action remains required for MFA enrollment. No MFA state change was performed by this read-only pass.
