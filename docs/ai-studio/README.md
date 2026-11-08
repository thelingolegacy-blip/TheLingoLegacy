# LINGOassist + Google AI Studio — Start Here

This folder contains the guarded build brief and host-side G02 recovery procedure.

## Deliverables

- `LINGOassist-G02-Recovery-Console-Build-Prompt.md` — paste the full prompt into Google AI Studio Build mode to generate the evidence console.
- `G02-Working-Runner-Recovery-Runbook.md` — safe host-side checks and the minimum proof required to verify a real runner.

## Start the AI Studio build

1. Open https://aistudio.google.com/ and choose **Build**.
2. Create a new **web app**. Start from a fresh app rather than importing the production repository as the app itself; the canonical repo has a Cloudflare Worker runtime, and an AI Studio-generated React/Node app must not overwrite or replace that production entrypoint.
3. Open the build prompt file above on this branch and paste its complete contents into the AI Studio prompt box.
4. Ask the agent to generate the application, run the available build/tests, and show the actual results. Do not accept unexecuted tests as passing.
5. Keep the app private during development. Use only synthetic or explicitly sanitized evidence until its access controls are reviewed.
6. Gemini API calls must remain server-side using AI Studio's managed secret. Never paste API keys, runner tokens, PATs, SSH credentials, or raw environment dumps into the prompt.
7. Do not click Publish or connect production write scopes during this prototype phase.
8. Review the generated code and tests. If you want source control, use AI Studio's GitHub integration only after choosing a safe repository/branch destination; do not sync generated app files over the root of the canonical production repository. Prefer a dedicated repo or a reviewed subdirectory/PR.
9. Return the generated file tree, build/test output, and app preview URL (if one exists) for a security and architecture review before deployment.

Google's documented AI Studio Build mode supports full-stack web applications, GitHub import/sync, and Cloud Run publishing. Cloud Run publication is a separate deployment decision and is deliberately not authorized by this runbook. See:
- https://ai.google.dev/gemini-api/docs/aistudio-build-mode
- https://ai.google.dev/gemini-api/docs/aistudio-deploying

## Current runner repair boundary

The repository currently has four diagnostic jobs that have shown queued state with `runner_id=0`, empty runner name, and no steps. This folder does not register or start a runner by itself. A person with authorized access to the intended Linux host must perform the host-side steps in the runbook. Do not dispatch additional workflows until the existing runner issue has been diagnosed.

## Definition of done

### LINGOassist prototype
- AI Studio has generated a full-stack preview.
- Evidence intake validates packet schema and checksum without overstating what a checksum proves.
- All gate statuses fail closed on missing/stale evidence.
- Tests were actually run and results captured.
- No credentials are exposed and no production actions are available.
- Deployment remains off pending review.

### G02 runner
- Runner is registered to the correct repository/authorized group and online.
- Exact required labels are present.
- A sentinel job is assigned with nonzero runner ID and populated runner name.
- Steps execute, logs are retrievable, and artifact is downloadable.
- Artifact bytes are independently hashed and a verification record is independently retrievable and correctly bound.
- An independent reviewer confirms all acceptance predicates.
