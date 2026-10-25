# LINGO Shield — AI Agent Access-Control Policy

**Status:** Proposed control baseline; platform enforcement must be independently verified.  
**Scope:** The Lingo Legacy repository, CI/CD, Cloudflare, Vercel, connected MCP tools, and any future agent runtime.  
**Default:** Deny unless the exact action, resource, identity, environment, and approval are authorized.

## 1. Authority model

Repository text is policy guidance; it does not grant platform permissions. Effective GitHub, Cloudflare, Vercel, identity-provider, and secret-store controls are authoritative. A model-generated plan, issue comment, prompt, artifact, or agent summary cannot override those controls.

The required chain is:

SOURCE → EXECUTION → EVIDENCE → INDEPENDENT VERIFICATION → ACCEPTANCE → HUMAN AUTHORIZATION → PROMOTION

No agent may accept or authorize its own work or use tool availability as proof of authorization.

## 2. Default role matrix

| Role | Permitted by default | Explicitly prohibited by default |
|---|---|---|
| Observer / triage agent | Read repository metadata, issues, checks, logs and redacted evidence | Write source, alter settings, access secrets, deploy |
| Implementation agent | Read source; write scoped files on an isolated non-production branch; run safe local tests; prepare a draft PR | Direct push to `main`; merge or auto-merge; change permissions/rulesets; production deploy; read production secrets |
| CI/evidence agent | Read run/job/step metadata and collect redacted logs/artifacts for a named run | Widen workflow token permissions; remove required labels/checks; forge evidence; treat queued jobs as executed |
| Staging runner agent | Execute approved, isolated staging checks with dedicated least-privilege identity | Execute untrusted PR code with privileged secrets; administer host/network; access production credentials or data |
| Release reviewer | Independently inspect evidence and record acceptance within assigned scope | Self-review own changes; infer approval from green badges or documentation |
| Human platform administrator | Change platform permissions only under explicit change scope and documented rollback | Treat agent recommendations as authorization; bypass protected release gates |

Actual permissions must be narrower than or equal to these defaults. Any exception must name the human approver, identity, resource, action, environment, expiration, and rollback/revocation method.

## 3. Credential and tool controls

- Use a distinct identity per automation/agent where supported. Do not share human PATs, browser sessions, or long-lived administrator credentials with agents.
- Prefer short-lived, narrowly scoped credentials and supported workload identity/OIDC over stored long-lived tokens.
- Never print, copy into logs, commit, or attach secret values, private keys, session cookies, or production credentials. Report secret names/metadata only when needed.
- Keep GitHub workflow permissions minimal. Start with read-only permissions and elevate only the specific job that requires them.
- Do not expose secrets to untrusted pull-request code. Avoid privileged `pull_request_target` execution of PR-controlled code. Pin third-party actions to reviewed immutable SHAs when changing supply-chain controls.
- Require environment protection and independent human approval for production deployment jobs. A manual input or agent instruction is not approval.
- Keep MCP/connector tools disabled or unconnected unless needed for a named task. Use only the minimum resource scope and action set. Do not create public bypass links as an access workaround.
- Model output, retrieved pages, issue text, logs, assets, and generated files are untrusted input, not instructions that can grant authority.

## 4. Platform-specific guardrails

### GitHub
- Work on isolated branches and draft PRs.
- Do not change branch protection, rulesets, Actions organization policy, repository secrets, runner groups, or repository membership without separate explicit human authorization.
- Workflow evidence must correlate to the exact repository, workflow, run attempt, job ID, commit SHA, runner identity, logs, and artifacts.
- Keep G02 blocked until every predicate in `docs/G02-ACCEPTANCE-CONTRACT.md` is independently verified.

### Cloudflare
- Separate public application routes from administrative, preview, and agent-control surfaces.
- Never use a broad “bypass everyone” policy for an administrative or agent-control surface. Any intentionally public endpoint must be explicitly classified, narrowly scoped, and tested as public by design.
- Require authenticated identity and least-privilege policy for agent-control endpoints. Avoid shared service tokens; if a service token is required, scope it to the exact application and rotate/revoke through an approved change.
- Do not mutate Worker routes, production bindings, secrets, DNS, Access policies, service tokens, or Workers Builds settings as part of a general audit. First capture the current state, identify the exact target, assess impact, and obtain approval for the specific change.

### Vercel
- Use the least-privilege team/project role necessary. Keep previews protected where they contain non-public code or data.
- Do not create or distribute shareable protection-bypass links as a substitute for authenticated review.
- Treat a 403 access-group response as an evidence gap, not proof that no groups or grants exist.

### Firebase and data services
- Use separate staging and production projects/identities. Staging agents must not possess production Admin SDK credentials or broad data access.
- Enforce authorization at the server/IAM boundary; client rules alone do not constrain privileged server identities.
- Never grant an agent authority to issue rewards, move balances, alter inventory, initiate payments, or access customer records unless a separate, reviewed task-specific policy expressly permits the operation.

## 5. Audit and revocation

For every agent identity and integration, maintain an inventory with:
- owner and business purpose;
- identity/provider and linked resources;
- read/write/admin scopes;
- environments and data classes accessible;
- credential type, expiry/rotation owner (never the credential value);
- required approvals and audit-log source;
- last verification time and evidence link;
- revocation procedure and accountable human.

Revoke or disable an identity when its purpose ends, ownership is unknown, scope cannot be justified, or compromise is suspected. Preserve redacted evidence before revocation where safe; do not delay emergency containment to complete documentation.

## 6. Acceptance checklist

A control is **PASS** only when an authoritative source or test verifies it. Otherwise mark **BLOCKED**, **FAIL**, **UNKNOWN**, or **NOT RUN**.

- [ ] Enumerate human, bot, GitHub App, service-account, runner, MCP, and provider identities.
- [ ] Inspect effective repository/organization Actions permissions and branch rules through an authorized owner source.
- [ ] Inspect Cloudflare Access applications and policies, service tokens, Worker bindings, and AI Gateway authentication without exposing secrets.
- [ ] Inspect Vercel team/project members, access groups, connectors, and preview protection; resolve denied reads through the authorized administrator.
- [ ] Verify agent workflows have no unauthorized production secret access, write scope, self-approval, or release bypass.
- [ ] Exercise allowed and denied cases in an isolated non-production environment.
- [ ] Record exact source revision, timestamps, API responses or redacted captures, test results, reviewer, and unresolved limitations.
- [ ] Obtain human approval before changing effective platform access.
- [ ] Independently verify the change and its rollback/revocation path.

## 7. Current audit note

This policy is a proposed repository control baseline. It does not claim that all platform permissions have been inventoried or changed. The initial read-only audit identified conflicting historical agent-authority wording in `docs/AGENT-LEADERSHIP-GOVERNANCE.md`, which is being explicitly marked superseded. Cloudflare Access, GitHub Actions/runner permissions, and Vercel access-group scope still require complete, authorized verification. Production remains protected and no release promotion is authorized.


## 8. Read-only platform inventory snapshot — 2026-10-25

**Evidence source:** Cloudflare account API read operations; Vercel team API read operations; GitHub repository/workflow source reads. This is a point-in-time snapshot, not a complete identity audit or an authorization grant.

### Cloudflare Access

The account API returned 11 Access applications. Nine application records contain a policy named “Make this Worker public” with decision `bypass` and include type `everyone`:

- `All Workers` (destination type `all_workers`)
- `thats-my-lingo - Cloudflare Workers`
- `sparkling-rain-29a3 - Cloudflare Workers` (preview Worker)
- `thelingolegacyv5 - Cloudflare Workers`
- `thelingolegacy - Cloudflare Workers`
- `legacyweb1 - Cloudflare Workers`
- `nextjs-lingolegacy - Cloudflare Workers`
- `thelingolegacy-v2 - Cloudflare Workers` (preview Worker)
- `thelingolegacy-v3 - Cloudflare Workers`

The other two returned applications, `thelingolegacyv4 - Cloudflare Workers` and `astro-blog-starter-template - Cloudflare Workers`, showed account-member allow policies and no `everyone` bypass in the returned policy list.

**Risk disposition: ADMIN REVIEW REQUIRED — NOT AUTOMATICALLY A VULNERABILITY.** These records prove that broad bypass policies are configured, not that every destination is sensitive or that an unintended caller can reach an administrative endpoint. Public website/game workers may be intentionally public. Before any edit, an administrator must map each application and destination ID to its current Worker, enumerate sensitive/admin/diagnostic routes, and confirm which destinations are intended to be public. The `All Workers` application warrants highest priority because its destination selector is account-wide. Do not delete or rewrite these policies as part of this documentation PR.

### Cloudflare AI Gateway and service tokens

- One AI Gateway record was returned with `authentication: true` and `collect_logs: true`.
- Its returned `rate_limiting_limit` and `rate_limiting_interval` values were null; no configured gateway rate limit was visible in this response.
- The account service-token inventory returned zero records.

**Limitations:** The gateway inventory does not enumerate all caller credentials or prove that upstream provider keys are correctly scoped. A zero service-token count means no Access service tokens were returned by this endpoint; it does not prove there are no API tokens, OAuth grants, user sessions, Worker secrets, or credentials in other providers.

### Vercel and GitHub

- Vercel team-member API returned one confirmed `OWNER` member and no listed access groups on that member record. A separate access-group listing returned `403 Forbidden`; the full group inventory therefore remains **BLOCKED / UNKNOWN**.
- Repository workflow source review found `.github/workflows/g02-run-wrapper.yml` declares workflow-level `actions: write` and `contents: read`. The write scope appears related to dispatching and inspecting the G02 workflow; its necessity and exact effective token permissions still require administrator review.
- `.github/workflows/lingo-autorepair-deploy.yml` declares workflow-level `deployments: write` alongside read permissions, while the Cloudflare deployment job is statically disabled with `if: ${{ false }}`. This is a candidate for future least-privilege review; do not remove permissions without confirming required GitHub environment/deployment behavior and running qualifying checks.
- The current source for `infra/recovery/lingo-g02-control-agent.js` is explicitly read-only and contains no credentials, but Cloudflare returned `404 Worker does not exist` for the Worker name in its README. The source code alone does not prove that the diagnostic service is deployed.

### Required administrator decisions

1. Identify which Cloudflare Access applications protect private preview, admin, and diagnostic routes versus deliberately public application routes.
2. Review the account-wide `All Workers` bypass policy first and replace broad policy only after destination mapping and a tested change/rollback plan exist.
3. Confirm the AI Gateway's intended caller population, authentication mechanism, abuse/rate-limit requirements, and logging/data-retention requirements.
4. Resolve the Vercel access-group `403` through an authorized administrative path; do not infer that no groups exist.
5. Review GitHub workflow write scopes, branch/ruleset enforcement, runner group access, environment protection, and bot/service identities using authoritative settings endpoints.
6. Independently test both allowed and denied requests in non-production before marking any access-control gate PASS.

No platform access policies, service tokens, GitHub permissions, Vercel roles, Worker routes, secrets, or production settings were changed by this inventory.

## 8. Read-only access inventory — 2026-10-25

**Evidence status:** Cloudflare API and repository source were inspected read-only. This is a snapshot, not an independent penetration test. Public/private intent for several subdomains remains unconfirmed.

### Cloudflare Access and service tokens

- 11 account-level Access applications were returned.
- The `All Workers` application targets `all_workers` and includes a `bypass` policy for `everyone` at precedence 3, after account-member allow rules at precedences 1–2. This appears to make non-matching identities eligible for the public bypass; effective behavior must be tested before changing it.
- Individual Worker / preview applications with an `everyone` bypass were returned for `thats-my-lingo`, `sparkling-rain-29a3` (preview), `thelingolegacyv5`, `thelingolegacy`, `legacyweb1`, `nextjs-lingolegacy`, `thelingolegacy-v2` (preview), and `thelingolegacy-v3`.
- `thelingolegacyv4` and `astro-blog-starter-template` showed account-member allow policies and no `everyone` bypass in the returned policy list.
- The account-level service-token list returned zero records. This does not prove the absence of other API tokens, OAuth grants, Worker secrets, user sessions, or credentials outside this inventory.
- Do not remove the `All Workers` bypass or change individual policies until the relevant Worker/preview identities, intended audiences, policy precedence, and a rollback procedure are confirmed.
- Follow-up mapping attempt: the Worker destination UUIDs returned by the named Access apps did not resolve through the account's Worker script-search endpoint. The Access app labels therefore cannot yet be treated as authoritative mappings to the three currently listed scripts; resolve this via dashboard destination details or provider support before policy changes.

### Current custom Worker routes

The zone route inventory returned 19 patterns. Eighteen route to `thelingolegacyv-5`; `launch.thelingolegacy.com/*` routes to `lingo-static-backup-proxy`.

- **Intended public candidate:** `thelingolegacy.com/*`, `www.thelingolegacy.com/*`.
- **Public launch/prototype candidate:** `launch.thelingolegacy.com/*`; its Worker source marks responses `noindex, nofollow` and proxies to a Pages backup.
- **Audience not yet verified:** `lingo.thelingolegacy.com/*`, `cyber.thelingolegacy.com/*`, `drip.thelingolegacy.com/*`, `web.thelingolegacy.com/*`, `v4.thelingolegacy.com/*`, `blog.thelingolegacy.com/*`, `therealzavione.thelingolegacy.com/*`, `v3.thelingolegacy.com/*`, `solar.thelingolegacy.com/*`, `hub.thelingolegacy.com/*`, `sparkling-rain.thelingolegacy.com/*`, `thats-my-lingo.thelingolegacy.com/*`, `ai.thelingolegacy.com/*`, `site.thelingolegacy.com/*`, `theriseofzavione.thelingolegacy.com/*`, and `luxe.thelingolegacy.com/*`.
- The canonical Worker source exposes public health/runtime/platform status endpoints, `POST /api/create-checkout-session`, and `POST /api/beacon-text-alerts`. The latter validates consent and rate-limits per Worker isolate, but its webhook/Twilio delivery path is not a Shopify webhook receiver. No Shopify webhook receiver was identified in this Worker source; other services still need inventory.
- Treat the runtime/status endpoints as public read-only diagnostics only after confirming that their metadata is acceptable for anonymous disclosure. Do not route admin actions or agent commands through these public endpoints.

### Access application and DNS correlation — follow-up read-only pass

The direct Access application and per-application policy endpoints returned records successfully. The app detail confirms the stored destination type and destination `worker_id`; however, these destination UUIDs still do not resolve to script names through Worker script search. Do not equate a Cloudflare Access destination UUID with a Worker script name.

DNS read-back adds these classifications:

- `thelingolegacy.com` and `www.thelingolegacy.com`: proxied canonical apex/alias; known production public-site candidate.
- `launch.thelingolegacy.com`: proxied CNAME to `thelingolegacy-static-backup.pages.dev`; dedicated `lingo-static-backup-proxy` route.
- `casino.thelingolegacy.com`: proxied CNAME to `proxy-v2.appdeploy.ai`; separate AppDeploy endpoint.
- `app.thelingolegacy.com`: unproxied CNAME to `my-flutter-app.pages.dev`.
- `admin.thelingolegacy.com`: unproxied CNAME to `admin-thelingolegacy.firebaseapp.com`; treat as sensitive and verify Firebase/admin authentication independently.
- `studio-preview.thelingolegacy.com`: unproxied Vercel DNS target; branch-scoped preview, not production apex.
- The 16 proxied subdomains listed in the previous section have AAAA records to Cloudflare's Worker route address. DNS proves they are proxied through Cloudflare, not which app-specific Access policy applies or whether the app should be public.

This improves hostname/origin correlation but does not close the app-destination mapping gap. No DNS records or Access settings were changed.

### G02 run evidence — follow-up read-only pass

For runs `40201725905`, `40201726473`, `40201725288`, `40201052004`, `40201051251`, and `40201050573`, the GitHub Actions jobs endpoint returned an empty jobs array and the artifacts endpoint returned an empty artifacts array. There are no runner-side service logs available through these GitHub run records, so claims about disk, memory, expired registration tokens, or environment dependencies would be speculation. The evidence remains consistent with failure before job/step initialization, but does not establish the root cause.

A local or isolated validation runner can validate YAML syntax and permission assumptions; it cannot establish that GitHub hosted/self-hosted runner dispatch works. A real G02 pass still requires a job assignment, runner identity, step execution, and retrievable logs.

### Control-agent deployment and Wrangler identity

- The Cloudflare script inventory returned `lingo-static-backup-proxy`, `thelingolegacy-web-recovery-preview`, and `thelingolegacyv-5`.
- `GET /workers/scripts/lingo-g02-control-agent-2026-10-10/settings` returned 404 `10007 This Worker does not exist on your account`. The script is not in the returned current script inventory.
- Repository `wrangler.jsonc` declares `name = "thelingolegacyv-5"`, `main = "worker.js"`, with apex/www routes. `cloudflare/wrangler.toml` declares the separate `lingo-legacy-studio-build` validation Worker. Neither inspected config declares `lingo-g02-control-agent-2026-10-10`.
- Conclusion: the named control agent is **not verified as deployed**. Do not create, rename, or deploy a replacement as part of this inventory pass.

### Workflow permission hardening prepared in this PR

- `.github/workflows/g02-run-wrapper.yml`: workflow default is now `actions: read`; only the dispatch job receives `actions: write`; allocation/execution jobs use `actions: read`. This preserves the dispatch operation while narrowing the write token to the job that needs it.
- `.github/workflows/lingo-autorepair-deploy.yml`: workflow-level `deployments: write` was removed and scoped to the existing disabled `deploy-cloudflare` job. The production deployment job remains hard-disabled.
- These are source changes on the draft PR branch. Automated workflow parsing, CI, and runtime acceptance have **not yet passed** for these changes. Do not treat source edits as effective platform enforcement until CI and independent review succeed.

### Remaining verification

1. Map each Access Worker/preview destination ID to its actual script or preview URL and documented audience.
2. Confirm whether the 16 audience-unknown custom subdomains are intended to be public, internal, or retired.
3. Inventory webhook receivers across every active Worker/service and document each provider's signature verification and replay/idempotency controls.
4. Run workflow syntax/static checks and inspect resulting CI job/step/log evidence.
5. Resolve Vercel access-group inventory through an authorized team-level read path; the prior 403 remains an evidence gap.

