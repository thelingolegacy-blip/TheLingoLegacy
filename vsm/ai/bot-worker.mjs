import fs from "node:fs/promises";
import path from "node:path";
import { validateProbabilityVector, evaluateVirtualDistribution } from "../math/engine.mjs";

const REGISTRY = path.join(process.cwd(), "ai", "bots.json");
const ALLOWED_TASKS = {
  "lingo://id/bot-release": ["prepare_release_draft", "review_release"],
  "lingo://id/bot-probe": ["system_snapshot"],
  "lingo://id/bot-studio": ["asset_intake_proposal"],
  "lingo://id/bot-math": ["validate_probability_input", "validate_probability_vector", "evaluate_virtual_distribution"]
};

export async function executeBot({ botId, task, input = {}, context = {} }) {
  const registry = JSON.parse(await fs.readFile(REGISTRY, "utf8"));
  const bot = registry.bots.find(item => item.id === botId);
  if (!bot) throw new Error("Unknown bot identity.");
  if (!(ALLOWED_TASKS[botId] || []).includes(task)) throw new Error("Task is not allowlisted for this bot.");
  if (task === "prepare_release_draft") {
    if (typeof input.title !== "string" || input.title.trim().length < 3 || input.title.length > 160) throw new Error("A release title of 3–160 characters is required.");
    if (!/^[a-f0-9]{7,64}$/i.test(input.commit || "") || typeof input.branch !== "string" || !input.branch.trim()) throw new Error("A valid commit SHA and branch are required.");
    return { type: "release_draft_proposal", proposal: { title: input.title.trim(), source: { commit: input.commit.toLowerCase(), branch: input.branch.trim() }, target: ["local-preview", "staging"].includes(input.target) ? input.target : "local-preview" }, mutation_performed: false };
  }
  if (task === "review_release") {
    const release = await context.getRelease?.(input.release_id);
    if (!release) throw new Error("Release package not found.");
    const required = ["g02", "security", "static", "runtime"];
    const blocked = required.filter(gate => release.gates?.[gate] !== "PASS");
    return { type: "release_review", release_id: release.id, status: release.status, blocked_gates: blocked, ready_for_local_acceptance: blocked.length === 0 && release.target !== "production-candidate", mutation_performed: false };
  }
  if (task === "system_snapshot") {
    const snapshot = await context.getStatus?.();
    return { type: "system_snapshot", snapshot: snapshot || { status: "unavailable" }, mutation_performed: false };
  }
  if (task === "asset_intake_proposal") {
    if (typeof input.asset_name !== "string" || !input.asset_name.trim()) throw new Error("asset_name is required.");
    return { type: "asset_intake_proposal", asset_name: input.asset_name.trim(), proposed_status: "needs_owner_review", mutation_performed: false };
  }
  if (task === "validate_probability_vector") {\n    return { type: "probability_vector_validation", ...validateProbabilityVector(input.probabilities) };\n  }\n  if (task === "evaluate_virtual_distribution") {\n    return { type: "virtual_distribution_analysis", ...evaluateVirtualDistribution(input.outcomes) };\n  }\n  if (task === "validate_probability_input") {
    const probability = Number(input.probability);
    if (!Number.isFinite(probability) || probability < 0 || probability > 1) throw new Error("probability must be between 0 and 1 inclusive.");
    return { type: "probability_validation", probability, percent: probability * 100, valid: true, mutation_performed: false };
  }
  throw new Error("No worker implementation exists for this task.");
}
