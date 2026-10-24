/**
 * LINGOassister append-only incident journal.
 *
 * Local Node.js adapter only: no network, credentials, command execution, or
 * production actions. Hash chaining makes accidental edits detectable; it is
 * not a substitute for authenticated storage, access controls, backups, or
 * independent evidence verification. Use one writer per journal file.
 */
import { createHash } from "node:crypto";
import { open, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { mkdir } from "node:fs/promises";

const GENESIS = "0".repeat(64);

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function digestEvent(event) {
  return createHash("sha256").update(canonical({
    schemaVersion: event.schemaVersion,
    sequence: event.sequence,
    previousDigest: event.previousDigest,
    payload: event.payload
  })).digest("hex");
}

function requireText(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

export function validateJournalEvent(event, expectedSequence, expectedPreviousDigest) {
  if (!event || typeof event !== "object" || Array.isArray(event)) throw new TypeError("event must be an object");
  if (event.schemaVersion !== 1) throw new Error("Unsupported journal schema version");
  if (event.sequence !== expectedSequence) throw new Error("Journal sequence mismatch");
  if (event.previousDigest !== expectedPreviousDigest) throw new Error("Journal previous digest mismatch");
  if (!event.payload || typeof event.payload !== "object" || Array.isArray(event.payload)) {
    throw new TypeError("event.payload must be an object");
  }
  requireText(event.payload.eventId, "payload.eventId");
  requireText(event.payload.incidentId, "payload.incidentId");
  requireText(event.payload.type, "payload.type");
  requireText(event.payload.observedAt, "payload.observedAt");
  requireText(event.payload.source, "payload.source");
  if (!Number.isFinite(Date.parse(event.payload.observedAt))) throw new TypeError("payload.observedAt must be a valid timestamp");
  if (event.digest !== digestEvent(event)) throw new Error("Journal event digest mismatch");
  return true;
}

export async function readIncidentJournal(path) {
  let content;
  try {
    content = await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return { events: [], lastDigest: GENESIS };
    throw error;
  }
  if (!content) return { events: [], lastDigest: GENESIS };
  const lines = content.split("\n");
  if (lines.at(-1) === "") lines.pop();
  const events = [];
  const eventIds = new Set();
  let previousDigest = GENESIS;
  for (let index = 0; index < lines.length; index += 1) {
    let event;
    try { event = JSON.parse(lines[index]); }
    catch { throw new Error(`Invalid JSON in journal line ${index + 1}`); }
    validateJournalEvent(event, index + 1, previousDigest);
    if (eventIds.has(event.payload.eventId)) throw new Error(`Duplicate event ID: ${event.payload.eventId}`);
    eventIds.add(event.payload.eventId);
    events.push(event);
    previousDigest = event.digest;
  }
  return { events, lastDigest: previousDigest };
}

export async function appendIncidentEvent(path, payload) {
  const normalized = {
    eventId: requireText(payload?.eventId, "eventId"),
    incidentId: requireText(payload?.incidentId, "incidentId"),
    type: requireText(payload?.type, "type"),
    observedAt: requireText(payload?.observedAt, "observedAt"),
    source: requireText(payload?.source, "source"),
    data: payload?.data ?? null
  };
  if (!Number.isFinite(Date.parse(normalized.observedAt))) throw new TypeError("observedAt must be a valid timestamp");
  const current = await readIncidentJournal(path);
  if (current.events.some(event => event.payload.eventId === normalized.eventId)) {
    throw new Error(`Duplicate event ID: ${normalized.eventId}`);
  }
  const event = {
    schemaVersion: 1,
    sequence: current.events.length + 1,
    previousDigest: current.lastDigest,
    payload: normalized
  };
  event.digest = digestEvent(event);
  await mkdir(dirname(path), { recursive: true });
  const handle = await open(path, "a");
  try {
    await handle.write(`${JSON.stringify(event)}\n`);
    await handle.sync();
  } finally {
    await handle.close();
  }
  return event;
}

export const JOURNAL_GENESIS_DIGEST = GENESIS;
