# LINGOlegacy Ecosystem Operating Model

Status: Architecture contract / not live-connected
Owner: LINGOlegacy
Network host: Neveah (host-1)
Source of truth: GitHub for code, configuration, decisions and release evidence

## 1. One ecosystem, many worlds

LINGOlegacy is one connected portfolio with independently owned products and worlds. A visitor may move between experiences, but each world retains its own identity, permissions, data boundaries, accessibility needs and release lifecycle.

The portfolio registry must represent at least these top-level domains:
- LINGOlegacy_MASTER — governance, legal, brand, creative, products, website, engineering, business, releases and archive.
- LINGOlegacy — flagship identity, account, wallet and community.
- LINGOlane — Designs & Promotions, Apparel and Laundry-Cycle.
- LINGOslots — That’s My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Lingo Lions Eruptions and Cashman Lingo Mania.
- LINGOarcade — Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly and Jersey Shore: The Undead.
- LINGOlibrary — KottonsCode, The Block I Grew Up On, Say It Again, Dice Shift Hotel and Legacy Legends.
- LINGOmedia — Rise of Zavione P1/P2.
- LINGOworld — LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge and LINGOdonations.
- LegacyXclub.

This is the initial known portfolio map, not a substitute for importing and validating the canonical product registry. Never invent a route, URL, owner, deployment, or live state.

## 2. Visitor journey and invisible-world transitions

The public website should feel like one coherent ecosystem:
1. A shared landing experience introduces the LINGOlegacy identity and routes visitors to the correct world.
2. Each world has a distinct landing page, purpose, visual identity and clear next action.
3. Shared navigation, account identity, accessibility, consent and support patterns make transitions understandable.
4. A transition handoff carries only the minimum authorized context: source world, destination world, route intent, locale, consent state and a short-lived correlation ID.
5. The destination resolves its own permissions and data access. A handoff never grants access by itself.
6. Visitors can return to the hub without losing their place when the destination supports resumable sessions.

“Invisible worlds” means the architecture can host experiences that are not all shown in the main navigation until their entry point is intentionally surfaced. It does not mean hidden tracking, secret data sharing or bypassing user consent. Use explicit discovery, visibility and publication states: internal, preview, listed, published, retired.

## 3. Pipeline contract

Every work item moves through explicit stages:
DISCOVER → DEFINE → DESIGN → BUILD → INTEGRATE → VERIFY → ACCEPT → RELEASE → OBSERVE → MAINTAIN.

Each stage has:
- a stable work-item ID and parent project ID;
- one accountable owner and optional collaborators;
- inputs and source references;
- dependencies and affected components;
- entry criteria and exit/acceptance criteria;
- authorized tools and environment;
- a checkpoint reference before mutation;
- test/evidence references after work;
- status: proposed, ready, active, blocked, failed, verified, accepted, released or retired.

The next stage must not start merely because the previous agent says it is done. It starts when its exit criteria and required evidence are satisfied. A receiving agent sees the stage manifest, prior decisions, open risks, dependency graph, checkpoint and exact next action.

## 4. Agent spots and host responsibilities

Each agent spot is a bounded workspace with:
- role-specific tools and project-scoped context;
- assigned work queue and workload/capacity;
- current stage and next-step instructions;
- read-only portfolio status and relevant dependencies;
- checkpoint create/restore request flow;
- health and collision alerts;
- a durable handoff back to Master Chat.

Neveah coordinates the pipeline and resolves routing conflicts. The original task owner remains accountable for integration. A specialist can help another agent directly, but cannot silently take ownership or broaden permissions. Agent spots must not depend on one person remembering the state.

## 5. Dependency graph and collision prevention

Represent projects, pages, routes, components, APIs, data collections, assets, design tokens, workflows and deployments as typed nodes in a dependency graph. Edges describe imports, links, consumes, publishes, shares-token-with, reads-from, writes-to, deploys-to and depends-on relationships.

Before a change:
- calculate direct and transitive dependents;
- identify shared components, routes, tokens, assets and data contracts;
- check whether another active task has overlapping write scope;
- detect route, identifier, schema, package, asset-name and design-token collisions;
- flag incompatible versions and circular dependencies;
- create an isolated branch/workspace and checkpoint.

Use a single-writer lease for shared mutable resources, optimistic concurrency for records, and explicit merge/rebase review for source changes. If collision detection is uncertain, pause the overlapping mutation and ask for review.

## 6. Portfolio-wide continuity

The portfolio state is the union of source-of-truth project records, GitHub issues/PRs/commits, release holds, decisions, task history, accepted checkpoints and runtime health snapshots. Chat messages are collaboration records, not authority to overwrite canonical state.

On every handoff, preserve:
- project and work-item IDs;
- source commit/ref and working branch;
- last-known-good checkpoint;
- current stage and completed criteria;
- pending changes and uncommitted work warnings;
- dependencies and affected routes/components;
- test results and evidence locations;
- known defects, risks and approvals;
- next action and rollback target.

If records disagree, preserve the safer state, show the conflict and reconcile against the authoritative source.

## 7. Release and publication rules

Preview, staging and production are separate environments. A page or world may be built and tested in preview without becoming publicly discoverable. Production publication requires the applicable security, accessibility, content, privacy, performance, QA and release gates plus explicit human authorization. No agent or host can authorize its own production promotion.

## 8. Success measures

Track portfolio-wide and per-world:
- landing-page availability and route correctness;
- navigation completion and broken-link rate;
- page performance and Core Web Vitals;
- accessibility conformance;
- build/test pass rate and defect escape rate;
- checkpoint freshness and restore-test success;
- dependency collision rate and time to resolve;
- task handoff latency and blocked duration;
- deployment rollback frequency;
- cost per successful task and model/provider error rate.

Define baselines and thresholds from measured traffic and service objectives; do not invent targets or claim a metric is healthy without observations.
