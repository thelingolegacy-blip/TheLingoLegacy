import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const site = resolve(root, "static-site");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const fail = (message) => { console.error("STATIC_BACKUP_CHECK=FAIL", message); process.exitCode = 1; };
const pass = (message) => console.log("STATIC_BACKUP_CHECK=PASS", message);

const home = read("static-site/index.html");
for (const [label, predicate] of [
  ["doctype", /^<!doctype html>/i.test(home)],
  ["language", /<html lang="en">/i.test(home)],
  ["main landmark", /<main\b/i.test(home)],
  ["skip navigation", /href="#main"/i.test(home)],
  ["canonical primary host", /<link rel="canonical" href="https:\/\/thelingolegacy\.com\/"/i.test(home)],
  ["portfolio title", /THE LINGO LEGACY — One Legacy\. Many Worlds\./.test(home)],
  ["reduced motion support", /prefers-reduced-motion/i.test(home)],
  ["no guessed email endpoint", !/mailto:dlingo@thelingolegacy\.com/i.test(home)]
]) predicate ? pass(label) : fail(label);

const headers = read("static-site/_headers");
for (const token of ["Content-Security-Policy:", "X-Content-Type-Options:", "X-Frame-Options:", "X-Robots-Tag: noindex"]) {
  headers.includes(token) ? pass("header " + token) : fail("missing header " + token);
}
const manifest = JSON.parse(read("static-site/portfolio.json"));
const EXPECTED_PUBLIC_PORTFOLIOS = [
  ["lingo-legacy", "LINGOlegacy"],
  ["lingo-lane", "LINGOlane"],
  ["lingo-slots", "LINGOslots"],
  ["lingo-arcade", "LINGOarcade"],
  ["lingo-library", "LINGOlibrary"],
  ["lingo-media", "LINGOmedia"],
  ["lingo-world", "LINGOworld"],
  ["legacy-x-club", "LegacyXclub"]
];
const EXPECTED_RELATED_CONCEPTS = [
  "LINGO ID",
  "Universal Legacy Wallet",
  "LINGO Nexus",
  "LINGO Studios",
  "LINGO Towers",
  "Bridged Gap"
];
const worlds = Array.isArray(manifest.worlds) ? manifest.worlds : [];
if (worlds.length !== EXPECTED_PUBLIC_PORTFOLIOS.length) {
  fail("public portfolio manifest must contain exactly eight canonical public portfolios");
} else {
  for (const [index, [id, name]] of EXPECTED_PUBLIC_PORTFOLIOS.entries()) {
    const world = worlds[index];
    if (!world || world.id !== id || world.name !== name || world.node_type !== "public_portfolio") {
      fail("non-canonical public portfolio at position " + (index + 1) + ": " + String(world?.name));
    }
  }
  pass("exactly eight canonical public portfolios");
}
const related = Array.isArray(manifest.related_concepts) ? manifest.related_concepts : [];
if (related.length !== EXPECTED_RELATED_CONCEPTS.length) {
  fail("related concepts must contain exactly six preserved non-realm concepts");
} else {
  for (const name of EXPECTED_RELATED_CONCEPTS) {
    const item = related.find((entry) => entry.name === name);
    if (!item || item.node_type !== "related_concept" || item.counted_as_realm !== false || item.route !== null) {
      fail("related concept must remain separately classified and unrouted: " + name);
    }
  }
  pass("six related concepts preserved outside the realm count");
}
if (manifest.taxonomy?.public_portfolio_count !== 8 ||
    manifest.taxonomy?.related_concept_count !== 6 ||
    manifest.taxonomy?.related_concepts_are_realms !== false) {
  fail("manifest taxonomy metadata does not match the eight-plus-six separation");
} else {
  pass("public portfolio and related-concept counts are explicit");
}
const manifestIds = [...worlds, ...related].map((entry) => entry.id);
if (manifestIds.some((id) => typeof id !== "string" || !id) || new Set(manifestIds).size !== manifestIds.length) {
  fail("manifest identifiers must be non-empty and unique");
} else {
  pass("manifest identifiers are unique");
}
for (const world of manifest.worlds ?? []) {
  if (!world.href) continue;
  const target = resolve(site, world.href.replace(/^\/+/, ""), "index.html");
  if (!target.startsWith(site + "/")) fail("route escapes static root: " + world.href);
  else if (!existsSync(target) || !statSync(target).isFile()) fail("missing route target: " + world.href);
  else pass("route " + world.href);
}
const health = JSON.parse(read("static-site/healthz.json"));
if (health.service !== "lingo-legacy-static-standby" || health.scope !== "static-file-presence-only") fail("health endpoint must retain static-only scope");
else pass("static-only health contract");
const legacy = resolve(site, "legacy-home/index.html");
if (existsSync(legacy) && statSync(legacy).isFile()) pass("previous homepage preserved");
else fail("previous homepage snapshot missing");
if (process.exitCode) process.exit(process.exitCode);
console.log("STATIC_BACKUP_CHECK=ALL_PASS");
