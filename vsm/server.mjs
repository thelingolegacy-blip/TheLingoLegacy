import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ensureOwnerIdentity, getOwnerPrincipal, signOwnerPayload } from "./identity/identity.mjs";
import { loadLane, configureLane, snapshot as sonicBoomSnapshot, submitLaneJob } from "./sonic-boom/lane.mjs";
import { executeBot } from "./ai/bot-worker.mjs";
import { writeEvidence, readEvidence } from "./evidence/store.mjs";
import { authorize, policySnapshot } from "./security/policy.mjs";
import { listStudioAssets, createStudioAsset } from "./studio/asset-registry.mjs";
import { createRunController } from "./orchestration/runner.mjs";
import { createRunConfig } from "./orchestration/run-contract.mjs";

const PORT = Number(process.env.PORT || 8787);
const PREVIEW_PORT = Number(process.env.PREVIEW_PORT || 8788);
const HOST = process.env.HOST || "127.0.0.1";
const DATA_DIR = process.env.VSM_DATA_DIR || path.join(process.cwd(), "data");
const WORKSPACE = process.env.VSM_WORKSPACE || path.resolve(process.cwd(), "..");
const OWNER_TOKEN = process.env.VSM_OWNER_TOKEN || "";
const OWNER_NAME = process.env.VSM_OWNER_NAME || "Owner";
const PROBE_BASE_URL = (process.env.VSM_PROBE_BASE_URL || "https://thelingolegacy.com").replace(/\/$/, "");
const REQUIRED_GATES = ["g02", "security", "static", "runtime"];
const CENTERS = [
  ["release-dispatch", "Release Dispatch Center", "Release packages, evidence, acceptance and promotion records."],
  ["execution", "Execution & Orchestration Center", "Local jobs, build orchestration and preview dispatch."],
  ["g02-authority", "G02 Gate & Authority Center", "Fail-closed release authority and Last Known Good protection."],
  ["troubleshooting", "Troubleshooting & Evidence Center", "Probe history, logs, artifacts and diagnostics."],
  ["security-saaae", "Security & SAAAE Center", "Role catalog, privileged boundaries and audit enforcement."],
  ["infrastructure-truth", "Infrastructure Truth Center", "Cloudflare inventory, route map and configuration drift."],
  ["observability", "Observability & Cost Center", "Health probes, telemetry, rate limits and cost guardrails."],
  ["identity", "LINGO ID Center", "Local-first identity, key-backed owner acceptance and role foundations."],
  ["forge", "LINGO Forge", "Private self-hosted Git service; federation and mirrors are future work."],
  ["studio-command", "LINGO Studio Command", "Creative cockpit, asset registry and versioned world canon."],
  ["art-visual-forge", "Art & Visual Forge", "Image, concept, UI and procedural visual pipelines."],
  ["sonic-boom-audio", "Sonic Boom Audio Center", "Audio generation, sound design and spatial audio pipeline."],
  ["math-simulation", "Mathematical Skills & Simulation Center", "Probability, economy, balance and simulation validation."],
  ["motion-cinematic", "Motion & Cinematic Studio", "Timeline, camera, particles and cinematic export."],
  ["lingoai", "LINGOai Core / askLINGO", "Local bot worker registry and policy-constrained orchestration."],
  ["economy", "Economy & Commerce Center", "Virtual wallet simulation and isolated commerce testing."],
  ["world-matrix", "World Matrix & Game Systems", "Game worlds, progression, game engines and release-linked assets."]
];

await fs.mkdir(DATA_DIR, { recursive: true });
const OWNER_IDENTITY = await ensureOwnerIdentity();
await loadLane();
const releasesFile = path.join(DATA_DIR, "releases.json");
const auditFile = path.join(DATA_DIR, "audit.jsonl");
let auditQueue = Promise.resolve();
const activeRuns = new Map();

async function readReleases() {
  try { return JSON.parse(await fs.readFile(releasesFile, "utf8")); }
  catch (e) { if (e.code === "ENOENT") return []; throw e; }
}
async function writeReleases(items) {
  const tmp = releasesFile + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(items, null, 2) + "\n", { mode: 0o600 });
  await fs.rename(tmp, releasesFile);
}
function audit(event, detail = {}) {
  const write = async () => {
    let previousHash = "GENESIS";
    try {
      const raw = await fs.readFile(auditFile, "utf8");
      const last = raw.trimEnd().split("\n").at(-1);
      if (last) previousHash = JSON.parse(last).hash;
    } catch (error) { if (error.code !== "ENOENT") throw error; }
    const base = { at: new Date().toISOString(), event, detail, previous_hash: previousHash };
    const hash = crypto.createHash("sha256").update(JSON.stringify(base)).digest("hex");
    await fs.appendFile(auditFile, JSON.stringify({ ...base, hash }) + "\n", { mode: 0o600 });
  };
  auditQueue = auditQueue.then(write, write);
  return auditQueue;
}
function send(res, status, data, headers = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers });
  res.end(body);
}
function auth(req) {
  const supplied = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const suppliedBytes = Buffer.from(supplied, "utf8");
  const expectedBytes = Buffer.from(OWNER_TOKEN, "utf8");
  return expectedBytes.length >= 32 && suppliedBytes.length === expectedBytes.length && crypto.timingSafeEqual(suppliedBytes, expectedBytes) && authorize(OWNER_IDENTITY, "vsm.read");
}
function can(req, capability) { return auth(req) && authorize(OWNER_IDENTITY, capability); }
async function bodyJson(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 64 * 1024) throw new Error("Request body exceeds 64 KB");
  }
  return raw ? JSON.parse(raw) : {};
}
function validCommit(commit) { return typeof commit === "string" && /^[a-f0-9]{7,64}$/i.test(commit); }
function contentType(file) {
  return ({ ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp", ".woff2":"font/woff2", ".ico":"image/x-icon" })[path.extname(file).toLowerCase()] || "application/octet-stream";
}
async function serveFile(res, file, root = null) {
  try {
    const resolved = await fs.realpath(file);
    if (root) { const realRoot = await fs.realpath(root); if (resolved !== realRoot && !resolved.startsWith(realRoot + path.sep)) throw new Error("Path outside preview root"); }
    const stat = await fs.stat(resolved);
    if (!stat.isFile()) throw new Error("Not a file");
    res.writeHead(200, { "Content-Type": contentType(file), "Content-Length": stat.size, "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" });
    const stream = (await import("node:fs")).createReadStream(resolved);
    stream.pipe(res);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}
async function runProbes() {
  const paths = ["/healthz", "/api/v1/platform/status"];
  const results = [];
  for (const route of paths) {
    const started = Date.now();
    try {
      const response = await fetch(PROBE_BASE_URL + route, { signal: AbortSignal.timeout(8000), redirect: "manual", headers: { "User-Agent": "LINGO-VSM-Probe/0.1" } });
      const text = (await response.text()).slice(0, 1200);
      results.push({ url: PROBE_BASE_URL + route, status: response.status, ok: response.status >= 200 && response.status < 300, duration_ms: Date.now() - started, body_excerpt: text });
    } catch (error) {
      results.push({ url: PROBE_BASE_URL + route, ok: false, duration_ms: Date.now() - started, error: error.message });
    }
  }
  return results;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    if (req.method === "POST" && url.pathname === "/api/runs") {
      if (!can(req, "run.execute")) return send(res, 403, { error: "Run execution capability required." });
      const input = await bodyJson(req);
      if (!input.config || typeof input.config !== "object" || Array.isArray(input.config)) return send(res, 400, { error: "A run configuration object is required." });
      let validatedConfig;
      try {
        validatedConfig = createRunConfig(input.config);
        for (const track of validatedConfig.tracks) {
          if (!Array.isArray(track.steps)) throw new Error("Every track requires a steps array.");
          for (const step of track.steps) {
            if (!step || !["node", "npm"].includes(step.command) || !Array.isArray(step.args) || step.args.some(arg => typeof arg !== "string")) throw new Error("Run steps must use node/npm with string arguments.");
            if (step.timeout_ms !== undefined && (!Number.isInteger(step.timeout_ms) || step.timeout_ms < 1000 || step.timeout_ms > 1800000)) throw new Error("Step timeout must be 1 second to 30 minutes.");
            if (step.soft_timeout_ms !== undefined && (!Number.isInteger(step.soft_timeout_ms) || step.soft_timeout_ms < 1000 || step.soft_timeout_ms >= (step.timeout_ms || 300000))) throw new Error("Step soft timeout must be less than the hard timeout.");
            if (step.min_log_bytes !== undefined && (!Number.isInteger(step.min_log_bytes) || step.min_log_bytes < 1 || step.min_log_bytes > 65536)) throw new Error("Step minimum log bytes must be 1–65536.");
            if (step.cost_usd !== undefined && (!Number.isFinite(step.cost_usd) || step.cost_usd < 0)) throw new Error("Step cost estimate must be non-negative.");
            if (step.id !== undefined && (typeof step.id !== "string" || !/^[a-zA-Z0-9._-]{1,60}$/.test(step.id))) throw new Error("Step ID is invalid.");
            if (step.mutating === true && !validatedConfig.ALLOW_DESTRUCTIVE) throw new Error("Mutating steps require ALLOW_DESTRUCTIVE=true.");
            if (step.mutating === true && step.idempotent !== true && (typeof step.idempotency_key !== "string" || step.idempotency_key.length < 8 || step.idempotency_key.length > 128)) throw new Error("Mutating steps require idempotent=true or an 8–128 character idempotency_key.");
          }
        }
      } catch (error) { return send(res, 400, { error: error.message || "Invalid run configuration." }); }
      if (validatedConfig.target === "production") return send(res, 423, { error: "Production-target runs are disabled in this VSM phase." });
      const runId = validatedConfig.run_id;
      if (typeof runId !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{2,79}$/.test(runId)) return send(res, 400, { error: "A valid run_id is required." });
      if (activeRuns.has(runId)) return send(res, 409, { error: "A run with this ID is already active." });
      const priorRun = await fs.access(path.join(DATA_DIR, "runs", runId)).then(() => true).catch(() => false);
      if (priorRun) return send(res, 409, { error: "A run with this ID already exists; run IDs are immutable and cannot be reused." });
      const runDirectory = path.join(DATA_DIR, "runs", runId);
      const controller = createRunController(validatedConfig, {
        rootDir: process.cwd(),
        artifactsDir: path.join(DATA_DIR, "runs"),
        notifyOwner: async event => {
          const notification = { ...event, created_at: new Date().toISOString(), delivery: "LOCAL_OWNER_OUTBOX", requires_human_poll: true };
          await fs.writeFile(path.join(runDirectory, "owner-notification.json"), JSON.stringify(notification, null, 2) + "\n", { mode: 0o600 });
        }
      });
      activeRuns.set(runId, controller);
      controller.promise.finally(() => activeRuns.delete(runId)).catch(() => activeRuns.delete(runId));
      await audit("run.started", { run_id: runId, requested_by: OWNER_IDENTITY.id, target: input.config.target || "local" });
      return send(res, 202, { run_id: runId, status: "STARTING", status_url: "/api/runs/" + runId, controls: ["pause", "resume", "cancel"] });
    }
    const runControlMatch = url.pathname.match(/^\/api\/runs\/([A-Za-z0-9][A-Za-z0-9._-]{2,79})\/(pause|resume|cancel)$/);
    if (req.method === "POST" && runControlMatch) {
      if (!can(req, "run.control")) return send(res, 403, { error: "Run control capability required." });
      const [, runId, action] = runControlMatch;
      const controller = activeRuns.get(runId);
      if (!controller) return send(res, 404, { error: "No active run with that ID." });
      if (action === "pause") controller.pause();
      if (action === "resume") controller.resume();
      if (action === "cancel") controller.cancel("human-cancelled");
      await audit("run." + action, { run_id: runId, requested_by: OWNER_IDENTITY.id });
      return send(res, 200, { run_id: runId, action, accepted: true });
    }
    const trackControlMatch = url.pathname.match(/^\/api\/runs\/([A-Za-z0-9][A-Za-z0-9._-]{2,79})\/tracks\/([a-z][a-z0-9-]{1,39})\/(pause|resume|cancel)$/);
    if (req.method === "POST" && trackControlMatch) {
      if (!can(req, "run.control")) return send(res, 403, { error: "Run control capability required." });
      const [, runId, trackId, action] = trackControlMatch;
      const controller = activeRuns.get(runId);
      if (!controller) return send(res, 404, { error: "No active run with that ID." });
      const accepted = action === "pause" ? controller.pauseTrack(trackId) :
        action === "resume" ? controller.resumeTrack(trackId) : controller.cancelTrack(trackId);
      if (!accepted) return send(res, 404, { error: "Track is not active or does not exist." });
      await audit("run.track." + action, { run_id: runId, track_id: trackId, requested_by: OWNER_IDENTITY.id });
      return send(res, 200, { run_id: runId, track_id: trackId, action, accepted: true });
    }
    const runStatusMatch = url.pathname.match(/^\/api\/runs\/([A-Za-z0-9][A-Za-z0-9._-]{2,79})$/);
    if (req.method === "GET" && runStatusMatch) {
      if (!can(req, "run.read")) return send(res, 403, { error: "Run read capability required." });
      const runId = runStatusMatch[1];
      const runDir = path.join(DATA_DIR, "runs", runId);
      const status = await fs.readFile(path.join(runDir, "status.json"), "utf8").then(JSON.parse).catch(error => error.code === "ENOENT" ? null : Promise.reject(error));
      const summary = await fs.readFile(path.join(runDir, "summary.json"), "utf8").then(JSON.parse).catch(error => error.code === "ENOENT" ? null : Promise.reject(error));
      const ownerNotification = await fs.readFile(path.join(runDir, "owner-notification.json"), "utf8").then(JSON.parse).catch(error => error.code === "ENOENT" ? null : Promise.reject(error));
      if (!status && !summary) return send(res, 404, { error: "Run status not found." });
      return send(res, 200, { status, summary, owner_notification: ownerNotification, active: activeRuns.has(runId) });
    }
    if (req.method === "GET" && url.pathname === "/api/health") {
      return send(res, 200, { ok: true, service: "lingo-vsm", version: "0.2.0", authority: "FAIL-CLOSED", production_bridge: "DISABLED", centers: CENTERS.length, timestamp: new Date().toISOString() });
    }
    if (req.method === "GET" && url.pathname === "/api/audit/verify") {
      if (!can(req, "audit.verify")) return send(res, 403, { error: "Audit verification capability required." });
      await auditQueue;
      const raw = await fs.readFile(auditFile, "utf8").catch(error => error.code === "ENOENT" ? "" : Promise.reject(error));
      let previous = "GENESIS"; let verified = 0;
      for (const line of raw.split("\n").filter(Boolean)) { const row = JSON.parse(line); const { hash, ...base } = row; const actual = crypto.createHash("sha256").update(JSON.stringify(base)).digest("hex"); if (row.previous_hash !== previous || hash !== actual) return send(res, 200, { ok: false, verified, broken_at: verified + 1 }); previous = hash; verified++; }
      return send(res, 200, { ok: true, verified, head: previous });
    }
    const evidenceMatch = url.pathname.match(/^\/api\/evidence\/(ev-[a-z0-9-]+)$/);
    if (req.method === "GET" && evidenceMatch) { if (!can(req, "evidence.read")) return send(res, 401, { error: "Owner authorization required." }); const record = await readEvidence(evidenceMatch[1]); return send(res, 200, record); }
    if (req.method === "GET" && url.pathname === "/api/security/policy") {
      return send(res, 200, policySnapshot());
    }
    if (req.method === "GET" && url.pathname === "/api/session") {
      if (!auth(req)) return send(res, 401, { error: "Valid LINGO Owner token required." });
      return send(res, 200, { principal: OWNER_IDENTITY, capabilities: policySnapshot().roles.owner, session_scope: "local-browser-session" });
    }
    if (req.method === "GET" && url.pathname === "/api/identity") {
      const principal = await getOwnerPrincipal();
      return send(res, 200, { principal, local_first: true, session_auth: "owner bearer token", federation: "not configured" });
    }
    if (req.method === "GET" && url.pathname === "/api/sonic-boom") {
      return send(res, 200, { lane: sonicBoomSnapshot(), policy: "priority and bounded concurrency only; gates remain mandatory" });
    }
    if (req.method === "POST" && url.pathname === "/api/sonic-boom") {
      if (!can(req, "sonic_boom.configure")) return send(res, 403, { error: "Sonic Boom configuration capability required." });
      const input = await bodyJson(req);
      const lane = await configureLane(input);
      await audit("sonic_boom.configured", { owner_id: OWNER_IDENTITY.id, lane });
      return send(res, 200, { lane });
    }
    if (req.method === "GET" && url.pathname === "/api/bots") {
      const bots = JSON.parse(await fs.readFile(path.join(process.cwd(), "ai", "bots.json"), "utf8"));
      return send(res, 200, bots);
    }
    if (req.method === "POST" && url.pathname === "/api/bots/run") {
      if (!can(req, "bot.invoke")) return send(res, 403, { error: "Bot invocation capability required." });
      const input = await bodyJson(req);
      const botId = input.bot_id;
      if (typeof botId !== "string" || !/^lingo:\/\/id\/bot-[a-z]+$/.test(botId)) return send(res, 400, { error: "A valid bot_id is required." });
      const result = await submitLaneJob({ owner: true, kind: "bot:" + botId, run: () => executeBot({
        botId, task: input.task, input: input.input || {},
        context: {
          getRelease: async id => (await readReleases()).find(item => item.id === id),
          getStatus: async () => ({ service: "lingo-vsm", authority: "FAIL-CLOSED", production_bridge: "DISABLED", centers: CENTERS.length, sonic_boom: sonicBoomSnapshot() })
        }
      }) });
      await audit("bot.executed", { bot_id: botId, owner_id: OWNER_IDENTITY.id, task: input.task, mutation_performed: false });
      return send(res, 200, { bot_id: botId, invoked_by: OWNER_IDENTITY.id, result, note: "Deterministic local worker; no model inference or privileged mutation performed." });
    }
    if (req.method === "GET" && url.pathname === "/api/centers") {
      return send(res, 200, { centers: CENTERS.map(([id, name, purpose]) => ({ id, name, purpose, status: "SOURCE_REGISTERED_NOT_RUNTIME_VERIFIED", phase: 1 })) });
    }
    if (req.method === "GET" && url.pathname === "/api/studio/assets") {
      return send(res, 200, { assets: await listStudioAssets(), registry: "local-first-metadata", binary_uploads: "not_enabled" });
    }
    if (req.method === "POST" && url.pathname === "/api/studio/assets") {
      if (!can(req, "studio.propose")) return send(res, 403, { error: "Studio asset proposal capability required." });
      const input = await bodyJson(req);
      let asset;
      try { asset = await createStudioAsset(input, OWNER_IDENTITY.id); }
      catch (error) { return send(res, 400, { error: error.message || "Invalid asset metadata." }); }
      await audit("studio.asset.proposed", { asset_id: asset.id, division: asset.division, kind: asset.kind, rights_status: asset.rights_status, created_by: OWNER_IDENTITY.id });
      return send(res, 201, { asset, note: "Metadata proposal recorded. Binary upload, rights clearance and publication remain separate approvals." });
    }
    if (req.method === "GET" && url.pathname === "/api/releases") {
      const releases = await readReleases();
      return send(res, 200, { releases: releases.sort((a,b) => b.created_at.localeCompare(a.created_at)) });
    }
    if (req.method === "POST" && url.pathname === "/api/releases") {
      if (!can(req, "release.create")) return send(res, 403, { error: "Release creation capability required." });
      const input = await bodyJson(req);
      if (typeof input.title !== "string" || input.title.trim().length < 3 || input.title.length > 160) return send(res, 400, { error: "Title must be 3–160 characters." });
      if (!input.source || !validCommit(input.source.commit) || typeof input.source.branch !== "string" || !input.source.branch.trim()) return send(res, 400, { error: "A valid source commit SHA and branch are required." });
      const target = ["local-preview", "staging", "production-candidate"].includes(input.target) ? input.target : "local-preview";
      const now = new Date().toISOString();
      const id = "rp-" + now.slice(0,10).replaceAll("-","") + "-" + crypto.randomBytes(4).toString("hex");
      const release = { id, title: input.title.trim(), source: { repo: "thelingolegacy-blip/TheLingoLegacy", branch: input.source.branch.trim(), commit: input.source.commit.toLowerCase() }, artifacts: [], target, status: "draft", gates: { g02:"UNKNOWN", security:"UNKNOWN", static:"UNKNOWN", runtime:"UNKNOWN" }, evidence: { probes:[], tests:[], logs:[], screenshots:[] }, accepted_by:null, accepted_at:null, owner_id:OWNER_IDENTITY.id, created_at:now, updated_at:now };
      const releases = await readReleases(); releases.push(release); await writeReleases(releases); await audit("release.created", { id, target, commit: release.source.commit, created_by: OWNER_IDENTITY.id });
      return send(res, 201, { release });
    }
    const gateMatch = url.pathname.match(/^\/api\/releases\/([a-z0-9-]+)\/gates\/(g02|security|static)$/);
    if (req.method === "POST" && gateMatch) {
      if (!can(req, "release.attest")) return send(res, 403, { error: "Release attestation capability required." });
      const [, id, gate] = gateMatch;
      const input = await bodyJson(req);
      if (!["PASS", "FAIL", "HOLD"].includes(input.decision) || typeof input.evidence_ref !== "string" || input.evidence_ref.trim().length < 3 || typeof input.rationale !== "string" || input.rationale.trim().length < 8) return send(res, 400, { error: "Provide PASS/FAIL/HOLD, an evidence reference, and a rationale of at least 8 characters." });
      const releases = await readReleases();
      const release = releases.find(x => x.id === id);
      if (!release) return send(res, 404, { error: "Release package not found." });
      const attestation = { gate, decision: input.decision, evidence_ref: input.evidence_ref.trim(), rationale: input.rationale.trim(), attested_by: OWNER_IDENTITY.id, attested_at: new Date().toISOString() };
      release.gates[gate] = input.decision;
      const evidence = await writeEvidence({ releaseId: id, type: "gate-attestation", payload: attestation, createdBy: OWNER_IDENTITY.id });
      attestation.evidence_record = evidence;
      release.evidence.gate_attestations = [...(release.evidence.gate_attestations || []), attestation];
      release.updated_at = attestation.attested_at;
      await writeReleases(releases); await audit("gate.attested", { id, ...attestation });
      return send(res, 200, { release, attestation, note: "Owner attestation is recorded locally; evidence authenticity remains subject to review." });
    }
    const match = url.pathname.match(/^\/api\/releases\/([a-z0-9-]+)\/(probe|accept)$/);
    if (req.method === "POST" && match) {
      const [, id, action] = match;
      const releases = await readReleases();
      const release = releases.find(x => x.id === id);
      if (!release) return send(res, 404, { error: "Release package not found." });
      if (action === "probe") {
        if (!can(req, "release.probe")) return send(res, 403, { error: "Release probe capability required." });
        if (release.status !== "draft" && release.status !== "pending") return send(res, 409, { error: "Probes are only allowed for draft or pending packages." });
        const probes = await runProbes();
        const probeEvidence = await writeEvidence({ releaseId: id, type: "probe", payload: probes, createdBy: OWNER_IDENTITY.id });
        release.evidence.probes.push({ ...probeEvidence, probe_count: probes.length, all_ok: probes.every(p => p.ok) });
        release.gates.runtime = probes.every(p => p.ok) ? "PASS" : "FAIL";
        release.updated_at = new Date().toISOString();
        await writeReleases(releases); await audit("release.probed", { id, runtime: release.gates.runtime, probe_count: probes.length });
        return send(res, 200, { release, probes, note: "Public HTTP probes are evidence of reachability only, not full product acceptance." });
      }
      if (!can(req, "release.accept.local")) return send(res, 403, { error: "Local release acceptance capability required." });
      const missing = REQUIRED_GATES.filter(g => release.gates[g] !== "PASS");
      if (missing.length) return send(res, 409, { error: "Acceptance denied: required gates are not PASS.", blocked_gates: missing });
      if (release.target === "production-candidate") return send(res, 423, { error: "Production acceptance is disabled in this VSM phase. Use the staging/preview evidence and a separately authorized promotion bridge." });
      release.status = "accepted"; release.accepted_by = OWNER_IDENTITY.id; release.accepted_at = new Date().toISOString(); release.updated_at = release.accepted_at;
      release.acceptance_signature = await signOwnerPayload({ release_id: id, source: release.source, target: release.target, gates: release.gates, accepted_at: release.accepted_at });
      await writeReleases(releases); await audit("release.accepted", { id, accepted_by: OWNER_IDENTITY.id, signature_algorithm: "Ed25519" });
      return send(res, 200, { release, message: "Accepted for local workflow only. No deployment was performed." });
    }
    if (req.method === "GET" && (url.pathname === "/" || url.pathname.startsWith("/style.css") || url.pathname.startsWith("/app.js"))) {
      const name = url.pathname === "/" ? "index.html" : path.basename(url.pathname);
      return serveFile(res, path.join(process.cwd(), "dashboard", name));
    }
    if (req.method === "GET" && url.pathname.startsWith("/preview/")) {
      const relative = decodeURIComponent(url.pathname.slice("/preview/".length) || "index.html");
      const segments = relative.split(/[\\/]+/);
      if (segments.some(part => part.startsWith(".") || ["vsm", "node_modules"].includes(part.toLowerCase()))) return send(res, 403, { error: "This path is not available through the static preview." });
      const target = path.resolve(WORKSPACE, relative);
      if (target !== WORKSPACE && !target.startsWith(WORKSPACE + path.sep)) return send(res, 400, { error: "Invalid preview path." });
      return serveFile(res, target, WORKSPACE);
    }
    return send(res, 404, { error: "Not found." });
  } catch (error) {
    return send(res, 500, { error: error.message || "Internal error." });
  }
});

server.listen(PORT, HOST, () => console.log(`LINGO VSM listening on http://${HOST}:${PORT}; production bridge disabled`));

const previewServer = http.createServer(async (req, res) => {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405); return res.end("Method not allowed"); }
    const url = new URL(req.url || "/", "http://127.0.0.1");
    const relative = decodeURIComponent(url.pathname === "/" ? "index.html" : url.pathname.slice(1));
    const segments = relative.split(/[\\/]+/);
    if (segments.some(part => part.startsWith(".") || ["vsm", "node_modules"].includes(part.toLowerCase()))) { res.writeHead(403); return res.end("Forbidden"); }
    let target = path.resolve(WORKSPACE, relative);
    if (target !== WORKSPACE && !target.startsWith(WORKSPACE + path.sep)) { res.writeHead(400); return res.end("Invalid path"); }
    try { if ((await fs.stat(target)).isDirectory()) target = path.join(target, "index.html"); } catch {}
    return serveFile(res, target, WORKSPACE);
  } catch (error) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(error.message || "Bad request");
  }
});
previewServer.listen(PREVIEW_PORT, HOST, () => console.log(`LINGO VSM static preview listening on http://${HOST}:${PREVIEW_PORT}`));

