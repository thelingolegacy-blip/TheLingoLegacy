import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile, chmod } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RecordStore, validateRecord } from "../src/record-store.mjs";

const digest = value => createHash("sha256").update(value).digest("hex");
const canonical = value => JSON.stringify(value);

export async function createBackup(store, destination) {
  const records = await store.readAll();
  const payload = {
    format: "lingo-lkis-backup-v1",
    created_at: new Date().toISOString(),
    record_count: records.length,
    records,
    records_sha256: digest(canonical(records))
  };
  const target = resolve(destination);
  await mkdir(dirname(target), { recursive: true, mode: 0o700 });
  const temporary = target + "." + randomUUID() + ".tmp";
  try {
    await writeFile(temporary, JSON.stringify(payload, null, 2) + "\n", { flag: "wx", mode: 0o600 });
    await chmod(temporary, 0o600);
    await rename(temporary, target);
    await chmod(dirname(target), 0o700);
  } catch (error) {
    await import("node:fs/promises").then(fs => fs.rm(temporary, { force: true })).catch(() => {});
    throw error;
  }
  return { path: target, record_count: records.length, records_sha256: payload.records_sha256 };
}

export async function restoreBackup(source, store) {
  const payload = JSON.parse(await readFile(resolve(source), "utf8"));
  if (!payload || payload.format !== "lingo-lkis-backup-v1" || !Array.isArray(payload.records)) {
    throw new Error("Unsupported or malformed LKIS backup");
  }
  if (payload.record_count !== payload.records.length) throw new Error("Backup record count mismatch");
  if (payload.records_sha256 !== digest(canonical(payload.records))) throw new Error("Backup integrity check failed");
  const ids = new Set();
  for (const row of payload.records) {
    if (!row || !row.record || !Number.isSafeInteger(row.revision) || row.revision < 1 ||
        typeof row.sha256 !== "string" || row.sha256 !== digest(canonical(row.record))) {
      throw new Error("Backup contains an invalid record envelope");
    }
    if (ids.has(row.record.id)) throw new Error("Backup contains duplicate record IDs");
    ids.add(row.record.id);
    const errors = validateRecord(row.record);
    if (errors.length) throw new Error("Backup record failed schema validation: " + errors.join("; "));
  }
  await store.writeAll(payload.records);
  return { restored: payload.records.length, records_sha256: payload.records_sha256 };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, source, target] = process.argv.slice(2);
  const dataFile = process.env.LKIS_DATA_FILE || resolve("var/records.json");
  const store = new RecordStore(dataFile);
  if (command === "backup" && source) {
    const result = await createBackup(store, source);
    process.stdout.write(JSON.stringify(result) + "\n");
  } else if (command === "restore" && source) {
    const destinationStore = new RecordStore(target || dataFile);
    const result = await restoreBackup(source, destinationStore);
    process.stdout.write(JSON.stringify(result) + "\n");
  } else {
    process.stderr.write("Usage: node scripts/backup.mjs backup <backup-file> | restore <backup-file> [target-data-file]\n");
    process.exitCode = 2;
  }
}
