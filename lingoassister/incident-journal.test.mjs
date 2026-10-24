import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { appendIncidentEvent, readIncidentJournal } from "./incident-journal.mjs";

const payload = (eventId, overrides = {}) => ({
  eventId, incidentId: "INC-G02", type: "evidence.observed",
  observedAt: "2026-10-23T23:00:00.000Z", source: "github-actions-readonly-adapter",
  data: { conclusion: "startup_failure" }, ...overrides
});

async function withJournal(run) {
  const dir = await mkdtemp(join(tmpdir(), "lingoassister-journal-"));
  try { await run(join(dir, "events.jsonl")); }
  finally { await rm(dir, { recursive: true, force: true }); }
}

test("empty journal has no events", async () => withJournal(async path => {
  const result = await readIncidentJournal(path);
  assert.deepEqual(result.events, []);
  assert.equal(result.lastDigest, "0".repeat(64));
}));

test("appends ordered events with a verifiable hash chain", async () => withJournal(async path => {
  const first = await appendIncidentEvent(path, payload("EV-1"));
  const second = await appendIncidentEvent(path, payload("EV-2"));
  const result = await readIncidentJournal(path);
  assert.equal(first.sequence, 1);
  assert.equal(second.sequence, 2);
  assert.equal(second.previousDigest, first.digest);
  assert.equal(result.events.length, 2);
  assert.equal(result.lastDigest, second.digest);
}));

test("rejects duplicate event IDs", async () => withJournal(async path => {
  await appendIncidentEvent(path, payload("EV-1"));
  await assert.rejects(appendIncidentEvent(path, payload("EV-1")), /Duplicate event ID/);
}));

test("rejects malformed event payloads", async () => withJournal(async path => {
  await assert.rejects(appendIncidentEvent(path, payload("EV-1", { source: " " })), /source must be a non-empty string/);
  await assert.rejects(appendIncidentEvent(path, payload("EV-2", { observedAt: "not-a-date" })), /valid timestamp/);
}));

test("detects edits to previously recorded event data", async () => withJournal(async path => {
  await appendIncidentEvent(path, payload("EV-1"));
  const text = await readFile(path, "utf8");
  await writeFile(path, text.replace("startup_failure", "success"), "utf8");
  await assert.rejects(readIncidentJournal(path), /digest mismatch/);
}));

test("detects a removed middle event through sequence and chain validation", async () => withJournal(async path => {
  await appendIncidentEvent(path, payload("EV-1"));
  await appendIncidentEvent(path, payload("EV-2"));
  await appendIncidentEvent(path, payload("EV-3"));
  const lines = (await readFile(path, "utf8")).trimEnd().split("\n");
  await writeFile(path, `${lines[0]}\n${lines[2]}\n`, "utf8");
  await assert.rejects(readIncidentJournal(path), /sequence mismatch|previous digest mismatch/);
}));
