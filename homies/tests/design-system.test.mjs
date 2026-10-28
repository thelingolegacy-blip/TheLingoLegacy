import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const css = await read("../design-system/tokens.css");
const icons = await read("../design-system/icons.tsx");
const components = await read("../design-system/components.tsx");
const grok = await read("../grok/CONTRACT.md");
const readme = await read("../README.md");

test("required crimson, white, charcoal and interaction tokens exist", () => {
  for (const token of ["#C41E3A", "#9B1B2F", "#FFFFFF", "#1C1C1E", "52px", "83px"]) {
    assert.ok(css.includes(token), `missing token/value: ${token}`);
  }
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /opacity:\s*\.4/);
});

test("all specified core icon names are represented", () => {
  for (const name of [
    "explore", "map", "chat", "circles", "profile", "like", "super-like",
    "boost", "filter", "more", "send", "voice", "camera", "disappearing",
    "verified", "private", "ghost", "block", "report", "events", "stories",
    "live", "premium", "grok",
  ]) assert.ok(icons.includes(`"${name}"`), `missing icon: ${name}`);
  assert.match(icons, /strokeLinecap="round"/);
  assert.match(icons, /strokeLinejoin="round"/);
});

test("button variants and five primary tabs are implemented accessibly", () => {
  for (const variant of ["primary", "secondary", "ghost", "destructive", "premium"]) {
    assert.ok(components.includes(`"${variant}"`), `missing button variant: ${variant}`);
  }
  for (const tab of ["Explore", "Map", "Chat", "Circles", "Profile"]) {
    assert.ok(components.includes(tab), `missing tab: ${tab}`);
  }
  assert.match(components, /aria-current/);
  assert.match(components, /aria-label/);
});

test("Grok contract protects secrets, privacy, deletion, and consent", () => {
  for (const phrase of ["server-only secret", "deletion", "consent", "rate limits", "sensitive", "streaming"]) {
    assert.ok(grok.toLowerCase().includes(phrase.toLowerCase()), `missing Grok requirement: ${phrase}`);
  }
});

test("package explicitly preserves protected production and G02 gates", () => {
  assert.match(readme, /does not change production routes/i);
  assert.match(readme, /does \*\*not\*\* imply G02 passes/i);
  assert.match(readme, /No production promotion/i);
});
