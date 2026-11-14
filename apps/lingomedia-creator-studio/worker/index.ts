export interface Env {
  DB: D1Database;
}
interface D1Result<T> { results: T[]; success: boolean }
interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<D1Result<T>>;
  run(): Promise<{ success: boolean }>;
}
interface D1Database { prepare(query: string): D1Statement }

const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/health") return response({ ok: true, service: "lingomedia-creator-studio" });
    if (url.pathname !== "/api/media") return response({ error: "Not found" }, 404);
    if (request.method === "GET") {
      const result = await env.DB.prepare("SELECT id, title, kind, status, creator, created_at FROM media ORDER BY created_at DESC LIMIT 100").all<Record<string, unknown>>();
      if (!result.success) return response({ error: "Unable to read media" }, 500);
      return response({ items: result.results });
    }
    if (request.method === "POST") {
      let body: unknown;
      try { body = await request.json(); } catch { return response({ error: "Invalid JSON body" }, 400); }
      if (!body || typeof body !== "object") return response({ error: "Invalid media payload" }, 400);
      const input = body as Record<string, unknown>;
      const title = typeof input.title === "string" ? input.title.trim().slice(0, 160) : "";
      const creator = typeof input.creator === "string" ? input.creator.trim().slice(0, 80) : "";
      const allowed = ["Video", "Audio", "Image", "Document"];
      if (!title || !creator || !allowed.includes(String(input.kind))) return response({ error: "Title, creator and a supported kind are required" }, 422);
      const id = crypto.randomUUID();
      const result = await env.DB.prepare("INSERT INTO media (id, title, kind, status, creator) VALUES (?, ?, ?, 'Draft', ?)")
        .bind(id, title, input.kind, creator).run();
      if (!result.success) return response({ error: "Unable to create media record" }, 500);
      return response({ id, title, kind: input.kind, status: "Draft", creator }, 201);
    }
    return response({ error: "Method not allowed" }, 405);
  }
} satisfies ExportedHandler<Env>;

interface ExportedHandler<E> { fetch(request: Request, env: E): Promise<Response> }
