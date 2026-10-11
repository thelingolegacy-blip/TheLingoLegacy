# G02 Diagnostic Intake (Isolated Patch)

Route: `/diagnostics/g02/` (static directory index; no router or server rewrite is required when the site serves directory indexes).

## Safety contract

- This page is a local, client-side diagnostic intake interface.
- The **Run Local Diagnostic** button parses pasted JSON and calculates SHA-256 in the browser. It does **not** dispatch a GitHub workflow, contact GitHub APIs, poll a runner, call a host, or change any gate.
- The verified runner signal remains `UNKNOWN` because the static page cannot independently authenticate evidence provenance. It separately displays a *reported* observation as `ASSIGNED`, `UNASSIGNED`, or `UNKNOWN` based on the pasted fields.
- A checksum match establishes byte integrity against the supplied expected digest only. It does not prove authorship, authenticity, truth, collection source, or execution.
- Session history is held in browser `sessionStorage`; it is not durable, server-side, or an authoritative evidence ledger.
- No production bridge, DNS, Worker, secrets, runner configuration, workflow, or deployment is modified by this patch.
- G02, merge, promotion, activation, and deployment remain blocked pending authentic host/sentinel evidence and independent acceptance.

## Evidence fields

The intake displays `run_id`, `job_id`, `commit_sha`, and `collected_at`. It inspects reported `runner_id`, `runner_name`, `job_assigned`, `steps_executed`, `sentinel_exit_code`, `logs_url`, and `artifact_sha256`. Presence or consistency of those fields is not independent verification.

## Review checklist

1. Open `/diagnostics/g02/` from a local/static preview.
2. Confirm the initial signal is `UNKNOWN` and gate is `BLOCKED`.
3. Submit malformed JSON: the diagnostic should fail closed.
4. Submit a JSON object without required correlation fields: the signal remains `UNKNOWN`.
5. Submit a complete-looking report and matching SHA-256: integrity may pass, but the verified signal must remain `UNKNOWN` and gate `BLOCKED`.
6. Confirm no network requests are initiated and no workflow is dispatched.
7. Independently inspect the diff before any merge or deployment decision.

No automated browser test or remote runtime test is claimed by this patch.
