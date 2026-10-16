import base64
import json
import shutil
import subprocess
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from verify_approval import verify_approval


@unittest.skipUnless(shutil.which("openssl"), "OpenSSL is required for signature verification tests")
class VerifyApprovalTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="lingo-approval-test-")
        self.root = Path(self.temp.name)
        self.private_key = self.root / "private.pem"
        self.public_key = self.root / "public.pem"
        self.nonce_registry = self.root / "consumed-nonces"
        self.nonce_registry.mkdir(mode=0o700)
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
        self.envelope.pop("signature_base64", None)
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
            "nonce_registry": self.nonce_registry,
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

    def test_tampered_signed_payload_is_rejected_by_signature(self):
        # Keep the policy-checked SHA/action/approver/key fields unchanged so
        # rejection must come from cryptographic signature verification.
        self.envelope["approval_reference"] = "approval:tampered-reference"
        verified, reason = self._verify()
        self.assertFalse(verified)
        self.assertEqual(reason, "approval signature verification failed")

    def test_tampered_signature_bytes_are_rejected(self):
        raw = bytearray(base64.b64decode(self.envelope["signature_base64"]))
        raw[0] ^= 0x01
        self.envelope["signature_base64"] = base64.b64encode(raw).decode("ascii")
        verified, reason = self._verify()
        self.assertFalse(verified)
        self.assertEqual(reason, "approval signature verification failed")

    def test_unpinned_key_id_is_rejected(self):
        verified, _ = self._verify(trusted_key_id="different-key")
        self.assertFalse(verified)

    def test_replayed_nonce_is_rejected(self):
        verified, reason = self._verify()
        self.assertTrue(verified, reason)
        verified_again, reason_again = self._verify()
        self.assertFalse(verified_again)
        self.assertEqual(reason_again, "approval nonce has already been consumed")

    def test_missing_nonce_registry_is_rejected(self):
        verified, reason = self._verify(nonce_registry=self.root / "missing-registry")
        self.assertFalse(verified)
        self.assertEqual(reason, "trusted nonce registry must be a pre-existing directory")

    def test_group_writable_nonce_registry_is_rejected(self):
        unsafe_registry = self.root / "unsafe-nonces"
        unsafe_registry.mkdir(mode=0o700)
        unsafe_registry.chmod(0o770)
        try:
            verified, reason = self._verify(nonce_registry=unsafe_registry)
            self.assertFalse(verified)
            self.assertEqual(reason, "trusted nonce registry directory must not be group/world writable")
        finally:
            unsafe_registry.chmod(0o700)


if __name__ == "__main__":
    unittest.main()
