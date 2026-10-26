import fs from "node:fs";
import path from "node:path";

const manifest = JSON.parse(fs.readFileSync("config/site-routes.json", "utf8"));
if (manifest.schema_version !== 1 || !Array.isArray(manifest.routes)) throw new Error("Invalid route manifest shape.");
const seen = new Set();
const errors = [];
for (const route of manifest.routes) {
  if (!route.path || !route.path.startsWith("/") || !route.label || !route.group) {
    errors.push("Route needs absolute path, label and group: " + JSON.stringify(route));
    continue;
  }
  if (seen.has(route.path)) errors.push("Duplicate route path: " + route.path);
  seen.add(route.path);
  if (route.status === "planned") continue;
  if (route.path === "/") {
    if (!fs.existsSync("index.html")) errors.push("Missing index.html for /");
    continue;
  }
  const clean = route.path.split("/").filter(Boolean).join("/");
  const candidates = [path.join(clean, "index.html"), path.join(clean + ".html")];
  if (!candidates.some((candidate) => fs.existsSync(candidate))) errors.push("No local target for " + route.path);
}
const nav = fs.readFileSync("assets/lingo-route-matrix.js", "utf8");
const worker = fs.readFileSync("worker.js", "utf8");
for (const route of manifest.routes.filter((item) => item.status !== "planned")) {
  if (!nav.includes(route.path)) errors.push("Navigation misses registered route: " + route.path);
  if (!worker.includes(route.path)) errors.push("Backend route registry misses route: " + route.path);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Validated " + manifest.routes.length + " routes and navigation registry.");
