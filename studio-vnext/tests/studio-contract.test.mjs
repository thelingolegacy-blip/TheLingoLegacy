import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join("\n");

test("prototype declares all expected studio sections", () => {
  for (const page of ["overview", "ecosystem", "worlds", "agents", "workflows", "integrations", "platform", "governance", "roadmap", "docs"]) {
    assert.match(html, new RegExp('id="page-' + page + '"'), "missing page " + page);
    assert.match(html, new RegExp('data-page="' + page + '"'), "missing navigation item " + page);
  }
});

test("Avalon integration is linked from Studio Nexus navigation", () => {
  assert.match(html, /data-page="ecosystem"/);
  assert.match(html, /id="page-ecosystem"/);
  assert.match(html, /href="avalon-lingo\.html"/);
});

test("blueprint catalogs contain expected minimum inventory", () => {
  assert.match(script, /const agents=\[/);
  assert.match(script, /const workflows=\[/);
  assert.match(script, /const integrations=\[/);
  assert.equal((script.match(/\["(?:Studio Orchestrator|Brand Guardian|Build & QA Analyst|Release Gatekeeper|Commerce Operations|Community Producer)"/g) || []).length, 6);
  assert.equal((script.match(/\["(?:Change intake → triage|Branch preview pipeline|Visual acceptance|Integration onboarding|Incident response|Content publishing|Commerce reconciliation|Release certification)"/g) || []).length, 8);
});

test("script parses without syntax errors", () => {
  assert.ok(script.length > 1000, "expected application script");
  assert.doesNotThrow(() => new vm.Script(script, { filename: "studio-vnext-inline.js" }));
});

test("governance is explicitly fail-closed and production-safe", () => {
  assert.match(html, /Protected production/);
  assert.match(html, /PREVIEW ONLY/);
  assert.match(html, /release gate remains HOLD/i);
  assert.match(html, /No credentials, webhooks, payment providers/);
});

test("accessibility foundations are present", () => {
  assert.match(html, /<html lang="en">/);
  assert.match(html, /aria-label="Main navigation"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /prefers-reduced-motion:reduce/);
  assert.match(html, /@media\(max-width:560px\)/);
});

test("primary controls and local governance handlers are wired", () => {
  for (const token of ["data-goto", "gateSummaryBtn", "resetGateBtn", "menuBtn", "addEventListener"]) {
    assert.ok(html.includes(token), "missing interaction contract: " + token);
  }
});
