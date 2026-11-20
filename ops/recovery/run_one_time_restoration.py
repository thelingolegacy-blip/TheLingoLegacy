#!/usr/bin/env python3
"""One-time, fail-closed LINGO Legacy restoration orchestrator.

Runs independent local checks concurrently in dependency-ordered waves, writes a
machine-readable evidence bundle, and never deploys, activates, merges, changes
DNS, provisions services, enables payments, starts runners, or deletes backups.

Usage:
  python3 ops/recovery/run_one_time_restoration.py
  python3 ops/recovery/run_one_time_restoration.py --network-enabled
  python3 ops/recovery/run_one_time_restoration.py --core-v2-dir /path/to/pr596
  python3 ops/recovery/run_one_time_restoration.py --firebase-candidate-dir /path/to/pr614
  python3 ops/recovery/run_one_time_restoration.py --g02-evidence /secure/g02.json --expected-sha <40-char-sha>

Network-enabled mode permits public HTTPS GET probes and ordinary dependency
downloads only. It does not authorize or perform any provider-side mutation.
Candidate directories must be pre-existing local checkouts/worktrees; this tool
does not fetch branches, alter refs, or create worktrees.
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import os
import platform
import re
import shutil
import sys
import tempfile
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

IGNORED = {
    ".git", ".dart_tool", ".gradle", ".idea", ".venv", "venv",
    "node_modules", "build", ".next", ".turbo", "coverage",
    "__pycache__", ".pytest_cache", ".mypy_cache", ".cache", "one-time-restoration",
}
SECRET_ENV = re.compile(r"(TOKEN|SECRET|PASSWORD|PRIVATE_KEY|CREDENTIAL|COOKIE|AUTH)", re.I)
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
PROBES = (
    "https://thelingolegacy.com/",
    "https://www.thelingolegacy.com/",
    "https://app.thelingolegacy.com/",
)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def safe_env(extra: dict[str, str] | None = None) -> dict[str, str]:
    env = {k: v for k, v in os.environ.items() if not SECRET_ENV.search(k)}
    env.setdefault("CI", "1")
    if extra:
        env.update(extra)
    return env


def copy_workspace(source: Path, destination: Path) -> None:
    shutil.copytree(
        source, destination,
        ignore=shutil.ignore_patterns(*IGNORED, "*.log", "static-gate-results.json"),
        symlinks=True,
    )


class Runner:
    def __init__(self, root: Path, out: Path, timeout: int, network: bool):
        self.root = root
        self.out = out
        self.timeout = timeout
        self.network = network
        self.results: list[dict[str, Any]] = []

    def record(self, item: dict[str, Any]) -> dict[str, Any]:
        item.setdefault("captured_at_utc", utc_now())
        self.results.append(item)
        return item

    async def command(
        self, task_id: str, cwd: Path, argv: list[str],
        timeout: int | None = None, extra_env: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        started = time.monotonic()
        log = self.out / "logs" / f"{task_id}.log"
        log.parent.mkdir(parents=True, exist_ok=True)
        try:
            proc = await asyncio.create_subprocess_exec(
                *argv, cwd=str(cwd), env=safe_env(extra_env),
                stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT,
            )
            output, _ = await asyncio.wait_for(proc.communicate(), timeout=timeout or self.timeout)
            text = output.decode("utf-8", errors="replace")
            log.write_text(text, encoding="utf-8")
            status = "PASS" if proc.returncode == 0 else "FAIL"
            return self.record({
                "task": task_id, "status": status, "command": argv,
                "cwd": str(cwd), "exit_code": proc.returncode,
                "duration_seconds": round(time.monotonic() - started, 3),
                "log": str(log.relative_to(self.out)),
            })
        except asyncio.TimeoutError:
            try:
                proc.kill()
                await proc.wait()
            except Exception:
                pass
            log.write_text("TASK_TIMEOUT\n", encoding="utf-8")
            return self.record({
                "task": task_id, "status": "FAIL", "command": argv,
                "cwd": str(cwd), "reason": "timeout",
                "duration_seconds": round(time.monotonic() - started, 3),
                "log": str(log.relative_to(self.out)),
            })
        except FileNotFoundError as exc:
            log.write_text(f"TOOL_NOT_FOUND: {exc}\n", encoding="utf-8")
            return self.record({
                "task": task_id, "status": "BLOCKED", "command": argv,
                "cwd": str(cwd), "reason": f"tool not found: {argv[0]}",
                "log": str(log.relative_to(self.out)),
            })
        except Exception as exc:
            log.write_text(f"TASK_ERROR: {type(exc).__name__}: {exc}\n", encoding="utf-8")
            return self.record({
                "task": task_id, "status": "FAIL", "command": argv,
                "cwd": str(cwd), "reason": f"{type(exc).__name__}: {exc}",
                "log": str(log.relative_to(self.out)),
            })

    async def python_recovery(self, workspace: Path) -> dict[str, Any]:
        tests = workspace / "ops/recovery/tests"
        if not tests.is_dir():
            return self.record({"task": "recovery-unit-tests", "status": "BLOCKED", "reason": "ops/recovery/tests not found"})
        return await self.command(
            "recovery-unit-tests", workspace,
            [sys.executable, "-m", "unittest", "discover", "-s", "ops/recovery/tests", "-v"],
            timeout=max(self.timeout, 600),
        )

    async def static_gates(self, workspace: Path) -> dict[str, Any]:
        script = workspace / "scripts/run-static-gates.mjs"
        if not script.is_file():
            return self.record({"task": "repository-static-gates", "status": "BLOCKED", "reason": "existing scripts/run-static-gates.mjs not found"})
        node = shutil.which("node")
        if not node:
            return self.record({"task": "repository-static-gates", "status": "BLOCKED", "reason": "Node.js not installed"})
        return await self.command("repository-static-gates", workspace, [node, "scripts/run-static-gates.mjs"], timeout=max(self.timeout, 900))

    async def integrity(self, source: Path) -> dict[str, Any]:
        checks: list[dict[str, Any]] = []
        for args, label in [
            (["git", "rev-parse", "HEAD"], "head"),
            (["git", "diff", "--check"], "diff_check"),
            (["git", "status", "--porcelain"], "working_tree"),
        ]:
            try:
                p = await asyncio.create_subprocess_exec(
                    *args, cwd=str(source), env=safe_env(),
                    stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT,
                )
                raw, _ = await asyncio.wait_for(p.communicate(), timeout=60)
                value = raw.decode("utf-8", errors="replace").strip()
                checks.append({"check": label, "exit_code": p.returncode, "value": value[:12000]})
            except Exception as exc:
                checks.append({"check": label, "error": f"{type(exc).__name__}: {exc}"})
        sha = next((x["value"] for x in checks if x["check"] == "head" and x.get("exit_code") == 0), None)
        diff = next((x for x in checks if x["check"] == "diff_check"), {})
        status = "PASS" if sha and diff.get("exit_code") == 0 else "FAIL"
        return self.record({"task": "source-integrity", "status": status, "commit_sha": sha, "checks": checks,
                            "note": "Working-tree changes are reported, not modified."})

    async def flutter_project(self, workspace: Path, relative: str, task_id: str) -> dict[str, Any]:
        project = workspace / relative
        if not (project / "pubspec.yaml").is_file():
            return self.record({"task": task_id, "status": "BLOCKED", "reason": f"{relative}/pubspec.yaml not found"})
        flutter = shutil.which("flutter")
        if not flutter:
            return self.record({"task": task_id, "status": "BLOCKED", "reason": "Flutter SDK not installed"})
        cache = self.out / "pub-cache" / task_id
        cache.mkdir(parents=True, exist_ok=True)
        env = {"PUB_CACHE": str(cache)}
        pub_args = [flutter, "pub", "get"] + ([] if self.network else ["--offline"])
        pub = await self.command(f"{task_id}-pub-get", project, pub_args, timeout=max(self.timeout, 900), extra_env=env)
        if pub["status"] != "PASS":
            return self.record({"task": task_id, "status": "BLOCKED", "reason": "dependency resolution did not complete; analyze/test/build steps were not run", "dependency_task": pub["task"]})
        commands = [
            ("analyze", [flutter, "analyze"]),
            ("tests", [flutter, "test"]),
            ("web-build", [flutter, "build", "web", "--release"]),
        ]
        results = []
        for suffix, argv in commands:
            results.append(await self.command(f"{task_id}-{suffix}", project, argv, timeout=max(self.timeout, 1200), extra_env=env))
        if (project / "android").is_dir():
            results.append(await self.command(f"{task_id}-android-debug", project, [flutter, "build", "apk", "--debug"], timeout=max(self.timeout, 1800), extra_env=env))
        if (project / "ios").is_dir():
            if platform.system() == "Darwin":
                results.append(await self.command(f"{task_id}-ios-simulator", project, [flutter, "build", "ios", "--simulator", "--no-codesign"], timeout=max(self.timeout, 1800), extra_env=env))
            else:
                results.append(self.record({"task": f"{task_id}-ios-simulator", "status": "BLOCKED", "reason": "iOS simulator build requires macOS/Xcode"}))
        failed = [x for x in results if x["status"] != "PASS"]
        lock = "present" if (project / "pubspec.lock").is_file() else "missing"
        status = "PASS" if not failed and lock == "present" else ("BLOCKED" if not failed else "FAIL")
        return self.record({"task": task_id, "status": status, "subtasks": results,
                            "lockfile": lock, "note": "All Flutter commands run in a disposable copy; source tree is not modified."})

    async def go_project(self, path: Path | None) -> dict[str, Any]:
        if path is None or not (path / "go.mod").is_file():
            return self.record({"task": "core-v2-go", "status": "BLOCKED",
                                "reason": "CORE V2 PR #596 is separate from the evidence branch; pass --core-v2-dir pointing to its local checkout"})
        go = shutil.which("go")
        if not go:
            return self.record({"task": "core-v2-go", "status": "BLOCKED", "reason": "Go toolchain not installed"})
        env = {"GOTOOLCHAIN": "local", "GOPROXY": "direct" if self.network else "off"}
        results = []
        for suffix, args in [
            ("tests", ["test", "./..."]),
            ("race-tests", ["test", "-race", "./..."]),
            ("vet", ["vet", "./..."]),
        ]:
            results.append(await self.command(f"core-v2-{suffix}", path, [go, *args], timeout=max(self.timeout, 1800), extra_env=env))
        status = "PASS" if all(x["status"] == "PASS" for x in results) else "FAIL"
        return self.record({"task": "core-v2-go", "status": status, "subtasks": results})

    async def firebase_candidate(self, path: Path | None) -> dict[str, Any]:
        if path is None or not path.is_dir():
            return self.record({"task": "firebase-hosting-candidate", "status": "BLOCKED",
                                "reason": "PR #614 is separate from the evidence branch; pass --firebase-candidate-dir pointing to its local checkout"})
        node = shutil.which("node")
        if not node:
            return self.record({"task": "firebase-hosting-candidate", "status": "BLOCKED", "reason": "Node.js not installed"})
        results = []
        builder = path / "scripts/build-firebase-public.mjs"
        test = path / "scripts/test-build-firebase-public.mjs"
        if builder.is_file():
            results.append(await self.command("firebase-builder-syntax", path, [node, "--check", str(builder)]))
        if test.is_file():
            results.append(await self.command("firebase-publication-negative-tests", path, [node, "--test", str(test)], timeout=max(self.timeout, 600)))
        if not results:
            return self.record({"task": "firebase-hosting-candidate", "status": "BLOCKED", "reason": "expected PR #614 builder/test files not found"})
        status = "PASS" if all(x["status"] == "PASS" for x in results) else "FAIL"
        return self.record({"task": "firebase-hosting-candidate", "status": status, "subtasks": results,
                            "note": "These are local publication-boundary tests, not Firebase connectivity or Hosting deployment evidence."})

    async def public_probes(self) -> dict[str, Any]:
        if not self.network:
            return self.record({"task": "public-route-probes", "status": "BLOCKED", "reason": "pass --network-enabled to allow public HTTPS GET probes"})
        results = []
        for url in PROBES:
            req = urllib.request.Request(url, headers={"User-Agent": "LINGO-Recovery-Evidence/1.0"}, method="GET")
            try:
                with urllib.request.urlopen(req, timeout=20) as response:
                    results.append({"url": url, "status": response.status, "final_url": response.geturl()})
            except urllib.error.HTTPError as exc:
                results.append({"url": url, "status": exc.code, "final_url": exc.geturl(), "error": "HTTPError"})
            except Exception as exc:
                results.append({"url": url, "error": f"{type(exc).__name__}: {exc}"})
        acceptable = all(x.get("status") in {200, 301, 302, 307, 308} for x in results)
        return self.record({"task": "public-route-probes", "status": "PASS" if acceptable else "FAIL",
                            "probes": results, "note": "Unauthenticated GET only; no mutation."})

    async def security_tools(self, workspace: Path) -> dict[str, Any]:
        scanner = shutil.which("gitleaks")
        if not scanner:
            return self.record({"task": "secret-scan", "status": "BLOCKED", "reason": "gitleaks not installed; no scanner was downloaded or installed"})
        return await self.command("secret-scan", workspace,
                                  [scanner, "detect", "--source", str(workspace), "--no-git", "--redact", "--exit-code", "1"],
                                  timeout=max(self.timeout, 1200))


async def main_async(args: argparse.Namespace) -> int:
    source = Path(args.repo_root).resolve()
    if not (source / ".git").exists() or not (source / "ops/recovery").is_dir():
        print("BLOCKED: run from a Git checkout containing ops/recovery.", file=sys.stderr)
        return 2
    if args.expected_sha and not SHA_RE.fullmatch(args.expected_sha):
        print("BLOCKED: --expected-sha must be a full lowercase 40-character SHA.", file=sys.stderr)
        return 2
    if args.timeout < 1:
        print("BLOCKED: --timeout must be positive.", file=sys.stderr)
        return 2

    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out = (source / args.output_dir / f"run-{run_id}").resolve()
    out.mkdir(parents=True, exist_ok=False)
    started = utc_now()
    runner = Runner(source, out, args.timeout, args.network_enabled)
    core_dir = Path(args.core_v2_dir).resolve() if args.core_v2_dir else None
    firebase_dir = Path(args.firebase_candidate_dir).resolve() if args.firebase_candidate_dir else None
    g02_evidence = Path(args.g02_evidence).resolve() if args.g02_evidence else None

    print(f"LINGO ONE-TIME RESTORATION RUN: {run_id}")
    print("Mode: local tests/builds + optional public GET probes; production activation disabled.")
    with tempfile.TemporaryDirectory(prefix="lingo-recovery-") as temp:
        workspace = Path(temp) / "repo"
        copy_workspace(source, workspace)

        # Optional PR worktrees are copied into the disposable workspace so
        # package managers and test tools cannot modify the supplied checkout.
        core_candidate = None
        if core_dir and (core_dir / "go.mod").is_file():
            core_candidate = workspace / "_external_candidates" / "core-v2"
            core_candidate.parent.mkdir(parents=True, exist_ok=True)
            copy_workspace(core_dir, core_candidate)
        firebase_candidate = None
        if firebase_dir and firebase_dir.is_dir():
            firebase_candidate = workspace / "_external_candidates" / "firebase-hosting"
            firebase_candidate.parent.mkdir(parents=True, exist_ok=True)
            copy_workspace(firebase_dir, firebase_candidate)

        waves = [
            ("WAVE 0 — SOURCE AND BASELINE", [
                runner.integrity(source),
            ]),
            ("WAVE 1 — REPOSITORY / SECURITY / SERVICE CONTRACTS", [
                runner.python_recovery(workspace),
                runner.static_gates(workspace),
                runner.security_tools(workspace),
                runner.firebase_candidate(firebase_candidate),
                runner.go_project(core_candidate),
            ]),
            ("WAVE 2 — MOBILE AND WEB BUILDS", [
                runner.flutter_project(workspace, ".", "flutter-root"),
                runner.flutter_project(workspace, "studio-sites/games/oasis-platform/flutter", "flutter-oasis"),
            ]),
            ("WAVE 3 — PUBLIC ROUTE OBSERVATION", [
                runner.public_probes(),
            ]),
        ]
        for title, coroutines in waves:
            print(f"\n{title}")
            results = await asyncio.gather(*coroutines)
            for result in results:
                print(f"  [{result['status']}] {result['task']}")

    g02_result: dict[str, Any]
    if g02_evidence and g02_evidence.is_file() and args.expected_sha:
        gate = source / "ops/recovery/checkpoint_gate.py"
        g02_result = await runner.command(
            "g02-evidence-gate", source,
            [sys.executable, str(gate), "--evidence", str(g02_evidence), "--expected-sha", args.expected_sha],
        )
    else:
        g02_result = runner.record({"task": "g02-evidence-gate", "status": "BLOCKED",
                                    "reason": "No externally captured G02 evidence JSON plus exact --expected-sha supplied. No runner was started."})

    # These are external acceptance dependencies, not commands this script may bypass.
    external = [
        {"gate": "github-actions-admission", "status": "BLOCKED", "reason": "Owner-side Actions admission/policy/quota issue remains unresolved; no workflow dispatch or rerun is initiated."},
        {"gate": "cloudflare-version-provenance", "status": "BLOCKED", "reason": "Worker uploads 138–367 are not correlated to accepted source/test/release evidence; deployed version 137 remains protected."},
        {"gate": "firebase-live-connectivity", "status": "BLOCKED", "reason": "No verified staging Firebase project/credentials or provider connectivity evidence."},
        {"gate": "identity-wallet-integration", "status": "BLOCKED", "reason": "No verified staging identity provider or shared server-authoritative wallet/ledger."},
        {"gate": "backup-restore-and-dr", "status": "BLOCKED", "reason": "Independent backup hash inventory and isolated restore drill not evidenced."},
        {"gate": "independent-security-certification", "status": "BLOCKED", "reason": "A local secret scan alone cannot replace SAST/SCA, SBOM/provenance, threat-model review, and independent verification."},
        {"gate": "production-activation", "status": "BLOCKED", "reason": "PROTECTED HOLD: no signed, exact-SHA, action-scoped authorization or approved rollback/release evidence. This script cannot activate production."},
    ]
    tasks = runner.results
    gates = [{"gate": x["task"], "status": x["status"]} for x in tasks] + external
    if g02_result["status"] != "PASS":
        gates.append({"gate": "G02", "status": g02_result["status"], "reason": g02_result.get("reason", "G02 evidence gate did not pass")})
    critical_nonpass = [x for x in gates if x["status"] != "PASS"]
    summary = {
        "schema_version": "lingo.one-time-restoration.v1",
        "run_id": run_id,
        "started_at_utc": started,
        "completed_at_utc": utc_now(),
        "repository": "thelingolegacy-blip/TheLingoLegacy",
        "source_path": str(source),
        "source_sha": next((x.get("commit_sha") for x in tasks if x["task"] == "source-integrity"), None),
        "mode": "network-enabled" if args.network_enabled else "offline",
        "parallelism": "concurrent within each dependency-ordered wave",
        "tasks": tasks,
        "gates": gates,
        "summary": {
            "tasks": len(tasks),
            "passed": sum(x["status"] == "PASS" for x in tasks),
            "failed": sum(x["status"] == "FAIL" for x in tasks),
            "blocked": sum(x["status"] == "BLOCKED" for x in tasks),
            "critical_gates_not_passed": len(critical_nonpass),
        },
        "final_disposition": "BLOCKED" if critical_nonpass else "PASS",
        "production_activation": "NOT PERFORMED — PROTECTED HOLD",
        "prohibited_actions_not_performed": [
            "merge", "production deployment", "DNS or Worker mutation",
            "Firebase provider mutation", "runner activation or workflow dispatch",
            "payment activation/cash-out", "data migration", "backup deletion",
        ],
    }
    report = out / "final-evidence.json"
    report.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    digest = hashlib.sha256(report.read_bytes()).hexdigest()
    (out / "SHA256SUMS").write_text(f"{digest}  final-evidence.json\n", encoding="utf-8")
    print("\nFINAL DISPOSITION:", summary["final_disposition"])
    print("Evidence:", report)
    print("SHA-256:", digest)
    print("Production activation: NOT PERFORMED — PROTECTED HOLD")
    return 0 if summary["final_disposition"] == "PASS" else 1


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", default=".", help="Existing local Git checkout (default: current directory)")
    parser.add_argument("--output-dir", default="release/evidence/one-time-restoration", help="Evidence output root inside repo")
    parser.add_argument("--timeout", type=int, default=900, help="Per-command timeout in seconds")
    parser.add_argument("--network-enabled", action="store_true", help="Allow public HTTPS GET probes and dependency downloads")
    parser.add_argument("--core-v2-dir", help="Existing local checkout/worktree for PR #596 Go implementation")
    parser.add_argument("--firebase-candidate-dir", help="Existing local checkout/worktree for PR #614 Firebase candidate")
    parser.add_argument("--g02-evidence", help="Externally captured G02 evidence JSON; never fabricated by this script")
    parser.add_argument("--expected-sha", help="Exact full commit SHA for G02 evidence correlation")
    return parser.parse_args()


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(main_async(parse_args())))
    except KeyboardInterrupt:
        print("INTERRUPTED: partial logs remain in the run evidence directory.", file=sys.stderr)
        raise SystemExit(130)
