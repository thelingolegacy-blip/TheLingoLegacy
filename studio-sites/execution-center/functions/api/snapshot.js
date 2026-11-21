const REPO = "thelingolegacy-blip/TheLingoLegacy";
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };
const MAX_PR_PAGES = 3;
const PR_PAGE_SIZE = 100;

async function github(path) {
  const response = await fetch("https://api.github.com/repos/" + REPO + path, {
    headers: { "Accept": "application/vnd.github+json", "User-Agent": "LINGOlegacy-Execution-Center-Preview" }
  });
  if (!response.ok) throw new Error("GitHub API " + response.status + " for " + path);
  return response.json();
}

async function listOpenPullRequests() {
  const items = [];
  let page = 1;
  let truncated = false;
  while (page <= MAX_PR_PAGES) {
    const batch = await github("/pulls?state=open&per_page=" + PR_PAGE_SIZE + "&page=" + page);
    if (!Array.isArray(batch)) throw new Error("GitHub open-PR endpoint returned a non-array response");
    items.push(...batch);
    if (batch.length < PR_PAGE_SIZE) break;
    page += 1;
  }
  if (page > MAX_PR_PAGES && items.length === MAX_PR_PAGES * PR_PAGE_SIZE) truncated = true;
  return {
    items: items.map(pr => ({
      number: pr.number, title: pr.title, state: pr.state, draft: pr.draft,
      html_url: pr.html_url, head_sha: pr.head?.sha, head_ref: pr.head?.ref,
      updated_at: pr.updated_at
    })),
    pagesRead: Math.min(page, MAX_PR_PAGES),
    truncated
  };
}

async function probe(path) {
  try {
    const response = await fetch("https://thelingolegacy.com" + path, { method: "GET", redirect: "manual" });
    return { path, status: response.status, ok: response.ok, note: response.ok ? "Public GET responded successfully" : "Public GET returned a non-success HTTP status" };
  } catch (error) {
    return { path, status: null, ok: false, error: String(error), note: "Probe failed; result is explicitly unavailable" };
  }
}

function settledValue(result) { return result.status === "fulfilled" ? result.value : null; }
function settledError(result) { return result.status === "rejected" ? String(result.reason) : null; }
function decodeFile(result) {
  const file = settledValue(result);
  if (!file?.content) return null;
  try { return JSON.parse(atob(file.content.replace(/\n/g, ""))); } catch { return null; }
}

export async function onRequestGet() {
  const paths = [
    github("/commits/main"),
    github("/actions/runs?per_page=10"),
    listOpenPullRequests(),
    probe("/healthz"),
    probe("/api/v1/platform/status"),
    probe("/api/v1/platform/gates"),
    github("/contents/firebase.json"),
    github("/contents/.firebaserc")
  ];
  const results = await Promise.allSettled(paths);
  const [main, runs, pullRequests, health, platform, gates, firebase, firebaserc] = results;
  const prPage = settledValue(pullRequests);
  const probeResults = [health, platform, gates].map(result =>
    result.status === "fulfilled" ? result.value : {
      path: "probe-request", status: null, ok: false,
      error: String(result.reason), note: "Probe request failed before an HTTP response was received"
    }
  );
  const errors = {
    main: settledError(main),
    actionsRuns: settledError(runs),
    pullRequests: settledError(pullRequests),
    firebaseConfig: settledError(firebase),
    firebaseProjectAlias: settledError(firebaserc)
  };
  for (const [source, error] of Object.entries(errors)) {
    if (error) probeResults.push({
      path: "github:" + source, status: null, ok: false, error,
      note: "GitHub source request failed; this is not an empty or successful result"
    });
  }
  const mainCommit = settledValue(main);
  const workflowRuns = settledValue(runs);
  return new Response(JSON.stringify({
    generatedAt: new Date().toISOString(),
    github: {
      main: mainCommit ? {
        sha: mainCommit.sha,
        message: mainCommit.commit?.message,
        committedAt: mainCommit.commit?.committer?.date,
        html_url: mainCommit.html_url
      } : null,
      runs: workflowRuns?.workflow_runs || [],
      pullRequests: (prPage?.items || []).slice(0, 30),
      pullRequestInventory: {
        totalOpenPullRequestsObserved: prPage?.items?.length || 0,
        dashboardRows: Math.min(prPage?.items?.length || 0, 30),
        pagesRead: prPage?.pagesRead || 0,
        pageSize: PR_PAGE_SIZE,
        maxPages: MAX_PR_PAGES,
        truncated: prPage?.truncated ?? false,
        scope: "Open pull requests only; newest ordering follows GitHub API default"
      }
    },
    sourceErrors: errors,
    probes: probeResults,
    firebase: {
      publicDirectory: decodeFile(firebase)?.hosting?.public || null,
      project: decodeFile(firebaserc)?.projects?.default || null
    },
    limitations: [
      "Public GitHub API and public HTTPS GETs only.",
      "Open pull requests are paginated with a bounded maximum of three pages; truncated inventory is explicitly marked.",
      "Failed source requests and failed probes remain visible as error states and are never silently filtered out.",
      "No account secrets, Firebase credentials, private repository settings, GitHub approvals, DNS mutations, Worker deployments or release actions are accessed."
    ]
  }), { headers: JSON_HEADERS });
}
