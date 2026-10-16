#!/usr/bin/env python3
"""Verify a signed LINGO approval envelope against an externally pinned public key.

The public-key path and expected approver must come from protected operator
configuration, never from a pull-request-controlled file or workflow input.
The approval signer keeps the private key offline. This utility verifies a
record; it does not deploy, merge, or mutate infrastructure.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import subprocess
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

REQUIRED_FIELDS = {
    "schema_version", "approval_reference", "approver_identity",
    "approved_sha", "approved_action", "issued_at_utc", "expires_at_utc",
    "nonce", "key_id", "signature_base64",
}


def _utc(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return None
    return parsed.astimezone(timezone.utc)


def verify_approval(
    envelope: dict[str, Any],
    *,
    expected_sha: str,
    expected_action: str,
    trusted_public_key: Path,
    trusted_approver: str,
    trusted_key_id: str,
    nonce_registry: Path,
    now: datetime | None = None,
) -> tuple[bool, str]:
    """Return (verified, reason); unknown or invalid evidence never verifies."""
    if not isinstance(envelope, dict) or set(envelope) != REQUIRED_FIELDS:
        return False, "approval envelope fields are missing or unexpected"
    if envelope.get("schema_version") != "lingo.approval.v1":
        return False, "unsupported approval schema version"
    if envelope.get("approved_sha") != expected_sha:
        return False, "approval SHA does not match expected source SHA"
    if envelope.get("approved_action") != expected_action:
        return False, "approval action does not match requested action"
    if envelope.get("approver_identity") != trusted_approver:
        return False, "approver identity is not on the trusted allowlist"
    if envelope.get("key_id") != trusted_key_id:
        return False, "approval key ID is not the pinned trusted key"
    for field in ("approval_reference", "approver_identity", "nonce", "key_id"):
        if not isinstance(envelope.get(field), str) or not envelope[field].strip():
            return False, f"{field} is required"
    if len(expected_sha) != 40 or any(c not in "0123456789abcdef" for c in expected_sha):
        return False, "expected SHA must be a full lowercase 40-character SHA"
    if not trusted_public_key.is_file():
        return False, "trusted public key is unavailable"

    issued = _utc(envelope.get("issued_at_utc"))
    expires = _utc(envelope.get("expires_at_utc"))
    current = (now or datetime.now(timezone.utc)).astimezone(timezone.utc)
    if issued is None or expires is None:
        return False, "approval timestamps must be timezone-aware ISO-8601 values"
    if issued > current + timedelta(seconds=60):
        return False, "approval issue time is in the future"
    if expires <= current:
        return False, "approval has expired"
    if expires <= issued or expires - issued > timedelta(hours=24):
        return False, "approval lifetime must be positive and no longer than 24 hours"

    try:
        signature = base64.b64decode(envelope["signature_base64"], validate=True)
    except (ValueError, TypeError):
        return False, "approval signature is not valid base64"
    if not signature:
        return False, "approval signature is empty"

    payload = {key: value for key, value in envelope.items() if key != "signature_base64"}
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    try:
        with tempfile.TemporaryDirectory(prefix="lingo-approval-") as directory:
            root = Path(directory)
            payload_path = root / "approval.json"
            signature_path = root / "approval.sig"
            payload_path.write_bytes(canonical)
            signature_path.write_bytes(signature)
            result = subprocess.run(
                ["openssl", "dgst", "-sha256", "-verify", str(trusted_public_key),
                 "-signature", str(signature_path), str(payload_path)],
                capture_output=True, text=True, timeout=10, check=False,
            )
    except (OSError, subprocess.TimeoutExpired):
        return False, "signature verifier could not be executed"
    if result.returncode != 0:
        return False, "approval signature verification failed"

    # Consume the nonce only after signature and policy checks. O_EXCL makes
    # consumption atomic for processes sharing this protected filesystem.
    # The registry directory must be pre-provisioned and protected out of band.
    try:
        if nonce_registry.is_symlink() or not nonce_registry.is_dir():
            return False, "trusted nonce registry must be a pre-existing directory"
        mode = nonce_registry.stat().st_mode
        if mode & 0o022:
            return False, "trusted nonce registry directory must not be group/world writable"
        nonce_key = base64.urlsafe_b64encode(
            hashlib.sha256(
                (trusted_key_id + "\\0" + envelope["nonce"]).encode("utf-8")
            ).digest()
        ).decode("ascii").rstrip("=")
        nonce_path = nonce_registry / (nonce_key + ".consumed")
        flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
        if hasattr(os, "O_NOFOLLOW"):
            flags |= os.O_NOFOLLOW
        fd = os.open(nonce_path, flags, 0o600)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as stream:
                stream.write(json.dumps({
                    "key_id": trusted_key_id,
                    "nonce_sha256": hashlib.sha256(envelope["nonce"].encode("utf-8")).hexdigest(),
                    "approval_reference": envelope["approval_reference"],
                    "approved_sha": expected_sha,
                    "approved_action": expected_action,
                    "consumed_at_utc": current.isoformat(),
                }, sort_keys=True) + "\\n")
                stream.flush()
                os.fsync(stream.fileno())
            dir_fd = os.open(nonce_registry, os.O_RDONLY)
            try:
                os.fsync(dir_fd)
            finally:
                os.close(dir_fd)
        except Exception:
            # Keep the nonce marker if it was created: uncertain durability is
            # fail-closed and must never permit the same approval to be reused.
            raise
    except FileExistsError:
        return False, "approval nonce has already been consumed"
    except (OSError, ValueError):
        return False, "trusted nonce could not be durably consumed"
    return True, "signed approval verified and nonce consumed for exact SHA, action, approver, key, and validity window"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--approval-envelope", required=True, help="Signed approval JSON")
    parser.add_argument("--expected-sha", required=True)
    parser.add_argument("--action", required=True)
    parser.add_argument("--trusted-public-key", required=True, help="Out-of-band pinned public key PEM path")
    parser.add_argument("--trusted-approver", required=True, help="Approver identity from protected allowlist")
    parser.add_argument("--trusted-key-id", required=True, help="Key ID from protected configuration")
    parser.add_argument("--trusted-nonce-registry", required=True, help="Pre-provisioned protected durable nonce registry directory")
    args = parser.parse_args()
    try:
        envelope = json.loads(Path(args.approval_envelope).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(json.dumps({"status": "BLOCKED", "reason": f"approval envelope unavailable: {exc}"}))
        return 2
    if not isinstance(envelope, dict):
        print(json.dumps({"status": "BLOCKED", "reason": "approval envelope must be a JSON object"}))
        return 2
    verified, reason = verify_approval(
        envelope, expected_sha=args.expected_sha, expected_action=args.action,
        trusted_public_key=Path(args.trusted_public_key),
        trusted_approver=args.trusted_approver, trusted_key_id=args.trusted_key_id,
        nonce_registry=Path(args.trusted_nonce_registry),
    )
    print(json.dumps({
        "status": "verified" if verified else "BLOCKED",
        "approval_reference": envelope.get("approval_reference"),
        "approved_sha": envelope.get("approved_sha"),
        "approved_action": envelope.get("approved_action"),
        "approver_identity": envelope.get("approver_identity"),
        "reason": reason,
    }, sort_keys=True))
    return 0 if verified else 1


if __name__ == "__main__":
    raise SystemExit(main())
