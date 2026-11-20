import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / "run_one_time_restoration.py"
SPEC = importlib.util.spec_from_file_location("run_one_time_restoration", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


class RestorationOrchestratorSafetyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="lingo-orchestrator-test-")
        self.root = Path(self.temp.name)
        self.source = self.root / "source"
        self.source.mkdir()
        (self.source / "README.md").write_text("safe source\n", encoding="utf-8")

    def tearDown(self):
        self.temp.cleanup()

    def test_copy_workspace_copies_regular_files(self):
        destination = self.root / "copy"
        MODULE.copy_workspace(self.source, destination)
        self.assertEqual((destination / "README.md").read_text(encoding="utf-8"), "safe source\n")

    def test_copy_workspace_rejects_file_symlinks(self):
        target = self.root / "outside-secret.txt"
        target.write_text("not for the disposable workspace", encoding="utf-8")
        link = self.source / "linked-secret.txt"
        try:
            link.symlink_to(target)
        except (OSError, NotImplementedError):
            self.skipTest("symlinks are unavailable on this platform")
        with self.assertRaisesRegex(ValueError, "contains symlinks"):
            MODULE.copy_workspace(self.source, self.root / "copy")

    def test_copy_workspace_rejects_directory_symlinks(self):
        target = self.root / "outside-dir"
        target.mkdir()
        (target / "payload.txt").write_text("outside", encoding="utf-8")
        link = self.source / "linked-dir"
        try:
            link.symlink_to(target, target_is_directory=True)
        except (OSError, NotImplementedError):
            self.skipTest("symlinks are unavailable on this platform")
        with self.assertRaisesRegex(ValueError, "contains symlinks"):
            MODULE.copy_workspace(self.source, self.root / "copy")

    def test_output_path_must_stay_inside_repository(self):
        with self.assertRaisesRegex(ValueError, "child of the source repository"):
            MODULE.resolve_output_root(self.source.resolve(), "../outside")

    def test_output_path_rejects_symlinked_parent(self):
        destination = self.root / "outside-output"
        destination.mkdir()
        link = self.source / "release"
        try:
            link.symlink_to(destination, target_is_directory=True)
        except (OSError, NotImplementedError):
            self.skipTest("symlinks are unavailable on this platform")
        with self.assertRaisesRegex(ValueError, "symlink components"):
            MODULE.resolve_output_root(self.source.resolve(), "release/evidence")

    def test_child_environment_drops_provider_and_home_credentials(self):
        with patch.dict(os.environ, {
            "AWS_ACCESS_KEY_ID": "must-not-inherit",
            "CLOUDFLARE_API_TOKEN": "must-not-inherit",
            "SSH_AUTH_SOCK": "/tmp/agent.sock",
            "HOME": "/home/operator",
            "PATH": os.environ.get("PATH", os.defpath),
        }, clear=False):
            env = MODULE.safe_env()
        self.assertNotIn("AWS_ACCESS_KEY_ID", env)
        self.assertNotIn("CLOUDFLARE_API_TOKEN", env)
        self.assertNotIn("SSH_AUTH_SOCK", env)
        self.assertNotEqual(env["HOME"], "/home/operator")

    def test_child_environment_rejects_unapproved_extra_keys(self):
        with self.assertRaisesRegex(ValueError, "unsupported child environment keys"):
            MODULE.safe_env({"AWS_ACCESS_KEY_ID": "must-not-pass"})

    def test_public_probe_redirects_are_not_followed(self):
        handler = MODULE.NoRedirectHandler()
        self.assertIsNone(handler.redirect_request(None, None, 302, "Found", {}, "https://other.example/"))


if __name__ == "__main__":
    unittest.main()
