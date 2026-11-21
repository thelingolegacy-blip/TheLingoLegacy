#!/usr/bin/env python3
"""One-time, fail-closed LINGO Legacy restoration orchestrator.

Runs independent local checks concurrently in dependency-ordered waves, writes a
machine-readable evidence bundle, and never deploys, activates, merges, changes
DNS, provisions services, enables payments, starts runners, or deletes backups.

Usage:
  python3 ops/recovery/run_one_time_restoration.py --source-expected-sha <40-char-sha>
  python3 ops/recovery/run_one_time_restoration.py --source-expected-sha <40-char-sha> --network-enabled
  python3 ops/recovery/run_one_time_restoration.py --source-expected-sha <40-char-sha> --core-v2-dir /path/to/pr596 --core-v2-expected-sha <40-char-sha>
  python3 ops/recovery/run_one_time_restoration.py --source-expected-sha <40-char-sha> --firebase-candidate-dir /path/to/pr614 --firebase-expected-sha <40-char-sha>
  python3 ops/recovery/run_one_time_restoration.py --source-expected-sha <40-char-sha> --g02-evidence /secure/g02.json --expected-sha <40-char-sha>

Network-enabled mode adds only fixed-host public HTTPS GET probes in this
process; it does NOT sandbox child-process egress. The host must enforce
outbound deny-by-default networking (or remain fully offline), with only the
three fixed probe hosts allowlisted when probes are enabled. Provider downloads
and provider-side mutations remain disabled.
Candidate directories must be pre-existing local checkouts/worktrees; this tool
does not fetch branches, alter refs, or create worktrees. Run only inside a
disposable, unprivileged VM/container with no provider credentials or host mounts.
The required acknowledgement flag is an operator attestation, not a sandbox;
it cannot enforce network egress restrictions or prove the host is isolated.
"""
from __future__ import annotations

import argparse
import asyncio
import fnmatch
import hashlib
import ipaddress
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
from urllib.parse import urljoin, urlparse

IGNORED = {
    ".git", ".dart_tool", ".gradle", ".idea", ".venv", "venv",
    "node_modules", "build", ".next", ".turbo", "coverage",
    "__pycache__", ".pytest_cache", ".mypy_cache", ".cache", "one-time-restoration",
    ".env", ".env.*", ".secrets", "secrets", "*.pem", "*.key", "*.p12", "*.pfx",
    ".ssh", ".aws", ".azure", ".docker", ".npmrc", ".netrc", ".pypirc",
    ".git-credentials", "id_rsa*", "id_ed25519*", "*.tfstate", "*.tfstate.*",
    "service-account*.json", "*credentials*.json",
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


SAFE_ENV_KEYS = {
    "PATH", "SYSTEMROOT", "WINDIR", "PATHEXT", "TEMP", "TMP",
    "LANG", "LC_ALL", "CI", "ANDROID_SDK_ROOT", "ANDROID_HOME",
    "JAVA_HOME", "FLUTTER_ROOT", "PUB_CACHE", "GOTOOLCHAIN", "GOPROXY",
}


def aggregate_status(statuses: list[str]) -> str:
    """A task passes only when every required subtask passes."""
    if not statuses or any(status not in {"PASS", "FAIL", "BLOCKED"} for status in statuses):
        return "BLOCKED"
    if "FAIL" in statuses:
        return "FAIL"
    if "BLOCKED" in statuses:
        return "BLOCKED"
    return "PASS"


def safe_env(extra: dict[str, str] | None = None, home_dir: Path | None = None) -> dict[str, str]:
    # Do not inherit the operator's HOME, cloud credentials, SSH agent, proxy
    # credentials, provider profiles, or arbitrary application environment.
    env = {k: v for k, v in os.environ.items() if k in SAFE_ENV_KEYS}
    env["HOME"] = str(home_dir) if home_dir is not None else tempfile.gettempdir()
    env.setdefault("PATH", os.defpath)
    env.setdefault("CI", "1")
    if extra:
        unexpected = set(extra) - (SAFE_ENV_KEYS | {"TEST_DATABASE_URL", "LINGO_FIREBASE_STAGING_PROJECT_ID"})
        if unexpected:
            raise ValueError("unsupported child environment keys: " + ", ".join(sorted(unexpected)))
        env.update(extra)
    return env


def find_workspace_symlinks(source: Path) -> list[str]:
    found: list[str] = []
    for current, directories, files in os.walk(source, followlinks=False):
        current_path = Path(current)
        kept_directories = []
        for name in directories:
            item = current_path / name
            relative_parts = item.relative_to(source).parts
            ignored = any(fnmatch.fnmatch(part, pattern) for part in relative_parts for pattern in IGNORED)
            if ignored:
                continue
            if item.is_symlink():
                found.append(item.relative_to(source).as_posix())
            else:
                kept_directories.append(name)
        directories[:] = kept_directories
        for name in files:
            item = current_path / name
            relative_parts = item.relative_to(source).parts
            if any(fnmatch.fnmatch(part, pattern) for part in relative_parts for pattern in IGNORED):
                continue
            if item.is_symlink():
                found.append(item.relative_to(source).as_posix())
    return found


def resolve_output_root(source: Path, output_dir: str) -> Path:
    requested = Path(output_dir)
    lexical = requested if requested.is_absolute() else source / requested
    resolved = lexical.resolve()
    if resolved == source or source not in resolved.parents:
        raise ValueError("output directory must resolve to a child of the source repository")
    try:
        relative = lexical.absolute().relative_to(source)
    except ValueError as exc:
        raise ValueError("output directory must be specified inside the source repository") from exc
    current = source
    for part in relative.parts:
        current = current / part
        if current.exists() and current.is_symlink():
            raise ValueError("output directory path must not contain symlink components")
    return resolved


COPY_IGNORES = (*IGNORED, "*.log", "static-gate-results.json")


def workspace_manifest_sha256(root: Path) -> str:
    """Hash every regular file that copy_workspace would preserve, by path and bytes."""
    digest = hashlib.sha256()
    for current, directories, files in os.walk(root, followlinks=False):
        current_path = Path(current)
        directories[:] = sorted(name for name in directories
                                if not any(fnmatch.fnmatch(name, pattern) for pattern in COPY_IGNORES))
        for name in sorted(files):
            if any(fnmatch.fnmatch(name, pattern) for pattern in COPY_IGNORES):
                continue
            path = current_path / name
            if path.is_symlink() or not path.is_file():
                raise ValueError(f"workspace contains a non-regular file: {path.relative_to(root).as_posix()}")
            relative = path.relative_to(root).as_posix().encode("utf-8")
            digest.update(len(relative).to_bytes(8, "big"))
            digest.update(relative)
            file_digest = hashlib.sha256()
            with path.open("rb") as stream:
                for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                    file_digest.update(chunk)
            digest.update(file_digest.digest())
    return digest.hexdigest()


def copy_workspace(source: Path, destination: Path) -> None:
    symlinks = find_workspace_symlinks(source)
    if symlinks:
        raise ValueError("workspace contains symlinks; refusing to preserve or follow them: " + ", ".join(symlinks[:20]))
    shutil.copytree(source, destination,
                    ignore=shutil.ignore_patterns(*COPY_IGNORES), symlinks=False)


def copy_workspace_verified(source: Path, destination: Path) -> str:
    """Copy only when source is stable across the copy and destination matches it."""
    before = workspace_manifest_sha256(source)
    copy_workspace(source, destination)
    after = workspace_manifest_sha256(source)
    copied = workspace_manifest_sha256(destination)
    if before != after or before != copied:
        raise ValueError("workspace changed during copy or copied content does not match the attested source manifest")
    return before


def valid_redirect_target(source_url: str, location: str) -> bool:
    source = urlparse(source_url)
    target = urlparse(urljoin(source_url, location))
    try:
        target_port = target.port
    except ValueError:
        return False
    return (target.scheme == "https"
            and target.hostname == source.hostname
            and target_port in (None, 443)
            and target.username is None
            and target.password is None)


class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class Runner:
    def __init__(self, root: Path, out: Path, timeout: int, network: bool):
        self.root = root
        self.out = out
        self.timeout = timeout
        self.network = network
        self.home = self.out / "isolated-home"
        self.home.mkdir(parents=True, exist_ok=True, mode=0o700)
        try:
            self.home.chmod(0o700)
        except OSError:
            pass
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
                *argv, cwd=str(cwd), env=safe_env(extra_env, self.home),
                stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT,
            )
            output, _ = await asyncio.wait_for(proc.communicate(), timeout=timeout or self.timeout)
            text = output.decode("utf-8", errors="replace")
            # Never persist a PostgreSQL connection URI if a child process
            # includes it in diagnostics.
            text = re.sub(r"postgres(?:ql)?://[^\s'\"<>]+", "[REDACTED_POSTGRES_DSN]", text, flags=re.I)
            if extra_env and extra_env.get("TEST_DATABASE_URL"):
                text = text.replace(extra_env["TEST_DATABASE_URL"], "[REDACTED_POSTGRES_DSN]")
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

    async def git_snapshot(self, path: Path, exclude_path: Path | None = None) -> dict[str, Any]:
        async def git_value(*args: str) -> tuple[int | None, str]:
            try:
                proc = await asyncio.create_subprocess_exec(
                    "git", *args, cwd=str(path), env=safe_env(home_dir=self.home),
                    stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT,
                )
                raw, _ = await asyncio.wait_for(proc.communicate(), timeout=60)
                return proc.returncode, raw.decode("utf-8", errors="replace").strip()
            except Exception as exc:
                return None, f"{type(exc).__name__}: {exc}"

        head_rc, head = await git_value("rev-parse", "HEAD")
        branch_rc, branch = await git_value("branch", "--show-current")
        status_args = ["status", "--porcelain", "--untracked-files=all"]
        if exclude_path is not None:
            try:
                relative_output = exclude_path.relative_to(path).as_posix()
                status_args.extend(["--", ".", f":(exclude){relative_output}"])
            except ValueError:
                pass
        status_rc, status = await git_value(*status_args)
        return {
            "path": str(path),
            "commit_sha": head if head_rc == 0 else None,
            "branch": branch if branch_rc == 0 else None,
            "working_tree_status": status[:12000],
            "working_tree_clean": status_rc == 0 and status == "",
            "git_readable": head_rc == 0 and status_rc == 0,
        }

    async def integrity(self, source: Path, expected_sha: str) -> dict[str, Any]:
        snapshot = await self.git_snapshot(source, self.out)
        sha_matches = snapshot.get("commit_sha") == expected_sha
        try:
            proc = await asyncio.create_subprocess_exec(
                "git", "diff", "--check", cwd=str(source), env=safe_env(home_dir=self.home),
                stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT,
            )
            raw, _ = await asyncio.wait_for(proc.communicate(), timeout=60)
            diff_rc = proc.returncode
            diff_output = raw.decode("utf-8", errors="replace").strip()
        except Exception as exc:
            diff_rc = None
            diff_output = f"{type(exc).__name__}: {exc}"
        passed = snapshot["git_readable"] and snapshot["working_tree_clean"] and sha_matches and diff_rc == 0
        return self.record({
            "task": "source-integrity",
            "status": "PASS" if passed else "FAIL",
            "commit_sha": snapshot["commit_sha"],
            "expected_sha": expected_sha,
            "expected_sha_matches": sha_matches,
            "branch": snapshot["branch"],
            "working_tree_clean": snapshot["working_tree_clean"],
            "working_tree_status": snapshot["working_tree_status"],
            "diff_check_exit_code": diff_rc,
            "diff_check_output": diff_output[:12000],
            "note": "A clean, exact-SHA checkout is required; dirty or untracked files fail W0 so later waves cannot test content misattributed to HEAD.",
        })

    async def flutter_project(
        self, workspace: Path | None, relative: str, task_id: str,
        provenance: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        source_sha = (provenance or {}).get("commit_sha")
        source_branch = (provenance or {}).get("branch")
        if workspace is None or not workspace.is_dir():
            return self.record({"task": task_id, "status": "BLOCKED",
                                "reason": "required clean candidate workspace is unavailable",
                                "source_commit_sha": source_sha, "source_branch": source_branch})
        project = workspace / relative
        if not (project / "pubspec.yaml").is_file():
            return self.record({"task": task_id, "status": "BLOCKED",
                                "reason": f"{relative}/pubspec.yaml not found",
                                "source_commit_sha": source_sha, "source_branch": source_branch})
        flutter = shutil.which("flutter")
        if not flutter:
            return self.record({"task": task_id, "status": "BLOCKED", "reason": "Flutter SDK not installed",
                                "source_commit_sha": source_sha, "source_branch": source_branch})
        source_lockfile_present = (project / "pubspec.lock").is_file()
        if not source_lockfile_present:
            return self.record({"task": task_id, "status": "BLOCKED",
                                "reason": "committed source pubspec.lock is missing; refusing to generate an unreviewed lockfile",
                                "source_commit_sha": source_sha, "source_branch": source_branch})
        # Enforce the committed lockfile and reuse the operator's existing
        # PUB_CACHE. Offline mode must not point to a newly created empty cache.
        env: dict[str, str] = {}
        pub_args = [flutter, "pub", "get", "--enforce-lockfile", "--offline"]
        pub = await self.command(f"{task_id}-pub-get", project, pub_args, timeout=max(self.timeout, 900), extra_env=env)
        if pub["status"] != "PASS":
            return self.record({"task": task_id, "status": "BLOCKED",
                                "reason": "dependency resolution did not complete; analyze/test/build steps were not run",
                                "dependency_task": pub["task"], "source_commit_sha": source_sha,
                                "source_branch": source_branch})
        commands = [
            ("analyze", [flutter, "analyze"]),
            ("tests", [flutter, "test"]),
            ("web-build", [flutter, "build", "web", "--release"]),
        ]
        results = []
        for suffix, argv in commands:
            results.append(await self.command(f"{task_id}-{suffix}", project, argv, timeout=max(self.timeout, 1200), extra_env=env))
        if (project / "android").is_dir():
            android_sdk = os.environ.get("ANDROID_SDK_ROOT") or os.environ.get("ANDROID_HOME")
            local_properties = project / "android/local.properties"
            if local_properties.is_file():
                for line in local_properties.read_text(encoding="utf-8", errors="replace").splitlines():
                    if line.startswith("sdk.dir="):
                        android_sdk = line.split("=", 1)[1].replace("\\:", ":")
                        break
            if android_sdk and Path(android_sdk).is_dir():
                results.append(await self.command(f"{task_id}-android-debug", project, [flutter, "build", "apk", "--debug"], timeout=max(self.timeout, 1800), extra_env=env))
            else:
                results.append(self.record({"task": f"{task_id}-android-debug", "status": "BLOCKED",
                                            "reason": "Android SDK not found via ANDROID_SDK_ROOT, ANDROID_HOME, or android/local.properties"}))
        if (project / "ios").is_dir():
            if platform.system() == "Darwin" and shutil.which("xcodebuild"):
                results.append(await self.command(f"{task_id}-ios-simulator", project, [flutter, "build", "ios", "--simulator", "--no-codesign"], timeout=max(self.timeout, 1800), extra_env=env))
            else:
                results.append(self.record({"task": f"{task_id}-ios-simulator", "status": "BLOCKED",
                                            "reason": "iOS simulator build requires macOS with Xcode/xcodebuild"}))
        # A platform task is accepted only when every applicable build passes.
        # Missing SDKs/Xcode remain BLOCKED and cannot be hidden by a web PASS.
        status = aggregate_status([x["status"] for x in results])
        return self.record({"task": task_id, "status": status, "subtasks": results,
                            "lockfile": "present", "source_commit_sha": source_sha,
                            "source_branch": source_branch,
                            "note": "All Flutter commands run in a disposable copy with --enforce-lockfile; source tree is not modified."})

    async def go_project(self, path: Path | None, provenance: dict[str, Any] | None = None,
                        allow_local_db: bool = False) -> dict[str, Any]:
        source_sha = (provenance or {}).get("commit_sha")
        source_branch = (provenance or {}).get("branch")
        if path is None or not (path / "go.mod").is_file():
            return self.record({"task": "core-v2-go", "status": "BLOCKED",
                                "reason": "CORE V2 Go module was not copied from a clean PR #596 checkout; expected platform/lingo-core-v2/services/api/go.mod or a module-directory input",
                                "source_commit_sha": source_sha, "source_branch": source_branch})
        go = shutil.which("go")
        if not go:
            return self.record({"task": "core-v2-go", "status": "BLOCKED", "reason": "Go toolchain not installed",
                                "source_commit_sha": source_sha, "source_branch": source_branch})
        env = {"GOTOOLCHAIN": "local", "GOPROXY": "off"}
        results = []
        gofmt = shutil.which("gofmt")
        if gofmt:
            format_check = (
                "import subprocess; p=subprocess.run(['gofmt','-l','.'],capture_output=True,text=True); "
                "assert p.returncode == 0, p.stderr; "
                "assert not p.stdout.strip(), 'unformatted Go files: '+p.stdout; "
                "print('GOFMT=PASS')"
            )
            results.append(await self.command("core-v2-gofmt-check", path, [sys.executable, "-c", format_check],
                                               timeout=max(self.timeout, 600), extra_env=env))
        else:
            results.append(self.record({"task": "core-v2-gofmt-check", "status": "BLOCKED", "reason": "gofmt not installed"}))
        results.append(await self.command("core-v2-module-tidy-check", path, [go, "mod", "tidy", "-diff"],
                                           timeout=max(self.timeout, 1800), extra_env=env))

        test_dsn = os.environ.get("TEST_DATABASE_URL", "").strip()
        if not allow_local_db:
            # Do not pass a possibly tunneled loopback DSN to tests unless the
            # operator explicitly opts in to isolated schema create/drop work.
            env["TEST_DATABASE_URL"] = ""
            results.append(self.record({"task": "core-v2-postgres-integration-target", "status": "BLOCKED",
                                        "reason": "local PostgreSQL integration tests create/drop isolated schemas; explicit --allow-local-postgres-integration opt-in is required."}))
        elif not test_dsn:
            env["TEST_DATABASE_URL"] = ""
            results.append(self.record({"task": "core-v2-postgres-integration-target", "status": "BLOCKED",
                                        "reason": "TEST_DATABASE_URL is unset; supply a local loopback database named lingo_test."}))
        else:
            parsed = urlparse(test_dsn)
            host = parsed.hostname or ""
            database = parsed.path.lstrip("/")
            try:
                loopback = host.lower() == "localhost" or ipaddress.ip_address(host).is_loopback
            except ValueError:
                loopback = False
            safe_target = parsed.scheme in {"postgres", "postgresql"} and loopback and database == "lingo_test"
            results.append(self.record({
                "task": "core-v2-postgres-integration-target",
                "status": "PASS" if safe_target else "FAIL",
                "host": host, "database": database,
                "reason": None if safe_target else "TEST_DATABASE_URL must target localhost/loopback and database lingo_test; raw DSN is never recorded.",
            }))
            if safe_target:
                env["TEST_DATABASE_URL"] = test_dsn
            else:
                env["TEST_DATABASE_URL"] = ""
        results.append(await self.command("core-v2-tests", path, [go, "test", "-count=1", "-v", "./..."],
                                           timeout=max(self.timeout, 1800), extra_env=env))
        results.append(await self.command("core-v2-race-tests", path, [go, "test", "-race", "-count=1", "./..."],
                                           timeout=max(self.timeout, 1800), extra_env=env))
        results.append(await self.command("core-v2-vet", path, [go, "vet", "./..."],
                                           timeout=max(self.timeout, 1800), extra_env=env))
        results.append(await self.command("core-v2-build", path, [go, "build", "./..."],
                                           timeout=max(self.timeout, 1800), extra_env=env))
        statuses = [x["status"] for x in results]
        status = "FAIL" if "FAIL" in statuses else ("BLOCKED" if "BLOCKED" in statuses else "PASS")
        return self.record({"task": "core-v2-go", "status": status, "source_commit_sha": source_sha,
                            "source_branch": source_branch, "subtasks": results,
                            "note": "PostgreSQL integration acceptance is BLOCKED unless TEST_DATABASE_URL targets a local loopback lingo_test database; the raw DSN is never copied into evidence."})

    async def firebase_candidate(self, path: Path | None, provenance: dict[str, Any] | None = None) -> dict[str, Any]:
        source_sha = (provenance or {}).get("commit_sha")
        source_branch = (provenance or {}).get("branch")
        if path is None or not path.is_dir():
            return self.record({"task": "firebase-hosting-candidate", "status": "BLOCKED",
                                "reason": "PR #614 is separate from the evidence branch; pass --firebase-candidate-dir pointing to its local checkout",
                                "source_commit_sha": source_sha, "source_branch": source_branch})
        node = shutil.which("node")
        if not node:
            return self.record({"task": "firebase-hosting-candidate", "status": "BLOCKED", "reason": "Node.js not installed",
                                "source_commit_sha": source_sha, "source_branch": source_branch})
        scripts = [
            "scripts/build-firebase-public.mjs",
            "scripts/verify-flutter-firebase.mjs",
            "scripts/verify-flutter-android-readiness.mjs",
            "scripts/verify-android-api21-firebase.mjs",
        ]
        tests = [
            "scripts/test-build-firebase-public.mjs",
            "scripts/test-verify-flutter-firebase.mjs",
            "scripts/test-verify-android-api21-firebase.mjs",
            "scripts/test-verify-flutter-android-readiness.mjs",
        ]
        missing = [name for name in scripts + tests if not (path / name).is_file()]
        if missing:
            return self.record({"task": "firebase-hosting-candidate", "status": "BLOCKED",
                                "reason": "required PR #614 Firebase/Android contract files missing", "missing": missing,
                                "source_commit_sha": source_sha, "source_branch": source_branch})
        results = []
        for name in scripts:
            results.append(await self.command("firebase-syntax-" + Path(name).stem, path,
                                               [node, "--check", name], timeout=max(self.timeout, 600)))
        results.append(await self.command("firebase-contract-tests", path,
                                          [node, "--test", *tests], timeout=max(self.timeout, 1200)))
        # Run the concrete Android contract validators against this candidate,
        # not only their fixture tests. Firebase project identity remains an
        # external gate until an approved staging ID and alias are supplied.
        results.append(await self.command("firebase-android-readiness", path,
                                          [node, "scripts/verify-flutter-android-readiness.mjs"],
                                          timeout=max(self.timeout, 600)))
        results.append(await self.command("firebase-android-api21-contract", path,
                                          [node, "scripts/verify-android-api21-firebase.mjs"],
                                          timeout=max(self.timeout, 600)))
        staging_id = os.environ.get("LINGO_FIREBASE_STAGING_PROJECT_ID", "").strip()
        if staging_id:
            results.append(await self.command("firebase-staging-project-contract", path,
                                              [node, "scripts/verify-flutter-firebase.mjs"],
                                              timeout=max(self.timeout, 600),
                                              extra_env={"LINGO_FIREBASE_STAGING_PROJECT_ID": staging_id}))
        statuses = [x["status"] for x in results]
        status = "FAIL" if "FAIL" in statuses else ("BLOCKED" if "BLOCKED" in statuses else "PASS")
        return self.record({"task": "firebase-hosting-candidate", "status": status,
                            "source_commit_sha": source_sha, "source_branch": source_branch,
                            "subtasks": results,
                            "note": "Runs publication-boundary and Firebase/Android contract tests plus concrete Android validators. Firebase staging identity/connectivity and Hosting deployment remain external gates; no Firebase provider operation is performed."})

    async def recovery_contracts(self, workspace: Path) -> dict[str, Any]:
        bridge = workspace / "ops/recovery/bridge-adapter.sh"
        evidence = workspace / "ops/recovery/evidence-template.json"
        quarantine = workspace / "ops/recovery/quarantine-manifest.json"
        if not bridge.is_file() or not evidence.is_file() or not quarantine.is_file():
            return self.record({"task": "recovery-contracts", "status": "BLOCKED", "reason": "bridge adapter or recovery JSON manifests missing"})
        results = []
        results.append(await self.command("recovery-bridge-shell-syntax", workspace, ["bash", "-n", "ops/recovery/bridge-adapter.sh"]))
        json_check = "import json; from pathlib import Path; [json.loads(Path(p).read_text(encoding='utf-8')) for p in ['ops/recovery/evidence-template.json','ops/recovery/quarantine-manifest.json']]; print('RECOVERY_JSON=PASS')"
        results.append(await self.command("recovery-json-contracts", workspace, [sys.executable, "-c", json_check]))
        blocked_check = (
            "import subprocess,sys; "
            "p=subprocess.run([sys.executable,'ops/recovery/checkpoint_gate.py','--evidence','ops/recovery/evidence-template.json','--expected-sha','a'*40],capture_output=True,text=True); "
            "out=p.stdout+'\\n'+p.stderr; "
            "assert p.returncode==1 and 'RESULT=BLOCKED' in out, ('incomplete evidence template did not fail closed: '+out); "
            "print('INCOMPLETE_TEMPLATE_FAIL_CLOSED=PASS')"
        )
        results.append(await self.command("recovery-template-fail-closed", workspace, [sys.executable, "-c", blocked_check]))
        statuses = [x["status"] for x in results]
        overall = "FAIL" if "FAIL" in statuses else ("BLOCKED" if "BLOCKED" in statuses else "PASS")
        return self.record({"task": "recovery-contracts", "status": overall, "subtasks": results})

    async def product_regressions(self, workspace: Path) -> dict[str, Any]:
        node = shutil.which("node")
        tests = [
            "scripts/test-run-static-gates.mjs",
            "scripts/tests/server-slot-engine.test.mjs",
            "scripts/tests/worker-rate-limit.test.mjs",
            "studio-sites/games/doughboys-oasis-racing/campaign-state.test.js",
            "lingoassister/repair-engine.test.mjs",
        ]
        missing = [name for name in tests if not (workspace / name).is_file()]
        if missing:
            return self.record({"task": "product-regressions", "status": "BLOCKED", "reason": "expected regression tests missing", "missing": missing})
        if not node:
            return self.record({"task": "product-regressions", "status": "BLOCKED", "reason": "Node.js not installed"})
        return await self.command("product-regressions", workspace, [node, "--test", *tests], timeout=max(self.timeout, 1200))

    async def shell_safety_tests(self, workspace: Path) -> dict[str, Any]:
        scripts = [
            "ops/g02/tests/test-recovery-guard.sh",
            "ops/github-runner/tests/local-harness.sh",
            "ops/manual-control/test-validator.sh",
        ]
        missing = [name for name in scripts if not (workspace / name).is_file()]
        if missing:
            return self.record({"task": "shell-safety-tests", "status": "BLOCKED", "reason": "expected shell regression tests missing", "missing": missing})
        results = []
        for name in scripts:
            results.append(await self.command("shell-" + Path(name).stem, workspace, ["bash", name], timeout=max(self.timeout, 600)))
        return self.record({"task": "shell-safety-tests", "status": aggregate_status([x["status"] for x in results]), "subtasks": results})

    async def studio_contracts(self, workspace: Path) -> dict[str, Any]:
        node = shutil.which("node")
        if not node:
            return self.record({"task": "studio-contracts", "status": "BLOCKED", "reason": "Node.js not installed"})
        commands = [
            ["studio-sites/scripts/validate-studio.mjs"],
            ["studio/runtime/surface-integrity.js"],
            ["scripts/validate-ezca-registry.mjs"],
        ]
        missing = [cmd[0] for cmd in commands if not (workspace / cmd[0]).is_file()]
        if missing:
            return self.record({"task": "studio-contracts", "status": "BLOCKED", "reason": "expected studio/registry validators missing", "missing": missing})
        results = []
        for command in commands:
            name = Path(command[0]).stem
            results.append(await self.command("studio-" + name, workspace, [node, command[0]], timeout=max(self.timeout, 600)))
        return self.record({"task": "studio-contracts", "status": aggregate_status([x["status"] for x in results]), "subtasks": results})

    async def crimson_smoke_static(self, workspace: Path) -> dict[str, Any]:
        code = r"""
from pathlib import Path
import re
root = Path(".")
required = ["index.html", "assets/crimson-smoke.css", "assets/crimson-smoke.js", "assets/lingo-legacy-crimson-mark.svg"]
missing = [name for name in required if not (root / name).is_file()]
assert not missing, "missing required Crimson Smoke files: " + ", ".join(missing)
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "assets/crimson-smoke.css").read_text(encoding="utf-8")
js = (root / "assets/crimson-smoke.js").read_text(encoding="utf-8")
svg = (root / "assets/lingo-legacy-crimson-mark.svg").read_text(encoding="utf-8")
head = re.search(r"<head\b[^>]*>(.*?)</head>", html, re.I | re.S)
assert head, "homepage head missing"
head_text = head.group(1)
assert head_text.rfind('href="/assets/crimson-smoke.css"') > head_text.lower().rfind("</style>"), "stylesheet order incorrect"
body = re.search(r"<body\b[^>]*>", html, re.I)
assert body and len(re.findall(r"\bclass\s*=", body.group(0), re.I)) == 1, "body must have exactly one class attribute"
assert 'src="/assets/crimson-smoke.js"' in html, "audio script missing"
assert "/assets/lingo-legacy-crimson-mark.svg" in html, "brand mark missing"
assert "prefers-reduced-motion" in css, "reduced-motion support missing"
assert ".ll-audio-toggle{position:fixed;left:18px;right:auto;bottom:18px;" in css, "desktop audio placement mismatch"
assert "@media(max-width:620px){.ll-audio-toggle{left:12px;right:auto;bottom:12px;" in css, "mobile audio placement mismatch"
assert "aria-pressed" in js and "btn.addEventListener('click'" in js and "osc.start()" in js, "explicit audio interaction contract missing"
assert re.search(r"<title[\s>]", svg, re.I), "SVG title missing"
print("CRIMSON_SMOKE_STATIC=PASS")
"""
        return await self.command("crimson-smoke-static", workspace, [sys.executable, "-c", code], timeout=max(self.timeout, 300))

    async def cloudflare_dry_run(self, workspace: Path) -> dict[str, Any]:
        wrangler = shutil.which("wrangler")
        config = workspace / "cloudflare/wrangler.toml"
        if not wrangler or not config.is_file():
            return self.record({"task": "cloudflare-worker-dry-run", "status": "BLOCKED",
                                "reason": "local Wrangler CLI or cloudflare/wrangler.toml unavailable; no package was installed"})
        return await self.command("cloudflare-worker-dry-run", workspace,
                                  [wrangler, "deploy", "--dry-run", "--config", "cloudflare/wrangler.toml"],
                                  timeout=max(self.timeout, 900))

    async def devops_static(self, workspace: Path) -> dict[str, Any]:
        results = []
        yamllint = shutil.which("yamllint")
        if yamllint and (workspace / ".yamllint").is_file():
            files = [".github/cache-policy.yml", ".github/workflows/devops-foundation-validation.yml",
                     ".circleci/config.yml", ".gitlab-ci.yml", "config.yaml",
                     "ansible/playbooks/read-only-diagnostics.yml",
                     "observability/prometheus/prometheus.yml",
                     "observability/grafana/provisioning/datasources/datasource.yml",
                     "observability/elk/docker-compose.yml"]
            files = [x for x in files if (workspace / x).is_file()]
            results.append(await self.command("devops-yaml-lint", workspace, [yamllint, "-c", ".yamllint", "-s", *files]))
        else:
            results.append(self.record({"task": "devops-yaml-lint", "status": "BLOCKED", "reason": "yamllint or .yamllint unavailable"}))
        ansible = shutil.which("ansible-playbook")
        playbook = workspace / "ansible/playbooks/read-only-diagnostics.yml"
        if ansible and playbook.is_file():
            results.append(await self.command("devops-ansible-syntax", workspace,
                                              [ansible, "--syntax-check", "-i", "localhost,", str(playbook)]))
        else:
            results.append(self.record({"task": "devops-ansible-syntax", "status": "BLOCKED", "reason": "Ansible or read-only diagnostics playbook unavailable"}))
        terraform = shutil.which("terraform")
        tfdir = workspace / "infrastructure/terraform"
        if terraform and tfdir.is_dir():
            results.append(await self.command("devops-terraform-format", workspace,
                                              [terraform, "-chdir=infrastructure/terraform", "fmt", "-check", "-recursive"]))
            results.append(self.record({"task": "devops-terraform-init", "status": "BLOCKED",
                                        "reason": "provider installation is intentionally disabled; prepare a separately verified offline provider cache"}))
            results.append(self.record({"task": "devops-terraform-validate", "status": "BLOCKED",
                                        "reason": "Terraform validation requires an independently prepared provider cache"}))
        else:
            results.append(self.record({"task": "devops-terraform", "status": "BLOCKED", "reason": "Terraform or infrastructure/terraform unavailable"}))
        statuses = [x["status"] for x in results]
        overall = "FAIL" if "FAIL" in statuses else ("BLOCKED" if "BLOCKED" in statuses else "PASS")
        return self.record({"task": "devops-static", "status": overall, "subtasks": results,
                            "note": "Terraform provider installation is intentionally disabled; use a separately prepared and verified offline provider cache."})

    async def public_probes(self) -> dict[str, Any]:
        if not self.network:
            return self.record({"task": "public-route-probes", "status": "BLOCKED", "reason": "pass --network-enabled to allow public HTTPS GET probes"})
        results = []
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirectHandler())
        for url in PROBES:
            req = urllib.request.Request(url, headers={"User-Agent": "LINGO-Recovery-Evidence/1.0"}, method="GET")
            try:
                with opener.open(req, timeout=20) as response:
                    results.append({"url": url, "status": response.status, "final_url": response.geturl(),
                                    "location": response.headers.get("Location")})
            except urllib.error.HTTPError as exc:
                results.append({"url": url, "status": exc.code, "final_url": exc.geturl(),
                                "location": exc.headers.get("Location"), "error": "HTTPError"})
            except Exception as exc:
                results.append({"url": url, "error": f"{type(exc).__name__}: {exc}"})
        accepted = []
        redirect_statuses = {301, 302, 303, 307, 308}
        for index, result in enumerate(results):
            status = result.get("status")
            source_url = urlparse(PROBES[index])
            location = result.get("location")
            redirect_ok = False
            if status in redirect_statuses and location:
                redirect_ok = valid_redirect_target(PROBES[index], location)
            if index == 0:
                ok = status == 200
                result["expectation"] = "HTTP 200"
            else:
                ok = status == 200 or (status in redirect_statuses and redirect_ok)
                result["expectation"] = "HTTP 200 or same-host HTTPS redirect"
            result["redirect_target_valid"] = redirect_ok if status in redirect_statuses else None
            accepted.append(ok)
        acceptable = len(accepted) == len(PROBES) and all(accepted)
        return self.record({"task": "public-route-probes", "status": "PASS" if acceptable else "FAIL",
                            "probes": results, "note": "Unauthenticated HTTPS GET only; redirects are not followed; redirect targets must remain HTTPS on the original hostname; no mutation."})

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
    if not args.source_expected_sha or not SHA_RE.fullmatch(args.source_expected_sha):
        print("BLOCKED: --source-expected-sha must be supplied as a full lowercase 40-character SHA.", file=sys.stderr)
        return 2
    if args.expected_sha and not SHA_RE.fullmatch(args.expected_sha):
        print("BLOCKED: --expected-sha must be a full lowercase 40-character SHA.", file=sys.stderr)
        return 2
    for label, value in [("CORE V2", args.core_v2_expected_sha), ("Firebase", args.firebase_expected_sha)]:
        if value and not SHA_RE.fullmatch(value):
            print(f"BLOCKED: --{label.lower().replace(' ', '-')}-expected-sha must be a full lowercase 40-character SHA.", file=sys.stderr)
            return 2
    if not args.isolated_host_confirmed:
        print("BLOCKED: run only in a disposable, unprivileged, uncredentialed VM/container and pass --isolated-host-confirmed.", file=sys.stderr)
        return 2
    if args.timeout < 1:
        print("BLOCKED: --timeout must be positive.", file=sys.stderr)
        return 2

    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    try:
        output_root = resolve_output_root(source, args.output_dir)
    except ValueError as exc:
        print(f"BLOCKED: {exc}", file=sys.stderr)
        return 2
    out = output_root / f"run-{run_id}"
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
        root_before = await runner.git_snapshot(source, out)
        if (not root_before.get("git_readable") or not root_before.get("working_tree_clean")
                or root_before.get("commit_sha") != args.source_expected_sha):
            print("BLOCKED: root source checkout is not clean at --source-expected-sha.", file=sys.stderr)
            return 2
        try:
            copy_workspace_verified(source, workspace)
        except (OSError, ValueError) as exc:
            print(f"BLOCKED: source workspace cannot be copied safely: {exc}", file=sys.stderr)
            return 2
        root_after = await runner.git_snapshot(source, out)
        if (not root_after.get("git_readable") or not root_after.get("working_tree_clean")
                or root_after.get("commit_sha") != args.source_expected_sha
                or root_after.get("commit_sha") != root_before.get("commit_sha")):
            print("BLOCKED: root source checkout changed during snapshot/copy; no checks will run.", file=sys.stderr)
            return 2

        # Capture immutable provenance before copying either candidate. Dirty
        # worktrees are rejected so test results cannot be attributed only to
        # a HEAD SHA while silently including uncommitted content.
        core_snapshot = await runner.git_snapshot(core_dir) if core_dir and core_dir.is_dir() else None
        firebase_snapshot = await runner.git_snapshot(firebase_dir) if firebase_dir and firebase_dir.is_dir() else None

        def candidate_ok(snapshot: dict[str, Any] | None, expected: str | None, module_ok: bool) -> bool:
            # A candidate is admissible only when tied to the exact live PR head.
            # Omitting the expected SHA must never silently accept an arbitrary clean checkout.
            return bool(snapshot and expected and snapshot.get("git_readable") and snapshot.get("working_tree_clean")
                        and snapshot.get("commit_sha") == expected and module_ok)

        def candidate_status(snapshot: dict[str, Any] | None, expected: str | None,
                             module_ok: bool) -> tuple[str, str | None]:
            if snapshot is None:
                return "BLOCKED", "candidate checkout path is missing or is not a directory"
            if not expected:
                return "BLOCKED", "exact current PR head SHA is required; supply the matching --*-expected-sha"
            if not snapshot.get("git_readable") or not snapshot.get("working_tree_clean"):
                return "FAIL", "candidate Git checkout is unreadable or dirty"
            if snapshot.get("commit_sha") != expected:
                return "FAIL", "candidate HEAD does not match the expected current PR head SHA"
            if not module_ok:
                return "FAIL", "required candidate module or contract tests are missing"
            return "PASS", None

        core_module = bool(core_dir and ((core_dir / "platform/lingo-core-v2/services/api/go.mod").is_file()
                                         or (core_dir / "go.mod").is_file()))
        core_has_symlinks = bool(core_dir and core_dir.is_dir() and find_workspace_symlinks(core_dir))
        core_ok = candidate_ok(core_snapshot, args.core_v2_expected_sha, core_module) and not core_has_symlinks
        core_status, core_reason = candidate_status(core_snapshot, args.core_v2_expected_sha, core_module)
        if core_has_symlinks:
            core_status, core_reason = "FAIL", "candidate contains symlinks; safe disposable copy is not permitted"
        runner.record({"task": "core-v2-source-provenance", "status": core_status,
                       **(core_snapshot or {"path": str(core_dir) if core_dir else None, "git_readable": False}),
                       "expected_sha": args.core_v2_expected_sha, "module_present": core_module,
                       **({"reason": core_reason} if core_reason else {})})
        firebase_module = bool(firebase_dir and (firebase_dir / "scripts/build-firebase-public.mjs").is_file()
                               and all((firebase_dir / name).is_file() for name in [
                                   "scripts/test-build-firebase-public.mjs",
                                   "scripts/test-verify-flutter-firebase.mjs",
                                   "scripts/test-verify-android-api21-firebase.mjs",
                                   "scripts/test-verify-flutter-android-readiness.mjs",
                               ]))
        firebase_has_symlinks = bool(firebase_dir and firebase_dir.is_dir() and find_workspace_symlinks(firebase_dir))
        firebase_ok = candidate_ok(firebase_snapshot, args.firebase_expected_sha, firebase_module) and not firebase_has_symlinks
        firebase_status, firebase_reason = candidate_status(firebase_snapshot, args.firebase_expected_sha, firebase_module)
        if firebase_has_symlinks:
            firebase_status, firebase_reason = "FAIL", "candidate contains symlinks; safe disposable copy is not permitted"
        runner.record({"task": "firebase-source-provenance", "status": firebase_status,
                       **(firebase_snapshot or {"path": str(firebase_dir) if firebase_dir else None, "git_readable": False}),
                       "expected_sha": args.firebase_expected_sha, "required_tests_present": firebase_module,
                       **({"reason": firebase_reason} if firebase_reason else {})})

        core_candidate = None
        if core_ok and core_dir:
            core_candidate = workspace / "_external_candidates" / "core-v2"
            core_candidate.parent.mkdir(parents=True, exist_ok=True)
            try:
                copy_workspace_verified(core_dir, core_candidate)
                core_after_copy = await runner.git_snapshot(core_dir)
                if (not core_after_copy.get("working_tree_clean")
                        or core_after_copy.get("commit_sha") != core_snapshot.get("commit_sha")
                        or core_after_copy.get("commit_sha") != args.core_v2_expected_sha):
                    raise ValueError("CORE V2 candidate Git provenance changed during copy")
                runner.record({"task": "core-v2-copy-integrity", "status": "PASS",
                               "source_commit_sha": core_after_copy["commit_sha"],
                               "manifest_sha256": workspace_manifest_sha256(core_candidate)})
            except (OSError, ValueError) as exc:
                core_candidate = None
                runner.record({"task": "core-v2-copy-integrity", "status": "FAIL", "reason": str(exc)})
            if core_candidate and (core_candidate / "platform/lingo-core-v2/services/api/go.mod").is_file():
                core_candidate = core_candidate / "platform/lingo-core-v2/services/api"
        firebase_candidate = None
        if firebase_ok and firebase_dir:
            firebase_candidate = workspace / "_external_candidates" / "firebase-hosting"
            firebase_candidate.parent.mkdir(parents=True, exist_ok=True)
            try:
                copy_workspace_verified(firebase_dir, firebase_candidate)
                firebase_after_copy = await runner.git_snapshot(firebase_dir)
                if (not firebase_after_copy.get("working_tree_clean")
                        or firebase_after_copy.get("commit_sha") != firebase_snapshot.get("commit_sha")
                        or firebase_after_copy.get("commit_sha") != args.firebase_expected_sha):
                    raise ValueError("Firebase candidate Git provenance changed during copy")
                runner.record({"task": "firebase-copy-integrity", "status": "PASS",
                               "source_commit_sha": firebase_after_copy["commit_sha"],
                               "manifest_sha256": workspace_manifest_sha256(firebase_candidate)})
            except (OSError, ValueError) as exc:
                firebase_candidate = None
                runner.record({"task": "firebase-copy-integrity", "status": "FAIL", "reason": str(exc)})

        # Each wave is a real dependency gate: a non-PASS task blocks every
        # task in later waves. Final evidence packaging still runs regardless.
        waves = [
            ("WAVE 0 — SOURCE AND BASELINE", [
                ("source-integrity", lambda: runner.integrity(source, args.source_expected_sha)),
            ]),
            ("WAVE 1 — REPOSITORY / SECURITY / SERVICE CONTRACTS", [
                ("recovery-unit-tests", lambda: runner.python_recovery(workspace)),
                ("recovery-contracts", lambda: runner.recovery_contracts(workspace)),
                ("repository-static-gates", lambda: runner.static_gates(workspace)),
                ("security-tools", lambda: runner.security_tools(workspace)),
                ("product-regressions", lambda: runner.product_regressions(workspace)),
                ("shell-safety-tests", lambda: runner.shell_safety_tests(workspace)),
                ("studio-contracts", lambda: runner.studio_contracts(workspace)),
                ("crimson-smoke-static", lambda: runner.crimson_smoke_static(workspace)),
                ("cloudflare-dry-run", lambda: runner.cloudflare_dry_run(workspace)),
                ("devops-static", lambda: runner.devops_static(workspace)),
                ("firebase-hosting-candidate", lambda: runner.firebase_candidate(firebase_candidate, firebase_snapshot)),
                ("core-v2-go", lambda: runner.go_project(core_candidate, core_snapshot, args.allow_local_postgres_integration)),
            ]),
            ("WAVE 2 — MOBILE AND WEB BUILDS", [
                ("flutter-root", lambda: runner.flutter_project(workspace, ".", "flutter-root")),
                ("flutter-oasis", lambda: runner.flutter_project(workspace, "studio-sites/games/oasis-platform/flutter", "flutter-oasis")),
                ("flutter-firebase-candidate", lambda: runner.flutter_project(firebase_candidate, ".", "flutter-firebase-candidate", firebase_snapshot)),
                ("flutter-oasis-firebase-candidate", lambda: runner.flutter_project(firebase_candidate, "studio-sites/games/oasis-platform/flutter", "flutter-oasis-firebase-candidate", firebase_snapshot)),
            ]),
            ("WAVE 3 — PUBLIC ROUTE OBSERVATION", [
                ("public-route-probes", lambda: runner.public_probes()),
            ]),
        ]
        upstream_blocker = None
        wave_results = []
        for title, task_factories in waves:
            print(f"\n{title}")
            if upstream_blocker:
                blocked = []
                for task_name, _factory in task_factories:
                    blocked.append(runner.record({"task": task_name, "status": "BLOCKED",
                                                   "reason": f"upstream wave gate not passed: {upstream_blocker}"}))
                wave_results.append({"wave": title, "status": "BLOCKED", "tasks": [x["task"] for x in blocked]})
                for result in blocked:
                    print(f"  [{result['status']}] {result['task']}")
                continue
            results = await asyncio.gather(*(factory() for _name, factory in task_factories))
            all_pass = len(results) == len(task_factories) and all(x["status"] == "PASS" for x in results)
            any_failure = any(x["status"] == "FAIL" for x in results)
            wave_status = "PASS" if all_pass else ("FAIL" if any_failure else "BLOCKED")
            wave_results.append({"wave": title, "status": wave_status,
                                 "tasks": [{"task": x["task"], "status": x["status"]} for x in results]})
            for result in results:
                print(f"  [{result['status']}] {result['task']}")
            if wave_status != "PASS":
                upstream_blocker = title

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
        "parallelism": "concurrent within each dependency-ordered wave; downstream waves require every task in the preceding wave to PASS",
        "wave_results": wave_results,
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
    # Hash the complete evidence bundle (summary plus every task log), excluding
    # the checksum manifest itself to avoid a recursive/self-referential digest.
    checksum_lines = []
    for artifact in sorted(path for path in out.rglob("*") if path.is_file() and path.name != "SHA256SUMS"):
        digest = hashlib.sha256(artifact.read_bytes()).hexdigest()
        checksum_lines.append(f"{digest}  {artifact.relative_to(out).as_posix()}")
    (out / "SHA256SUMS").write_text("\n".join(checksum_lines) + "\n", encoding="utf-8")
    manifest_digest = hashlib.sha256((out / "SHA256SUMS").read_bytes()).hexdigest()
    print("\nFINAL DISPOSITION:", summary["final_disposition"])
    print("Evidence:", report)
    print("SHA256SUMS manifest SHA-256:", manifest_digest)
    print("Production activation: NOT PERFORMED — PROTECTED HOLD")
    return 0 if summary["final_disposition"] == "PASS" else 1


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", default=".", help="Existing local Git checkout (default: current directory)")
    parser.add_argument("--source-expected-sha", required=True,
                        help="Required exact 40-character SHA for the root source checkout")
    parser.add_argument("--output-dir", default="release/evidence/one-time-restoration", help="Evidence output root inside repo")
    parser.add_argument("--timeout", type=int, default=900, help="Per-command timeout in seconds")
    parser.add_argument("--isolated-host-confirmed", action="store_true",
                        help="Attest that execution is inside a disposable unprivileged VM/container with no provider credentials or host mounts and host-enforced deny-by-default egress restrictions")
    parser.add_argument("--network-enabled", action="store_true", help="Run fixed-host public HTTPS GET probes; host egress firewall must deny all other outbound access, including from child processes")
    parser.add_argument("--core-v2-dir", help="Existing clean local PR #596 checkout/worktree (repository root or Go module directory)")
    parser.add_argument("--core-v2-expected-sha", help="Required with --core-v2-dir: exact current PR #596 head SHA")
    parser.add_argument("--allow-local-postgres-integration", action="store_true",
                        help="Explicitly permit CORE V2 integration tests to create/drop isolated schemas in a loopback lingo_test database")
    parser.add_argument("--firebase-candidate-dir", help="Existing clean local checkout/worktree for PR #614 Firebase candidate")
    parser.add_argument("--firebase-expected-sha", help="Required with --firebase-candidate-dir: exact current PR #614 head SHA")
    parser.add_argument("--g02-evidence", help="Externally captured G02 evidence JSON; never fabricated by this script")
    parser.add_argument("--expected-sha", help="Exact full commit SHA for G02 evidence correlation")
    return parser.parse_args()


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(main_async(parse_args())))
    except KeyboardInterrupt:
        print("INTERRUPTED: partial logs remain in the run evidence directory.", file=sys.stderr)
        raise SystemExit(130)
