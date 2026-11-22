# askLINGO v2.0 — Asset Reconciliation Register

## Method

Preserve first. Record exact source, version/ref, status, and disposition. Add new v2 documents without overwriting prior artifacts. Reconcile contradictory claims through controlled change and evidence, not silent edits.

## Repository assets inspected

| Asset | Source | Observed status | v2 disposition |
|---|---|---|---|
| Assistant service contract | `docs/ASKLINGO-AI-INTEGRATION.md` | Planned / not production enabled | Preserve; authoritative current integration boundary pending newer evidence |
| Authenticated facade | `src/ai/ask-lingo-facade.mjs` | Auth check then intentionally returns `ASKLINGO_DISABLED` | Preserve; no bypass or activation |
| AI landing page | `ai/index.html` | Presentation surface; runtime-dependent availability | Preserve; source presence is not runtime evidence |
| System activation record | `SYSTEM-ACTIVATION-AUTHORITY.md` | Explicitly marked superseded historical record | Preserve as archive; grants no authority |
| Repository operating instructions | `AGENTS.md` | Current agent/change-control instructions | Follow |
| G02 acceptance contract | `docs/G02-ACCEPTANCE-CONTRACT.md` | G02 blocked until all predicates verified | Preserve; unrelated to askLINGO architecture acceptance but governs repository safety |
| Historical AI integration branch | `integration/asklingo-lingoai-contract-2026-10-16` | Older Claude/Gemini and Firestore proposal | Preserve as historical proposal; not live provider or storage evidence |
| Truthful runtime contract branch | `docs/asklingo-truthful-runtime-contract-2026-11-05` | Same truthful not-enabled contract | Preserve; compare before any future consolidation |
| LINGOassist operating layer | Library `03_LINGOASSIST_OPERATING_LAYER.md` | Role, worker family, lifecycle, independent capabilities, human review | Reuse and formalize in v2 contracts |
| LINGO master blueprint | Library `LINGO_MASTER_BLUEPRINT_SELF_PUBLISHING_V1_0` | Includes askLINGO modes, voice, LINGOassist, source/evidence/authority model | Preserve as source material; do not replace |

## Contradiction resolution

An older integration proposal describes Claude/Gemini providers, user context storage, and GDPR/COPPA compliance. The current service contract explicitly states no provider, active endpoint, conversation store, or Firebase Auth integration is verified, and prohibits compliance claims without review. The current truthful contract governs runtime statements. The older proposal remains historical design material only.

An older system activation document contains broad "active" claims, but its own opening marks it superseded and not an authorization. It cannot override current runtime evidence or platform permissions.

## Branch inventory

Existing askLINGO-related branches found:
- `docs/asklingo-truthful-runtime-contract-2026-11-05`
- `feat/asklingo-voice-books-modes-2026-10-05`
- `integration/asklingo-lingoai-contract-2026-10-16`

The integration branch's service contract was inspected and contains an older provider-specific proposal. The voice/books/modes branch did not expose the same contract at that path; its full contents remain to be inventoried before any branch cleanup or archival decision.

## New v2 foundation

The files in this directory are additive architecture documents on a feature branch. They do not replace the current service contract, facade, UI, Library files, or historical branches.

## Remaining inspection

- Inventory full contents and commit history of all askLINGO-related branches.
- Locate and inspect the dedicated askLINGO voice/books/modes source artifact, if present.
- Inspect all relevant model, identity, policy, and connector code before runtime implementation.
- Verify current production Worker routes/bindings through authorized read-only evidence before any runtime claim.
- Record the exact reviewed base SHA and all file-level provenance in the PR.


## Additional legacy voice/books branch assessment

See [15 — Legacy voice branch assessment](15-LEGACY-VOICE-BRANCH-ASSESSMENT.md). The historical branch is 53 commits ahead and 732 behind current main and is not safe to merge as a whole. It contains the 13-mode JSON registry, browser/Flutter WebRTC clients, Worker realtime-token and response handlers, and seven-book audio manifest. The inspected handlers lack visible server-side identity, scoped authorization, SAAAE approval, durable audit, and shared rate limiting; they also set `ask_lingo: true` on that historical branch. These are preserved as historical source only. The canonical mode vocabulary and WebRTC direction are reconciled into v2 documents; the old runtime routes and provider-specific model identifiers are not transplanted. All seven book narration states remain pending.
