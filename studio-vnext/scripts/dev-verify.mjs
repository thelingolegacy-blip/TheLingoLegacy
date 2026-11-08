import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const entry = fileURLToPath(new URL("../index.html", import.meta.url));
const html = readFileSync(entry, "utf8");
const checks = [];
const record = (name, ok, detail = "") => checks.push({ name, status: ok ? "PASS" : "FAIL", detail });

record("HTML document shell", /<!doctype html>/i.test(html) && /<html lang="en">/.test(html) && /<meta charset="utf-8">/.test(html));
record("Mobile viewport", /name="viewport" content="width=device-width,initial-scale=1"/.test(html));
record("Responsive breakpoints", /@media\(max-width:900px\)/.test(html) && /@media\(max-width:560px\)/.test(html));
record("Keyboard focus styling", /:focus-visible/.test(html));
record("Reduced-motion support", /prefers-reduced-motion:reduce/.test(html));
record("Mobile menu semantics", /aria-controls="sidebar"/.test(html) && /aria-expanded="false"/.test(html) && /e\.key==='Escape'/.test(html));
record("Deep-link navigation", /history\.replaceState/.test(html) && /addEventListener\('hashchange'/.test(html));

const navPages = [...html.matchAll(/<button[^>]*data-page="([^"]+)"/g)].map(match => match[1]);
const pageIds = new Set([...html.matchAll(/id="page-([^"]+)"/g)].map(match => match[1]));
record("Navigation targets exist", navPages.length > 0 && navPages.every(page => pageIds.has(page)), navPages.filter(page => !pageIds.has(page)).join(","));

const gotoTargets = [...html.matchAll(/data-goto="([^"]+)"/g)].map(match => match[1]);
record("In-page action targets exist", gotoTargets.length > 0 && gotoTargets.every(page => pageIds.has(page)), [...new Set(gotoTargets.filter(page => !pageIds.has(page)))].join(","));
record("Production remains protected", /Protected production/.test(html) && /Production mutations: disabled/.test(html) && /PROTECTED HOLD remains authoritative/.test(html));
record("Sensitive integrations remain disabled", /No credentials, webhooks, payment providers, customer data, or production APIs are connected/.test(html));

for (const check of checks) {
  console.log(`[${check.status}] ${check.name}${check.detail ? ` — ${check.detail}` : ""}`);
}
const failures = checks.filter(check => check.status === "FAIL");
console.log(`Static development checks: ${checks.length - failures.length}/${checks.length} passed.`);
console.log("UNVERIFIED: browser execution, real-device layout, accessibility audit, security scans, GitHub Actions, and production release checks.");
if (failures.length) process.exitCode = 1;
