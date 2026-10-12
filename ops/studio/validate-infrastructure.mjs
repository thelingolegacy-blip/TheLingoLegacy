import fs from "node:fs";

const requiredFiles = [
  ".github/workflows/g02-runner-assignment-probe.yml",
  ".github/workflows/studio-platform-ci.yml",
  "infra/ci/studio-pipeline-contract.json",
  "ops/studio/media-pipeline.json",
  "studio/assets/asset-registry.json",
  "studio/ops/index.html",
  "studio/ops/studio.css",
  "studio/ops/studio.js",
];
const errors = [];
for (const file of requiredFiles) if (!fs.existsSync(file)) errors.push("missing required file: " + file);

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { errors.push(file + ": invalid JSON (" + error.message + ")"); return null; }
}

const contract = readJson("infra/ci/studio-pipeline-contract.json");
const media = readJson("ops/studio/media-pipeline.json");
const registry = readJson("studio/assets/asset-registry.json");
if (contract) {
  if (contract.sourceOfTruth !== "GitHub") errors.push("source of truth must remain GitHub");
  if (contract.productionRuntime !== "Cloudflare") errors.push("production runtime must remain Cloudflare");
  if (contract.branchPolicy?.autoMerge !== false) errors.push("auto-merge must remain disabled");
  if (contract.production?.mutationFreeze !== true) errors.push("production mutation freeze must remain active");
  if (contract.production?.lastKnownGoodProtected !== true) errors.push("last-known-good must remain protected");
  if (contract.production?.activationAutomatic !== false) errors.push("automatic activation must remain disabled");
  for (const label of ["self-hosted", "linux", "x64", "lingo-g02"]) {
    if (!contract.runner?.labels?.includes(label)) errors.push("runner labels missing " + label);
  }
  if (contract.runner?.defaultSentinelEnabled !== false) errors.push("self-hosted sentinel must be opt-in by default");
}
if (media) {
  if (media.publishing?.uploadAutomatically !== false) errors.push("automatic media publishing must remain disabled");
  if (media.publishing?.productionPublishAllowed !== false) errors.push("production media publish must remain disabled");
  if (!media.qualityGates?.requireLicenseRecord) errors.push("media license gate must be required");
}
if (registry && (!Array.isArray(registry.assets) || registry.schemaVersion !== 1)) errors.push("asset registry schema invalid");

const html = fs.existsSync("studio/ops/index.html") ? fs.readFileSync("studio/ops/index.html", "utf8") : "";
const css = fs.existsSync("studio/ops/studio.css") ? fs.readFileSync("studio/ops/studio.css", "utf8") : "";
const js = fs.existsSync("studio/ops/studio.js") ? fs.readFileSync("studio/ops/studio.js", "utf8") : "";
if (html && !html.includes('id="main"')) errors.push("Studio UI must include main landmark");
if (html && !html.includes('class="skip-link"')) errors.push("Studio UI must include a skip link");
if (html && !html.includes('aria-live="polite"')) errors.push("evidence inspector must announce updates accessibly");
if (css && !css.includes("@media(prefers-reduced-motion:reduce)")) errors.push("reduced-motion support missing");
if (css && !css.includes("--gold:#d6b15e")) errors.push("canonical gold design token missing");
if (css && !css.includes("--purple:#8761e8")) errors.push("canonical purple design token missing");
if (js && !js.includes("2 * 1024 * 1024")) errors.push("evidence inspector size limit missing");

for (const file of [".github/workflows/g02-runner-assignment-probe.yml", ".github/workflows/studio-platform-ci.yml"]) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  if (/permissions:\s*write-all/.test(text)) errors.push(file + ": write-all permission forbidden");
  if (/persist-credentials:\s*true/.test(text)) errors.push(file + ": checkout credential persistence forbidden");
  if (file.includes("g02-runner-assignment-probe") && !text.includes("runner_id")) errors.push("G02 probe must record runner ID");
  if (file.includes("g02-runner-assignment-probe") && !text.includes("runner_name")) errors.push("G02 probe must record runner name");
  if (file.includes("g02-runner-assignment-probe") && !text.includes("steps:")) errors.push("G02 probe must contain explicit execution steps");
}
if (errors.length) {
  console.error(JSON.stringify({ gate: "studio-infrastructure-contract", status: "FAIL", errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  gate: "studio-infrastructure-contract", status: "PASS", requiredFiles: requiredFiles.length,
  productionMutation: "FROZEN", lastKnownGood: "PROTECTED", autoMerge: false,
  automaticMediaPublish: false,
  note: "Contract validation only; it does not prove GitHub runner assignment or production readiness."
}, null, 2));
