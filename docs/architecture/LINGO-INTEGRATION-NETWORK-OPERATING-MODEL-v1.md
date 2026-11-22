# LINGO Integration Network Operating Model v1
Date: 2026-11-09
Status: architecture proposal and connected-tool capability inventory; not certification of every provider account or live system.

## 1. Executive principle
The LINGO network should operate as one portfolio with shared control, not a collection of disconnected apps. Take many affordable, reversible swings; protect the foundations whose failure could endanger customers, money, data, legal standing or the whole company.
Separate exploration (cheap prototypes and mock data), validation (observed user behavior and willingness to pay), and scale (hardened identity, security, operations, support, legal review and deployment evidence). Be bold on experiments and disciplined with irreversible actions.

## 2. Connected integration inventory
The current tool environment exposes 1,832 callable actions across 44 integration namespaces plus files/settings. This is tool-surface availability, not a count of connected accounts or proof of provider permissions.

### Account probes completed
| Provider | Observed result | Limitation |
|---|---|---|
| GitHub | One app installation on thelingolegacy-blip; repository selection all | Does not prove runner admin, branch protection write or every repository endpoint. |
| Cloudflare | Authenticated profile returned | Identity reachable; scopes and production mutation authorization not certified. |
| Supabase | One ACTIVE_HEALTHY project zoksxavxmgnkrthselek, us-west-2, Postgres 17.6 | Project purpose and relationship to Firebase remain unreconciled; do not silently substitute. |
| Stripe | TheLingoLegacy account visible, livemode=false | Test mode only; no live payment capability inferred or exercised. |
| Shopify | Loyalty Lane store visible, Advanced plan, USD, EST | Store identity reachable; costs, catalog and public state need separate review. |
| AppDeploy | Three linked account IDs; two resolve to one user ID, one to another | Map each app and source to the correct account before writes. |
| Figma | Starter team, View seat, role admin, Code Layers enabled | File-level permissions still govern each file. |
| GitLab | Authenticated profile returned | GitHub remains canonical source unless an explicit migration decision changes it. |
| monday.com | One active member; no relevant boards; one Getting Started doc | Connector reachable, but no LINGO execution board identified. |
| Render | One workspace visible | No LINGO service/deployment identity verified in this pass. |
| Replit | One editable app, Lingo Legacy Gaming, last updated 2026-10-26 | Source/runtime relationship to GitHub unverified. |
| Higgsfield | Private workspace, Free plan, 10 credits | Credits limited; estimate cost before generation. |
| HubSpot | Portal exists; onboarding incomplete | CRM/marketing operations not ready until onboarding and schema/access are established. |
| Vercel | Authenticated user lookup returned 404 user-not-found | Treat account linkage as unavailable/unverified; do not introduce new Vercel dependency. |

### Other available integration namespaces
| Domain | Available namespaces | Recommended role |
|---|---|---|
| Engineering/platform | GitHub, GitLab, Cloudflare, Supabase, Render, Vercel, Replit, AppDeploy, OpenAI Platform | Source, code review, build, deploy, edge, API/data and AI application workflows. GitHub canonical; Cloudflare authoritative edge. |
| Work management | monday.com, Atlassian Rovo, Google Calendar, Automations, HubSpot | One task system, issue coordination, scheduling, CRM and follow-up. Avoid duplicate task truth. |
| Files/knowledge | Dropbox, Files, Adobe | Evidence archive, source assets, document processing and records. |
| Design/media | Figma, Canva, Adobe, Higgsfield, Runway, AI Voice Generator, InVideo, Explain Video Generator, Apple Music | Design systems, original imagery, motion, audio, voice and campaigns; track rights and provenance. |
| Commerce/finance | Shopify, Stripe, Finances, GoDaddy | Storefront, test payments, finance visibility and domains. Live money movement needs separate approval. |
| Audience/marketing | Metricool, vidIQ, HubSpot, LinkedIn | Content planning, analytics, demand discovery and distribution. |
| Analytics/operations | Datadog, PostHog, CloudX, Supademo, Malwarebytes | Observability, product analytics, ad performance, demos and link/domain risk. |
| Specialized | Blockscout, Skyscanner, GC AI, B12 Website Generator | Blockchain read-only research, travel, legal-workspace and rapid website tasks where relevant. |

### Requested but not connected
- fal: available/enabled in plugin discovery but not installed.
- Asana: available/enabled but not installed. A recent suggestion exists; no duplicate suggestion or install was initiated.
- Runway, Higgsfield, Adobe, vidIQ, OpenAI Developers, Product Design and monday.com were visible as installed plugin entries; connector identity and account permissions still vary by service.

## 3. Recommended network topology
- Control plane: LINGOlegacy_MASTER owns registry, decisions, portfolio, risks, architecture, dependencies and release governance. GitHub is canonical source. Choose one work-management system. Calendar and automations handle timing/alerts, not duplicate task databases. Evidence archive stores logs, artifacts, approvals and hashes.
- Shared platform plane: LINGO ID; versioned API gateway/contracts; authoritative data domains and lineage; append-only wallet ledger; event/automation layer with idempotency and dead-letter policy; correlated logs, traces, metrics and privacy-safe analytics.
- Product/distribution plane: web/mobile/game surfaces consume shared contracts. Shopify supports physical commerce. Stripe stays test mode until separate live-payment approval. Figma/Adobe/Canva/Higgsfield/Runway/voice/video tools feed controlled asset pipelines. Metricool/vidIQ/HubSpot/LinkedIn measure and distribute. Supademo documents product journeys.

## 4. Network thinking method
Model the ecosystem as a graph. Nodes: products, journeys, repositories, runtimes, routes, APIs, providers, datasets, assets, owners, tests and gates. Edges: depends_on, publishes_to, authenticates_with, reads_from, writes_to, routes_to, built_from, monitored_by, owned_by and validated_by.
Every edge should have an owner, contract, environment, evidence link and failure mode. Rank nodes by dependency centrality and blast radius. Fix high-centrality bottlenecks such as CI, identity, API gateway, data and route control because one repair can unlock many products. Before a change, calculate its impact on products, routes, APIs, datasets, journeys, tests and rollback paths. Avoid hidden cross-product coupling.

## 5. Better decision and reasoning loop
1. State opportunity and user pain.
2. Separate verified facts from assumptions.
3. Generate at least three approaches, including a reversible low-cost option.
4. Map dependencies and second-order effects.
5. Estimate expected value, downside, time-to-learning, cash cost and opportunity cost.
6. Define evidence that would change the decision.
7. Run the smallest experiment that can disprove the riskiest assumption.
8. Review results and update confidence.
9. Scale, pivot, hold or stop using explicit thresholds.
10. Record decision, evidence, owner and revisit date.
For high-impact decisions, use adversarial review: one role proposes, another tries to falsify, another checks implementation/evidence, and the executive decision owner resolves tradeoffs. Multiple model/provider opinions can help on costly decisions, but model consensus is not proof.

## 6. Portfolio risk model
Suggested starting allocation of founder attention and engineering capacity (not a cash budget): 60% flagship/shared foundations, 30% a small number of near-term growth/revenue bets, 10% moonshots.
Maintain three classes: Core (identity, APIs, wallet controls, primary surfaces and build reliability); Growth bets (no more than 2–3 at a time with a path to demand/revenue); Experiments (small tests for the rest).
Experiment rules: first test uses $0/existing tools/mock data/demo/landing page/interviews wherever possible; use a 1–2 week learning cycle with one hypothesis and one primary metric; spend only after demand evidence and explicit cost approval; treat failed cheap tests as useful learning; do not mistake sunk cost or polish for market demand.
Never risk customer funds, sensitive data, secrets, legal compliance or production domains to test an idea.

## 7. Candidate growth hypotheses
These are candidates, not declared winners. Loyalty Lane: test one small apparel capsule/preorder-interest journey and verify margin/fulfillment/returns. Kotton's Code: test one polished story plus short-form companion and measure completion, saves and parent/educator interest. That's My Lingo: test demo retention and entertainment quality with non-redeemable virtual credits; no real-money wagering/cashout. askLINGO/LINGOai: validate one frequent use case with provider-independent adapters and cost limits. Doughboys Oasis/LINGOarcade: test one complete playable loop and repeat session before expanding the full roster. Loyalty Lane Cycle: test repeat-use loop and local demand before full platform investment.
Select no more than three growth bets at a time using user evidence, cost-to-test, reachable audience, contribution margin, dependency readiness and time to learning.

## 8. Automation and safeguards
Automate PR/CI evidence, dependency checks, route/version drift reports, artifact hashes, product health/funnel dashboards, customer/support triage, content performance and decision reviews.
Do not automate production deploys, DNS/Worker routing, Firebase security rules, secret rotation, runner registration, live payment activation, refunds, financial transfers, legal commitments or business-data deletion without explicit scope and approval.
Every automation needs a trigger, scope, idempotency, retry/timeout policy, owner, audit record, notification rule and disable/rollback procedure.

## 9. Operating cadence
Daily: Master Control reviews blockers, CI, incidents and highest-value next action; workstreams report evidence-backed status; run one small learning experiment where appropriate.
Weekly: portfolio continue/pivot/stop/scale review; network bottleneck/provider concentration/data/API drift/cost review; customer/support/retention review; security and release review.
At day 30: select one flagship focus and no more than three growth bets; close or defer weak experiments; reallocate capacity to products with user proof; publish a portfolio scorecard and updated dependency graph.

## 10. Next actions
1. Choose one task system. monday.com is connected but no LINGO board was returned; Asana is available but not installed. Do not mirror tasks in both.
2. Map the three AppDeploy links and every app to canonical repo, commit, runtime, domain, API and deployment. Do not write until intended account is selected.
3. Reconcile Supabase identity/purpose with Firebase. Decide if it is a separate service or migration candidate; do not create accidental parallel backends.
4. Verify Cloudflare scopes, routes and origins while production remains protected.
5. Use Shopify for Loyalty Lane store work; Stripe test mode for payment development only until live-payment readiness and authorization.
6. Complete HubSpot onboarding only if CRM/marketing pipeline operations are in scope.
7. Review Figma file-level permissions before design writes.
8. Restore trustworthy GitHub CI/G02 execution before relying on CI-driven automation.
9. Consider fal for scalable generative assets when desired; it is available but not installed. Asana is similarly available but not installed.
10. Establish an Integration Registry: provider, connected identity, account/workspace, scopes, owner, cost/plan, data classification, capabilities, source-of-truth status, fallback, last verified time and evidence link.

This is an architecture strategy and observed capability inventory. It does not prove every integration is connected, external agents are assigned, or production systems have changed.