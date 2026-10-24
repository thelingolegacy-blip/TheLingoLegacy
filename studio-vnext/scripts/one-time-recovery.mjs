#!/usr/bin/env node
/**
 * One-time, fail-closed recovery orchestrator for LINGO Legacy Studio VNext.
 * Safe by design: local verification and read-only remote checks only.
 * Never dispatches/retries workflows, changes DNS, deploys, merges, changes
 * secrets, or promotes a release gate. Admin-only blockers are reported.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const REPO = process.env.GITHUB_REPOSITORY || "thelingolegacy-blip/TheLingoLegacy";
const BRANCH = process.env.RECOVERY_BRANCH || "studio/enterprise-environment-vnext-2026-10-24";
const PREVIEW = (process.env.STUDIO_PREVIEW_URL || "https://studio-preview.thelingolegacy.com").replace(/\/+$/, "");
const OUT = resolve(process.env.RECOVERY_REPORT_PATH || resolve(ROOT, ".recovery-evidence/one-time-recovery-report.json"));
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";
const checks = [];
const evidence = { startedAt: new Date().toISOString(), repository: REPO, branch: BRANCH, previewBase: PREVIEW, actions: [], checks };
let blockers = 0;

function record(name, status, detail = "", extra = {}) {
  checks.push({ name, status, detail, ...extra });
  console.log("[" + status + "] " + name + (detail ? " — " + detail : ""));
  if (status === "FAIL" || status === "BLOCKED") blockers += 1;
}
function run(name, command, args, cwd) {
  console.log("\n$ " + command + " " + args.join(" "));
  const result = spawnSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 180000 });
  const output = ((result.stdout || "") + (result.stderr || "")).trim();
  if (output) console.log(output.slice(-12000));
  const ok = result.status === 0;
  record(name, ok ? "PASS" : "FAIL", ok ? "exit=" + result.status : "exit=" + (result.status ?? "null") + "; " + (result.error?.message || "command failed"));
  return { ok, status: result.status, output };
}
async function request(url, headers = {}, redirect = "follow") {
  const response = await fetch(url, { headers: { "user-agent": "LINGO-Legacy-One-Time-Recovery/1.0", accept: "application/vnd.github+json", ...headers }, signal: AbortSignal.timeout(15000), redirect });
  const body = await response.text();
  return { status: response.status, ok: response.ok, headers: Object.fromEntries(response.headers.entries()), body };
}
function meta(html, name) {
  const re = new RegExp(`<meta\\s+[^>]*(?:name|http-equiv)=["']${name}["'][^>]*>`, "i");
  return html.match(re)?.[0] || "";
}
async function checkPreviewRoute(path) {
  const url = PREVIEW + path;
  try {
    const r = await request(url, {}, "manual");
    if (r.status >= 300 && r.status < 400) {
      const location = r.headers.location || "";
      let redirectHost = "";
      try { redirectHost = location ? new URL(location, url).host : ""; } catch {}
      record("Preview " + path, "BLOCKED", "HTTP " + r.status + "; redirect prevents unauthenticated content validation", { url, httpStatus: r.status, redirectHost, authenticationRequired: /vercel\\.com\\/sso-api/i.test(location) });
      return;
    }
    const html = r.body;
    const csp = meta(html, "Content-Security-Policy");
    const robots = meta(html, "robots");
    const ok = r.status === 200 &&
      /text\/html/i.test(r.headers["content-type"] || "") &&
      /default-src\s+['"]?self['"]?/i.test(csp) &&
      /noindex/i.test(robots);
    record("Preview " + path, ok ? "PASS" : "FAIL", "HTTP " + r.status + "; CSP-meta=" + Boolean(csp) + "; noindex=" + /noindex/i.test(robots), { url, httpStatus: r.status, cspMetaPresent: Boolean(csp), noindex: /noindex/i.test(robots) });
  } catch (error) {
    record("Preview " + path, "FAIL", error?.message || String(error), { url });
  }
}
async function checkGitHubActions() {
  const url = "https://api.github.com/repos/" + REPO + "/actions/runs?branch=" + encodeURIComponent(BRANCH) + "&per_page=20";
  const headers = TOKEN ? { authorization: "Bearer " + TOKEN } : {};
  try {
    const r = await request(url, headers);
    if (!r.ok) {
      record("GitHub Actions inventory", "BLOCKED", "API HTTP " + r.status + "; configure GH_TOKEN with read-only Actions access or inspect as repository administrator");
      evidence.actionsInventory = { status: r.status, url };
      return;
    }
    const data = JSON.parse(r.body);
    const runs = (data.workflow_runs || []).map(x => ({
      id: x.id, name: x.name, event: x.event, status: x.status, conclusion: x.conclusion,
      head_sha: x.head_sha, created_at: x.created_at, html_url: x.html_url
    }));
    evidence.actions = runs;
    const startup = runs.filter(x => x.conclusion === "startup_failure");
    const sampled = [];
    for (const item of startup.slice(0, 5)) {
      try {
        const results = await Promise.all([
          request("https://api.github.com/repos/" + REPO + "/actions/runs/" + item.id + "/jobs?per_page=100", headers),
          request("https://api.github.com/repos/" + REPO + "/actions/runs/" + item.id + "/artifacts?per_page=100", headers)
        ]);
        const jobsBody = results[0].ok ? JSON.parse(results[0].body) : {};
        const artifactsBody = results[1].ok ? JSON.parse(results[1].body) : {};
        sampled.push({ id: item.id, name: item.name, jobCount: jobsBody.total_count ?? jobsBody.jobs?.length ?? null, artifactCount: artifactsBody.total_count ?? artifactsBody.artifacts?.length ?? null, jobsHttp: results[0].status, artifactsHttp: results[1].status, url: item.html_url });
      } catch (error) {
        sampled.push({ id: item.id, name: item.name, error: error?.message || String(error) });
      }
    }
    evidence.startupFailureDetails = sampled;
    if (startup.length) {
      record("GitHub Actions startup state", "BLOCKED", startup.length + " startup_failure run(s) in latest " + runs.length + " branch runs; no workflow retries attempted", { startupFailures: startup.length, sampledRuns: sampled });
    } else if (runs.length === 0) {
      record("GitHub Actions startup state", "BLOCKED", "No runs returned for this branch; this is not proof that Actions is healthy");
    } else {
      record("GitHub Actions startup state", "PASS", "No startup_failure found in latest " + runs.length + " branch runs; this alone does not prove G02 acceptance");
    }
  } catch (error) {
    record("GitHub Actions inventory", "BLOCKED", error?.message || String(error));
  }
}
async function main() {
  console.log("LINGO LEGACY — ONE-TIME RECOVERY");
  console.log("Safety mode: local tests + read-only remote checks; production mutations disabled.");
  console.log("Repository: " + REPO + "\nBranch: " + BRANCH + "\nPreview: " + PREVIEW + "\n");

  run("Static development verification", "npm", ["run", "dev:verify"], ROOT);
  run("Studio contract and unit tests", "npm", ["test"], ROOT);

  await Promise.all([
    checkPreviewRoute("/studio-vnext/"),
    checkPreviewRoute("/diagnostics/g02/"),
    checkPreviewRoute("/vercel-hard-lock/")
  ]);
  await checkGitHubActions();

  // Static tests and HTTP responses cannot certify these acceptance gates.
  record("G02 real runner assignment + sentinel", "BLOCKED", "Requires administrator-authorized controlled run with numeric runner/job IDs, executed sentinel, logs, artifact, and verified SHA-256");
  record("Browser/accessibility acceptance", "BLOCKED", "Static checks do not replace real-browser keyboard, forced-colors, reduced-motion, contrast, and target-device verification");
  record("Production authorization", "BLOCKED", "No merge/deploy/DNS/secrets/gate promotion performed; separate evidence review and authorization required");

  evidence.finishedAt = new Date().toISOString();
  evidence.summary = { totalChecks: checks.length, passed: checks.filter(x => x.status === "PASS").length, failed: checks.filter(x => x.status === "FAIL").length, blocked: checks.filter(x => x.status === "BLOCKED").length, production: "PROTECTED_HOLD", g02: "BLOCKED" };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(evidence, null, 2) + "\n", { mode: 0o600 });
  console.log("\nReport written: " + OUT);
  console.log(JSON.stringify(evidence.summary, null, 2));
  console.log("\nThis script cannot change organization policy or repair a runner host without administrator access. It reports those gates and never bypasses them.");
  process.exitCode = evidence.summary.failed > 0 || evidence.summary.blocked > 0 ? 1 : 0;
}
main().catch(error => {
  console.error("FATAL: " + (error?.stack || error));
  process.exitCode = 2;
});
