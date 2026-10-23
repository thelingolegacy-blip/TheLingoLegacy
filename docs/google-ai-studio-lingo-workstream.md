# Google AI Studio + LINGO LEGACY Workstream

**Status:** design and implementation package only; isolated branch; not deployed.
**Production policy:** fail closed. G02 remains FAIL / UNVERIFIED. G03–G11 remain BLOCKED. Production mutation stays FROZEN and last-known-good stays PROTECTED.

## Objectives covered

1. Use Google AI Studio Build mode to prototype LINGO AI and import/export code through the isolated GitHub branch.
2. Extend the Studio Control Center as a read-only operations surface for runtime status, release gates, module inventory, provider readiness, and approval tracking.
3. Investigate G02 runner dispatch with a bounded diagnostic agent; never treat AI-generated analysis as execution evidence.
4. Define a LINGO development agent that can inspect, propose, test, and prepare changes but cannot merge, deploy, alter secrets, change permissions, issue rewards, or activate production.
5. Evaluate AI Studio as a development tool, not as a replacement production authority or runner repair mechanism.

## Recommended architecture

- **Source of truth:** GitHub repository and reviewed commits.
- **Production edge:** Cloudflare Worker and routes; keep the current last-known-good release untouched.
- **Identity/data:** existing Firebase services and server-authoritative authorization, when verified.
- **AI prototyping:** Google AI Studio Build mode with Gemini; import this repository or a narrow prototype from the feature branch.
- **AI provider boundary:** server-side adapter only. Gemini credentials must live in a server-side secret store and must never be committed, returned to the browser, or embedded in mobile/web bundles.
- **Operations:** GitHub Actions and the actual runner host remain authoritative for CI execution. Google AI Studio cannot make an unassigned GitHub job run.
- **Deployment:** keep Cloudflare as the production edge. Do not deploy from AI Studio/Cloud Run as a side door around the release gates.

## Workstream A — LINGO AI prototype

Build an authenticated-ready but non-privileged assistant with the following capabilities:

- Explain current platform status and gate evidence.
- Summarize logs, artifacts, and repository changes provided by authorized sources.
- Draft test plans, code changes, incident notes, and pull-request descriptions.
- Return structured action proposals with: action ID, purpose, target, risk level, required permissions, preconditions, evidence required, rollback plan, and approval state.
- Refuse to represent a suggested or simulated action as completed.

Initial modes: **Observe**, **Analyze**, **Propose**, and **Verify**. No autonomous **Execute**, **Promote**, **Deploy**, **Pay**, **Reward**, or **Activate** mode.

## Workstream B — Studio Control Center

The current `studio/index.html` surface is read-only and should remain so until authentication, authorization, audit logging, CSRF protection where applicable, server-side action handlers, and evidence-backed approval flows are implemented and tested.

Required sections:
- Release gate matrix and evidence timestamps.
- Runner inventory / last check-in / labels / assignment / log artifact links.
- Cloudflare runtime and public reachability evidence, kept distinct.
- Gemini provider readiness (configured / not configured; never expose secret values).
- Billing integration readiness (configuration is not proof of live billing).
- Access and approval ledger, showing requested / approved / denied / executed as distinct states.
- Module registry and integration health.
- Audit trail and change provenance.

A visible button must not imply that a backend action exists. Keep privileged controls disabled until a server-side authorization path and its tests are present.

## Workstream C — G02 runner recovery

The G02 agent may:
1. Read repository workflow definitions and expected labels.
2. Parse host diagnostics, runner inventory, job assignment, logs, and artifacts supplied by the actual host/GitHub.
3. Compare each observation against the G02 acceptance predicate.
4. Produce a finding and next diagnostic command.

It may not:
- fabricate runner inventory or claim a queued job executed;
- change GitHub Actions policy, register a runner, start a host service, or alter secrets;
- bypass the runner gate or dispatch a production deployment.

G02 passes only when evidence independently establishes: a matching runner; nonzero runner ID; populated runner name; job assignment; instantiated steps; executed sentinel; retrievable logs; retrievable artifact; and independent verification. AI analysis is not a substitute for any predicate.

## Workstream D — bounded development agent

Agent lifecycle:
1. **Discover:** read only approved repository files and current gate status.
2. **Plan:** produce scoped change proposal and risk classification.
3. **Implement:** write only to an isolated feature branch.
4. **Validate:** run available checks and report unavailable checks explicitly.
5. **Review:** prepare a draft PR with changed-file inventory, test evidence, security review, and rollback.
6. **Await approval:** never merge, deploy, rotate credentials, change permissions, or activate production autonomously.
7. **Verify:** compare actual post-action state against the requested outcome and preserve evidence.

Every action is deny-by-default. Unknown permissions, missing evidence, failed tests, unavailable logs, or inconsistent state mean STOP.

## Workstream E — AI Studio workflow evaluation

### Good fit
- Natural-language app prototyping and iterative UI work.
- Gemini prompt and model experiments.
- A fast, isolated prototype with a live preview.
- GitHub import/sync for source exchange and Cloud Run preview/deployment when explicitly approved for a non-production environment.

### Not a substitute for
- GitHub Actions runner provisioning or host-level service management.
- Branch protection, required checks, approval rules, release evidence, or audit controls.
- Cloudflare production routing and DNS authority.
- Production certification, public reachability validation, or the G02 gate.

### Adoption decision
**Adopt AI Studio for prototype and agent-design work; do not make it a production deployment authority.** Import only the isolated branch, review every generated diff, keep credentials server-side, and return changes through the existing PR/evidence process. Cloud Run can be considered later for a separate sandbox, with cost, identity, data residency, observability, and teardown reviewed first.

## Safe setup sequence

1. Open Google AI Studio Build mode and import the GitHub repository, selecting `studio/creative-experience-upgrade-2026-10-10` if the importer supports branch selection.
2. If the importer only offers the default branch, do not grant write access to the production branch; create a separate sandbox repository or download the feature branch as a ZIP and import that copy.
3. Start with the companion prompt at `studio/google-ai-studio-build-prompt.md`.
4. Keep `GEMINI_API_KEY` in the AI Studio server-side Secrets panel for a prototype, or in the approved production secret store for a later integration. Never place a real key in repository files, browser code, prompts, screenshots, or issue comments.
5. Review generated changes locally or in a separate branch. Run automated checks and security review.
6. Update the draft PR with evidence. Do not merge or deploy while G02 is unresolved.
7. If an AI Studio prototype is deployed to Cloud Run, label it sandbox-only, restrict access, establish a budget/usage limit, and do not point production DNS to it.

## Acceptance criteria

- [ ] LINGO AI prototype runs with server-side Gemini access and no client-exposed key.
- [ ] All responses distinguish observations, inferences, proposals, and verified actions.
- [ ] Control Center remains read-only unless a separately reviewed backend authorization design is accepted.
- [ ] Agent action proposals include preconditions, evidence, risk, and rollback.
- [ ] G02 report links to real GitHub runner/job/log/artifact evidence; no AI-generated substitute evidence.
- [ ] Automated tests and security checks pass with retrievable logs.
- [ ] Changes remain on an isolated branch and a draft PR.
- [ ] G02 is independently verified before any release-gate progression.
- [ ] No production mutation, merge, deployment, billing action, reward issuance, or activation occurred without explicit authorization and passing gates.

## Current known blockers

- G02 runner dispatch remains FAIL / UNVERIFIED.
- G03–G11 remain BLOCKED.
- Production mutation is FROZEN; last-known-good is PROTECTED.
- Google AI Studio account/project, GitHub import authorization, Gemini secret configuration, and any sandbox deployment have not been verified from this session.
