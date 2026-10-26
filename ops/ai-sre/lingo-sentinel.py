#!/usr/bin/env python3
"""Read-only LINGO Sentinel for host diagnostics; never authorizes a release."""
from __future__ import annotations

import json
import os
import shutil
import socket
import subprocess
import sys
import time
from pathlib import Path


def command(args: list[str], timeout: float = 2.0) -> dict:
    try:
        result = subprocess.run(args, capture_output=True, text=True, timeout=timeout, check=False)
        return {"returncode": result.returncode, "stdout": result.stdout.strip()[:2000]}
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"error": type(exc).__name__}


def main() -> int:
    runner_root = Path(os.environ.get("RUNNER_ROOT", "/opt/actions-runner"))
    runner_listener = command(["pgrep", "-af", "Runner.Listener"])
    runner_process_detected = runner_listener.get("returncode") == 0 and bool(runner_listener.get("stdout"))
    disk = shutil.disk_usage(runner_root if runner_root.exists() else Path("/"))
    hostname = socket.gethostname()

    report = {
        "schema": "lingo.sentinel/v1",
        "component": "LINGO Sentinel",
        "timestamp_utc_epoch": int(time.time()),
        "host": hostname,
        "runner_root_exists": runner_root.exists(),
        "runner_listener_process_detected": runner_process_detected,
        "runner_process_probe": runner_listener,
        "disk": {
            "path": str(runner_root if runner_root.exists() else Path("/")),
            "total_bytes": disk.total,
            "used_bytes": disk.used,
            "free_bytes": disk.free,
            "used_percent": round((disk.used / disk.total) * 100, 2) if disk.total else None,
        },
        "release_gates": {
            "G02": "BLOCKED",
            "production": "HOLD",
            "fail_closed": "ACTIVE",
            "last_known_good": "PROTECTED",
        },
        "release_authorization": False,
        "notes": [
            "Read-only host snapshot; not proof of GitHub job assignment or workflow execution.",
            "A running listener process alone does not satisfy G02 acceptance.",
            "Gate values are deliberately fail-closed and cannot be changed by this tool.",
        ],
    }
    print(json.dumps(report, sort_keys=True, indent=2))
    return 0 if runner_process_detected else 2


if __name__ == "__main__":
    sys.exit(main())
