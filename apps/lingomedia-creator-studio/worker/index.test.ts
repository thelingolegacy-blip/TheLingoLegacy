import { beforeEach, describe, expect, it, vi } from "vitest";
import worker from "./index";

const TOKEN = "test-token-that-is-long-enough-to-pass-the-minimum-length-check";
function makeEnv() {
  const rows: Record<string, unknown>[] = [];
  const db = {
    prepare: vi.fn(() => ({
      bind: (...values: unknown[]) => ({
        run: async () => {
          rows.push({ id: values[0], title: values[1], kind: values[2], status: "Draft", creator: values[3] });
          return { success: true };
        },
        all: async () => ({ success: true, results: rows })
      }),
      run: async () => ({ success: true }),
      all: async () => ({ success: true, results: rows })
    }))
  };
  return { DB: db, MEDIA_API_TOKEN: TOKEN };
}
function request(path: string, init: RequestInit = {}) {
  return new Request(`https://studio.example.test${path}`, init);
}
function auth() {
  return { authorization: `Bearer ${TOKEN}` };
}

describe("Creator Studio Worker API", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("keeps the health endpoint public and reports the service", async () => {
    const response = await worker.fetch(request("/api/health"), makeEnv());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, api: "protected" });
  });

  it("fails closed when the API secret is not configured", async () => {
    const env = makeEnv();
    (env as { MEDIA_API_TOKEN?: string }).MEDIA_API_TOKEN = undefined;
    const response = await worker.fetch(request("/api/media", { headers: auth() }), env);
    expect(response.status).toBe(503);
  });

  it("rejects requests without a valid bearer token", async () => {
    const response = await worker.fetch(request("/api/media"), makeEnv());
    expect(response.status).toBe(401);
  });

  it("rejects unsupported methods", async () => {
    const response = await worker.fetch(request("/api/media", { method: "DELETE", headers: auth() }), makeEnv());
    expect(response.status).toBe(405);
  });

  it("validates media payloads before writing", async () => {
    const response = await worker.fetch(request("/api/media", {
      method: "POST",
      headers: { ...auth(), "content-type": "application/json" },
      body: JSON.stringify({ title: "", kind: "Video", creator: "Z" })
    }), makeEnv());
    expect(response.status).toBe(422);
  });

  it("creates a draft media record for an authorized request", async () => {
    const env = makeEnv();
    const response = await worker.fetch(request("/api/media", {
      method: "POST",
      headers: { ...auth(), "content-type": "application/json" },
      body: JSON.stringify({ title: "Studio test", kind: "Video", creator: "ZAVIONE" })
    }), env);
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ title: "Studio test", status: "Draft" });
    expect(env.DB.prepare).toHaveBeenCalledOnce();
  });

  it("rejects non-JSON write requests", async () => {
    const response = await worker.fetch(request("/api/media", {
      method: "POST",
      headers: auth(),
      body: "title=hello"
    }), makeEnv());
    expect(response.status).toBe(415);
  });
});
