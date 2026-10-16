import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { IncidentStore } from "./incident-store.mjs";
import { appendLearningRecord, canReuseLesson, createLearningRecord, readLearningRecords } from "./learning-loop.mjs";

async function withTemp(fn) {
  const dir = await mkdtemp(join(tmpdir(), "lingo-learning-"));
  try { await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}
const base = {
  id: "LESSON-1", incidentId: "INC-G02-1", classification: "verified-lesson",
  title: "Do not repeat unchanged runner probe",
  statement: "A completed diagnostic with identical context should not be repeated without new evidence.",
  evidenceIds: ["EVID-1"],
  sourceRefs: ["https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/209"],
  contextFingerprint: "runner:hosted|workflow:static-ci|sha:abc",
  outcome: "repeat-did-not-change-dispatch",
  independentlyVerified: true, producerId: "lingoassister", verifierId: "lingoassisthem",
  reviewStatus: "accepted", createdAt: "2026-10-16T12:00:00Z", expiresAt: "2026-11-16T12:00:00Z"
};

test("verified lesson requires evidence and independent verifier", () => {
  assert.throws(() => createLearningRecord({ ...base, evidenceIds: [] }), /evidence ID/);
  assert.throws(() => createLearningRecord({ ...base, verifierId: "lingoassister" }), /independent verification/);
});
test("only accepted verified lessons with matching context are reusable", () => {
  const lesson = createLearningRecord(base);
  assert.deepEqual(canReuseLesson(lesson, { contextFingerprint: base.contextFingerprint, now: "2026-10-17T00:00:00Z" }), { reusable: true, reasons: [], actionAuthority: false });
  assert.equal(canReuseLesson(lesson, { contextFingerprint: "different-context" }).reusable, false);
  assert.equal(canReuseLesson(createLearningRecord({ ...base, reviewStatus: "proposed" }), { contextFingerprint: base.contextFingerprint }).reusable, false);
});
test("expired lessons are not reused", () => {
  const lesson = createLearningRecord({ ...base, expiresAt: "2026-10-15T00:00:00Z" });
  assert.equal(canReuseLesson(lesson, { contextFingerprint: base.contextFingerprint, now: "2026-10-16T00:00:00Z" }).reusable, false);
});
test("learning records persist through the hash-chained incident journal", async () => withTemp(async dir => {
  const store = new IncidentStore(join(dir, "incidents.jsonl"));
  const lesson = createLearningRecord(base);
  assert.equal((await appendLearningRecord(store, lesson)).persisted, true);
  assert.deepEqual(await readLearningRecords(store), [lesson]);
}));
test("secrets are rejected instead of being persisted", () => {
  assert.throws(() => createLearningRecord({ ...base, statement: "token ghp_123456789012345678901234567890123456" }), /contain a secret/);
});
test("a hypothesis cannot be marked accepted for reuse", () => {
  assert.throws(() => createLearningRecord({ ...base, classification: "causal-hypothesis", reviewStatus: "accepted" }), /only independently verified lessons/);
});
