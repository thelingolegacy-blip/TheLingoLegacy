import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile, chmod } from "node:fs/promises";
import { dirname } from "node:path";
import { readFile as readText } from "node:fs/promises";
const schemaUrl = new URL("../../../config/knowledge/knowledge-record.schema.json", import.meta.url);
const schema = JSON.parse(await readText(schemaUrl, "utf8"));
function validate(value, rule, path = "$", errors = []) {
  if (rule.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) { errors.push(path + " must be an object"); return errors; }
    for (const key of rule.required ?? []) if (!(key in value)) errors.push(path + "." + key + " is required");
    if (rule.additionalProperties === false) for (const key of Object.keys(value)) if (!(key in (rule.properties ?? {}))) errors.push(path + "." + key + " is not allowed");
    for (const [key, child] of Object.entries(rule.properties ?? {})) if (key in value) validate(value[key], child, path + "." + key, errors);
  } else if (rule.type === "array") {
    if (!Array.isArray(value)) { errors.push(path + " must be an array"); return errors; }
    if (rule.minItems !== undefined && value.length < rule.minItems) errors.push(path + " has too few items");
    if (rule.uniqueItems && new Set(value.map(v => JSON.stringify(v))).size !== value.length) errors.push(path + " must contain unique items");
    value.forEach((v, i) => validate(v, rule.items ?? {}, path + "[" + i + "]", errors));
  } else if (rule.type === "string") {
    if (typeof value !== "string") { errors.push(path + " must be a string"); return errors; }
    if (rule.minLength !== undefined && value.length < rule.minLength) errors.push(path + " is too short");
    if (rule.maxLength !== undefined && value.length > rule.maxLength) errors.push(path + " is too long");
    if (rule.pattern && !(new RegExp(rule.pattern).test(value))) errors.push(path + " has an invalid format");
    if (rule.format === "date-time" && (!/^\d{4}-\d\d-\d\dT/.test(value) || Number.isNaN(Date.parse(value)))) errors.push(path + " must be an ISO date-time");
  }
  if (rule.enum && !rule.enum.includes(value)) errors.push(path + " is not an allowed value");
  return errors;
}
export function validateRecord(record) { return validate(record, schema); }
export class RecordStore {
  constructor(filePath) { this.filePath = filePath; this.writeQueue = Promise.resolve(); }
  async readAll() {
    try { const parsed = JSON.parse(await readFile(this.filePath, "utf8")); if (!Array.isArray(parsed)) throw new Error("LKIS store must contain an array"); return parsed; }
    catch (error) { if (error.code === "ENOENT") return []; throw error; }
  }
  async writeAll(rows) {
    await mkdir(dirname(this.filePath), { recursive: true, mode: 0o700 });
    const temp = this.filePath + "." + randomUUID() + ".tmp";
    await writeFile(temp, JSON.stringify(rows, null, 2) + "\n", { mode: 0o600, flag: "wx" });
    await chmod(temp, 0o600); await rename(temp, this.filePath); await chmod(dirname(this.filePath), 0o700);
  }
  async list() { return this.readAll(); }
  async mutate(operation) {
    const run = this.writeQueue.then(operation, operation);
    this.writeQueue = run.then(() => undefined, () => undefined);
    return run;
  }
  async create(record) {
    return this.mutate(async () => {
      const rows = await this.readAll();
      if (rows.some(row => row.record.id === record.id)) return { conflict: true };
      const row = { record, revision: 1, stored_at: new Date().toISOString(), sha256: createHash("sha256").update(JSON.stringify(record)).digest("hex") };
      rows.push(row); await this.writeAll(rows); return { conflict: false, row };
    });
  }
  async verify(id, reviewer) {
    return this.mutate(async () => {
      const rows = await this.readAll(), index = rows.findIndex(row => row.record.id === id);
      if (index < 0) return { missing: true };
      const row = rows[index];
      if (row.record.status !== "proposed") return { conflict: true, status: row.record.status };
      if (!Array.isArray(row.record.evidence_refs) || row.record.evidence_refs.length === 0) return { missingEvidence: true };
      const record = { ...row.record, status: "verified", change_history: [...(row.record.change_history || []), { changed_at: new Date().toISOString(), change: "Status changed from proposed to verified", reason: "Independent LKIS reviewer accepted the submitted evidence references.", evidence_refs: row.record.evidence_refs }] };
      const next = { ...row, record, revision: row.revision + 1, stored_at: new Date().toISOString(), reviewed_by: reviewer, sha256: createHash("sha256").update(JSON.stringify(record)).digest("hex") };
      rows[index] = next; await this.writeAll(rows); return { row: next };
    });
  }
}
