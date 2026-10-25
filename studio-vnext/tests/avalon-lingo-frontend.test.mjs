import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../avalon-lingo.html", import.meta.url), "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)].map(match => match[1]).join("\n");

test("integration preview exposes domain navigation and core studio features", () => {
  for (const token of ['data-domain="avalon"', 'data-domain="kiki"', 'data-domain="lingo"', 'id="ecosystem-worlds"', 'id="planning"', 'id="digital-id-card"', 'id="ai-form"', 'id="dns-check"', 'id="ballroom"', 'id="category-simulator"']) {
    assert.ok(html.includes(token), "missing integration contract: " + token);
  }
});

test("financial, identity, event, and integration claims are explicitly qualified", () => {
  for (const token of ["ILLUSTRATIVE", "NOT VERIFIED", "DEMO PASS", "not an official identity credential", "SIMULATION ONLY", "PROTECTED HOLD"]) {
    assert.ok(html.includes(token), "missing fail-closed qualifier: " + token);
  }
  assert.match(html, /prompt will not be sent/i);
  assert.match(html, /Email sending is disabled/i);
});

test("client script parses and has no direct Gemini API or embedded API key", () => {
  assert.ok(scripts.length > 1000);
  assert.doesNotThrow(() => new vm.Script(scripts, { filename: "avalon-lingo-inline.js" }));
  assert.doesNotMatch(scripts, /generativelanguage\.googleapis\.com|AIza[0-9A-Za-z_-]{30,}/);
});

test("accessibility and security basics are present", () => {
  assert.match(html, /<html lang="en">/);
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /aria-label="Ecosystem domains"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /prefers-reduced-motion:reduce/);
  assert.match(html, /@media\(max-width:640px\)/);
});
