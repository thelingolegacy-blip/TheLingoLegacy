import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const registryPath = path.join(root, "studio/assets/asset-registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const accepted = new Set([".avif", ".gif", ".jpeg", ".jpg", ".json", ".mp3", ".mp4", ".ogg", ".png", ".svg", ".wav", ".webm", ".webp"]);
const errors = [];
const assets = [];
const seen = new Set();

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isSymbolicLink()) { errors.push("symbolic link rejected: " + path.relative(root, full)); continue; }
    if (ent.isDirectory()) walk(full);
    else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (!accepted.has(ext)) { errors.push("unsupported asset extension: " + path.relative(root, full)); continue; }
      assets.push({ path: path.relative(root, full).split(path.sep).join("/"), bytes: fs.statSync(full).size, sha256: sha256(full), mediaType: ext.slice(1) });
    }
  }
}
walk(path.join(root, "studio/assets/source"));

for (const item of registry.assets || []) {
  if (!item || typeof item.id !== "string" || typeof item.path !== "string") { errors.push("each registry asset requires string id and path"); continue; }
  if (seen.has(item.id)) errors.push("duplicate asset id: " + item.id);
  seen.add(item.id);
  if (item.path.startsWith("/") || item.path.includes("..") || item.path.includes("://")) errors.push("asset path must be local and relative: " + item.path);
  if (item.license?.status !== "documented" || !item.license?.reference) errors.push("asset " + item.id + " lacks documented license reference");
  if (item.kind === "image" && item.informative === true && !item.alt) errors.push("informative image " + item.id + " lacks alt text");
  if (item.kind === "video" && item.spoken === true && !item.captions) errors.push("spoken video " + item.id + " lacks captions");
  const base = path.resolve(root, "studio/assets");
  const full = path.resolve(base, item.path);
  if (!full.startsWith(base + path.sep) || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
    errors.push("asset file missing or outside studio/assets: " + item.path);
  } else {
    const found = assets.find(a => path.resolve(root, a.path) === full);
    if (!found) assets.push({ path: path.relative(root, full).split(path.sep).join("/"), bytes: fs.statSync(full).size, sha256: sha256(full), mediaType: path.extname(full).slice(1).toLowerCase() });
  }
}
if (errors.length) {
  console.error(JSON.stringify({ gate: "studio-media-manifest", status: "FAIL", errors }, null, 2));
  process.exit(1);
}
assets.sort((a, b) => a.path.localeCompare(b.path));
const outputDir = path.join(root, ".build");
fs.mkdirSync(outputDir, { recursive: true });
const manifest = { schemaVersion: 1, generatedBy: "ops/studio/build-media-manifest.mjs", assetCount: assets.length, assets };
const serialized = JSON.stringify(manifest, null, 2) + "\n";
const manifestPath = path.join(outputDir, "studio-media-manifest.json");
fs.writeFileSync(manifestPath, serialized);
fs.writeFileSync(path.join(outputDir, "studio-media-manifest.sha256"), crypto.createHash("sha256").update(serialized).digest("hex") + "  studio-media-manifest.json\n");
console.log(JSON.stringify({ gate: "studio-media-manifest", status: "PASS", assetCount: assets.length, manifest: ".build/studio-media-manifest.json", productionPublish: "NOT_AUTHORIZED" }, null, 2));
