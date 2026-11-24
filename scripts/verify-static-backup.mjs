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
if (!Array.isArray(manifest.worlds) || manifest.worlds.length < 12) fail("portfolio manifest must contain at least twelve portfolio entries");
else pass("portfolio manifest has " + manifest.worlds.length + " entries");
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
