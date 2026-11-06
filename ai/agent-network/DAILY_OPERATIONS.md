# Daily Operations, Scheduling and Portfolio Continuity

Status: Schedule contract; no scheduler or agent runtime is connected yet.
Default timezone: America/New_York; configurable.

## Daily planning inputs

Neveah compiles:
- founder priorities and explicit instructions;
- active LINGOlegacy portfolio/project registry;
- open GitHub issues and pull requests;
- release holds, branch protections and acceptance gates;
- due dates, dependencies and blockers;
- task estimates and agent capacity;
- security incidents and service health signals;
- outstanding approval requests;
- previous day's unfinished tasks and accepted decisions.

## Priority order

1. Safety, security incidents and data integrity.
2. Existing production protection and release holds.
3. Explicit founder priorities.
4. Work blocking multiple teams or projects.
5. Time-sensitive obligations and due dates.
6. Approved roadmap work.
7. Research and improvement work.

Do not infer permission from priority. A high-priority task still obeys its authorization requirements.

## Daily schedule output

Each daily plan includes:
- date and timezone;
- portfolio status snapshot and source timestamps;
- top outcomes;
- tasks with stable IDs, owners, collaborators and reviewers;
- priority, dependency, due window and acceptance criteria;
- authorized tools and environment;
- expected evidence;
- approval gates;
- capacity and collision warnings;
- carryover tasks;
- risks and unresolved conflicts.

## Assignment model

Neveah proposes assignments. Specialists may accept, request clarification, or return a capacity/blocker notice. Agent assignment does not grant new tool permissions. Use a capability map and workload score; do not assign every task to every agent.

## Suggested responsibility routing

- Neveah: daily brief, coordination, cross-team dependencies and approvals queue.
- Dusse 1.0: founder-facing summaries, follow-up capture and continuity assistance.
- Dusse 2.0: task decomposition and executive orchestration drafts.
- Zay 1.0: user-facing continuity and help.
- Zay 2.0: independent analysis and second opinions.
- Ava 1.0: schedules, records and administrative preparation.
- Ava 2.0: approved workflow execution and operational follow-through.
- Navine: research, source validation and API/tool discovery.
- Daizhur: engineering implementation, integrations and technical diagnosis.
- Dialoe: security, privacy, identity and access review.
- Datrell: test planning, execution evidence and independent QA.
- Azora: creative briefs, assets and media workflows.
- Keith: community support and moderation triage.
- Noz: business operations, SOPs, vendor and process coordination.
- Derrick: metrics, data quality, dashboards and outcome reporting.

## End-of-day report

Report separately:
- completed and verified;
- completed but not independently verified;
- in progress;
- blocked and exact blocker;
- waiting for founder approval;
- carried to next day;
- newly discovered risks;
- changes to project status with source evidence.

## Portfolio continuity rules

The system must retain project IDs, source links, owner priorities, last-known-good references, branch/PR references, release gates, unresolved issues, approved architecture and status history. GitHub remains the engineering source of truth. The chat database stores collaboration and task records, not an alternative code or release authority.

Do not close or replace existing tasks merely because a new daily schedule is generated. Use explicit task supersession links and preserve history.
