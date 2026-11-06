import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const rootSource = readFileSync("cloudflare/flagship-root/worker.js", "utf8");
const portal = readFileSync("studio-sites/index.html", "utf8");
const destination = readFileSync("studio-sites/destination.html", "utf8");

function rootHtml() {
  const marker = 'const HOME = "';
  const start = rootSource.indexOf(marker);
  assert.notEqual(start, -1, "flagship Worker must define HOME");
  const bodyStart = start + marker.length;
  const end = rootSource.indexOf('";', bodyStart);
  assert.notEqual(end, -1, "flagship HOME string must terminate");
  return rootSource.slice(bodyStart, end)
    .replace(/\\(["\\])/g, "$1")
    .replace(/\\n/g, "\n");
}

function hrefs(markup) {
  return [...markup.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
}

function assertLocalRoute(route, baseDirectory) {
  const clean = route.split(/[?#]/, 1)[0];
  if (!clean || clean.startsWith("#") || clean.startsWith("mailto:") || /^https?:\/\//i.test(clean)) return;
  const normalized = clean.replace(/^\//, "");
  const candidate = normalized.endsWith("/")
    ? normalized + "index.html"
    : normalized;
  assert.ok(existsSync(candidate), `missing local route: ${route}`);
}

test("flagship homepage no longer points to placeholder destinations", () => {
  const html = rootHtml();
  assert.doesNotMatch(html, /href="(?:#module-info|#ask-l-dock)"/);
  assert.doesNotMatch(html, /navigation-ready design candidate|Candidate experience/);
});

test("all flagship destination pages exist and have registered world keys", () => {
  const html = rootHtml();
  const tiles = [...html.matchAll(/<a class="tile"[\s\S]*?<\/a>/g)].map((m) => m[0]);
  assert.ok(tiles.length >= 20, "expected the flagship directory to retain its platform cards");
  for (const tile of tiles) {
    const href = (tile.match(/href="([^"]+)"/) || [])[1];
    assert.ok(href, "each tile must have a destination");
    if (href.includes("destination.html?world=")) {
      const slug = new URL(href, "https://example.test").searchParams.get("world");
      assert.ok(slug, `missing world slug in ${href}`);
      assert.match(destination, new RegExp(`"${slug}"\\s*:\\s*\\{`), `unregistered destination: ${slug}`);
    } else {
      assertLocalRoute(href, ".");
    }
  }
});

test("flagship internal anchors resolve to elements", () => {
  const html = rootHtml();
  for (const href of hrefs(html).filter((item) => item.startsWith("#"))) {
    const id = href.slice(1);
    assert.match(html, new RegExp(`id="${id}"`), `unresolved anchor: ${href}`);
  }
});

test("universe portal game cards no longer use inert placeholder anchors", () => {
  const portalTileBlocks = [...portal.matchAll(/<a class="tile"[\\s\\S]*?<\\/a>/g)].map((match) => match[0]);
  for (const block of portalTileBlocks) assert.doesNotMatch(block, /href="#worlds"/);
  assert.match(portal, /href="lingoslots\/#play"/);
  for (const block of portal.matchAll(/<a class="tile"[\s\S]*?<\/a>/g)) {
    const href = (block[0].match(/href="([^"]+)"/) || [])[1];
    assert.ok(href, "each world tile must have a destination");
    if (href.startsWith("destination.html?world=")) {
      const slug = new URL(href, "https://example.test/studio-sites/").searchParams.get("world");
      assert.match(destination, new RegExp(`"${slug}"\\s*:\\s*\\{`), `unregistered portal destination: ${slug}`);
    } else if (!/^https?:\/\//i.test(href) && !href.startsWith("#")) {
      const path = href.startsWith("lingoslots/") ? "studio-sites/" + href : "studio-sites/" + href;
      const clean = path.split(/[?#]/, 1)[0];
      const candidate = clean.endsWith("/") ? clean + "index.html" : clean;
      assert.ok(existsSync(candidate), `missing portal route: ${href}`);
    }
  }
});


test("flagship local assets and page references resolve in the repository", () => {
  const html = rootHtml();
  const refs = [...html.matchAll(/(?:href|src)="(\\/[^"]+)"/g)].map((match) => match[1]);
  for (const ref of refs) {
    if (ref.startsWith("/studio-sites/destination.html")) {
      assert.ok(existsSync("studio-sites/destination.html"), "destination detail page must exist");
      continue;
    }
    const clean = ref.split(/[?#]/, 1)[0];
    if (!clean || clean.startsWith("//")) continue;
    const relative = clean.replace(/^\\//, "");
    const candidate = relative.endsWith("/") ? relative + "index.html" : relative;
    assert.ok(existsSync(candidate), `missing flagship asset or route: ${ref}`);
  }
});

test("TV directional navigation script exists and supports remote arrow keys", () => {
  const tvNavigation = readFileSync("studio-sites/assets/tv-navigation.js", "utf8");
  for (const key of ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]) {
    assert.ok(tvNavigation.includes(key), `missing TV remote key: ${key}`);
  }
});

test("destination pages disclose service limitations and do not claim all products are live", () => {
  for (const text of [
    "checkout disabled",
    "Firebase identity unresolved",
    "ledger certification pending",
    "streaming not connected",
    "Read-only diagnostics",
    "production gate remains fail-closed",
  ]) assert.ok(destination.toLowerCase().includes(text.toLowerCase()), `missing readiness disclosure: ${text}`);
});
