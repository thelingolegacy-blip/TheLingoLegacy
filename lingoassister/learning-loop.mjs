const LEARNING_SCHEMA = "lingo.learning.v1";
const CLASSIFICATIONS = new Set(["observed-fact", "causal-hypothesis", "repair-pattern", "verified-lesson", "rejected-lesson"]);
const SECRET_PATTERN = /(?:gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/;

function text(value, name) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`${name} must be non-empty text`);
  const result = value.trim();
  if (SECRET_PATTERN.test(result)) throw new Error(`${name} appears to contain a secret; refusing to persist it`);
  return result;
}
function uniqueTextArray(value, name) {
  if (!Array.isArray(value)) throw new TypeError(`${name} must be an array`);
  return [...new Set(value.map((item, i) => text(item, `${name}[${i}]`)))];
}
function isoDate(value, name) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new TypeError(`${name} must be a valid timestamp`);
  return date.toISOString();
}

/** Create a reviewable learning record; it never changes policy or executes repairs. */
export function createLearningRecord(input) {
  const classification = text(input?.classification, "classification");
  if (!CLASSIFICATIONS.has(classification)) throw new TypeError("unsupported learning classification");
  const evidenceIds = uniqueTextArray(input.evidenceIds ?? [], "evidenceIds");
  const independentlyVerified = input.independentlyVerified === true;
  const verifierId = input.verifierId == null ? null : text(input.verifierId, "verifierId");
  const producerId = input.producerId == null ? null : text(input.producerId, "producerId");
  if (["observed-fact", "repair-pattern", "verified-lesson"].includes(classification) && evidenceIds.length === 0) {
    throw new Error(`${classification} requires at least one evidence ID`);
  }
  if (classification === "verified-lesson" && (!independentlyVerified || !verifierId || verifierId === producerId)) {
    throw new Error("verified-lesson requires independent verification by an identity distinct from the producer");
  }
  const reviewStatus = input.reviewStatus ?? "proposed";
  if (!new Set(["proposed", "accepted", "rejected", "expired"]).has(reviewStatus)) throw new TypeError("invalid reviewStatus");
  if (reviewStatus === "accepted" && classification !== "verified-lesson") {
    throw new Error("only independently verified lessons may be accepted for reuse");
  }
  return Object.freeze({
    schemaVersion: LEARNING_SCHEMA,
    id: text(input.id, "id"),
    incidentId: text(input.incidentId, "incidentId"),
    classification,
    title: text(input.title, "title"),
    statement: text(input.statement, "statement"),
    evidenceIds,
    sourceRefs: uniqueTextArray(input.sourceRefs ?? [], "sourceRefs"),
    contextFingerprint: text(input.contextFingerprint, "contextFingerprint"),
    outcome: input.outcome == null ? "unknown" : text(input.outcome, "outcome"),
    independentlyVerified,
    producerId,
    verifierId,
    reviewStatus,
    createdAt: isoDate(input.createdAt ?? new Date().toISOString(), "createdAt"),
    expiresAt: input.expiresAt == null ? null : isoDate(input.expiresAt, "expiresAt"),
    reusePolicy: "recommendation-only; human review required; never grants action or release authority"
  });
}

/** A lesson can inform a recommendation only after review and exact-context matching. */
export function canReuseLesson(lesson, { contextFingerprint, now = new Date().toISOString() } = {}) {
  const reasons = [];
  if (!lesson || lesson.schemaVersion !== LEARNING_SCHEMA) reasons.push("unsupported_schema");
  if (lesson?.classification !== "verified-lesson") reasons.push("not_a_verified_lesson");
  if (lesson?.reviewStatus !== "accepted") reasons.push("not_accepted_by_review");
  if (lesson?.independentlyVerified !== true || !lesson?.verifierId || lesson.verifierId === lesson.producerId) reasons.push("independent_verification_missing");
  if (!Array.isArray(lesson?.evidenceIds) || lesson.evidenceIds.length === 0) reasons.push("evidence_missing");
  if (typeof contextFingerprint !== "string" || !contextFingerprint || lesson?.contextFingerprint !== contextFingerprint) reasons.push("context_mismatch");
  const nowMs = Date.parse(now);
  if (!Number.isFinite(nowMs)) reasons.push("invalid_current_time");
  if (lesson?.expiresAt != null) {
    const expiryMs = Date.parse(lesson.expiresAt);
    if (!Number.isFinite(expiryMs)) reasons.push("invalid_expiry");
    else if (Number.isFinite(nowMs) && expiryMs <= nowMs) reasons.push("lesson_expired");
  }
  return { reusable: reasons.length === 0, reasons, actionAuthority: false };
}

export async function appendLearningRecord(store, record) {
  if (!store || typeof store.append !== "function") throw new TypeError("a compatible append-only store is required");
  if (!record || record.schemaVersion !== LEARNING_SCHEMA) throw new TypeError("valid LINGO learning record required");
  await store.append({ type: LEARNING_SCHEMA, record });
  return { persisted: true, recordId: record.id };
}

export async function readLearningRecords(store) {
  if (!store || typeof store.readAll !== "function") throw new TypeError("a compatible append-only store is required");
  const entries = await store.readAll();
  return entries.filter(entry => entry?.type === LEARNING_SCHEMA && entry.record?.schemaVersion === LEARNING_SCHEMA).map(entry => entry.record);
}
