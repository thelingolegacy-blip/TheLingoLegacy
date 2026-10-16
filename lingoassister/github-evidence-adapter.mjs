const API_ORIGIN = "https://api.github.com";
const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SHA_PATTERN = /^[a-f0-9]{40}$/;
function requiredText(value, field) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}
function parseTimestamp(value) {
  if (typeof value !== "string") return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}
function githubWebUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com" ? url.href : null;
  } catch { return null; }
}
/** Read-only GitHub Actions collector. Collection never counts as independent verification. */
export function createGitHubEvidenceAdapter({
  fetchImpl = globalThis.fetch,
  clock = () => new Date(),
  maxAgeMs = 24 * 60 * 60 * 1000
} = {}) {
  if (typeof fetchImpl !== "function") throw new TypeError("fetchImpl must be a function");
  if (!Number.isFinite(maxAgeMs) || maxAgeMs < 0) throw new TypeError("maxAgeMs must be a non-negative finite number");
  async function getJson(path) {
    const url = new URL(path, API_ORIGIN);
    if (url.origin !== API_ORIGIN || !url.pathname.startsWith("/repos/")) throw new Error("GitHub evidence URL rejected");
    const response = await fetchImpl(url, { method: "GET", headers: {
      accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28"
    }, redirect: "error" });
    if (!response || response.ok !== true) throw new Error(`GitHub evidence request failed: HTTP ${response?.status ?? "unknown"}`);
    const body = await response.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("GitHub evidence response must be a JSON object");
    return body;
  }
  return Object.freeze({
    async collectWorkflowRun({ repository, runId, expectedCommit }) {
      repository = requiredText(repository, "repository");
      expectedCommit = requiredText(expectedCommit, "expectedCommit").toLowerCase();
      if (!REPO_PATTERN.test(repository)) throw new TypeError("repository must be owner/name");
      if (!/^\d+$/.test(String(runId)) || !Number.isSafeInteger(Number(runId)) || Number(runId) <= 0) throw new TypeError("runId must be a positive safe integer");
      if (!SHA_PATTERN.test(expectedCommit)) throw new TypeError("expectedCommit must be a full 40-character SHA");
      const requestedRunId = Number(runId);
      const encodedRepo = repository.split("/").map(encodeURIComponent).join("/");
      const run = await getJson(`/repos/${encodedRepo}/actions/runs/${requestedRunId}`);
      if (!Number.isSafeInteger(run.id) || run.id <= 0) throw new Error("GitHub evidence response is missing a valid run ID");
      const headSha = typeof run.head_sha === "string" ? run.head_sha.toLowerCase() : null;
      const repositoryFullName = typeof run.repository?.full_name === "string" ? run.repository.full_name : null;
      const repositoryMatches = repositoryFullName !== null && repositoryFullName.toLowerCase() === repository.toLowerCase();
      const commitMatches = headSha === expectedCommit;
      const returnedRunIdMatches = run.id === requestedRunId;
      const collectedDate = clock();
      const collectedAt = collectedDate instanceof Date && Number.isFinite(collectedDate.getTime()) ? collectedDate.toISOString() : null;
      if (!collectedAt) throw new TypeError("clock must return a valid Date");
      const sourceUpdatedAt = parseTimestamp(run.updated_at);
      const sourceCreatedAt = parseTimestamp(run.created_at);
      const sourceStartedAt = parseTimestamp(run.run_started_at);
      const ageMs = sourceUpdatedAt ? collectedDate.getTime() - Date.parse(sourceUpdatedAt) : null;
      const freshness = ageMs === null ? "UNKNOWN" : ageMs < 0 ? "FUTURE_DATED" : ageMs > maxAgeMs ? "STALE" : "FRESH";
      return Object.freeze({
        schemaVersion: 2,
        evidenceId: `github-actions-run:${repository}:${run.id}`,
        kind: "github-actions-workflow-run",
        source: API_ORIGIN,
        requestedRepository: repository,
        repository: repositoryFullName,
        runId: run.id,
        requestedRunId,
        runIdMatches: returnedRunIdMatches,
        workflowId: Number.isSafeInteger(run.workflow_id) ? run.workflow_id : null,
        runNumber: Number.isSafeInteger(run.run_number) ? run.run_number : null,
        runAttempt: Number.isSafeInteger(run.run_attempt) ? run.run_attempt : null,
        event: typeof run.event === "string" ? run.event : null,
        branch: typeof run.head_branch === "string" ? run.head_branch : null,
        headRepository: typeof run.head_repository?.full_name === "string" ? run.head_repository.full_name : null,
        runUrl: githubWebUrl(run.html_url),
        workflowName: typeof run.name === "string" ? run.name : null,
        status: typeof run.status === "string" ? run.status : "unknown",
        conclusion: typeof run.conclusion === "string" ? run.conclusion : null,
        sourceCreatedAt, sourceStartedAt, sourceUpdatedAt,
        headSha, expectedCommit,
        correlationKey: `${repository}@${expectedCommit}`,
        correlation: {
          repositoryMatches,
          commitMatches,
          runIdMatches: returnedRunIdMatches,
          verified: repositoryMatches && commitMatches && returnedRunIdMatches
        },
        collectedAt,
        ageMs,
        freshness,
        retrieval: { outcome: "SUCCESS", httpStatus: 200, sourceRecordValidated: true },
        independentlyVerified: false,
        accepted: false
      });
    }
  });
}
