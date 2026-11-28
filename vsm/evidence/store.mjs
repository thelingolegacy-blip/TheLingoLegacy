import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.join(process.env.VSM_DATA_DIR || path.join(process.cwd(), "data"), "evidence");
const ALLOWED_TYPES = new Set(["probe", "gate-attestation", "release-review", "build", "test", "studio-asset"]);
export async function writeEvidence({ releaseId, type, payload, createdBy = "system" }) {
  if (typeof releaseId !== "string" || !/^rp-[a-z0-9-]+$/.test(releaseId)) throw new Error("Invalid release evidence scope.");
  if (!ALLOWED_TYPES.has(type)) throw new Error("Unsupported evidence type.");
  await fs.mkdir(ROOT, { recursive: true, mode: 0o700 });
  const id = "ev-" + Date.now().toString(36) + "-" + crypto.randomBytes(6).toString("hex");
  const base = { id, release_id: releaseId, type, created_at: new Date().toISOString(), created_by: createdBy, payload };
  const sha256 = crypto.createHash("sha256").update(JSON.stringify(base)).digest("hex");
  const record = { ...base, sha256 };
  await fs.writeFile(path.join(ROOT, id + ".json"), JSON.stringify(record, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  return { id, type, created_at: record.created_at, created_by: createdBy, sha256, uri: "vsm-evidence://" + id };
}
export async function readEvidence(id) {
  if (typeof id !== "string" || !/^ev-[a-z0-9-]+$/.test(id)) throw new Error("Invalid evidence identifier.");
  const record = JSON.parse(await fs.readFile(path.join(ROOT, id + ".json"), "utf8"));
  const { sha256, ...base } = record;
  const actual = crypto.createHash("sha256").update(JSON.stringify(base)).digest("hex");
  if (actual !== sha256) throw new Error("Evidence integrity check failed.");
  return record;
}
