import fs from "node:fs/promises";
import path from "node:path";

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
await fs.writeFile(path.join(runDir, "owner-notification.json"), JSON.stringify({ run_id: path.basename(runDir), status: "ORCHESTRATOR_CRASH", created_at: detectedAt, delivery: "LOCAL_OWNER_OUTBOX", requires_human_poll: true, crash_report: crashFile }) + "\n", { mode: 0o600 });
await fs.writeFile(path.join(runDir, "status.json"), JSON.stringify({ run_id: (await import("node:path")).basename(runDir), status: "ORCHESTRATOR_CRASH", updated_at: detectedAt }) + "\n", { mode: 0o600 });
