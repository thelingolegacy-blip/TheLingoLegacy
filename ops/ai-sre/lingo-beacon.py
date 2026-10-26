#!/usr/bin/env python3
"""Send a sanitized Sentinel heartbeat to an explicitly configured HTTPS endpoint.

A successful HTTP response confirms receipt only. It does not establish host health,
GitHub runner assignment, G02 acceptance, or production authorization.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone


def main() -> int:
    endpoint = os.environ.get("LINGO_BEACON_URL", "").strip()
    if not endpoint:
        print("BLOCKED: set LINGO_BEACON_URL to an approved HTTPS receiver.", file=sys.stderr)
        return 2

    parsed = urllib.parse.urlparse(endpoint)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        print("BLOCKED: beacon endpoint must be an HTTPS URL without embedded credentials.", file=sys.stderr)
        return 2

    raw = sys.stdin.read()
    try:
        report = json.loads(raw)
    except json.JSONDecodeError:
        print("BLOCKED: stdin must contain a valid Sentinel JSON report.", file=sys.stderr)
        return 2

    if report.get("schema") != "lingo.sentinel/v1":
        print("BLOCKED: unsupported or missing Sentinel schema.", file=sys.stderr)
        return 2

    # Allowlist fields; never forward arbitrary host command output or environment data.
    payload = {
        "schema": "lingo.beacon/v1",
        "component": "LINGO Beacon",
        "sentinel_timestamp_utc_epoch": report.get("timestamp_utc_epoch"),
        "sent_at_utc": datetime.now(timezone.utc).isoformat(),
        "host": report.get("host"),
        "runner_listener_process_detected": report.get("runner_listener_process_detected") is True,
        "release_gates": {
            "G02": "BLOCKED",
            "production": "HOLD",
            "fail_closed": "ACTIVE",
            "last_known_good": "PROTECTED",
        },
        "release_authorization": False,
        "meaning": "heartbeat delivery only; not runner execution evidence or release authorization",
    }
    request = urllib.request.Request(
        endpoint,
        data=json.dumps(payload, separators=(",", ":")).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "LINGO-Beacon/1"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            print(json.dumps({
                "delivery": "RECEIVED" if 200 <= response.status < 300 else "FAILED",
                "http_status": response.status,
                "release_authorization": False,
                "gate_state": "G02 BLOCKED; PRODUCTION HOLD",
            }))
            return 0 if 200 <= response.status < 300 else 3
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        # Do not print the endpoint or request body; endpoints can contain sensitive paths.
        print(json.dumps({
            "delivery": "FAILED",
            "error_type": type(exc).__name__,
            "release_authorization": False,
            "gate_state": "G02 BLOCKED; PRODUCTION HOLD",
        }))
        return 3


if __name__ == "__main__":
    sys.exit(main())
