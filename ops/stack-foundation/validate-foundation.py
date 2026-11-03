#!/usr/bin/env python3
"""Validate the isolated LINGO stack foundation contract without network access."""
from __future__ import annotations
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
REGISTRY = ROOT / "config/stack-foundation/stack-registry.json"
DOC = ROOT / "docs/architecture/LINGO-FULL-STACK-EXECUTION-MATRIX-2026-11-03.md"
REQUIRED_LANES = {
    "governance", "source-control", "web", "mobile", "identity-data",
    "game-runtime", "media", "edge-api", "storage", "observability",
    "recovery", "ci", "g02",
}
SECRET_PATTERNS = [
    re.compile(r"(?i)-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    re.compile(r"(?i)\b(?:sk_live|rk_live)_[A-Za-z0-9]{12,}\b"),
    re.compile(r"(?i)\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b"),
]

def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)

if not REGISTRY.is_file() or not DOC.is_file():
    fail("required foundation source files are missing")

try:
    data = json.loads(REGISTRY.read_text(encoding="utf-8"))
except Exception as exc:
    fail(f"registry JSON is invalid: {exc}")

if data.get("schemaVersion") != "1.0.0":
    fail("unexpected registry schemaVersion")
if data.get("policy", {}).get("billing") != "NO_BILLING":
    fail("no-billing policy must remain explicit")
if data.get("policy", {}).get("failClosed") is not True:
    fail("fail-closed policy must remain enabled")
if data.get("policy", {}).get("productionPromotion") != "EXPLICIT_SEPARATE_AUTHORIZATION_REQUIRED":
    fail("production promotion must remain separately authorized")
if data.get("policy", {}).get("payments") is not False or data.get("policy", {}).get("realMoneyWagering") is not False:
    fail("payments and real-money wagering must remain disabled")
lanes = {item.get("id") for item in data.get("lanes", [])}
missing = REQUIRED_LANES - lanes
if missing:
    fail(f"required lanes missing: {sorted(missing)}")
if data.get("providers", {}).get("cloudflare", {}).get("r2", {}).get("enabled") is not False:
    fail("R2 must remain disabled until separately reviewed")
if data.get("canonicalIntegrationVehicle", {}).get("pullRequest") != 445:
    fail("canonical Control Center integration vehicle must remain PR #445")
if data.get("games", {}).get("lingoEruptions", {}).get("releaseStatus") != "not-certified":
    fail("game release status must not be promoted by a contract check")

for path in (REGISTRY, DOC):
    content = path.read_text(encoding="utf-8")
    for pattern in SECRET_PATTERNS:
        if pattern.search(content):
            fail(f"possible credential material detected in {path.relative_to(ROOT)}")

print("PASS: foundation registry parses")
print("PASS: no-billing and fail-closed policies remain enabled")
print("PASS: production promotion remains separately authorized")
print("PASS: payments and real-money wagering remain disabled")
print("PASS: all required platform lanes are present")
print("PASS: R2 remains disabled pending review")
print("PASS: PR #445 remains the canonical Control Center integration vehicle")
print("PASS: LINGO Eruptions is not mislabeled production-certified")
print("PASS: no recognized live-secret patterns found in foundation source")
