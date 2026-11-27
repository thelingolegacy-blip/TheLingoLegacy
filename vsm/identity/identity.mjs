import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = process.env.VSM_DATA_DIR || path.join(process.cwd(), "data");
const IDENTITY_FILE = path.join(DATA_DIR, "lingo-id-owner.json");
const HANDLE = (process.env.LINGO_ID_HANDLE || "owner").toLowerCase();
const DISPLAY_NAME = process.env.LINGO_ID_DISPLAY_NAME || process.env.VSM_OWNER_NAME || "LINGO Owner";

export function canonicalId(handle = HANDLE) {
  const value = String(handle).toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{1,31}$/.test(value)) throw new Error("LINGO ID handle must be 2–32 lowercase letters, numbers, dots, underscores or hyphens.");
  return `lingo://id/${value}`;
}
export async function ensureOwnerIdentity() {
  await fs.mkdir(DATA_DIR, { recursive: true, mode: 0o700 });
  try {
    const existing = JSON.parse(await fs.readFile(IDENTITY_FILE, "utf8"));
    if (existing.id !== canonicalId() || !existing.private_key_pem || !existing.public_key_pem) throw new Error("Existing LINGO ID identity does not match configured handle or key material is incomplete.");
    return publicPrincipal(existing);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const record = {
    id: canonicalId(), handle: HANDLE, display_name: DISPLAY_NAME, status: "active",
    roles: ["owner"], public_key_pem: publicKey.export({ type: "spki", format: "pem" }),
    private_key_pem: privateKey.export({ type: "pkcs8", format: "pem" }),
    created_at: new Date().toISOString(), key_algorithm: "Ed25519"
  };
  const temp = IDENTITY_FILE + ".tmp";
  await fs.writeFile(temp, JSON.stringify(record, null, 2) + "\n", { mode: 0o600, flag: "wx" });
  await fs.rename(temp, IDENTITY_FILE);
  await fs.chmod(IDENTITY_FILE, 0o600);
  return publicPrincipal(record);
}
function publicPrincipal(record) {
  return { id: record.id, handle: record.handle, display_name: record.display_name, status: record.status, roles: record.roles, public_key: record.public_key_pem, key_algorithm: record.key_algorithm, created_at: record.created_at };
}
export async function getOwnerPrincipal() {
  const record = JSON.parse(await fs.readFile(IDENTITY_FILE, "utf8"));
  return publicPrincipal(record);
}
export async function signOwnerPayload(payload) {
  const record = JSON.parse(await fs.readFile(IDENTITY_FILE, "utf8"));
  if (record.status !== "active" || !record.roles.includes("owner")) throw new Error("Owner identity is not active.");
  const bytes = Buffer.from(JSON.stringify(payload));
  const signature = crypto.sign(null, bytes, crypto.createPrivateKey(record.private_key_pem)).toString("base64url");
  return { signer: record.id, algorithm: "Ed25519", payload, signature, signed_at: new Date().toISOString() };
}
export function verifySignedPayload(envelope, publicKeyPem) {
  if (!envelope || envelope.algorithm !== "Ed25519" || typeof envelope.signature !== "string") return false;
  return crypto.verify(null, Buffer.from(JSON.stringify(envelope.payload)), crypto.createPublicKey(publicKeyPem), Buffer.from(envelope.signature, "base64url"));
}
