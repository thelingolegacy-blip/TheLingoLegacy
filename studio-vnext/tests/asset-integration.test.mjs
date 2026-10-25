import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const assets = [
  ["hero-universe.svg", "Original LINGO Legacy universe artwork"],
  ["loyalty-lane.svg", "Premium black hoodie concept"],
  ["thats-my-lingo.svg", "That's My Lingo arcade cabinet concept art"],
  ["kottonscode.svg", "KottonsCode fluffy white Maltese mascot concept art"],
  ["asklingo.svg", "AskLINGO knowledge orb and connected network concept art"]
];

test("all five committed SVG assets exist and have accessible SVG metadata", () => {
  for (const [file] of assets) {
    const path = new URL("assets/" + file, root);
    assert.equal(existsSync(path), true, "missing asset: " + file);
    const svg = readFileSync(path, "utf8");
    assert.match(svg, /^<svg\b/, file + " must be an SVG document");
    assert.match(svg, /role="img"/, file + " must expose image semantics");
    assert.match(svg, /aria-labelledby=/, file + " must associate its accessible name and description");
    assert.match(svg, /<title\b[^>]*>[^<]+<\/title>/, file + " must include a title");
    assert.match(svg, /<desc\b[^>]*>[^<]+<\/desc>/, file + " must include a description");
  }
});

test("hero uses the hero SVG with meaningful alt text and eager priority", () => {
  assert.match(html, /src="assets\/hero-universe\.svg"/);
  assert.match(html, /alt="Original LINGO Legacy universe artwork:[^"]+"/);
  assert.match(html, /fetchpriority="high"/);
});

test("world cards map all four product SVGs and lazy-load them with alt text", () => {
  for (const [file] of assets.slice(1)) assert.ok(html.includes("assets/" + file), "missing HTML reference: " + file);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /const alt=/);
  assert.ok(html.includes("alt=\"\'+alt+\'\""), "world-card alt text must be interpolated into the generated image markup");
  assert.match(html, /width="720" height="480"/);
});

test("visual asset paths remain local and do not embed remote image URLs", () => {
  for (const [file] of assets) {
    const svg = readFileSync(new URL("assets/" + file, root), "utf8");
    assert.doesNotMatch(svg, /<image\b[^>]+href="https?:\/\//i, file + " must not embed remote image sources");
  }
});
