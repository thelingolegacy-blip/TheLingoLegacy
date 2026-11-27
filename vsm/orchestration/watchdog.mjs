import fs from "node:fs/promises";

const [parentPidRaw, pidFile, crashFile] = process.argv.slice(2);
const parentPid = Number(parentPidRaw);
if (!Number.isInteger(parentPid) || parentPid < 1 || !pidFile || !crashFile) process.exit(2);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function alive(pid) {
  try { process.kill(pid, 0); return true; }
  catch (error) { return error.code === "EPERM"; }
}
while (alive(parentPid)) await sleep(500);
let pids = [];
try { pids = JSON.parse(await fs.readFile(pidFile, "utf8")); } catch {}
const killed = [];
for (const pid of pids) {
  if (!Number.isInteger(pid) || pid < 1) continue;
  try { process.kill(-pid, "SIGKILL"); killed.push(pid); } catch {}
}
await fs.writeFile(crashFile, JSON.stringify({ detected_at: new Date().toISOString(), parent_pid: parentPid, killed_process_groups: killed }) + "\n", { mode: 0o600 });
