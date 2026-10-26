#!/usr/bin/env ruby
# Read-only policy validator for the proposed LINGO agent charter.
# Uses Ruby's standard-library YAML parser; it does not contact services or mutate infrastructure.
require "yaml"

ROOT = File.expand_path("../..", __dir__)
FILES = {
  team: File.join(ROOT, "ops/ai-sre/agent-team.yaml"),
  auth: File.join(ROOT, "ops/ai-sre/authorization-matrix.yaml"),
  catalog: File.join(ROOT, "ops/ai-sre/operations-catalog.yaml")
}
def fail!(message)
  warn "FAIL: #{message}"
  exit 1
end
def require_true(value, message)
  fail!(message) unless value == true
end
def require_value(value, expected, message)
  fail!("#{message} (expected #{expected.inspect}, got #{value.inspect})") unless value == expected
end

documents = {}
FILES.each do |name, path|
  fail!("missing required file: #{path}") unless File.file?(path)
  begin
    documents[name] = YAML.safe_load_file(path, permitted_classes: [], aliases: false)
  rescue StandardError => e
    fail!("YAML parse failed for #{path}: #{e.class}: #{e.message}")
  end
  fail!("YAML root must be a mapping: #{path}") unless documents[name].is_a?(Hash)
end

team = documents.fetch(:team)
auth = documents.fetch(:auth)
catalog = documents.fetch(:catalog)

require_value(team.dig("kind"), "AgentTeam", "agent-team kind")
require_value(auth.dig("kind"), "AuthorizationMatrix", "authorization-matrix kind")
require_value(catalog.dig("kind"), "OperationsCatalog", "operations-catalog kind")

[team, auth, catalog].each do |doc|
  require_value(doc.dig("metadata", "status"), "proposed", "every manifest must remain proposed")
  require_value(doc.dig("metadata", "deployed"), false, "no manifest may claim deployed=true")
end

gov = team.fetch("governance")
require_value(gov.fetch("default_access"), "read_only", "default access must be read-only")
require_true(gov.fetch("least_privilege"), "least privilege must be enabled")
require_true(gov.fetch("fail_closed"), "fail-closed policy must be enabled")
require_true(gov.fetch("mutation_requires_explicit_approval"), "mutations must require explicit approval")
require_true(gov.fetch("independent_post_change_validation"), "independent post-change validation must be required")
require_value(gov.fetch("max_direct_reports_per_agent"), 5, "direct helper cap must be five")
require_value(gov.fetch("max_delegation_depth_without_owner_approval"), 1, "delegation depth without owner approval must be one")
require_value(gov.fetch("recursive_spawning"), "prohibited", "recursive spawning must be prohibited")
require_value(gov.fetch("external_communications_by_default"), "draft_only", "external communications must default to drafts")
require_value(gov.fetch("purchases_payments_and_billing_changes"), "approval_required", "spending must require approval")
require_value(gov.fetch("production_changes"), "separate_release_authorization_required", "production changes must require separate release authorization")
require_value(gov.fetch("secrets_in_prompts_logs_or_commits"), "prohibited", "secrets in prompts/logs/commits must be prohibited")

agents = team.fetch("agents")
expected_agents = %w[sippyLINGO earlLINGO osbswaldLINGO michelleLINGO bryantLINGO hopeLINGO].sort
actual_agents = agents.map { |agent| agent.fetch("name") }.sort
require_value(actual_agents, expected_agents, "agent roster must contain exactly the six approved identities")
agents.each do |agent|
  fail!("agent #{agent["name"]} must have an approval_required list") unless agent["approval_required"].is_a?(Array) && !agent["approval_required"].empty?
end
require_value(team.dig("delegation", "direct_team_limit"), 5, "delegation direct team limit must be five")
require_value(team.dig("delegation", "new_agent_registration_requires"), "owner_approval", "new identities must require owner approval")
require_value(team.dig("delegation", "team_membership_changes_require"), "owner_approval", "team membership changes must require owner approval")

rules = auth.fetch("approval_rules")
required_actions = %w[
  production_deploy_dns_or_release_promotion
  purchase_subscription_pay_invoice_or_raise_spend_limit
  send_email_or_external_notice
  change_identity_permissions_or_secrets
  restart_service_or_restore_data
]
actual_actions = rules.map { |rule| rule.fetch("action") }
required_actions.each do |action|
  fail!("missing approval rule for #{action}") unless actual_actions.include?(action)
end
require_true(auth.dig("evidence", "stale_or_missing_evidence") == "fail_closed", "stale/missing evidence must fail closed")
require_true(auth.dig("billing", "no_paid_resource_creation_without_approval"), "paid resource creation must require approval")
require_true(auth.dig("billing", "never_invent_prices_or_assume_plan_limits"), "cost data must not be invented")

require_value(catalog.dig("current_known_gates", "G02"), "BLOCKED", "G02 must remain blocked")
require_value(catalog.dig("current_known_gates", "production"), "HOLD", "production must remain on hold")
require_value(catalog.dig("current_known_gates", "fail_closed"), "ACTIVE", "fail-closed must remain active")
require_value(catalog.dig("current_known_gates", "last_known_good"), "PROTECTED", "last-known-good must remain protected")
require_true(catalog.dig("inventory_policy", "costs", "must_label_cost_type"), "cost type must be labeled")
require_true(catalog.dig("inventory_policy", "costs", "must_include_currency_and_period"), "cost currency and period must be recorded")

puts "PASS: all three YAML manifests parse and required LINGO agent safety invariants hold."
puts "NOTE: this validates configuration structure only; it does not provision agents, prove runtime controls, or pass G02."
