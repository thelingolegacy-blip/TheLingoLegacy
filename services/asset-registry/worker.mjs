const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer"
};
const REVIEW_TYPES = ["rights", "quality", "brand"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function reply(status, body) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}
function listEnv(value) {
  return new Set(String(value || "").split(",").map(cleanEmail).filter(Boolean));
}
function decodePart(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")));
}
function safeEqual(a, b) {
  const x = new TextEncoder().encode(String(a));
  const y = new TextEncoder().encode(String(b));
  if (x.length !== y.length) return false;
  let result = 0;
  for (let i = 0; i < x.length; i++) result |= x[i] ^ y[i];
  return result === 0;
}
let jwksCache = null;
let jwksExpires = 0;
async function accessClaims(request, env) {
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) throw new Error("Cloudflare Access authentication is required.");
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) throw new Error("Access issuer and audience are not configured.");
  const issuer = String(env.ACCESS_TEAM_DOMAIN).replace(/\/$/, "");
  if (!issuer.startsWith("https://")) throw new Error("Access issuer must use HTTPS.");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid Access token.");
  const header = decodePart(parts[0]);
  const claims = decodePart(parts[1]);
  if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported Access token signature.");
  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== issuer || !claims.exp || claims.exp <= now || (claims.nbf && claims.nbf > now + 30)) {
    throw new Error("Access token issuer or lifetime validation failed.");
  }
  const allowedAudiences = String(env.ACCESS_AUD).split(",").map(x => x.trim()).filter(Boolean);
  const tokenAudiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!allowedAudiences.some(aud => tokenAudiences.includes(aud))) throw new Error("Access application audience mismatch.");
  if (!jwksCache || jwksExpires < now) {
    const response = await fetch(issuer + "/cdn-cgi/access/certs", { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error("Unable to retrieve Cloudflare Access signing keys.");
    jwksCache = await response.json();
    jwksExpires = now + 300;
  }
  const jwk = (jwksCache.keys || []).find(key => key.kid === header.kid && key.kty === "RSA");
  if (!jwk) {
    jwksCache = null;
    throw new Error("Access signing key was not found.");
  }
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const signature = Uint8Array.from(atob(parts[2].replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(parts[2].length / 4) * 4, "=")), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, new TextEncoder().encode(parts[0] + "." + parts[1]));
  if (!valid) throw new Error("Access token signature verification failed.");
  const email = cleanEmail(claims.email);
  if (!EMAIL_RE.test(email) || claims.email_verified === false) throw new Error("A verified email identity is required.");
  return { email, subject: String(claims.sub || email) };
}
function roleFor(email, env) {
  if (listEnv(env.REGISTRY_ADMINS).has(email)) return "admin";
  if (listEnv(env.REGISTRY_REVIEWERS).has(email)) return "reviewer";
  if (listEnv(env.REGISTRY_CREATORS).has(email)) return "creator";
  return "viewer";
}
function canCreate(role) { return role === "admin" || role === "creator"; }
function canReview(role) { return role === "admin" || role === "reviewer"; }
function isSha256(value) { return /^[a-f0-9]{64}$/i.test(String(value || "")); }
function isSafeSourceUri(value) {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch { return /^r2:\/\/[a-z0-9][a-z0-9._/-]{0,500}$/i.test(value); }
}
function validateAssetInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return "A JSON object is required.";
  const name = String(input.name || "").trim();
  const category = String(input.category || "").trim();
  if (name.length < 2 || name.length > 160) return "Asset name must be 2–160 characters.";
  if (!/^[a-z0-9][a-z0-9_-]{1,63}$/i.test(category)) return "Category must use letters, numbers, underscores or hyphens.";
  if (String(input.description || "").length > 2000) return "Description is limited to 2,000 characters.";
  return null;
}
async function readJson(request) {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > 20000) throw new Error("Request body exceeds 20 KB.");
  try { return JSON.parse(raw); } catch { throw new Error("A valid JSON request body is required."); }
}
function auditStatement(env, actor, action, assetId, versionId, details, requestId) {
  return env.DB.prepare("INSERT INTO audit_events (event_id, actor_email, action, asset_id, version_id, details_json, request_id, occurred_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), actor, action, assetId || null, versionId || null, JSON.stringify(details || {}), requestId, new Date().toISOString());
}
async function getAsset(env, id) {
  return env.DB.prepare("SELECT * FROM assets WHERE asset_id = ?").bind(id).first();
}
async function ensureOwnerOrAdmin(asset, actor, role) {
  if (!asset) return reply(404, { error: "Asset not found." });
  if (role !== "admin" && asset.owner_email !== actor) return reply(403, { error: "Only the asset owner or a registry administrator may perform this action." });
  return null;
}
async function handle(request, env, ctx) {
  if (!env.DB) return reply(503, { error: "Registry database binding REGISTRY_DB is not configured." });
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const requestId = request.headers.get("cf-ray") || crypto.randomUUID();
  let identity;
  try { identity = await accessClaims(request, env); }
  catch (error) { return reply(401, { error: error.message }); }
  const role = roleFor(identity.email, env);
  const actor = identity.email;

  if (request.method !== "GET" && request.method !== "HEAD") {
    const origin = request.headers.get("origin");
    if (origin && origin !== url.origin) return reply(403, { error: "Cross-origin writes are not allowed." });
  }
  if (request.method === "GET" && path === "/api/me") {
    return reply(200, { email: actor, role, authenticated: true, writeEnabled: role !== "viewer" });
  }
  if (request.method === "GET" && path === "/api/assets") {
    const q = String(url.searchParams.get("q") || "").trim().slice(0, 120);
    const rows = q
      ? await env.DB.prepare("SELECT a.*, (SELECT COUNT(*) FROM asset_versions v WHERE v.asset_id=a.asset_id) AS version_count FROM assets a WHERE a.name LIKE ? OR a.asset_id LIKE ? OR a.category LIKE ? ORDER BY a.updated_at DESC LIMIT 200").bind("%" + q + "%", "%" + q + "%", "%" + q + "%").all()
      : await env.DB.prepare("SELECT a.*, (SELECT COUNT(*) FROM asset_versions v WHERE v.asset_id=a.asset_id) AS version_count FROM assets a ORDER BY a.updated_at DESC LIMIT 200").all();
    return reply(200, { assets: rows.results || [], requestId });
  }
  if (request.method === "GET" && path === "/api/audit") {
    if (role !== "admin" && role !== "reviewer") return reply(403, { error: "Reviewer or administrator role required." });
    const rows = await env.DB.prepare("SELECT * FROM audit_events ORDER BY occurred_at DESC LIMIT 250").all();
    return reply(200, { events: rows.results || [] });
  }
  if (request.method === "POST" && path === "/api/assets") {
    if (!canCreate(role)) return reply(403, { error: "Creator or administrator role required." });
    let input;
    try { input = await readJson(request); } catch (error) { return reply(400, { error: error.message }); }
    const invalid = validateAssetInput(input);
    if (invalid) return reply(400, { error: invalid });
    const id = "AST-" + crypto.randomUUID().toUpperCase();
    const now = new Date().toISOString();
    const statements = [
      env.DB.prepare("INSERT INTO assets (asset_id, name, category, description, owner_email, status, current_version_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'DRAFT', NULL, ?, ?)")
        .bind(id, String(input.name).trim(), String(input.category).trim().toLowerCase(), String(input.description || "").trim(), actor, now, now),
      auditStatement(env, actor, "ASSET_CREATED", id, null, { name: String(input.name).trim(), category: String(input.category).trim().toLowerCase() }, requestId)
    ];
    await env.DB.batch(statements);
    return reply(201, { assetId: id, status: "DRAFT" });
  }
  const match = path.match(/^\/api\/assets\/(AST-[A-F0-9-]+)(?:\/(versions|rights|decisions|publish|rollback))?$/i);
  if (!match) return reply(404, { error: "Route not found." });
  const assetId = match[1];
  const action = match[2] || "";
  const asset = await getAsset(env, assetId);
  if (!asset) return reply(404, { error: "Asset not found." });

  if (request.method === "GET" && !action) {
    const [versions, evidence, decisions, publications, events] = await Promise.all([
      env.DB.prepare("SELECT * FROM asset_versions WHERE asset_id=? ORDER BY version_number DESC").bind(assetId).all(),
      env.DB.prepare("SELECT * FROM rights_evidence WHERE asset_id=? ORDER BY created_at DESC").bind(assetId).all(),
      env.DB.prepare("SELECT * FROM review_decisions WHERE asset_id=? ORDER BY created_at DESC").bind(assetId).all(),
      env.DB.prepare("SELECT * FROM asset_publications WHERE asset_id=? ORDER BY created_at DESC").bind(assetId).all(),
      env.DB.prepare("SELECT * FROM audit_events WHERE asset_id=? ORDER BY occurred_at DESC LIMIT 100").bind(assetId).all()
    ]);
    return reply(200, { asset, versions: versions.results || [], rightsEvidence: evidence.results || [], decisions: decisions.results || [], publications: publications.results || [], auditEvents: events.results || [] });
  }
  if (request.method !== "POST") return reply(405, { error: "Method not allowed." });

  if (action === "versions") {
    if (!canCreate(role)) return reply(403, { error: "Creator or administrator role required." });
    const denied = await ensureOwnerOrAdmin(asset, actor, role);
    if (denied) return denied;
    let input;
    try { input = await readJson(request); } catch (error) { return reply(400, { error: error.message }); }
    if (!isSafeSourceUri(input.sourceUri)) return reply(400, { error: "Source must be an HTTPS URL or an r2:// object reference." });
    if (!isSha256(input.sha256)) return reply(400, { error: "A 64-character SHA-256 checksum is required." });
    if (!/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i.test(String(input.mediaType || ""))) return reply(400, { error: "A valid media type is required." });
    const size = Number(input.byteSize);
    if (!Number.isSafeInteger(size) || size < 0 || size > 1073741824) return reply(400, { error: "Byte size must be between 0 and 1 GiB." });
    const previous = await env.DB.prepare("SELECT COALESCE(MAX(version_number), 0) AS max_version FROM asset_versions WHERE asset_id=?").bind(assetId).first();
    const versionNumber = Number(previous?.max_version || 0) + 1;
    const versionId = "VER-" + crypto.randomUUID().toUpperCase();
    const now = new Date().toISOString();
    try {
      await env.DB.batch([
        env.DB.prepare("INSERT INTO asset_versions (version_id, asset_id, version_number, source_uri, sha256, media_type, byte_size, change_note, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .bind(versionId, assetId, versionNumber, input.sourceUri, String(input.sha256).toLowerCase(), input.mediaType, size, String(input.changeNote || "").slice(0, 1000), actor, now),
        env.DB.prepare("UPDATE assets SET current_version_id=?, status='DRAFT', updated_at=? WHERE asset_id=?").bind(versionId, now, assetId),
        auditStatement(env, actor, "VERSION_CREATED", assetId, versionId, { versionNumber, sha256: String(input.sha256).toLowerCase(), mediaType: input.mediaType, byteSize: size }, requestId)
      ]);
    } catch { return reply(409, { error: "Version could not be created. Refresh the asset and retry; version numbers are unique." }); }
    return reply(201, { versionId, versionNumber, status: "DRAFT" });
  }
  if (action === "rights") {
    const denied = await ensureOwnerOrAdmin(asset, actor, role);
    if (denied) return denied;
    let input;
    try { input = await readJson(request); } catch (error) { return reply(400, { error: error.message }); }
    if (!asset.current_version_id) return reply(409, { error: "Create a version before attaching rights evidence." });
    if (!["owned", "licensed", "public-domain", "permission-pending"].includes(input.rightsType)) return reply(400, { error: "Unsupported rights type." });
    let evidenceUrl;
    try { evidenceUrl = new URL(String(input.evidenceUri || "")); } catch { return reply(400, { error: "Evidence must be a retrievable HTTPS URL." }); }
    if (evidenceUrl.protocol !== "https:" || !evidenceUrl.hostname || String(input.evidenceUri).length > 2048) return reply(400, { error: "Evidence must be a retrievable HTTPS URL." });
    const id = "RGT-" + crypto.randomUUID().toUpperCase();
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO rights_evidence (evidence_id, asset_id, version_id, rights_type, license_name, evidence_uri, evidence_sha256, submitted_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(id, assetId, asset.current_version_id, input.rightsType, String(input.licenseName || "").slice(0, 160), input.evidenceUri, isSha256(input.evidenceSha256) ? input.evidenceSha256.toLowerCase() : null, actor, now),
      auditStatement(env, actor, "RIGHTS_EVIDENCE_ADDED", assetId, asset.current_version_id, { evidenceId: id, rightsType: input.rightsType, evidenceUri: input.evidenceUri }, requestId)
    ]);
    return reply(201, { evidenceId: id });
  }
  if (action === "decisions") {
    if (!canReview(role)) return reply(403, { error: "Independent reviewer or administrator role required." });
    if (asset.owner_email === actor) return reply(403, { error: "Segregation of duties: an asset owner cannot approve their own asset." });
    let input;
    try { input = await readJson(request); } catch (error) { return reply(400, { error: error.message }); }
    if (!asset.current_version_id) return reply(409, { error: "No current version is available for review." });
    if (!REVIEW_TYPES.includes(input.reviewType) || !["APPROVED", "REJECTED"].includes(input.decision)) return reply(400, { error: "Review type or decision is invalid." });
    const id = "REV-" + crypto.randomUUID().toUpperCase();
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO review_decisions (decision_id, asset_id, version_id, review_type, decision, reviewer_email, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(id, assetId, asset.current_version_id, input.reviewType, input.decision, actor, String(input.notes || "").slice(0, 1000), now),
      auditStatement(env, actor, "REVIEW_" + input.decision, assetId, asset.current_version_id, { reviewType: input.reviewType, decisionId: id }, requestId),
      env.DB.prepare("UPDATE assets SET status='IN_REVIEW', updated_at=? WHERE asset_id=? AND status!='PUBLISHED'").bind(now, assetId)
    ]);
    return reply(201, { decisionId: id, decision: input.decision });
  }
  if (action === "publish") {
    if (role !== "admin") return reply(403, { error: "Administrator role required for publication." });
    if (!asset.current_version_id) return reply(409, { error: "No current version exists." });
    const version = await env.DB.prepare("SELECT * FROM asset_versions WHERE version_id=? AND asset_id=?").bind(asset.current_version_id, assetId).first();
    if (!version || !isSha256(version.sha256) || !isSafeSourceUri(version.source_uri)) return reply(409, { error: "Current version lacks verified source metadata and SHA-256 integrity." });
    const evidence = await env.DB.prepare("SELECT COUNT(*) AS total FROM rights_evidence WHERE asset_id=? AND version_id=? AND rights_type IN ('owned','licensed','public-domain')").bind(assetId, version.version_id).first();
    if (!Number(evidence?.total)) return reply(409, { error: "Rights evidence is required before publication." });
    const latest = {};
    for (const type of REVIEW_TYPES) {
      latest[type] = await env.DB.prepare("SELECT decision, reviewer_email FROM review_decisions WHERE asset_id=? AND version_id=? AND review_type=? ORDER BY created_at DESC, rowid DESC LIMIT 1").bind(assetId, version.version_id, type).first();
      if (!latest[type] || latest[type].decision !== "APPROVED" || latest[type].reviewer_email === asset.owner_email) {
        return reply(409, { error: "Publication requires current approved rights, quality and brand reviews from non-owners.", missingReview: type });
      }
    }
    if (new Set(REVIEW_TYPES.map(type => latest[type].reviewer_email)).size < 2) return reply(409, { error: "At least two distinct independent reviewers are required across the three review controls." });
    const now = new Date().toISOString();
    const publicationId = "PUB-" + crypto.randomUUID().toUpperCase();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO asset_publications (publication_id, asset_id, version_id, action, actor_email, created_at) VALUES (?, ?, ?, 'PUBLISH', ?, ?)").bind(publicationId, assetId, version.version_id, actor, now),
      env.DB.prepare("UPDATE assets SET status='PUBLISHED', updated_at=? WHERE asset_id=?").bind(now, assetId),
      auditStatement(env, actor, "ASSET_PUBLISHED", assetId, version.version_id, { publicationId, sha256: version.sha256 }, requestId)
    ]);
    return reply(200, { publicationId, status: "PUBLISHED", versionId: version.version_id });
  }
  if (action === "rollback") {
    if (role !== "admin") return reply(403, { error: "Administrator role required for rollback." });
    const previous = await env.DB.prepare("SELECT version_id FROM asset_publications WHERE asset_id=? AND action='PUBLISH' AND version_id!=? ORDER BY created_at DESC, rowid DESC LIMIT 1").bind(assetId, asset.current_version_id || "").first();
    if (!previous) return reply(409, { error: "No previously published version is available for rollback." });
    const now = new Date().toISOString();
    const publicationId = "PUB-" + crypto.randomUUID().toUpperCase();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO asset_publications (publication_id, asset_id, version_id, action, actor_email, created_at) VALUES (?, ?, ?, 'ROLLBACK', ?, ?)").bind(publicationId, assetId, previous.version_id, actor, now),
      env.DB.prepare("UPDATE assets SET current_version_id=?, status='PUBLISHED', updated_at=? WHERE asset_id=?").bind(previous.version_id, now, assetId),
      auditStatement(env, actor, "ASSET_ROLLED_BACK", assetId, previous.version_id, { publicationId }, requestId)
    ]);
    return reply(200, { publicationId, status: "PUBLISHED", versionId: previous.version_id });
  }
  return reply(404, { error: "Route not found." });
}
export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
    try { return await handle(request, env, ctx); }
    catch (error) {
      return reply(500, { error: "Registry operation failed.", requestId: request.headers.get("cf-ray") || null });
    }
  }
};
export { cleanEmail, isSafeSourceUri, isSha256, validateAssetInput, roleFor };
