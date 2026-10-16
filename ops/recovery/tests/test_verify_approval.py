import base64
import json
import shutil
import subprocess
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

from verify_approval import verify_approval


@unittest.skipUnless(shutil.which("openssl"), "OpenSSL is required for signature verification tests")
class VerifyApprovalTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="lingo-approval-test-")
        self.root = Path(self.temp.name)
        self.private_key = self.root / "private.pem"
        self.public_key = self.root / "public.pem"
        subprocess.run([
            "openssl", "genpkey", "-algorithm", "RSA",
            "-pkeyopt", "rsa_keygen_bits:2048", "-out", str(self.private_key)
        ], check=True, capture_output=True)
        subprocess.run([
            "openssl", "pkey", "-in", str(self.private_key), "-pubout", "-out", str(self.public_key)
        ], check=True, capture_output=True)
        self.now = datetime.now(timezone.utc).replace(microsecond=0)
        self.envelope = {
            "schema_version": "lingo.approval.v1",
            "approval_reference": "approval:test-1",
            "approver_identity": "release-owner",
            "approved_sha": "a" * 40,
            "approved_action": "release",
            "issued_at_utc": self.now.isoformat().replace("+00:00", "Z"),
            "expires_at_utc": (self.now + timedelta(hours=1)).isoformat().replace("+00:00", "Z"),
            "nonce": "test-nonce-001",
            "key_id": "release-key-test",
        }
        self._sign()

    def tearDown(self):
        self.temp.cleanup()

    def _sign(self):
        payload = json.dumps(self.envelope, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
        payload_path = self.root / "payload.json"
        signature_path = self.root / "signature.bin"
        payload_path.write_bytes(payload)
        subprocess.run([
            "openssl", "dgst", "-sha256", "-sign", str(self.private_key),
            "-out", str(signature_path), str(payload_path)
        ], check=True, capture_output=True)
        self.envelope["signature_base64"] = base64.b64encode(signature_path.read_bytes()).decode("ascii")

    def _verify(self, **overrides):
        args = {
            "expected_sha": "a" * 40,
            "expected_action": "release",
            "trusted_public_key": self.public_key,
            "trusted_approver": "release-owner",
            "trusted_key_id": "release-key-test",
            "now": self.now,
        }
        args.update(overrides)
        return verify_approval(self.envelope, **args)

    def test_valid_signed_approval_verifies(self):
        verified, reason = self._verify()
        self.assertTrue(verified, reason)

    def test_wrong_sha_is_rejected(self):
        verified, _ = self._verify(expected_sha="b" * 40)
        self.assertFalse(verified)

    def test_wrong_action_is_rejected(self):
        verified, _ = self._verify(expected_action="diagnostic-only")
        self.assertFalse(verified)

    def test_untrusted_approver_is_rejected(self):
        verified, _ = self._verify(trusted_approver="another-identity")
        self.assertFalse(verified)

    def test_expired_approval_is_rejected(self):
        self.envelope["expires_at_utc"] = (self.now - timedelta(seconds=1)).isoformat().replace("+00:00", "Z")
        self._sign()
        verified, _ = self._verify()
        self.assertFalse(verified)

    def test_tampered_payload_signature_is_rejected(self):
        self.envelope["approved_action"] = "diagnostic-only"
        verified, _ = self._verify()
        self.assertFalse(verified)

    def test_unpinned_key_id_is_rejected(self):
        verified, _ = self._verify(trusted_key_id="different-key")
        self.assertFalse(verified)


if __name__ == "__main__":
    unittest.main()
