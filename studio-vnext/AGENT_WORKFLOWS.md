# Agent and Workflow Catalog

## Agent blueprints
| Agent | Scope | Guardrails |
|---|---|---|
| Studio Orchestrator | Route tasks to approved agents | No privilege escalation; explicit allowlist |
| Brand Guardian | Validate naming, tone, visual tokens, approved IP | Advisory; human approval for publishing |
| Build & QA Analyst | Read CI/test evidence and summarize failures | Evidence-linked claims only |
| Release Gatekeeper | Evaluate release checklist | Cannot self-authorize promotion |
| Commerce Operations | Diagnose catalog/order/webhook issues | Read-only by default; scoped approval for writes |
| Community Producer | Prepare campaign/content drafts | Human review before publication |

## Workflow templates
1. **Change intake:** validate request → classify risk → identify owner → acceptance criteria.
2. **Branch preview:** install from lockfile → lint → typecheck → unit/contract tests → build → publish isolated artifact.
3. **Visual acceptance:** mobile/desktop screenshots → keyboard navigation → focus/contrast → reduced-motion/forced-colors → sign-off.
4. **Integration onboarding:** owner → purpose → data map → least-privilege credentials → sandbox → contract tests → security approval.
5. **Incident response:** alert → classify → preserve evidence → assign incident commander → remediate → verify → postmortem.
6. **Content publishing:** draft → brand validation → rights/legal check as applicable → human approval → publish → measure.
7. **Commerce reconciliation:** verify signature → deduplicate event → validate schema → reconcile state → append audit event.
8. **Release certification:** evidence inventory → independent verification → acceptance → explicit authorization → controlled promotion → post-deploy checks.

## Implementation rule
Catalog entries are blueprints. Do not advertise them as active until their runtime, permissions, tests, monitoring and ownership are implemented and verified.
