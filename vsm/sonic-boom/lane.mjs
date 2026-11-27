import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = process.env.VSM_DATA_DIR || path.join(process.cwd(), "data");
const STATE_FILE = path.join(DATA_DIR, "sonic-boom-lane.json");
const DEFAULT_STATE = { enabled: false, owner_priority: true, max_parallel_jobs: 4, queue: [], updated_at: null };
let state = { ...DEFAULT_STATE };
let active = 0;
const waiters = [];
export async function loadLane() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const loaded = JSON.parse(await fs.readFile(STATE_FILE, "utf8"));
    if (typeof loaded.enabled !== "boolean" || typeof loaded.owner_priority !== "boolean" || !Number.isInteger(loaded.max_parallel_jobs) || loaded.max_parallel_jobs < 1 || loaded.max_parallel_jobs > 16) throw new Error("Persisted Sonic Boom lane state failed validation; refusing unsafe scheduler settings.");
    state = { ...DEFAULT_STATE, enabled: loaded.enabled, owner_priority: loaded.owner_priority, max_parallel_jobs: loaded.max_parallel_jobs, updated_at: loaded.updated_at || null, queue: [] };
  }
  catch (e) { if (e.code !== "ENOENT") throw e; await persist(); }
  return snapshot();
}
async function persist() {
  const temp = STATE_FILE + ".tmp";
  await fs.writeFile(temp, JSON.stringify(state, null, 2) + "\n", { mode: 0o600 });
  await fs.rename(temp, STATE_FILE);
}
export function snapshot() {
  return { enabled: state.enabled, owner_priority: state.owner_priority, max_parallel_jobs: state.max_parallel_jobs, queued_jobs: state.queue.length, active_jobs: active, updated_at: state.updated_at };
}
export async function configureLane(input) {
  if (typeof input.enabled !== "boolean") throw new Error("enabled must be boolean.");
  const parallel = input.max_parallel_jobs ?? state.max_parallel_jobs;
  if (!Number.isInteger(parallel) || parallel < 1 || parallel > 16) throw new Error("max_parallel_jobs must be an integer from 1 to 16.");
  state = { ...state, enabled: input.enabled, owner_priority: input.owner_priority !== false, max_parallel_jobs: parallel, updated_at: new Date().toISOString() };
  await persist();
  return snapshot();
}
export function submitLaneJob({ owner = false, kind = "task", run }) {
  if (typeof run !== "function") throw new Error("A job runner function is required.");
  const job = { id: "sb-" + crypto.randomBytes(6).toString("hex"), owner, kind, run, enqueued_at: Date.now() };
  return new Promise((resolve, reject) => {
    waiters.push({ ...job, resolve, reject });
    waiters.sort((a, b) => (state.enabled && state.owner_priority ? Number(b.owner) - Number(a.owner) : 0) || a.enqueued_at - b.enqueued_at);
    drain();
  });
}
function drain() {
  while (active < (state.enabled ? state.max_parallel_jobs : 1) && waiters.length) {
    const job = waiters.shift(); active++;
    Promise.resolve().then(job.run).then(job.resolve, job.reject).finally(() => { active--; drain(); });
  }
}
export async function laneQueueSnapshot() {
  return { ...snapshot(), queued: waiters.map(({ id, owner, kind, enqueued_at }) => ({ id, owner, kind, enqueued_at })) };
}
