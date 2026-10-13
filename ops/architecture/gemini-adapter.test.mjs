import test from "node:test";
import assert from "node:assert/strict";
import { callGemini, GeminiAdapterError } from "./gemini-adapter.mjs";

const baseEnv = {
  AI_ENABLED: "true",
  AI_ENVIRONMENT: "staging",
  GEMINI_API_KEY: "test-key-never-real",
  AI_MODEL: "gemini-test-model",
  AI_MODEL_ALLOWLIST: "gemini-test-model",
  AI_MAX_OUTPUT_TOKENS: "128",
  AI_REQUEST_TIMEOUT_MS: "1000"
};

const authorized = { requestAuthorized: true, mode: "analyze", prompt: "Summarize this synthetic test input.", env: baseEnv };

test("defaults closed when caller is not authorized", async () => {
  await assert.rejects(() => callGemini({ ...authorized, requestAuthorized: false, fetchImpl: async () => { throw new Error("must not fetch"); } }), { code: "UNAUTHORIZED" });
});

test("defaults closed when AI is disabled", async () => {
  await assert.rejects(() => callGemini({ ...authorized, env: { ...baseEnv, AI_ENABLED: "false" }, fetchImpl: async () => { throw new Error("must not fetch"); } }), { code: "AI_DISABLED" });
});

test("refuses production environment", async () => {
  await assert.rejects(() => callGemini({ ...authorized, env: { ...baseEnv, AI_ENVIRONMENT: "production" }, fetchImpl: async () => { throw new Error("must not fetch"); } }), { code: "ENVIRONMENT_BLOCKED" });
});

test("refuses a model that is not explicitly allowlisted", async () => {
  await assert.rejects(() => callGemini({ ...authorized, env: { ...baseEnv, AI_MODEL: "unapproved-model" }, fetchImpl: async () => { throw new Error("must not fetch"); } }), { code: "MODEL_NOT_ALLOWLISTED" });
});

test("sends key in a server-side header and returns a typed result", async () => {
  let captured;
  const fetchImpl = async (url, init) => {
    captured = { url, init, body: JSON.parse(init.body) };
    return {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "Synthetic answer" }] } }],
        usageMetadata: { totalTokenCount: 12 }
      })
    };
  };
  const result = await callGemini({ ...authorized, fetchImpl });
  assert.equal(result.text, "Synthetic answer");
  assert.equal(result.mode, "analyze");
  assert.equal(captured.init.headers["x-goog-api-key"], "test-key-never-real");
  assert.equal(captured.url.includes("test-key-never-real"), false);
  assert.equal(captured.body.generationConfig.maxOutputTokens, 128);
  assert.equal(captured.body.tools, undefined);
});

test("refuses missing secret before network access", async () => {
  await assert.rejects(() => callGemini({ ...authorized, env: { ...baseEnv, GEMINI_API_KEY: "" }, fetchImpl: async () => { throw new Error("must not fetch"); } }), { code: "MISSING_SECRET" });
});

test("rejects oversized prompts before network access", async () => {
  await assert.rejects(() => callGemini({ ...authorized, prompt: "x".repeat(12001), fetchImpl: async () => { throw new Error("must not fetch"); } }), { code: "INVALID_PROMPT" });
});
