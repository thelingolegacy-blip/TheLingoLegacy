import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RecordStore } from "../src/record-store.mjs";
import { createBackup, restoreBackup } from "../scripts/backup.mjs";

const sample = () => ({
  id: "lkis.backup.record-001", title: "Backup fixture", domain: "KNOW",
  classification: "internal", knowledge_type: "lesson",
  statement: "Synthetic record used to test backup and restore.",
  source_refs: ["https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/562"],
  evidence_refs: ["https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/562"],
  observed_at: new Date().toISOString(), status: "proposed",
  owner: "knowledge-governance", limitations: ["Test data only."]
});

test("backs up and restores records with integrity verification", async () => {
  const dir = await mkdtemp(join(tmpdir(), "lkis-backup-"));
  try {
    const source = new RecordStore(join(dir, "source", "records.json"));
    const destination = new RecordStore(join(dir, "restore", "records.json"));
    await source.create(sample());
    const backupPath = join(dir, "snapshots", "lkis.json");
    const result = await createBackup(source, backupPath);
    assert.equal(result.record_count, 1);
    const restored = await restoreBackup(backupPath, destination);
    assert.equal(restored.restored, 1);
    assert.deepEqual(await destination.list(), await source.list());
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("rejects a backup whose records have been modified", async () => {
  const dir = await mkdtemp(join(tmpdir(), "lkis-tamper-"));
  try {
    const source = new RecordStore(join(dir, "source.json"));
    const destination = new RecordStore(join(dir, "destination.json"));
    await source.create(sample());
    const backupPath = join(dir, "backup.json");
    await createBackup(source, backupPath);
    const payload = JSON.parse(await readFile(backupPath, "utf8"));
    payload.records[0].record.statement = "tampered";
    await (await import("node:fs/promises")).writeFile(backupPath, JSON.stringify(payload));
    await assert.rejects(() => restoreBackup(backupPath, destination), /integrity check failed/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
