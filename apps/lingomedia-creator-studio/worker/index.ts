export interface Env {
  DB: D1Database;
  /** Configure as a Cloudflare secret in a non-production environment before enabling the API. */
  MEDIA_API_TOKEN?: string;
}
interface D1Result<T> { results: T[]; success: boolean }
interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<D1Result<T>>;
  run(): Promise<{ success: boolean }>;
}
interface D1Database { prepare(query: string): D1Statement }

const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

async function authorized(request: Request, env: Env): Promise<boolean> {
  const configured = env.MEDIA_API_TOKEN;
  if (!configured || configured.length < 32) return false;
  const supplied = request.headers.get("authorization") ?? "";
  if (!supplied.startsWith("Bearer ")) return false;
  const token = supplied.slice(7);
  if (!token || token.length > 512) return false;
  const encoder = new TextEncoder();
  const [expected, actual] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(configured)),
    crypto.subtle.digest("SHA-256", encoder.encode(token))
  ]);
  const a = new Uint8Array(expected), b = new Uint8Array(actual);
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  return mismatch === 0;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/health") {
      return response({ ok: true, service: "lingomedia-creator-studio", api: "protected" });
    }
    if (url.pathname !== "/api/media") return response({ error: "Not found" }, 404);
    if (request.method !== "GET" && request.method !== "POST") {
      return response({ error: "Method not allowed" }, 405);
    }
    if (!env.MEDIA_API_TOKEN || env.MEDIA_API_TOKEN.length < 32) {
      return response({ error: "Media API is not configured for this environment" }, 503);
    }
    if (!(await authorized(request, env))) return response({ error: "Unauthorized" }, 401);

    try {
      if (request.method === "GET") {
        const result = await env.DB.prepare(
          "SELECT id, title, kind, status, creator, created_at FROM media ORDER BY created_at DESC LIMIT 100"
        ).all<Record<string, unknown>>();
        if (!result.success) return response({ error: "Unable to read media" }, 500);
        return response({ items: result.results });
      }

      const contentType = request.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().includes("application/json")) {
        return response({ error: "Content-Type must be application/json" }, 415);
      }
      const declaredLength = Number(request.headers.get("content-length") ?? "0");
      if (declaredLength > 8192) return response({ error: "Request body is too large" }, 413);
      const raw = await request.text();
      if (new TextEncoder().encode(raw).byteLength > 8192) return response({ error: "Request body is too large" }, 413);
      let body: unknown;
      try { body = JSON.parse(raw); } catch { return response({ error: "Invalid JSON body" }, 400); }
      if (!body || typeof body !== "object" || Array.isArray(body)) return response({ error: "Invalid media payload" }, 400);
      const input = body as Record<string, unknown>;
      const title = typeof input.title === "string" ? input.title.trim() : "";
      const creator = typeof input.creator === "string" ? input.creator.trim() : "";
      const allowed = ["Video", "Audio", "Image", "Document"];
      if (!title || title.length > 160 || !creator || creator.length > 80 || !allowed.includes(String(input.kind))) {
        return response({ error: "A title (1–160 chars), creator (1–80 chars), and supported kind are required" }, 422);
      }
      const id = crypto.randomUUID();
      const result = await env.DB.prepare(
        "INSERT INTO media (id, title, kind, status, creator) VALUES (?, ?, ?, 'Draft', ?)"
      ).bind(id, title, input.kind, creator).run();
      if (!result.success) return response({ error: "Unable to create media record" }, 500);
      return response({ id, title, kind: input.kind, status: "Draft", creator }, 201);
    } catch {
      return response({ error: "Internal service error" }, 500);
    }
  }
};
