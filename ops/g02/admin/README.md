# G02 Administrative Control System

**Control posture:** G02 BLOCKED · Production HOLD · Fail-closed ACTIVE · LKG PROTECTED

Read-only governance and evidence tooling. It does not change Actions policy, runner registration/services, secrets, deployments, or production traffic.

## Components
- `.github/workflows/g02-admin-evidence.yml`: manually dispatched, read-only snapshot of Actions permissions, runner inventory, and recent G02 runs. API failures are recorded as unavailable, never passed.
- `evidence-intake.schema.json`: versioned evidence intake contract.
- `validate-evidence.py`: fail-closed offline validator.
- `ADMINISTRATIVE-CONTROLS.md`: evidence capture, review, and acceptance procedure.

## Rules
1. A green workflow is not G02 acceptance.
2. Empty jobs, missing runner ID, missing steps, unavailable logs, stale captures, and denied endpoints remain blockers.
3. Capture UTC time, source, collector, reviewer, and SHA-256 for every evidence file.
4. Redact tokens, cookies, runner registration tokens, and secrets before sharing.
5. This tooling never authorizes deployment or changes the control state.

Run the workflow manually from Actions. Validate a manifest locally:
```bash
python3 ops/g02/admin/validate-evidence.py /path/to/evidence-manifest.json
```
