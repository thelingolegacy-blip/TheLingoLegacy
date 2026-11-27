import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = process.env.VSM_DATA_DIR || path.join(process.cwd(), "data");
const REGISTRY_FILE = path.join(DATA_DIR, "studio-assets.json");
const KINDS = new Set(["image", "audio", "video", "document", "design", "code", "game", "other"]);
const RIGHTS = new Set(["owner_created", "licensed", "public_domain", "pending_review", "unknown"]);
let writeQueue = Promise.resolve();

async function readAll() {
  try {
    const records = JSON.parse(await fs.readFile(REGISTRY_FILE, "utf8"));
    if (!Array.isArray(records)) throw new Error("Studio asset registry is not an array.");
    return records;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function persist(records) {
  await fs.mkdir(DATA_DIR, { recursive: true, mode: 0o700 });
  const temp = REGISTRY_FILE + ".tmp";
  await fs.writeFile(temp, JSON.stringify(records, null, 2) + "\n", { mode: 0o600 });
  await fs.rename(temp, REGISTRY_FILE);
}

function validateSourceUri(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 500) throw new Error("source_uri must be a URL or repository reference under 500 characters.");
  if (/^(repo|lingo-asset):\/\/[a-z0-9._/-]+$/i.test(value)) return value;
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error("source_uri must use HTTPS, repo:// or lingo-asset://."); }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error("External asset sources must use HTTPS without embedded credentials.");
  return parsed.toString();
}

export async function listStudioAssets() {
  return (await readAll()).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createStudioAsset(input, createdBy) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Asset metadata object is required.");
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const division = typeof input.division === "string" ? input.division.trim() : "";
  const kind = input.kind;
  const rights = input.rights_status || "unknown";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  if (name.length < 2 || name.length > 120) throw new Error("Asset name must be 2–120 characters.");
  if (division.length < 2 || division.length > 80) throw new Error("Division must be 2–80 characters.");
  if (!KINDS.has(kind)) throw new Error("Unsupported asset kind.");
  if (!RIGHTS.has(rights)) throw new Error("Unsupported rights_status.");
  if (description.length > 2000) throw new Error("Description must be 2000 characters or fewer.");
  const tags = input.tags === undefined ? [] : input.tags;
  if (!Array.isArray(tags) || tags.length > 20 || tags.some(tag => typeof tag !== "string" || tag.trim().length < 1 || tag.trim().length > 32)) throw new Error("tags must contain up to 20 strings of 1–32 characters.");
  const contentSha256 = input.content_sha256 === undefined || input.content_sha256 === "" ? null : input.content_sha256;
  if (contentSha256 !== null && (typeof contentSha256 !== "string" || !/^[a-f0-9]{64}$/i.test(contentSha256))) throw new Error("content_sha256 must be a 64-character hexadecimal digest.");
  const sourceUri = validateSourceUri(input.source_uri);
  const record = {
    id: "la-" + Date.now().toString(36) + "-" + crypto.randomBytes(6).toString("hex"),
    name, division, kind, description, tags: tags.map(tag => tag.trim()),
    source_uri: sourceUri, content_sha256: contentSha256?.toLowerCase() || null,
    rights_status: rights, status: "proposed", created_by: createdBy,
    created_at: new Date().toISOString(), version: 1
  };
  const operation = async () => {
    const records = await readAll();
    records.push(record);
    await persist(records);
    return record;
  };
  const result = writeQueue.then(operation, operation);
  writeQueue = result.then(() => undefined, () => undefined);
  return result;
}
