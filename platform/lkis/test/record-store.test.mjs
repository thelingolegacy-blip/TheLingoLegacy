import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RecordStore, validateRecord } from "../src/record-store.mjs";
const sample = () => ({
  id: "lkis.test.record-001", title: "LKIS test record", domain: "KNOW",
  classification: "internal", knowledge_type: "lesson",
  statement: "A test record used only to validate the LKIS pilot.",
  source_refs: ["https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/562"],
  evidence_refs: [], observed_at: new Date().toISOString(), status: "proposed",
  owner: "knowledge-governance", limitations: ["Synthetic test fixture; not enterprise knowledge."]
});
test("accepts a complete schema-conforming record", () => assert.deepEqual(validateRecord(sample()), []));
test("rejects missing provenance and unknown fields", () => {
  const record = sample(); delete record.source_refs; record.secret = "no";
  const errors = validateRecord(record);
  assert.ok(errors.some(x => x.includes("source_refs is required")));
  assert.ok(errors.some(x => x.includes("secret is not allowed")));
});
test("rejects invalid identifiers and enum values", () => {
  const record = sample(); record.id = "Bad ID"; record.status = "production";
  assert.ok(validateRecord(record).length >= 2);
});
test("persists records with revision and content digest and rejects duplicate IDs", async () => {
  const dir = await mkdtemp(join(tmpdir(), "lkis-"));
  try {
    const store = new RecordStore(join(dir, "records.json"));
    const first = await store.create(sample());
    assert.equal(first.conflict, false); assert.equal(first.row.revision, 1);
    assert.match(first.row.sha256, /^[a-f0-9]{64}$/);
    assert.equal((await store.create(sample())).conflict, true);
    assert.equal((await store.list()).length, 1);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("requires evidence and records an independent verification revision", async () => {
  const dir = await mkdtemp(join(tmpdir(), "lkis-review-"));
  try {
    const store = new RecordStore(join(dir, "records.json"));
    const proposed = sample();
    await store.create(proposed);
    const blocked = await store.verify(proposed.id, "reviewer-1");
    assert.equal(blocked.missingEvidence, true);
    proposed.evidence_refs = ["https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/562"];
    const replacement = new RecordStore(join(dir, "reviewable.json"));
    await replacement.create(proposed);
    const accepted = await replacement.verify(proposed.id, "independent-reviewer");
    assert.equal(accepted.row.record.status, "verified");
    assert.equal(accepted.row.revision, 2);
    assert.equal(accepted.row.reviewed_by, "independent-reviewer");
    assert.equal(accepted.row.record.change_history.length, 1);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
