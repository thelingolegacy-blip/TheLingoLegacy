const GATES = Object.freeze({
  G00_SOURCE_AUTHORITY: "PASS",
  G01_REPOSITORY: "PASS",
  G02_RUNNER: "BLOCKED",
  G03_CI_EXECUTION: "BLOCKED",
  G04_CERTIFICATION: "BLOCKED",
  G05_RELEASE_CANDIDATE: "BLOCKED",
  G06_DEPLOYMENT: "BLOCKED",
  G07_LIVE_VALIDATION: "BLOCKED",
  G08_SYNCHRONIZATION: "BLOCKED",
  G09_ACTIVATION: "BLOCKED",
  G10_POST_ACTIVATION: "BLOCKED",
  G11_ACCEPTANCE: "BLOCKED"
});

module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  return res.status(200).json({
    ok: true,
    runtime: "vercel-preview-contract",
    status: "PREVIEW_ONLY",
    generated_at: new Date().toISOString(),
    release_locked: true,
    production_mutation: false,
    backend_integrations: "NOT_VERIFIED",
    gates: GATES
  });
};
