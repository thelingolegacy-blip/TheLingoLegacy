import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const read = p => { const f = path.join(root, p); if (!fs.existsSync(f)) { errors.push("Missing required file: " + p); return null; } return fs.readFileSync(f, "utf8"); };
const json = p => { const raw = read(p); if (raw === null) return null; try { return JSON.parse(raw); } catch (e) { errors.push("Invalid JSON " + p + ": " + e.message); return null; } };
const config = json("config/studio-config.json");
const registry = json("config/game-registry.json");
const manifest = json("assets/manifest.json");
for (const p of ["index.html","lingoarcade/index.html","lingoslots/index.html","dashboard/index.html","GAME-MASTER-TREE.md","GAME-BIBLE-INDEX.md","storyboards/UNIVERSE-STORYBOARD-PACK.md","ECONOMY-AND-PROMOTIONS-SPEC.md","games/oasis-platform/README.md","games/oasis-platform/PLATFORM-PERMISSIONS.md","games/oasis-platform/api/openapi.yaml","games/oasis-platform/cloudflare/worker.js","games/oasis-platform/cloudflare/wrangler.toml","games/oasis-platform/firebase-functions/package.json","games/oasis-platform/firebase-functions/tsconfig.json","games/oasis-platform/firebase-functions/catalog-seed.json","games/oasis-platform/firebase-functions/scripts/seed-catalog.mjs","games/oasis-platform/firebase-functions/src/index.ts","games/oasis-platform/firebase-functions/firestore.rules","games/oasis-platform/flutter/pubspec.yaml","games/oasis-platform/flutter/lib/main.dart"]) read(p);
if (config) {
 if (config.policy?.failClosed !== true) errors.push("Fail-closed policy must remain true");
 if (config.policy?.productionDeploy !== false) errors.push("Production deploy must remain disabled in this branch");
 if (config.environments?.production?.activationAuthorized !== false) errors.push("Production activation authorization must remain false");
 if (config.services?.sweepstakes?.enabled !== false) errors.push("Sweepstakes must remain disabled pending legal review");
}
if (registry) {
 const ids = registry.games.map(g => g.id);
 if (new Set(ids).size !== ids.length) errors.push("Duplicate game IDs in registry");
 for (const game of registry.games) {
   if (!game.id || !game.title || !game.genre || !game.status || !game.route) errors.push("Incomplete registry record: " + JSON.stringify(game));
   if (game.route.startsWith("/") && game.route.includes("..")) errors.push("Unsafe route: " + game.route);
 }
 if (registry.games.length < 13) errors.push("Expected the 13 registered game/platform identities");
 if (registry.rules?.noRealMoneyWagers !== true || registry.rules?.noCashout !== true) errors.push("Virtual-only economy safeguards missing");
}
if (manifest) {
 const ids = manifest.assets.map(a => a.assetId);
 if (new Set(ids).size !== ids.length) errors.push("Duplicate asset IDs");
 for (const asset of manifest.assets) {
   for (const key of ["assetId","kind","version","license","owner","status"]) if (!asset[key]) errors.push("Asset " + (asset.assetId || "(unknown)") + " missing " + key);
   if (asset.path && !fs.existsSync(path.resolve(root, asset.path))) errors.push("Asset path missing: " + asset.path);
 }
}
function walk(dir) {
 for (const ent of fs.readdirSync(dir,{withFileTypes:true})) {
   if ([".git","node_modules"].includes(ent.name)) continue;
   const p = path.join(dir,ent.name);
   if (ent.isDirectory()) walk(p);
   else if (ent.isFile() && ent.name.endsWith(".html")) {
     const rel = path.relative(root,p);
     const html = fs.readFileSync(p,"utf8");
     if (!/^<!doctype html>/i.test(html.trimStart())) errors.push(rel + ": missing HTML5 doctype");
     if (!/<html[^>]+lang=/i.test(html)) errors.push(rel + ": missing html lang attribute");
     if (!/<meta[^>]+name=["']viewport["']/i.test(html)) errors.push(rel + ": missing responsive viewport");
     for (const match of html.matchAll(/(?:href|src)=["']([^"'#]+)["']/g)) {
       const target = match[1];
       if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(target)) {
         if (/^javascript:/i.test(target)) errors.push(rel + ": javascript: URL forbidden");
         continue;
       }
       const local = path.resolve(path.dirname(p), target.split("?")[0]);
       if (!fs.existsSync(local)) errors.push(rel + ": broken local reference " + target);
     }
   }
 }
}
walk(root);

// Doughboy's Oasis vertical-slice contract: static checks only, not browser/device QA.
const oasis = read("games/doughboys-oasis-vertical-slice.html");
if (oasis) {
  const requiredIds = [
    "world", "interact", "missionChoices", "createCrew", "territoryBtn",
    "cpuToggle", "radioToggle", "saveBtn", "checkpointBtn", "modal",
    "missionState", "inventoryText", "stations", "rivalInfluence", "returnCheckpoint"
  ];
  for (const id of requiredIds) {
    if (!oasis.includes('id="' + id + '"') && !oasis.includes("id='" + id + "'")) {
      errors.push("Doughboy's Oasis vertical slice missing required UI element: #" + id);
    }
  }
  for (const domain of ["MONEY", "POWER", "SEX & DESIRE", "DRUGS", "ROCK & ROLL", "INTELLIGENCE"]) {
    if (!oasis.includes(domain)) errors.push("Doughboy's Oasis missing GREED domain: " + domain);
  }
  for (const solution of ['data-solution="negotiate"', 'data-solution="route"', 'data-solution="audit"']) {
    if (!oasis.includes(solution)) errors.push("Doughboy's Oasis missing mission solution: " + solution);
  }
  if (!oasis.includes("localStorage")) errors.push("Doughboy's Oasis must retain local save/load support");
  if (/navigator\.geolocation|watchPosition|getCurrentPosition/.test(oasis)) errors.push("Doughboy's Oasis prototype must not access device location");
  if (!oasis.includes("function canOccupy")) errors.push("Doughboy's Oasis missing walkable-space collision guard");
  if (!oasis.includes("function findPath")) errors.push("Doughboy's Oasis missing click-to-move pathfinding");
  if (!oasis.includes("function updateNpcSchedules")) errors.push("Doughboy's Oasis missing daypart NPC schedules");
  if (!oasis.includes("state.solved||state.mission==='not-started'")) errors.push("Doughboy's Oasis mission choices must be gated until mission start");
  const inlineScripts = [...oasis.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  if (!inlineScripts.length) errors.push("Doughboy's Oasis is missing its inline gameplay script");
  for (const [index, match] of inlineScripts.entries()) {
    try { new Function(match[1]); }
    catch (e) { errors.push("Doughboy's Oasis inline script " + (index + 1) + " has a syntax error: " + e.message); }
  }
  const oasisRecord = registry?.games?.find(game => game.id === "doughboys-oasis");
  if (oasisRecord?.status !== "local-prototype") errors.push("Doughboy's Oasis registry status must be local-prototype");
  if (oasisRecord?.route !== "/studio-sites/games/doughboys-oasis-vertical-slice.html") errors.push("Doughboy's Oasis registry route does not target the vertical slice");
}

// Oasis Exchange store contract: static checks only, not browser/device QA or backend certification.
const oasisStore = read("games/doughboys-oasis-store.html");
if (oasisStore) {
  for (const id of ["filters", "products", "balance", "loadout", "ledger", "depositBtn", "map", "waypoint", "sort"]) {
    if (!oasisStore.includes('id="' + id + '"')) errors.push("Oasis Exchange missing required UI element: #" + id);
  }
  for (const category of ["clothing", "gear", "transport", "banking", "tools"]) {
    if (!oasisStore.includes("id:'" + category + "'")) errors.push("Oasis Exchange missing store category: " + category);
  }
  for (const forbidden of ["navigator.geolocation", "getCurrentPosition(", "watchPosition("]) {
    if (oasisStore.includes(forbidden)) errors.push("Oasis Exchange must not request GPS in this prototype: " + forbidden);
  }
  if (!oasisStore.includes("localStorage")) errors.push("Oasis Exchange must document/use local demo persistence");
  if (!oasisStore.includes("No real payment was made")) errors.push("Oasis Exchange must clearly disclose simulated purchases");
  if (!oasisStore.includes("real-money wagering") || !oasisStore.includes("cash-out")) errors.push("Oasis Exchange monetization safeguards are missing");
  const scripts = [...oasisStore.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  if (!scripts.length) errors.push("Oasis Exchange is missing its inline store script");
  for (const [index, match] of scripts.entries()) {
    try { new Function(match[1]); }
    catch (e) { errors.push("Oasis Exchange inline script " + (index + 1) + " has a syntax error: " + e.message); }
  }
  const storeRecord = registry?.games?.find(game => game.id === "doughboys-oasis-store");
  if (storeRecord?.status !== "local-prototype") errors.push("Oasis Exchange registry status must be local-prototype");
  if (storeRecord?.route !== "/studio-sites/games/doughboys-oasis-store.html") errors.push("Oasis Exchange registry route is incorrect");
  if (config?.routes?.oasisStore !== "/studio-sites/games/doughboys-oasis-store.html") errors.push("Oasis Exchange route is missing from studio config");
}
if (!fs.existsSync(path.join(root, "games/DOUGHBOYS-OASIS-PLATFORM-INTEGRATION.md"))) errors.push("Missing Oasis platform integration blueprint");


// Oasis platform scaffold checks. These verify source contracts, not deployed services.
const edge = read("games/oasis-platform/cloudflare/worker.js");
const fn = read("games/oasis-platform/firebase-functions/src/index.ts");
const rules = read("games/oasis-platform/firebase-functions/firestore.rules");
const flutter = read("games/oasis-platform/flutter/lib/main.dart");
const wrangler = read("games/oasis-platform/cloudflare/wrangler.toml");
const api = read("games/oasis-platform/api/openapi.yaml");
if (edge) {
  if (!edge.includes('BACKEND_NOT_CONFIGURED') || !edge.includes('503,headers')) errors.push("Oasis edge API must fail closed when the trusted backend is not configured");
  if (!edge.includes('/api/oasis/v1/catalog') || !edge.includes('/api/oasis/v1/healthz')) errors.push("Oasis edge API is missing catalog or health routes");
  if (!edge.includes('FEATURE_DISABLED')) errors.push("Oasis location unlock must remain disabled until privacy approval");
}
if (fn) {
  if (!fn.includes('request.auth?.uid') || !fn.includes('db.runTransaction') || !fn.includes('initializeOasisDemoWallet')) errors.push("Oasis wallet/purchase functions must authenticate and transact atomically");
  if (!fn.includes('INSUFFICIENT_FUNDS') || !fn.includes('idempotencyKey')) errors.push("Oasis purchase function is missing balance or idempotency controls");
}
if (rules && !rules.includes('allow write: if false;')) errors.push("Oasis Firestore rules must deny client-side wallet/inventory/ledger writes");
if (flutter) {
  if (!flutter.includes('requestPermission()') || !flutter.includes('Enable my location')) errors.push("Flutter location must be explicit and user-initiated");
  if (!flutter.includes('OpenStreetMap contributors')) errors.push("Flutter map must display provider attribution");
  if (!flutter.includes('Coordinates are not persisted')) errors.push("Flutter map must disclose location data handling");
}
if (wrangler && /routes\s*=|route\s*=/.test(wrangler)) errors.push("Oasis Worker scaffold must not declare a production route");
if (api && (!api.includes('/purchases:') || !api.includes('/location/unlock:'))) errors.push("Oasis OpenAPI contract is missing purchase or location routes");
if (!fs.existsSync(path.join(root, "games/oasis-platform/PLATFORM-PERMISSIONS.md"))) errors.push("Missing Flutter platform permission checklist");


// DOUGHBOY'S OASIS next-gate source contracts: static checks only, not browser/Unity runtime QA.
const lifeLab = read("games/doughboys-oasis-life-legacy-lab.html");
const lingoDeckCatalog = json("games/oasis-decks/lingo-deck-catalog.v1.json");
const mysteryManifest = json("games/oasis-mystery/doughboy-past-clue-manifest.v1.json");
for (const p of ["games/DOUGHBOYS-OASIS-ENGINEERING-EXECUTION-PLAN-2026-10-14.md","games/DOUGHBOYS-OASIS-UNITY-VERTICAL-SLICE-BOOTSTRAP.md"]) read(p);
if (lifeLab) {
  for (const token of ["Legacy Campaign","Sandbox","ageMilestones.push","storageKey(s)","buildBoard","data-lingocard","data-clue","Doughboy’s child is confirmed canon","revelation gate remains locked"]) {
    if (!lifeLab.includes(token)) errors.push("Oasis Life Lab missing next-gate contract: " + token);
  }
  const scripts = [...lifeLab.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)];
  if (scripts.length !== 1) errors.push("Oasis Life Lab must contain exactly one inline script");
  for (const [index, match] of scripts.entries()) {
    try { new Function(match[1]); }
    catch (e) { errors.push("Oasis Life Lab inline script " + (index + 1) + " has a syntax error: " + e.message); }
  }
  if ((lifeLab.match(/<\\/script>/g) || []).length !== 1) errors.push("Oasis Life Lab contains malformed trailing script markup");
}
if (lingoDeckCatalog) {
  const cards = (lingoDeckCatalog.collections || []).flatMap(c => c.cards || []);
  if (lingoDeckCatalog.system !== "Oasis Decks" || lingoDeckCatalog.collectionBrand !== "LINGO Decks") errors.push("Oasis card-system naming hierarchy is incorrect");
  if (lingoDeckCatalog.collections?.length !== 4 || cards.length !== 16) errors.push("Oasis must define four original starter collections with 16 cards");
  const ids = cards.map(c => c.id);
  if (new Set(ids).size !== ids.length) errors.push("LINGO Deck catalog contains duplicate card IDs");
  if (lingoDeckCatalog.realMoneyAdvantage !== false) errors.push("LINGO Deck catalog must prohibit real-money competitive advantage");
  for (const card of cards) if (!card.id || !card.title || !card.effect || !card.cost || !Array.isArray(card.eligibleStages)) errors.push("LINGO Deck card missing required contract fields: " + (card.id || "(unknown)"));
}
if (mysteryManifest) {
  if (mysteryManifest.revealEnabled !== false || mysteryManifest.canonSecret !== "UNASSIGNED — creator approval required") errors.push("Doughboy mystery must remain unrevealed pending creator approval");
  if (mysteryManifest.gate?.randomExplorationCanReveal !== false || mysteryManifest.gate?.requiresCreatorApproval !== true) errors.push("Doughboy mystery reveal gate must require authored evidence and creator approval");
  if ((mysteryManifest.clues || []).length < 3) errors.push("Doughboy mystery must include at least three linked clue/account records");
  if (mysteryManifest.privacy?.usesMicrophone !== false || mysteryManifest.privacy?.usesScreenCapture !== false || mysteryManifest.privacy?.usesDeviceLocation !== false) errors.push("Doughboy mystery must not use covert real-world monitoring");
}
const catalogSeed = json("games/oasis-platform/firebase-functions/catalog-seed.json");
const seedScript = read("games/oasis-platform/firebase-functions/scripts/seed-catalog.mjs");
if (catalogSeed) {
  const itemIds = catalogSeed.map(item => item.id);
  if (new Set(itemIds).size !== itemIds.length) errors.push("Oasis Firebase catalog seed contains duplicate item IDs");
  for (const item of catalogSeed) {
    if (!item.id || !item.name || !["clothing","gear","transport","banking","tools"].includes(item.category)) errors.push("Oasis catalog seed item has invalid identity/category: " + JSON.stringify(item));
    if (!Number.isSafeInteger(item.price) || item.price < 0 || item.cashValue !== false || item.active !== true) errors.push("Oasis catalog seed item violates virtual-only price/availability rules: " + (item.id || "(unknown)"));
  }
  if (catalogSeed.length !== 16) errors.push("Oasis catalog seed must align with the 16-item web prototype catalog");
}
if (seedScript && (!seedScript.includes("applicationDefault()") || !seedScript.includes("oasisCatalog") || seedScript.includes("players/"))) errors.push("Oasis catalog seed utility must use ADC and must not write player balances");

if (errors.length) { console.error("STUDIO VALIDATION FAILED\n- " + errors.join("\n- ")); process.exit(1); }
console.log("STUDIO VALIDATION PASS: required docs, JSON, registry, fail-closed policy, local HTML references, and baseline accessibility metadata.");
console.log("NOTE: static validation is not browser QA, security certification, legal/IP clearance, runner evidence, or production authorization.");
