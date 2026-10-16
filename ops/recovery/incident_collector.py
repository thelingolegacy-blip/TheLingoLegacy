#!/usr/bin/env python3
"""Read-only GitHub Actions incident evidence collector; never changes gate state."""
from __future__ import annotations
import argparse, importlib.util, json, os, re, sys, urllib.error, urllib.request, urllib.parse
from datetime import datetime, timezone

DEFAULT_REPOSITORY = "thelingolegacy-blip/TheLingoLegacy"
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
API = "https://api.github.com"

class EvidenceUnavailable(Exception):
    pass

class SafeRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Never forward the GitHub bearer token to a different redirect host."""
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        redirected = super().redirect_request(req, fp, code, msg, headers, newurl)
        if redirected is not None:
            old_host = urllib.parse.urlsplit(req.full_url).netloc.lower()
            new_host = urllib.parse.urlsplit(newurl).netloc.lower()
            if old_host != new_host:
                redirected.remove_header("Authorization")
        return redirected


class GitHubReadOnlyClient:
    """GET-only GitHub REST client. Use a least-privilege read-only token."""
    def __init__(self, token, timeout=15):
        if not token:
            raise ValueError("GitHub token is required")
        self.token, self.timeout = token, timeout

    def get(self, path, accept="application/vnd.github+json"):
        req = urllib.request.Request(API + path, headers={
            "Accept": accept, "Authorization": "Bearer " + self.token,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "LINGO-Legacy-ReadOnly-Incident-Collector",
        }, method="GET")
        try:
            with urllib.request.build_opener(SafeRedirectHandler()).open(req, timeout=self.timeout) as response:
                return response.read()
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            raise EvidenceUnavailable("GitHub evidence request failed or was inaccessible") from exc

    @staticmethod
    def repo(repository):
        parts = repository.split("/")
        if len(parts) != 2 or not all(parts):
            raise ValueError("Repository must be owner/name")
        return "/repos/" + "/".join(parts)

    def run(self, repo, run_id):
        return json.loads(self.get(f"{self.repo(repo)}/actions/runs/{run_id}"))

    def jobs(self, repo, run_id, attempt):
        data = json.loads(self.get(f"{self.repo(repo)}/actions/runs/{run_id}/attempts/{attempt}/jobs?per_page=100"))
        return data["jobs"]

    def logs(self, repo, job_id):
        return self.get(f"{self.repo(repo)}/actions/jobs/{job_id}/logs").decode("utf-8", "replace")

    def artifacts(self, repo, run_id):
        return json.loads(self.get(f"{self.repo(repo)}/actions/runs/{run_id}/artifacts?per_page=100"))["artifacts"]


def evaluate_existing_checkpoint_gate(evidence, expected_sha):
    """Call the canonical validator; collector evidence must not bypass acceptance."""
    gate_path = os.path.join(os.path.dirname(__file__), "checkpoint_gate.py")
    spec = importlib.util.spec_from_file_location("lingo_checkpoint_gate", gate_path)
    if spec is None or spec.loader is None:
        return {"result": "BLOCKED", "passed": [], "blocked": ["canonical checkpoint validator could not be loaded"]}
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    accepted, passed, blocked = module.evaluate(evidence, expected_sha)
    return {"result": "PASS" if accepted else "BLOCKED", "passed": passed, "blocked": blocked}


def collect_incident(request, client, expected_repository=DEFAULT_REPOSITORY):
    """Return a structured report. Any absent or inconsistent evidence fails closed."""
    repo, run_id, attempt, sha, job_id = (request.get(k) for k in
        ("repository", "run_id", "attempt", "commit_sha", "job_id"))
    errors = []
    if repo != expected_repository: errors.append("repository does not match configured repository")
    if not isinstance(run_id, int) or isinstance(run_id, bool) or run_id <= 0: errors.append("run_id must be positive")
    if not isinstance(attempt, int) or isinstance(attempt, bool) or attempt <= 0: errors.append("attempt must be positive")
    if not isinstance(job_id, int) or isinstance(job_id, bool) or job_id <= 0: errors.append("job_id must be positive")
    if not isinstance(sha, str) or not SHA_RE.fullmatch(sha): errors.append("commit_sha must be a full lowercase SHA")

    run = job = None
    status, findings, logs_ok, artifact_count = "BLOCKED", errors, False, None
    if not errors:
        try:
            run = client.run(repo, run_id)
        except Exception:
            findings = ["authoritative workflow run metadata is inaccessible"]
        else:
            if not isinstance(run, dict) or run.get("id") != run_id:
                findings = ["workflow run does not exist or returned ID is inconsistent"]
            elif (run.get("repository") or {}).get("full_name") != repo:
                findings = ["workflow run repository does not match incident"]
            elif run.get("head_sha") != sha:
                findings = ["workflow run commit SHA does not match incident"]
            elif run.get("run_attempt") != attempt:
                findings = ["workflow run attempt does not match incident"]
            else:
                try:
                    jobs = client.jobs(repo, run_id, attempt)
                except Exception:
                    findings = ["authoritative job metadata is inaccessible"]
                else:
                    job = next((j for j in jobs if j.get("id") == job_id), None)
                    if job is None:
                        findings = ["requested job not found in specified run attempt"]
                    elif job.get("run_id") != run_id or job.get("run_attempt") != attempt:
                        findings = ["job run/attempt correlation is inconsistent"]
                    else:
                        findings = ["repository, run, attempt, job, and commit SHA correlate"]
                        runner_id, runner_name = job.get("runner_id") or 0, job.get("runner_name") or ""
                        steps = job.get("steps") if isinstance(job.get("steps"), list) else []
                        if not runner_id or not runner_name:
                            if job.get("status") == "queued" and not steps:
                                status = "RUNNER_UNASSIGNED"
                                findings.append("queued job has no assigned runner; execution is not inferred")
                            else:
                                findings.append("runner assignment is absent or incomplete")
                        elif not any(isinstance(s, dict) and s.get("status") in ("in_progress", "completed") for s in steps):
                            status = "EXECUTION_UNVERIFIED"
                            findings.append("runner assigned but no executed step is evidenced")
                        else:
                            try:
                                logs_ok = bool(client.logs(repo, job_id).strip())
                            except Exception:
                                logs_ok = False
                            if not logs_ok:
                                status = "EVIDENCE_INCOMPLETE"
                                findings.append("steps exist but logs are empty or inaccessible")
                            else:
                                try:
                                    artifacts = client.artifacts(repo, run_id)
                                    artifacts = [a for a in artifacts if (a.get("workflow_run") or {}).get("id", run_id) == run_id]
                                    artifact_count = len(artifacts)
                                except Exception:
                                    artifacts = None
                                if artifacts is None or artifact_count == 0:
                                    status = "EVIDENCE_INCOMPLETE"
                                    findings.append("logs are retrievable but run artifact evidence is missing or inaccessible")
                                else:
                                    status = "EVIDENCE_VERIFIED"
                                    findings.extend(["non-empty job logs retrieved", "run-associated artifact metadata found",
                                        "correlation verified; independent acceptance remains outstanding"])

    evidence = {
        "run_id": (run or {}).get("id"), "run_attempt": (run or {}).get("run_attempt"),
        "source_sha": (run or {}).get("head_sha"),
        "repository": ((run or {}).get("repository") or {}).get("full_name"),
        "head_sha": (run or {}).get("head_sha"), "run_status": (run or {}).get("status"),
        "run_conclusion": (run or {}).get("conclusion"), "job_id": (job or {}).get("id"),
        "job_run_id": (job or {}).get("run_id"), "job_run_attempt": (job or {}).get("run_attempt"),
        "job_status": (job or {}).get("status"), "job_conclusion": (job or {}).get("conclusion"),
        "runner_id": (job or {}).get("runner_id") or 0, "runner_name": (job or {}).get("runner_name") or "",
        "runner_group_name": (job or {}).get("runner_group_name") or "",
        "runner_labels": (job or {}).get("labels") if isinstance((job or {}).get("labels"), list) else [],
        "steps_count": len((job or {}).get("steps", [])) if isinstance((job or {}).get("steps", []), list) else 0,
        "logs_retrievable": logs_ok, "artifact_count": artifact_count, "independently_verified": False,
    }
    checkpoint_gate = evaluate_existing_checkpoint_gate(evidence, sha if isinstance(sha, str) else "")
    return {
        "schema_version": 1, "collector": "LINGOassister.incident_collector",
        "collected_at_utc": datetime.now(timezone.utc).isoformat(),
        "incident": request, "status": status, "findings": findings, "evidence": evidence,
        "acceptance": {"incident_correlation": status == "EVIDENCE_VERIFIED", "g02": "BLOCKED",
            "production_promotion": "BLOCKED", "production_activation": "BLOCKED",
            "last_known_good": "PROTECTED", "repair_authorized": False, "checkpoint_gate": checkpoint_gate},
        "limitations": ["Report is not proof of repair.", "Artifact contents are not downloaded or independently hashed.",
            "G02 acceptance additionally requires independent verification and the existing checkpoint gate."],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repository", default=DEFAULT_REPOSITORY)
    parser.add_argument("--run-id", type=int, required=True)
    parser.add_argument("--attempt", type=int, required=True)
    parser.add_argument("--job-id", type=int, required=True)
    parser.add_argument("--commit-sha", required=True)
    parser.add_argument("--output")
    args = parser.parse_args()
    request = {"repository": args.repository, "run_id": args.run_id, "attempt": args.attempt,
        "job_id": args.job_id, "commit_sha": args.commit_sha}
    token = os.environ.get("GITHUB_TOKEN", "")
    if not token:
        report = {"schema_version": 1, "incident": request, "status": "BLOCKED",
            "findings": ["GITHUB_TOKEN is unset; no API request was made"],
            "acceptance": {"g02": "BLOCKED", "production_promotion": "BLOCKED",
                "production_activation": "BLOCKED", "last_known_good": "PROTECTED", "repair_authorized": False}}
        code = 2
    else:
        report = collect_incident(request, GitHubReadOnlyClient(token))
        code = 0 if report["status"] == "EVIDENCE_VERIFIED" else 1
    output = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.output:
        try:
            with open(args.output, "w", encoding="utf-8") as handle: handle.write(output)
        except OSError:
            print("Unable to write report file.", file=sys.stderr); return 2
    else: print(output, end="")
    return code

if __name__ == "__main__":
    raise SystemExit(main())
