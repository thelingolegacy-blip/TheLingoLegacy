#!/usr/bin/env python3
"""Read-only host checks plus a staging-only Firestore connectivity test.

This script refuses the production project. It uses Application Default
Credentials (prefer workload identity) and creates a unique staging record.
It does not inspect, print, or upload credential material.
"""
from __future__ import annotations
import os
import platform
import subprocess
import sys
import uuid
from datetime import datetime, timezone

PRODUCTION_PROJECT = "lingo-legacy-production"

def run(argv):
    try:
        p = subprocess.run(argv, capture_output=True, text=True, timeout=10, check=True)
        return p.stdout.strip()
    except Exception as exc:
        raise RuntimeError(f"{argv[0]} check failed: {type(exc).__name__}") from None

def gate1():
    print("[TEST] Gate 1: staging Firebase identity and Firestore")
    if os.getenv("FIREBASE_ENV") != "staging":
        raise RuntimeError("FIREBASE_ENV must equal staging")
    project = os.getenv("FIREBASE_PROJECT_ID", "").strip()
    if not project or project == PRODUCTION_PROJECT:
        raise RuntimeError("Set FIREBASE_PROJECT_ID to a dedicated non-production project")
    if platform.system() != "Linux":
        raise RuntimeError("Expected Linux staging host")
    import firebase_admin
    from firebase_admin import firestore
    if not firebase_admin._apps:
        firebase_admin.initialize_app(options={"projectId": project})
    db = firestore.client()
    run_id = os.getenv("GITHUB_RUN_ID") or f"manual-{uuid.uuid4()}"
    attempt = os.getenv("GITHUB_RUN_ATTEMPT", "1")
    doc_id = f"gate-check-{run_id}-{attempt}"
    payload = {
        "schema": "lingo-g02-gate-check-v1",
        "environment": "staging",
        "project_id": project,
        "run_id": run_id,
        "run_attempt": attempt,
        "captured_utc": datetime.now(timezone.utc).isoformat(),
        "test": "gate1-firestore-connectivity",
    }
    db.collection("g02_staging_validation").document(doc_id).create(payload)
    print(f"[PASS] Firestore staging write verified; document_id={doc_id}; project_id={project}")
    return True

def gate2():
    print("[TEST] Gate 2: local host metrics")
    if platform.system() != "Linux":
        raise RuntimeError("Expected Linux staging host")
    uptime = run(["uptime"])
    disk = run(["df", "-h", "/"])
    print(f"[INFO] uptime: {uptime}")
    print(f"[INFO] root disk:\n{disk}")
    print("[PASS] Local host metrics gathered")
    return True

if __name__ == "__main__":
    print("=== LINGO G02 STAGING GATE 1/2 VALIDATION ===")
    try:
        gate1()
        gate2()
    except Exception as exc:
        print(f"[FAIL] {type(exc).__name__}: {exc}", file=sys.stderr)
        sys.exit(1)
    print("[SUCCESS] Gates 1 and 2 local checks completed. Independent evidence review is still required.")
