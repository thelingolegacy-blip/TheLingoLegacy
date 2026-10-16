const API_ORIGIN = "https://api.github.com";
const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
function requiredText(value, field) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}
/** Read-only GitHub Actions collector. Collection never counts as independent verification. */
export function createGitHubEvidenceAdapter({ fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== "function") throw new TypeError("fetchImpl must be a function");
  async function getJson(path) {
    const url = new URL(path, API_ORIGIN);
    if (url.origin !== API_ORIGIN || !url.pathname.startsWith("/repos/")) throw new Error("GitHub evidence URL rejected");
    const response = await fetchImpl(url, { method: "GET", headers: {
      accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28"
    }, redirect: "error" });
    if (!response || response.ok !== true) throw new Error(`GitHub evidence request failed: HTTP ${response?.status ?? "unknown"}`);
    return response.json();
  }
  return Object.freeze({
    async collectWorkflowRun({ repository, runId, expectedCommit }) {
      repository = requiredText(repository, "repository");
      expectedCommit = requiredText(expectedCommit, "expectedCommit").toLowerCase();
      if (!REPO_PATTERN.test(repository)) throw new TypeError("repository must be owner/name");
      if (!/^\d+$/.test(String(runId)) || Number(runId) <= 0) throw new TypeError("runId must be a positive integer");
      if (!/^[a-f0-9]{40}$/.test(expectedCommit)) throw new TypeError("expectedCommit must be a full 40-character SHA");
      const encodedRepo = repository.split("/").map(encodeURIComponent).join("/");
      const run = await getJson(`/repos/${encodedRepo}/actions/runs/${Number(runId)}`);
      const headSha = typeof run.head_sha === "string" ? run.head_sha.toLowerCase() : null;
      const repositoryFullName = run.repository?.full_name ?? null;
      const repositoryMatches = typeof repositoryFullName === "string" && repositoryFullName.toLowerCase() === repository.toLowerCase();
      const commitMatches = headSha === expectedCommit;
      return Object.freeze({
        schemaVersion: 1, evidenceId: `github-actions-run:${repository}:${run.id ?? runId}`,
        kind: "github-actions-workflow-run", source: API_ORIGIN, repository: repositoryFullName,
        requestedRepository: repository, runId: Number(run.id ?? runId),
        runUrl: typeof run.html_url === "string" ? run.html_url : null,
        workflowName: typeof run.name === "string" ? run.name : null,
        status: typeof run.status === "string" ? run.status : "unknown",
        conclusion: typeof run.conclusion === "string" ? run.conclusion : null,
        headSha, expectedCommit, correlationKey: `${repository}@${expectedCommit}`,
        correlation: { repositoryMatches, commitMatches, verified: repositoryMatches && commitMatches },
        collectedAt: new Date().toISOString(), independentlyVerified: false, accepted: false
      });
    }
  });
}
