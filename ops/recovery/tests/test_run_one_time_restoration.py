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

    def test_copy_workspace_excludes_common_local_credential_files(self):
        (self.source / ".npmrc").write_text("//registry.example/:_authToken=not-a-real-token\n", encoding="utf-8")
        (self.source / ".netrc").write_text("machine example login user password not-a-real-password\n", encoding="utf-8")
        destination = self.root / "copy"
        MODULE.copy_workspace(self.source, destination)
        self.assertFalse((destination / ".npmrc").exists())
        self.assertFalse((destination / ".netrc").exists())

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

    def test_aggregate_status_requires_every_subtask_to_pass(self):
        self.assertEqual(MODULE.aggregate_status(["PASS", "PASS"]), "PASS")
        self.assertEqual(MODULE.aggregate_status(["PASS", "BLOCKED"]), "BLOCKED")
        self.assertEqual(MODULE.aggregate_status(["PASS", "FAIL"]), "FAIL")
        self.assertEqual(MODULE.aggregate_status([]), "BLOCKED")

    def test_runner_uses_a_private_isolated_home(self):
        output = self.root / "evidence"
        output.mkdir()
        runner = MODULE.Runner(self.source, output, 30, False)
        env = MODULE.safe_env(home_dir=runner.home)
        self.assertEqual(Path(env["HOME"]), runner.home)
        self.assertTrue(runner.home.is_dir())
        if os.name != "nt":
            self.assertEqual(runner.home.stat().st_mode & 0o777, 0o700)

    def test_public_probe_redirects_are_not_followed(self):
        handler = MODULE.NoRedirectHandler()
        self.assertIsNone(handler.redirect_request(None, None, 302, "Found", {}, "https://other.example/"))


    def test_verified_copy_records_matching_manifest(self):
        destination = self.root / "verified-copy"
        digest = MODULE.copy_workspace_verified(self.source, destination)
        self.assertEqual(digest, MODULE.workspace_manifest_sha256(destination))
        self.assertEqual(digest, MODULE.workspace_manifest_sha256(self.source))

    def test_verified_copy_rejects_source_change_during_copy(self):
        destination = self.root / "raced-copy"
        original_copy = MODULE.copy_workspace

        def copy_then_mutate(source, target):
            original_copy(source, target)
            (source / "README.md").write_text("changed during copy\\n", encoding="utf-8")

        with patch.object(MODULE, "copy_workspace", side_effect=copy_then_mutate):
            with self.assertRaisesRegex(ValueError, "changed during copy"):
                MODULE.copy_workspace_verified(self.source, destination)

    def test_firebase_staging_identity_is_only_added_when_explicitly_scoped(self):
        with patch.dict(os.environ, {"LINGO_FIREBASE_STAGING_PROJECT_ID": "staging-project"}, clear=False):
            inherited = MODULE.safe_env()
            scoped = MODULE.safe_env({"LINGO_FIREBASE_STAGING_PROJECT_ID": "staging-project"})
        self.assertNotIn("LINGO_FIREBASE_STAGING_PROJECT_ID", inherited)
        self.assertEqual(scoped["LINGO_FIREBASE_STAGING_PROJECT_ID"], "staging-project")

    def test_redirect_policy_accepts_same_host_https_only(self):
        self.assertTrue(MODULE.valid_redirect_target("https://www.thelingolegacy.com/", "/home"))
        self.assertTrue(MODULE.valid_redirect_target("https://app.thelingolegacy.com/", "https://app.thelingolegacy.com/login"))
        self.assertFalse(MODULE.valid_redirect_target("https://www.thelingolegacy.com/", "https://evil.example/"))
        self.assertFalse(MODULE.valid_redirect_target("https://www.thelingolegacy.com/", "http://www.thelingolegacy.com/"))
        self.assertFalse(MODULE.valid_redirect_target("https://www.thelingolegacy.com/", "https://user@www.thelingolegacy.com/"))

    def test_root_source_expected_sha_is_required_by_cli(self):
        with patch("sys.argv", ["runner"]):
            with self.assertRaises(SystemExit):
                MODULE.parse_args()
        with patch("sys.argv", ["runner", "--source-expected-sha", "a" * 40]):
            args = MODULE.parse_args()
        self.assertEqual(args.source_expected_sha, "a" * 40)


if __name__ == "__main__":
    unittest.main()
