import { BigQuery } from "@google-cloud/bigquery";
import { defineString } from "firebase-functions/params";
import { onInit } from "firebase-functions/v2/core";
import { HttpsError, onCall } from "firebase-functions/v2/https";

const datasetIdParam = defineString("BIGQUERY_DATASET_ID");

let bigQuery: BigQuery | undefined;
let datasetId: string | undefined;

onInit(() => {
  const configuredDatasetId = datasetIdParam.value().trim();
  const projectId = process.env.GCLOUD_PROJECT?.trim();

  if (!projectId) {
    throw new Error("GCLOUD_PROJECT is unavailable in the Functions runtime.");
  }
  if (!/^[A-Za-z0-9_]{1,1024}$/.test(configuredDatasetId)) {
    throw new Error("BIGQUERY_DATASET_ID is missing or invalid.");
  }

  datasetId = configuredDatasetId;
  bigQuery = new BigQuery({ projectId });
});

function getEventsTable() {
  if (!bigQuery || !datasetId) {
    throw new Error("BigQuery analytics client has not initialized.");
  }
  return bigQuery.dataset(datasetId).table("events");
}

type TrackEventRequest = {
  eventId?: unknown;
  eventName?: unknown;
  product?: unknown;
  properties?: unknown;
};

type JsonPrimitive = string | number | boolean | null;

const prohibitedPropertyKey = /(email|phone|password|secret|token|address|birth|dob|ssn|payment|card|wallet|credential|auth)/i;

function validateProperties(value: unknown): Record<string, JsonPrimitive> {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpsError("invalid-argument", "properties must be a flat object.");
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > 20) {
    throw new HttpsError("invalid-argument", "properties may contain at most 20 fields.");
  }

  const result: Record<string, JsonPrimitive> = {};
  for (const [key, item] of entries) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(key) || prohibitedPropertyKey.test(key)) {
      throw new HttpsError("invalid-argument", "A properties key is not permitted.");
    }
    if (
      item !== null &&
      typeof item !== "string" &&
      typeof item !== "number" &&
      typeof item !== "boolean"
    ) {
      throw new HttpsError("invalid-argument", "properties values must be scalar values.");
    }
    if (typeof item === "string" && item.length > 256) {
      throw new HttpsError("invalid-argument", "A properties value is too long.");
    }
    if (typeof item === "number" && !Number.isFinite(item)) {
      throw new HttpsError("invalid-argument", "Numeric properties must be finite.");
    }
    result[key] = item as JsonPrimitive;
  }

  const serialized = JSON.stringify(result);
  if (serialized.length > 4000) {
    throw new HttpsError("invalid-argument", "properties payload is too large.");
  }
  return result;
}

export const trackLingoAnalyticsEvent = onCall<TrackEventRequest>(
  { enforceAppCheck: true, maxInstances: 2 },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Sign in before sending analytics events.");
    }

    const { eventId, eventName, product } = request.data ?? {};
    if (typeof eventId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId)) {
      throw new HttpsError("invalid-argument", "eventId must be a UUID.");
    }
    if (typeof eventName !== "string" || !/^[a-z][a-z0-9_]{1,63}$/.test(eventName)) {
      throw new HttpsError("invalid-argument", "eventName is invalid.");
    }
    if (product !== undefined &&
        (typeof product !== "string" || !/^[a-z][a-z0-9_-]{1,39}$/.test(product))) {
      throw new HttpsError("invalid-argument", "product is invalid.");
    }

    const properties = validateProperties(request.data?.properties);
    const row = {
      eventId,
      eventName,
      occurredAt: new Date().toISOString(),
      product: typeof product === "string" ? product : null,
      source: "firebase_callable",
      propertiesJson: JSON.stringify(properties)
    };

    try {
      await getEventsTable().insert(
        [{ insertId: eventId, json: row }],
        { raw: true }
      );
    } catch {
      // Do not log request payloads, user identifiers, or provider error bodies.
      console.error("LINGO analytics insert failed", { eventName });
      throw new HttpsError("unavailable", "Analytics is temporarily unavailable.");
    }

    // The authenticated UID is used only for authorization and is never persisted.
    return { ok: true };
  }
);
