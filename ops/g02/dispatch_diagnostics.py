#!/usr/bin/env python3
"""Read-only G02 Actions diagnostics using the authenticated GitHub CLI."""
from __future__ import annotations
import json, os, subprocess, sys, time
from pathlib import Path

def gh_api(path: str):
    try:
        p = subprocess.run(["gh", "api", path], capture_output=True, text=True, timeout=20, check=False)
        if p.returncode:
            return {"ok": False, "error": "gh_api_failed", "status": p.returncode}
        return {"ok": True, "data": json.loads(p.stdout)}
    except (OSError, subprocess.TimeoutExpired, json.JSONDecodeError) as exc:
        return {"ok": False, "error": type(exc).__name__}

def logs_probe(repo: str, job_id: int):
    try:
        p = subprocess.run(
            ["gh", "api", f"/repos/{repo}/actions/jobs/{job_id}/logs"],
            stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, timeout=20, check=False,
        )
        return {"retrievable": p.returncode == 0, "exit_code": p.returncode}
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"retrievable": False, "error": type(exc).__name__}

def main():
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    current_run = os.environ.get("GITHUB_RUN_ID", "")
    target_run = os.environ.get("TARGET_RUN_ID", "").strip() or current_run
    if "/" not in repo or not target_run.isdigit():
        print("Missing repository or run context.", file=sys.stderr)
        return 2
    base = f"/repos/{repo}/actions"
    run_r = gh_api(f"{base}/runs/{target_run}")
    jobs_r = gh_api(f"{base}/runs/{target_run}/jobs?per_page=100")
    artifacts_r = gh_api(f"{base}/runs/{target_run}/artifacts?per_page=100")
    runners_r = gh_api(f"{base}/runners?per_page=100")
    run = run_r.get("data", {}) if run_r["ok"] else {}
    jobs_data = jobs_r.get("data", {}) if jobs_r["ok"] else {}
    artifacts_data = artifacts_r.get("data", {}) if artifacts_r["ok"] else {}
    runners_data = runners_r.get("data", {}) if runners_r["ok"] else {}
    jobs = jobs_data.get("jobs", []) if isinstance(jobs_data, dict) else []
    artifacts = artifacts_data.get("artifacts", []) if isinstance(artifacts_data, dict) else []
    runners = runners_data.get("runners", []) if isinstance(runners_data, dict) else []
    target_jobs = [j for j in jobs if "target runner assignment sentinel" in str(j.get("name", "")).lower()]
    assigned = [j for j in target_jobs if isinstance(j.get("runner_id"), int) and j.get("runner_id") > 0 and j.get("runner_name")]
    steps = any(bool(j.get("steps")) for j in target_jobs)
    sentinel_ok = any(j.get("status") == "completed" and j.get("conclusion") == "success" for j in target_jobs)
    log_checks = [{"job_id": j["id"], "runner_id": j.get("runner_id"), "runner_name": j.get("runner_name"), **logs_probe(repo, int(j["id"]))} for j in assigned if j.get("id")]
    artifact_records = [
        {"id": a.get("id"), "name": a.get("name"), "expired": a.get("expired"), "size_in_bytes": a.get("size_in_bytes"), "created_at": a.get("created_at")}
        for a in artifacts if str(a.get("name", "")).startswith(f"g02-target-sentinel-{target_run}-") and not a.get("expired", False)
    ]
    predicates = {
        "run_record_readable": run_r["ok"],
        "jobs_list_readable": jobs_r["ok"],
        "target_job_present": bool(target_jobs),
        "runner_id_and_name_present": bool(assigned),
        "steps_instantiated": steps,
        "target_sentinel_completed_successfully": sentinel_ok,
        "job_logs_retrievable": any(x.get("retrievable") for x in log_checks),
        "target_artifact_present_and_correlated": bool(artifact_records),
    }
    report = {
        "schema": "lingo.g02.dispatch-diagnostics/v1",
        "generated_at_utc_epoch": int(time.time()),
        "repository": repo,
        "collector_run": {k: os.environ.get(k) for k in ("GITHUB_RUN_ID", "GITHUB_RUN_ATTEMPT", "GITHUB_SHA", "GITHUB_EVENT_NAME", "GITHUB_REF_NAME")},
        "target_run": {k: run.get(k) for k in ("id", "name", "event", "status", "conclusion", "head_branch", "head_sha", "run_attempt", "html_url")},
        "api_access": {k: {"ok": v["ok"], "error": v.get("error")} for k, v in (("run", run_r), ("jobs", jobs_r), ("artifacts", artifacts_r), ("runner_inventory", runners_r))},
        "job_evidence": [{
            "job_id": j.get("id"), "name": j.get("name"), "status": j.get("status"), "conclusion": j.get("conclusion"),
            "runner_id": j.get("runner_id"), "runner_name": j.get("runner_name"),
            "steps": [{"name": s.get("name"), "status": s.get("status"), "conclusion": s.get("conclusion")} for s in (j.get("steps") or [])],
        } for j in jobs],
        "runner_inventory": {
            "readable": runners_r["ok"], "count_returned": len(runners) if runners_r["ok"] else None,
            "runners": [{"id": r.get("id"), "name": r.get("name"), "status": r.get("status"), "busy": r.get("busy"), "labels": [x.get("name") for x in r.get("labels", [])]} for r in runners] if runners_r["ok"] else None,
            "limitation": None if runners_r["ok"] else "Inventory unavailable to this token; count is unknown, not zero.",
        },
        "log_retrieval_checks": log_checks, "correlated_artifacts": artifact_records,
        "g02_predicates": predicates,
        "g02_status": "BLOCKED_PENDING_INDEPENDENT_ACCEPTANCE",
        "release_authorization": False,
        "release_gates": {"G02": "BLOCKED", "production": "HOLD", "fail_closed": "ACTIVE", "last_known_good": "PROTECTED"},
        "incident_ref": os.environ.get("INCIDENT_REF", ""),
        "interpretation": "This report is diagnostic evidence only. It cannot authorize release or substitute for independent acceptance.",
    }
    out = Path("g02-evidence")
    out.mkdir(parents=True, exist_ok=True)
    (out / "dispatch-diagnostics.json").write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    summary = [
        "# G02 Dispatch Diagnostics", "",
        f"- Target run: {target_run}",
        f"- Run conclusion: {run.get('conclusion') or 'unknown / in progress'}",
        f"- Jobs returned: {len(jobs) if jobs_r['ok'] else 'unavailable'}",
        f"- Target runner job found: {bool(target_jobs)}",
        f"- Runner assigned: {bool(assigned)}",
        f"- Runner inventory readable: {runners_r['ok']}",
        f"- Correlated target sentinel artifact: {bool(artifact_records)}",
        "- G02: BLOCKED pending independent acceptance",
        "- Production: HOLD; fail-closed: ACTIVE; last-known-good: PROTECTED",
    ]
    (out / "summary.md").write_text("\n".join(summary) + "\n", encoding="utf-8")
    print("\n".join(summary))
    return 0 if run_r["ok"] and jobs_r["ok"] else 1

if __name__ == "__main__":
    sys.exit(main())
