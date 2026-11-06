#!/usr/bin/env python3
"""Collect authoritative GitHub runner assignment, host telemetry, and correlated G02 evidence."""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import io
import json
import os
import pathlib
import platform
import re
import shutil
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
import zipfile

API = "https://api.github.com"
REPO = os.environ.get("GITHUB_REPOSITORY", "")
TOKEN = os.environ.get("GH_TOKEN", "")
RUN_ID = os.environ.get("GITHUB_RUN_ID", "")
ATTEMPT = os.environ.get("GITHUB_RUN_ATTEMPT", "1")
SHA = os.environ.get("GITHUB_SHA", "")
ROOT = pathlib.Path(os.environ.get("G02_RUNNER_ROOT", "/opt/actions-runner"))
SERVICE = os.environ.get("G02_RUNNER_SERVICE", "actions.runner.lingo-legacy-g02.service")
OUT = pathlib.Path("g02-evidence")


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


def api_request(path: str, timeout: int = 30) -> tuple[int, bytes]:
    if not TOKEN:
        raise RuntimeError("GH_TOKEN is required for authoritative Actions API evidence")
    req = urllib.request.Request(
        API + path,
        headers={
            "Authorization": "Bearer " + TOKEN,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "LINGOlegacy-G02-Evidence-Collector",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read()


def api_json(path: str) -> dict:
    status, body = api_request(path)
    if status != 200:
        raise RuntimeError(f"GitHub API {status} for {path}: {body[:500].decode('utf-8', 'replace')}")
    return json.loads(body.decode("utf-8"))


def write_json(path: pathlib.Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def command_output(args: list[str]) -> str:
    try:
        result = subprocess.run(args, check=False, capture_output=True, text=True, timeout=8)
        return (result.stdout or result.stderr).strip()
    except (OSError, subprocess.TimeoutExpired):
        return ""


def host_telemetry() -> dict:
    mem = {}
    try:
        for line in pathlib.Path("/proc/meminfo").read_text().splitlines():
            key, value = line.split(":", 1)
            mem[key] = int(value.strip().split()[0]) * 1024
    except (OSError, ValueError, IndexError):
        pass
    uptime = None
    try:
        uptime = float(pathlib.Path("/proc/uptime").read_text().split()[0])
    except (OSError, ValueError, IndexError):
        pass
    disk_path = ROOT if ROOT.exists() else pathlib.Path.cwd()
    try:
        disk = shutil.disk_usage(disk_path)
        disk_info = {"path": str(disk_path), "total_bytes": disk.total, "free_bytes": disk.free}
    except OSError:
        disk_info = {"path": str(disk_path), "total_bytes": None, "free_bytes": None}
    machine_id = ""
    for candidate in (pathlib.Path("/etc/machine-id"), pathlib.Path("/var/lib/dbus/machine-id")):
        try:
            machine_id = candidate.read_text().strip()
            if machine_id:
                break
        except OSError:
            continue
    fingerprint_source = machine_id or socket.gethostname()
    fingerprint = hashlib.sha256(fingerprint_source.encode("utf-8")).hexdigest()
    service_state = command_output(["systemctl", "show", SERVICE, "--property=ActiveState", "--property=SubState", "--value"])
    listener_count = command_output(["bash", "-lc", "pgrep -x Runner.Listener | wc -l"]) or "0"
    worker_count = command_output(["bash", "-lc", "pgrep -x Runner.Worker | wc -l"]) or "0"
    return {
        "collected_at_utc": utc_now(),
        "hostname_fingerprint_sha256": fingerprint,
        "os": platform.platform(),
        "kernel": platform.release(),
        "architecture": platform.machine(),
        "cpu_count": os.cpu_count(),
        "memory_total_bytes": mem.get("MemTotal"),
        "memory_available_bytes": mem.get("MemAvailable"),
        "uptime_seconds": uptime,
        "disk": disk_info,
        "runner_root": str(ROOT),
        "runner_root_exists": ROOT.is_dir(),
        "runner_registration_file_present": (ROOT / ".runner").is_file(),
        "runner_diag_directory_present": (ROOT / "_diag").is_dir(),
        "runner_service": SERVICE,
        "runner_service_state": service_state,
        "runner_listener_process_count": int(listener_count) if listener_count.isdigit() else None,
        "runner_worker_process_count": int(worker_count) if worker_count.isdigit() else None,
    }


def current_job() -> dict:
    expected = os.environ.get("EXPECTED_JOB_NAME", "")
    if not all((REPO, RUN_ID, expected)):
        raise RuntimeError("GITHUB_REPOSITORY, GITHUB_RUN_ID, and EXPECTED_JOB_NAME are required")
    path = f"/repos/{REPO}/actions/runs/{RUN_ID}/jobs?per_page=100"
    last = []
    for _ in range(12):
        payload = api_json(path)
        last = payload.get("jobs", [])
        matches = [j for j in last if j.get("name") == expected and j.get("head_sha") == SHA]
        if matches:
            job = matches[-1]
            if job.get("runner_id") is not None and job.get("runner_name"):
                return job
        time.sleep(5)
    raise RuntimeError(
        "The Actions Jobs API did not expose an assigned job with runner_id and runner_name. "
        f"Expected job={expected!r}; visible_jobs={[j.get('name') for j in last]!r}"
    )


def collect(require_g02: bool) -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    job = current_job()
    labels = job.get("labels") or []
    runner_id = job.get("runner_id")
    runner_name = job.get("runner_name")
    assignment = {
        "schema": "lingo-g02-assignment-evidence/v2",
        "correlation_id": f"g02:{REPO}:{RUN_ID}:{ATTEMPT}:{job.get('id')}",
        "repository": REPO,
        "run_id": int(RUN_ID),
        "run_attempt": int(ATTEMPT),
        "commit_sha": SHA,
        "job_id": job.get("id"),
        "job_name": job.get("name"),
        "job_status": job.get("status"),
        "job_conclusion": job.get("conclusion"),
        "runner_id": runner_id,
        "runner_name": runner_name,
        "runner_group_id": job.get("runner_group_id"),
        "runner_group_name": job.get("runner_group_name"),
        "runner_labels": labels,
        "steps": job.get("steps") or [],
        "html_url": job.get("html_url"),
        "logs_api_url": f"https://api.github.com/repos/{REPO}/actions/jobs/{job.get('id')}/logs",
        "collected_at_utc": utc_now(),
        "change_reference": os.environ.get("CHANGE_REFERENCE", ""),
        "lane": os.environ.get("G02_EVIDENCE_LANE", "unspecified"),
        "source": "GitHub Actions Jobs API",
    }
    telemetry = host_telemetry()
    write_json(OUT / "assignment.json", assignment)
    write_json(OUT / "host-telemetry.json", telemetry)

    checks = {
        "positive_runner_id": isinstance(runner_id, int) and runner_id > 0,
        "runner_name_present": bool(runner_name),
        "linux": os.environ.get("RUNNER_OS") == "Linux",
        "x64": os.environ.get("RUNNER_ARCH") == "X64",
        "bash_available": shutil.which("bash") is not None,
        "python3_available": shutil.which("python3") is not None,
        "git_available": shutil.which("git") is not None,
    }
    if require_g02:
        expected_name = os.environ.get("G02_EXPECTED_RUNNER_NAME", "lingo-legacy-g02")
        required_labels = {"self-hosted", "linux", "x64", "lingo-g02"}
        checks.update({
            "canonical_runner_name": runner_name == expected_name,
            "required_labels": required_labels.issubset(set(labels)),
            "canonical_runner_root": telemetry["runner_root_exists"],
            "registration_file_present": telemetry["runner_registration_file_present"],
            "diagnostic_directory_present": telemetry["runner_diag_directory_present"],
            "runner_service_active": "active" in (telemetry["runner_service_state"] or "").splitlines(),
            "runner_listener_present": (telemetry["runner_listener_process_count"] or 0) > 0,
        })
    sentinel_status = "PASS" if all(checks.values()) else "FAIL"
    sentinel = {
        "schema": "lingo-g02-sentinel/v1",
        "correlation_id": assignment["correlation_id"],
        "run_id": int(RUN_ID),
        "job_id": job.get("id"),
        "commit_sha": SHA,
        "runner_id": runner_id,
        "runner_name": runner_name,
        "runner_labels": labels,
        "sentinel_status": sentinel_status if require_g02 else "HOSTED_DIAGNOSTIC_ONLY",
        "checks": checks,
        "checked_at_utc": utc_now(),
        "acceptance_authority": "diagnostic-only; independent reviewer verdict required",
    }
    write_json(OUT / "sentinel.json", sentinel)
    files = {}
    for path in sorted(OUT.iterdir()):
        if path.is_file() and path.name != "SHA256SUMS":
            files[path.name] = hashlib.sha256(path.read_bytes()).hexdigest()
    (OUT / "SHA256SUMS").write_text(
        "".join(f"{digest}  {name}\n" for name, digest in files.items()), encoding="utf-8"
    )
    write_json(OUT / "evidence-manifest.json", {
        "schema": "lingo-g02-evidence-manifest/v1",
        "correlation_id": assignment["correlation_id"],
        "run_id": int(RUN_ID),
        "job_id": job.get("id"),
        "files_sha256": files,
        "sentinel_status": sentinel["sentinel_status"],
        "generated_at_utc": utc_now(),
    })
    print(json.dumps({"correlation_id": assignment["correlation_id"], "runner_id": runner_id,
                      "runner_name": runner_name, "sentinel_status": sentinel["sentinel_status"],
                      "checks": checks}, indent=2))
    return 1 if require_g02 and sentinel_status != "PASS" else 0


def finalize() -> int:
    out = pathlib.Path("g02-final-evidence")
    logs_dir = out / "logs"
    artifacts_dir = out / "artifacts"
    logs_dir.mkdir(parents=True, exist_ok=True)
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    jobs_payload = api_json(f"/repos/{REPO}/actions/runs/{RUN_ID}/jobs?per_page=100")
    artifact_payload = api_json(f"/repos/{REPO}/actions/runs/{RUN_ID}/artifacts?per_page=100")
    jobs = jobs_payload.get("jobs", [])
    downloaded_logs = []
    for job in jobs:
        job_id = job.get("id")
        if not job_id:
            continue
        try:
            status, body = api_request(f"/repos/{REPO}/actions/jobs/{job_id}/logs", timeout=60)
            if status == 200 and body:
                target = logs_dir / f"job-{job_id}.zip"
                target.write_bytes(body)
                downloaded_logs.append({"job_id": job_id, "path": str(target), "bytes": len(body),
                                        "sha256": hashlib.sha256(body).hexdigest(), "retrievable": True})
            else:
                downloaded_logs.append({"job_id": job_id, "retrievable": False, "http_status": status})
        except Exception as exc:
            downloaded_logs.append({"job_id": job_id, "retrievable": False, "error": str(exc)})
    downloaded_artifacts = []
    for artifact in artifact_payload.get("artifacts", []):
        name = artifact.get("name", "")
        artifact_id = artifact.get("id")
        if not isinstance(name, str) or not name.startswith("g02-"):
            continue
        if not isinstance(artifact_id, int) or artifact_id <= 0:
            continue
        # Artifact names are API metadata; sanitize them before using them in a filesystem path.
        safe_name = re.sub(r"[^A-Za-z0-9._-]+", "_", name)[:100] or "g02-artifact"
        item = {"artifact_id": artifact_id, "name": name, "expired": artifact.get("expired", False),
                "size_in_bytes": artifact.get("size_in_bytes"), "created_at": artifact.get("created_at")}
        try:
            status, body = api_request(f"/repos/{REPO}/actions/artifacts/{artifact_id}/zip", timeout=90)
            if status == 200 and body:
                target = artifacts_dir / f"{artifact_id}-{safe_name}.zip"
                target.write_bytes(body)
                item.update({"retrievable": True, "path": str(target), "sha256": hashlib.sha256(body).hexdigest()})
            else:
                item.update({"retrievable": False, "http_status": status})
        except Exception as exc:
            item.update({"retrievable": False, "error": str(exc)})
        downloaded_artifacts.append(item)

    sentinel_records = []
    for item in downloaded_artifacts:
        item["contains_canonical_sentinel"] = False
        if not item.get("retrievable"):
            continue
        try:
            with zipfile.ZipFile(item["path"]) as archive:
                for member in archive.infolist()[:1000]:
                    if member.filename.endswith("sentinel.json") and member.file_size <= 1024 * 1024:
                        record = json.loads(archive.read(member).decode("utf-8"))
                        sentinel_records.append(record)
                        if (record.get("sentinel_status") in ("PASS", "FAIL") and
                                record.get("runner_name") == "lingo-legacy-g02" and
                                isinstance(record.get("runner_id"), int) and record["runner_id"] > 0):
                            item["contains_canonical_sentinel"] = True
        except (OSError, zipfile.BadZipFile, json.JSONDecodeError):
            continue
    required_labels = {"self-hosted", "linux", "x64", "lingo-g02"}
    api_canonical_jobs = {
        j.get("id"): j for j in jobs
        if isinstance(j.get("id"), int)
        and j.get("runner_name") == "lingo-legacy-g02"
        and isinstance(j.get("runner_id"), int) and j["runner_id"] > 0
        and required_labels.issubset(set(j.get("labels") or []))
        and j.get("head_sha") == SHA
    }
    canonical_pass_records = [
        s for s in sentinel_records
        if s.get("sentinel_status") == "PASS"
        and s.get("run_id") == int(RUN_ID)
        and s.get("commit_sha") == SHA
        and s.get("runner_name") == "lingo-legacy-g02"
        and isinstance(s.get("runner_id"), int) and s["runner_id"] > 0
        and required_labels.issubset(set(s.get("runner_labels") or []))
        and s.get("job_id") in api_canonical_jobs
        and s.get("runner_id") == api_canonical_jobs[s.get("job_id")].get("runner_id")
    ]
    canonical_pass = bool(canonical_pass_records)
    canonical_job_ids = {s.get("job_id") for s in canonical_pass_records}
    canonical_job_success = any(
        j.get("id") in canonical_job_ids
        and j.get("status") == "completed"
        and j.get("conclusion") == "success"
        and bool(j.get("steps"))
        and any(step.get("status") == "completed" and step.get("conclusion") == "success"
                for step in (j.get("steps") or []))
        for j in jobs
    )
    canonical_logs_retrievable = any(x.get("job_id") in canonical_job_ids and x.get("retrievable")
                                     for x in downloaded_logs)
    canonical_artifact_retrievable = any(x.get("contains_canonical_sentinel") and x.get("retrievable")
                                         for x in downloaded_artifacts)
    all_files = []
    for folder in (logs_dir, artifacts_dir):
        for path in sorted(folder.iterdir()):
            if path.is_file():
                all_files.append({"path": str(path), "bytes": path.stat().st_size,
                                  "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    register = {
        "schema": "lingo-g02-correlation-register/v1",
        "correlation_id": f"g02:{REPO}:{RUN_ID}:{ATTEMPT}",
        "repository": REPO,
        "run_id": int(RUN_ID),
        "run_attempt": int(ATTEMPT),
        "commit_sha": SHA,
        "collected_at_utc": utc_now(),
        "jobs": [{
            "job_id": j.get("id"), "job_name": j.get("name"), "status": j.get("status"),
            "conclusion": j.get("conclusion"), "runner_id": j.get("runner_id"),
            "runner_name": j.get("runner_name"), "steps": j.get("steps") or [],
            "html_url": j.get("html_url")
        } for j in jobs],
        "job_count": len(jobs),
        "logs": downloaded_logs,
        "artifacts": downloaded_artifacts,
        "retrieved_file_checksums": all_files,
        "canonical_g02_sentinel_pass": canonical_pass,
        "canonical_g02_job_completed_successfully": canonical_job_success,
        "canonical_g02_job_logs_retrievable": canonical_logs_retrievable,
        "canonical_g02_sentinel_artifact_retrievable": canonical_artifact_retrievable,
        "eligible_for_independent_review": bool(canonical_pass and canonical_job_success and
                                                canonical_logs_retrievable and canonical_artifact_retrievable),
        "acceptance_verdict": "PENDING_INDEPENDENT_REVIEW",
        "promotion_authorized": False,
        "interpretation": "Evidence correlation only; this register never grants acceptance or promotion.",
    }
    write_json(out / "correlation-register.json", register)
    checksums = {}
    for path in sorted(out.rglob("*")):
        if path.is_file() and path.name != "SHA256SUMS":
            checksums[str(path.relative_to(out))] = hashlib.sha256(path.read_bytes()).hexdigest()
    (out / "SHA256SUMS").write_text(
        "".join(f"{digest}  {name}\n" for name, digest in checksums.items()), encoding="utf-8"
    )
    print(json.dumps({"job_count": len(jobs), "retrievable_logs": sum(x.get("retrievable", False) for x in downloaded_logs),
                      "retrievable_g02_artifacts": sum(x.get("retrievable", False) for x in downloaded_artifacts),
                      "canonical_g02_sentinel_pass": canonical_pass,
                      "canonical_g02_job_completed_successfully": canonical_job_success,
                      "canonical_g02_job_logs_retrievable": canonical_logs_retrievable,
                      "canonical_g02_sentinel_artifact_retrievable": canonical_artifact_retrievable,
                      "eligible_for_independent_review": register["eligible_for_independent_review"],
                      "acceptance_verdict": register["acceptance_verdict"]}, indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--require-g02-sentinel", action="store_true")
    parser.add_argument("--finalize", action="store_true")
    args = parser.parse_args()
    if not REPO or not RUN_ID:
        print("GITHUB_REPOSITORY and GITHUB_RUN_ID are required", file=sys.stderr)
        return 2
    try:
        return finalize() if args.finalize else collect(args.require_g02_sentinel)
    except Exception as exc:
        print(f"G02_EVIDENCE_COLLECTION_ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
