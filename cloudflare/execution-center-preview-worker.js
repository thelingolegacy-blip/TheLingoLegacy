const PAGE_URL = "https://raw.githubusercontent.com/thelingolegacy-blip/TheLingoLegacy/5e8b7c8c53a907a2bba3465c4c1c81a6259971ad/studio-sites/execution-center/index.html";
const REPO = "thelingolegacy-blip/TheLingoLegacy";
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };
async function github(path) {
  const r = await fetch("https://api.github.com/repos/" + REPO + path, { headers: { "Accept": "application/vnd.github+json", "User-Agent": "LINGOlegacy-Execution-Center-Preview" } });
  if (!r.ok) throw new Error("GitHub API " + r.status + " for " + path);
  return r.json();
}
async function probe(path) {
  try {
    const r = await fetch("https://thelingolegacy.com" + path, { method: "GET", redirect: "manual" });
    return { path, status: r.status, note: r.ok ? "Public GET responded" : "Public GET did not return success" };
  } catch (e) { return { path, error: String(e), note: "Probe unavailable" }; }
}
function unwrap(result) { return result.status === "fulfilled" ? result.value : null; }
function decodeFile(result) {
  const f = unwrap(result);
  if (!f?.content) return null;
  try { return JSON.parse(atob(f.content.replace(/\n/g, ""))); } catch { return null; }
}
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405, headers: { "allow": "GET, HEAD" } });
    if (url.pathname === "/healthz") return new Response(JSON.stringify({ ok: true, service: "lingo-execution-center-preview", mode: "read-only", timestamp: new Date().toISOString() }), { headers: JSON_HEADERS });
    if (url.pathname === "/api/snapshot") {
      const results = await Promise.allSettled([
        github("/commits/main"),
        github("/actions/runs?per_page=10"),
        Promise.all([548, 602, 614, 615].map(n => github("/pulls/" + n))),
        probe("/healthz"), probe("/api/v1/platform/status"), probe("/api/v1/platform/gates"),
        github("/contents/firebase.json"), github("/contents/.firebaserc")
      ]);
      const [main, runs, prs, health, platform, gates, firebase, firebaserc] = results;
      const prList = unwrap(prs) || [];
      return new Response(JSON.stringify({
        generatedAt: new Date().toISOString(),
        github: {
          main: unwrap(main) ? { sha: unwrap(main).sha, message: unwrap(main).commit?.message, committedAt: unwrap(main).commit?.committer?.date, html_url: unwrap(main).html_url } : null,
          runs: unwrap(runs)?.workflow_runs || [],
          pullRequests: prList.map(p => ({ number: p.number, title: p.title, state: p.state, draft: p.draft, html_url: p.html_url, head_sha: p.head?.sha }))
        },
        probes: [unwrap(health), unwrap(platform), unwrap(gates)].filter(Boolean),
        firebase: { publicDirectory: decodeFile(firebase)?.hosting?.public || null, project: decodeFile(firebaserc)?.projects?.default || null },
        limitations: ["Public GitHub API and public HTTPS GETs only.", "No account secrets, Firebase credentials, private repository settings, GitHub approvals, DNS mutations, Worker deployments or release actions are accessed."]
      }), { headers: JSON_HEADERS });
    }
    const page = await fetch(PAGE_URL, { headers: { "Accept": "text/html" } });
    if (!page.ok) return new Response("Preview page source unavailable", { status: 503, headers: { "cache-control": "no-store" } });
    const headers = {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "referrer-policy": "strict-origin-when-cross-origin",
      "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
      "content-security-policy": "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'; img-src 'self' data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests",
      "x-robots-tag": "noindex, nofollow"
    };
    return new Response(request.method === "HEAD" ? null : page.body, { status: page.status, headers });
  }
};