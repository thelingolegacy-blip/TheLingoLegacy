import { GATES, G02_PREDICATES, parseEvidenceJson, parseSha256Manifest, sha256Hex, summarizeEvidence, getGateDisplayStatus } from "./evidence-core.mjs";

const byId = id => document.getElementById(id);
const timeline = [];
let currentEvidence = null;
let currentFileBytes = null;
const demoPredicates = [
  ["P1", "Matching runner exists", "UNKNOWN"],
  ["P2", "Runner ID greater than zero", "FAIL"],
  ["P3", "Runner name populated and matches", "FAIL"],
  ["P4", "Job assigned to runner", "FAIL"],
  ["P5", "Steps instantiated", "FAIL"],
  ["P6", "Sentinel steps executed", "FAIL"],
  ["P7", "Job logs generated", "UNKNOWN"],
  ["P8", "Job logs retrievable", "FAIL"],
  ["P9", "Artifact independently verified", "FAIL"]
];

function addTimeline(title, detail) {
  timeline.unshift({ at: new Date().toISOString(), title, detail });
  renderTimeline();
}
function renderGates() {
  byId("gate-grid").replaceChildren();
  GATES.forEach(gate => {
    const card = document.createElement("div");
    const status = getGateDisplayStatus(gate.status);
    card.className = "gate " + status.toLowerCase();
    const name = document.createElement("span");
    name.textContent = gate.id + " · " + gate.name;
    const value = document.createElement("strong");
    value.textContent = status;
    card.append(name, value);
    byId("gate-grid").append(card);
  });
}
function renderPredicates(items) {
  byId("predicate-list").replaceChildren();
  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "predicate";
    const label = document.createElement("span");
    label.textContent = item[0] + " · " + item[1];
    const value = document.createElement("b");
    value.textContent = item[2];
    row.append(label, value);
    byId("predicate-list").append(row);
  });
}
function renderTimeline() {
  byId("timeline").replaceChildren();
  if (!timeline.length) {
    const item = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = "Session started";
    const detail = document.createElement("p");
    detail.textContent = "No evidence actions recorded yet.";
    item.append(strong, detail);
    byId("timeline").append(item);
    return;
  }
  timeline.forEach(entry => {
    const item = document.createElement("li");
    const time = document.createElement("time");
    time.dateTime = entry.at;
    time.textContent = entry.at;
    const strong = document.createElement("strong");
    strong.textContent = entry.title;
    const detail = document.createElement("p");
    detail.textContent = entry.detail;
    item.append(time, strong, detail);
    byId("timeline").append(item);
  });
}
function setResult(kind, title, detail) {
  const box = byId("validation-result");
  box.className = "result-box " + kind;
  const strong = document.createElement("strong");
  strong.textContent = title;
  const span = document.createElement("span");
  span.textContent = detail;
  box.replaceChildren(strong, span);
}
function safeShortSummary(summary) {
  return JSON.stringify({
    captured_at_utc: summary.captured_at_utc,
    source_sha: summary.source_sha,
    declared_g02: summary.declared_g02,
    run_count: summary.run_count,
    runs: summary.runs,
    derived: summary.derived
  }, null, 2);
}
async function validateEvidence() {
  const file = byId("evidence-file").files[0];
  const manifest = byId("manifest-file").files[0];
  if (!file) {
    setResult("bad", "Evidence required", "Choose a JSON evidence packet first.");
    return;
  }
  try {
    const text = await file.text();
    const parsed = parseEvidenceJson(text);
    if (!parsed.ok) {
      setResult("bad", "Invalid packet", parsed.error);
      addTimeline("Evidence rejected", parsed.error);
      return;
    }
    currentFileBytes = new Uint8Array(await file.arrayBuffer());
    const digest = await sha256Hex(currentFileBytes);
    let manifestState = "NOT PROVIDED";
    if (manifest) {
      const manifestDigest = parseSha256Manifest(await manifest.text());
      if (!manifestDigest) {
        manifestState = "INVALID MANIFEST";
      } else if (manifestDigest !== digest) {
        manifestState = "MISMATCH";
      } else {
        manifestState = "MATCH";
      }
    }
    currentEvidence = parsed.packet;
    const summary = summarizeEvidence(parsed.packet);
    byId("evidence-summary").hidden = false;
    byId("evidence-summary").textContent = safeShortSummary(summary) + "\n\nFile SHA-256: " + digest + "\nManifest: " + manifestState;
    const hasMismatch = manifestState === "MISMATCH" || manifestState === "INVALID MANIFEST";
    setResult(hasMismatch ? "bad" : "good",
      hasMismatch ? "Packet parsed; checksum check failed" : "Packet parsed",
      "SHA-256: " + digest + ". Manifest: " + manifestState + ". Parsing and checksum do not prove authenticity or that a CI job executed.");
    if (summary.derived.runner_assignment_observed) {
      renderPredicates(G02_PREDICATES.map(p => [p[0], p[1], p[0] === "P2" || p[0] === "P3" || p[0] === "P4" ? "OBSERVED · REVIEW" : "UNKNOWN"]));
    } else {
      renderPredicates(demoPredicates);
    }
    addTimeline("Evidence packet parsed", file.name + " · SHA-256 " + digest + " · manifest " + manifestState + " · G02 PASS not inferred.");
  } catch (error) {
    setResult("bad", "Validation error", error instanceof Error ? error.message : "Unknown validation error.");
  }
}
function exportReview() {
  const packet = {
    schema: "lingoassist-recovery-review/v1",
    exported_at_utc: new Date().toISOString(),
    mode: "local-prototype-no-live-github-connection",
    production_mutation_performed: false,
    current_evidence_summary: currentEvidence ? summarizeEvidence(currentEvidence) : null,
    timeline,
    limitations: [
      "No live GitHub API connection is configured.",
      "A local file checksum does not prove evidence authenticity.",
      "No gate can be passed from this prototype alone.",
      "Timeline is session-only and not durable storage.",
      "No runner registration, workflow dispatch, deployment, or production mutation is available."
    ]
  };
  const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "lingoassist-recovery-review-" + new Date().toISOString().replace(/[:.]/g, "-") + ".json";
  anchor.click();
  URL.revokeObjectURL(url);
  addTimeline("Review exported", "Local review JSON generated; no production action performed.");
}
byId("validate-btn").addEventListener("click", validateEvidence);
byId("export-btn").addEventListener("click", exportReview);
byId("capture-time").textContent = "LOCAL SESSION · " + new Date().toISOString();
renderGates();
renderPredicates(demoPredicates);
renderTimeline();
addTimeline("Prototype initialized", "Historical demo fixture only. No live GitHub connection.");
