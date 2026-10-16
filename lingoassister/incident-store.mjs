import { createHash } from "node:crypto";
import { mkdir, open, readFile, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
const hash = value => createHash("sha256").update(value).digest("hex");
const canonical = value => JSON.stringify(value);
const GENESIS = "0".repeat(64);
/** Append-only hash-chained JSONL journal with an exclusive single-writer lock. */
export class IncidentStore {
  constructor(path) {
    if (typeof path !== "string" || !path.trim()) throw new TypeError("path required");
    this.path = resolve(path);
    this.lockPath = this.path + ".lock";
  }
  async readAll() {
    let text;
    try { text = await readFile(this.path, "utf8"); }
    catch (error) { if (error.code === "ENOENT") return []; throw error; }
    if (!text) return [];
    if (!text.endsWith("\n")) throw new Error("Journal has an incomplete trailing record");
    const lines = text.slice(0, -1).split("\n");
    let previous = GENESIS;
    const records = [];
    for (let i = 0; i < lines.length; i++) {
      let item;
      try { item = JSON.parse(lines[i]); } catch { throw new Error(`Invalid JSON at journal record ${i + 1}`); }
      if (item.sequence !== i + 1) throw new Error(`Invalid sequence at journal record ${i + 1}`);
      if (item.previousDigest !== previous) throw new Error(`Broken hash chain at journal record ${i + 1}`);
      const base = { sequence: item.sequence, previousDigest: previous, payload: item.payload };
      if (item.digest !== hash(canonical(base))) throw new Error(`Digest mismatch at journal record ${i + 1}`);
      records.push(item.payload); previous = item.digest;
    }
    return records;
  }
  async append(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new TypeError("payload must be an object");
    await mkdir(dirname(this.path), { recursive: true });
    let lock;
    try { lock = await open(this.lockPath, "wx", 0o600); }
    catch (error) {
      if (error.code === "EEXIST") throw new Error("Concurrent writer blocked: journal lock already exists");
      throw error;
    }
    try {
      const records = await this.readAll();
      let previousDigest = GENESIS;
      if (records.length) {
        const text = await readFile(this.path, "utf8");
        previousDigest = JSON.parse(text.trimEnd().split("\n").at(-1)).digest;
      }
      const base = { sequence: records.length + 1, previousDigest, payload };
      const envelope = { ...base, digest: hash(canonical(base)) };
      const handle = await open(this.path, "a", 0o600);
      try { await handle.writeFile(canonical(envelope) + "\n", "utf8"); await handle.sync(); }
      finally { await handle.close(); }
      return { sequence: envelope.sequence, digest: envelope.digest };
    } finally {
      await lock.close();
      await unlink(this.lockPath).catch(error => { if (error.code !== "ENOENT") throw error; });
    }
  }
}
