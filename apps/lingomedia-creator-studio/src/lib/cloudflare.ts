/**
 * Typed Cloudflare D1 boundary.
 * The browser UI never receives D1 credentials or binding objects.
 * Wire this repository from a same-origin Worker route at deployment time.
 */
export interface D1Result<T> {
  results: T[];
  success: boolean;
  meta?: { changes?: number };
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface CreatorMediaRecord {
  id: string;
  title: string;
  kind: "Video" | "Audio" | "Image" | "Document";
  status: "Draft" | "Published" | "Processing";
  creator: string;
  created_at: string;
}

export class MediaRepository {
  constructor(private readonly db: D1Database) {}

  async list(): Promise<CreatorMediaRecord[]> {
    const result = await this.db.prepare(
      "SELECT id, title, kind, status, creator, created_at FROM media ORDER BY created_at DESC LIMIT 100"
    ).all<CreatorMediaRecord>();
    if (!result.success) throw new Error("Media query failed");
    return result.results;
  }

  async create(input: Pick<CreatorMediaRecord, "id" | "title" | "kind" | "creator">): Promise<void> {
    await this.db.prepare(
      "INSERT INTO media (id, title, kind, status, creator) VALUES (?, ?, ?, 'Draft', ?)"
    ).bind(input.id, input.title, input.kind, input.creator).run();
  }
}