const REPO = "thelingolegacy-blip/TheLingoLegacy";
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };

async function github(path) {
  const response = await fetch("https://api.github.com/repos/" + REPO + path, {
    headers: { "Accept": "application/vnd.github+json", "User-Agent": "LINGOlegacy-Execution-Center-Preview" }
  });
  if (!response.ok) throw new Error("GitHub API " + response.status + " for " + path);
  return response.json();
}

async function probe(path) {
  try {
    const response = await fetch("https://thelingolegacy.com" + path, { method: "GET", redirect: "manual" });
    return { path, status: response.status, note: response.ok ? "Public GET responded" : "Public GET did not return success" };
  } catch (error) {
    return { path, error: String(error), note: "Probe unavailable" };
  }
}

function value(result) { return result.status === "fulfilled" ? result.value : null; }
function decodeFile(result) {
  const file = value(result);
  if (!file?.content) return null;
  try { return JSON.parse(atob(file.content.replace(/\n/g, ""))); } catch { return null; }
}

export async function onRequestGet() {
  const results = await Promise.allSettled([
    github("/commits/main"),
    github("/actions/runs?per_page=10"),
    Promise.all([548, 602, 614, 615].map(number => github("/pulls/" + number))),
    probe("/healthz"),
    probe("/api/v1/platform/status"),
    probe("/api/v1/platform/gates"),
    github("/contents/firebase.json"),
    github("/contents/.firebaserc")
  ]);
  const [main, runs, pullRequests, health, platform, gates, firebase, firebaserc] = results;
  const prs = value(pullRequests) || [];
  return new Response(JSON.stringify({
    generatedAt: new Date().toISOString(),
    github: {
      main: value(main) ? {
        sha: value(main).sha,
        message: value(main).commit?.message,
        committedAt: value(main).commit?.committer?.date,
        html_url: value(main).html_url
      } : null,
      runs: value(runs)?.workflow_runs || [],
      pullRequests: prs.map(pr => ({
        number: pr.number, title: pr.title, state: pr.state,
        draft: pr.draft, html_url: pr.html_url, head_sha: pr.head?.sha
      }))
    },
    probes: [value(health), value(platform), value(gates)].filter(Boolean),
    firebase: {
      publicDirectory: decodeFile(firebase)?.hosting?.public || null,
      project: decodeFile(firebaserc)?.projects?.default || null
    },
    limitations: [
      "Public GitHub API and public HTTPS GETs only.",
      "No account secrets, Firebase credentials, private repository settings, GitHub approvals, DNS mutations, Worker deployments or release actions are accessed."
    ]
  }), { headers: JSON_HEADERS });
}
