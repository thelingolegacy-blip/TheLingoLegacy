import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const [parentPidRaw, pidFile, crashFile] = process.argv.slice(2);
const parentPid = Number(parentPidRaw);
if (!Number.isInteger(parentPid) || parentPid < 1 || !pidFile || !crashFile) process.exit(2);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function alive(pid) {
  try { process.kill(pid, 0); return true; }
  catch (error) { return error.code === "EPERM"; }
}
const runDir = path.dirname(crashFile);
const completedFile = path.join(runDir, "completed.json");
while (alive(parentPid)) {
  try { await fs.access(completedFile); process.exit(0); } catch {}
  await sleep(500);
}
try { await fs.access(completedFile); process.exit(0); } catch {}
let pids = [];
try { pids = JSON.parse(await fs.readFile(pidFile, "utf8")); } catch {}
const killed = [];
for (const pid of pids) {
  if (!Number.isInteger(pid) || pid < 1) continue;
  try { process.kill(-pid, "SIGKILL"); killed.push(pid); } catch {}
}
const detectedAt = new Date().toISOString();
const report = { detected_at: detectedAt, parent_pid: parentPid, killed_process_groups: killed, status: "ORCHESTRATOR_CRASH" };
await fs.writeFile(crashFile, JSON.stringify(report) + "\n", { mode: 0o600 });
const runId = path.basename(runDir);
const statusFile = path.join(runDir, "status.json");
const summaryFile = path.join(runDir, "summary.json");
let previousStatus = {};
try { previousStatus = JSON.parse(await fs.readFile(statusFile, "utf8")); } catch {}
const status = { ...previousStatus, run_id: runId, status: "ORCHESTRATOR_CRASH", updated_at: detectedAt, crash_report: crashFile };
const summary = { run_id: runId, status: "ORCHESTRATOR_CRASH", finished_at: detectedAt, budget: previousStatus.budget || null, tracks: previousStatus.tracks || {}, crash_report: crashFile, owner_notification: "LOCAL_OWNER_OUTBOX" };
const notification = { run_id: runId, status: "ORCHESTRATOR_CRASH", created_at: detectedAt, delivery: "LOCAL_OWNER_OUTBOX", requires_human_poll: true, crash_report: crashFile };
await fs.writeFile(statusFile, JSON.stringify(status) + "\n", { mode: 0o600 });
await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2) + "\n", { mode: 0o600 });
await fs.writeFile(path.join(runDir, "owner-notification.json"), JSON.stringify(notification) + "\n", { mode: 0o600 });
try {
  const auditFile = path.resolve(runDir, "..", "audit.jsonl");
  let previousHash = "GENESIS";
  try {
    const raw = await fs.readFile(auditFile, "utf8");
    const last = raw.trimEnd().split("\n").at(-1);
    if (last) previousHash = JSON.parse(last).hash;
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  const base = { at: detectedAt, event: "run.orchestrator-crash", detail: { run_id: runId, killed_process_groups: killed }, previous_hash: previousHash };
  const hash = crypto.createHash("sha256").update(JSON.stringify(base)).digest("hex");
  await fs.appendFile(auditFile, JSON.stringify({ ...base, hash }) + "\n", { mode: 0o600 });
} catch {}
