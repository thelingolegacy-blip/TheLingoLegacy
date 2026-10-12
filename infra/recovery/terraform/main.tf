# LINGO Legacy Recovery Framework — Safe Mode

resource "terraform_data" "recovery_framework" {
  input = {
    framework         = "lingo-legacy-recovery"
    mode              = "design-only"
    branch            = "dev/isolated-workspace-2026-10-10"
    production_changes = false
    auto_merge         = false
    auto_deploy        = false
    dns_mutation       = false
    hidden_backdoor    = false
    gated_break_glass = true
    host_provisioned   = false
    runner_verified    = false
  }

  lifecycle {
    # This object documents desired policy only. It does not provision cloud compute.
    prevent_destroy = true
  }
}
