import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const errors = [];
const checks = [];
const check = (id, pass, detail) => {
  checks.push({ id, status: pass ? 'PASS' : 'FAIL', detail });
  if (!pass) errors.push(id);
};
const read = (relative) => {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) throw new Error(`missing required file: ${relative}`);
  return fs.readFileSync(file, 'utf8');
};

let contract = {};
let wrangler = {};
let release = {};
try { contract = JSON.parse(read('config/landing-page-contract.json')); check('contract-json', true, 'landing page contract parses'); }
catch (error) { check('contract-json', false, String(error)); }
try { wrangler = JSON.parse(read('wrangler.jsonc')); check('wrangler-json', true, 'wrangler.jsonc parses as JSON-compatible configuration'); }
catch (error) { check('wrangler-json', false, String(error)); }
try { release = JSON.parse(read('config/release/lingo-legacy-v1.0.0-rc.json')); check('release-manifest-json', true, 'release manifest parses'); }
catch (error) { check('release-manifest-json', false, String(error)); }

let html = '', worker = '', ignore = '', sitemap = '', robots = '', previewConfig = '', previewWorker = '', rootSnapshot = '';
for (const [key, file] of Object.entries({
  homepage: 'index.html',
  worker: 'worker.js',
  assetExclusions: '.assetsignore',
  sitemap: 'sitemap.xml',
  robots: 'robots.txt',
  previewConfig: 'wrangler.flagship-preview.toml',
  previewWorker: 'cloudflare/flagship-root/preview-worker.js',
  rootWorkerSnapshot: 'cloudflare/flagship-root/live-snapshot-2026-10-29.html',
})) {
  try {
    const value = read(file);
    if (key === 'homepage') html = value;
    if (key === 'worker') worker = value;
    if (key === 'assetExclusions') ignore = value;
    if (key === 'sitemap') sitemap = value;
    if (key === 'robots') robots = value;
    if (key === 'previewConfig') previewConfig = value;
    if (key === 'previewWorker') previewWorker = value;
    if (key === 'rootWorkerSnapshot') rootSnapshot = value;
    check(`required-file-${key}`, true, `${file} exists`);
  } catch (error) { check(`required-file-${key}`, false, String(error)); }
}

if (contract.site && wrangler && release) {
  check('canonical-origin', contract.site.canonicalOrigin === 'https://thelingolegacy.com', 'one canonical apex origin is declared');
  check('static-first-model', contract.site.pageModel === 'static-html-with-cloudflare-worker-edge-runtime', 'the architecture matches the checked-in HTML + Worker source');
  check('worker-name', wrangler.name === contract.deployment?.workerName, `expected Worker ${contract.deployment?.workerName}; found ${wrangler.name || 'missing'}`);
  check('worker-entrypoint', wrangler.main === contract.deployment?.workerEntrypoint, `expected ${contract.deployment?.workerEntrypoint}; found ${wrangler.main || 'missing'}`);
  check('asset-directory', wrangler.assets?.directory === contract.deployment?.assetDirectory, `expected asset directory ${contract.deployment?.assetDirectory}`);
  check('asset-binding', wrangler.assets?.binding === contract.deployment?.assetBinding, `expected asset binding ${contract.deployment?.assetBinding}`);

  const routes = new Set((wrangler.routes || []).map((route) => route.pattern));
  check('apex-route', routes.has('thelingolegacy.com/*'), 'apex custom-domain route is configured');
  check('www-route', routes.has('www.thelingolegacy.com/*'), 'www custom-domain route is configured');

  check('worker-static-forwarding', worker.includes('env.ASSETS.fetch(request)'), 'public page requests are forwarded to Workers Static Assets');
  check('worker-canonical-redirect', worker.includes('canonical.hostname = String(env.CANONICAL_DOMAIN'), 'www hostname redirects to canonical apex');
  check('worker-health-contract', worker.includes(`url.pathname === '${contract.runtime?.healthPath}'`), 'health endpoint is implemented');
  for (const endpoint of contract.runtime?.requiredEndpoints || []) {
    const marker = `url.pathname === '${endpoint}'`;
    const aliasMarker = endpoint === '/api/v1/platform/manifest' ? `url.pathname === '/api/v1/runtime' || ${marker}` : marker;
    check(`runtime-${endpoint.replaceAll('/', '-')}`, worker.includes(marker) || worker.includes(aliasMarker), `${endpoint} has an explicit Worker route`);
  }

  for (const file of contract.requiredPublicFiles || []) {
    check(`public-file-${file}`, fs.existsSync(path.join(root, file)), `${file} exists at the static asset root`);
    const entries = ignore.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
    check(`published-file-${file}`, !entries.includes(file) && !entries.includes(`/${file}`), `${file} is not excluded from public assets`);
  }

  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || '';
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim() || '';
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1]?.trim() || '';
  check('homepage-title', title.length >= 10, 'homepage has a descriptive title');
  check('homepage-description', description.length >= 50, 'homepage has a useful meta description');
  check('homepage-canonical', canonical === contract.requiredLandingMetadata?.canonical, `homepage canonical is ${canonical || 'missing'}`);
  check('homepage-brand-headline', Boolean(contract.homepage?.headlineText) && html.includes(contract.homepage.headlineText) && html.includes(contract.homepage?.headlineAccentText || ''), 'homepage uses the approved unified-flagship headline');
  check('homepage-primary-destination', Boolean(contract.homepage?.primaryDestination) && html.includes(`href="${contract.homepage.primaryDestination}"`), 'homepage links to the primary That’s My Lingo destination');
  check('homepage-universe-destination', Boolean(contract.homepage?.universeDestination) && html.includes(`href="${contract.homepage.universeDestination}"`), 'homepage links to the Universe hub');
  check('homepage-brand-tagline', Boolean(contract.homepage?.brandTagline) && html.includes(contract.homepage.brandTagline), 'homepage carries the approved LINGO Legacy tagline');
  check('cloudflare-build-target-match', contract.deployment?.cloudflareGitBuildTargetWorkerName === wrangler.name, 'declared Cloudflare Git build target matches wrangler Worker identity');
  check('expected-root-route-owner', contract.deployment?.expectedRootRouteOwner === 'lingo-flagship-root', 'live exact-root route owner is explicitly recorded separately from wildcard runtime');
  check('expected-wildcard-route-owner', contract.deployment?.expectedWildcardRouteOwner === wrangler.name, 'apex and www wildcard routes are owned by the configured runtime Worker');
  check('exact-root-route-pattern', contract.deployment?.expectedExactRootRoutePattern === 'thelingolegacy.com/', 'exact-root route pattern is recorded without a wildcard');
  check('wildcard-route-pattern', contract.deployment?.expectedWildcardRoutePattern === 'thelingolegacy.com/*' && contract.deployment?.expectedWwwRoutePattern === 'www.thelingolegacy.com/*', 'apex and www wildcard route patterns are explicit');
  check('root-source-parity-pending', contract.deployment?.rootSourceParityStatus === 'snapshot-captured; canonical-index-preview-and-live-source-parity-pending', 'source parity is represented as pending rather than assumed');
  check('root-worker-snapshot', rootSnapshot.includes('<title>The Lingo Legacy — One Legacy. Many Worlds.</title>') && rootSnapshot.includes('id="catalog"'), 'captured live exact-root HTML is preserved for source comparison');
  check('preview-worker-import', previewWorker.includes("import worker from '../../worker.js'") && previewWorker.includes('export default worker'), 'preview reuses the canonical Worker runtime source');
  check('preview-worker-isolated', previewConfig.includes('name = "' + contract.deployment?.previewWorkerName + '"') && previewConfig.includes('workers_dev = true') && contract.deployment?.previewHasProductionRoutes === false && !previewConfig.includes('[[routes]]') && !previewConfig.includes('pattern = "thelingolegacy.com'), 'preview uses a distinct workers.dev name with no production custom-domain routes');
  check('preview-worker-assets', previewConfig.includes('run_worker_first = true') && previewConfig.includes('binding = "ASSETS"') && previewConfig.includes('directory = "."'), 'preview serves repository assets through the existing publication boundary');
  check('homepage-hybrid-direction', contract.homepage?.direction === 'hybrid-discovery-catalog', 'homepage contract selects the approved hybrid discovery catalog');
  check('homepage-search-control', html.includes('id="destination-search"') && html.includes("search.addEventListener('input', refresh)"), 'homepage provides a wired destination search control');
  check('homepage-category-filters', ['games', 'hub', 'commerce', 'stories', 'creative'].every((category) => html.includes('data-filter="' + category + '"')), 'homepage provides category filters for each catalog class');
  check('homepage-route-status-labels', (html.match(/data-route-status="unverified"/g) || []).length >= 6 && html.includes('Not yet verified live'), 'homepage labels unverified routes honestly instead of implying live availability');
  check('homepage-destination-search-data', (html.match(/data-category="/g) || []).length >= 6 && html.includes('catalog-empty'), 'catalog cards expose category data and an empty-results state');
  check('homepage-h1', /<h1\b/i.test(html), 'homepage has a primary H1');
  check('homepage-main', /<main\b/i.test(html), 'homepage uses a main landmark');
  check('homepage-nav', /<nav\b/i.test(html), 'homepage uses a navigation landmark');

  const sitemapLocs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const sitemapUrls = new Set(sitemapLocs);
  check('sitemap-canonical-origin', sitemapLocs.every((loc) => loc.startsWith(contract.site.canonicalOrigin)), 'sitemap URLs use the canonical origin');
  for (const route of contract.requiredLandingMetadata?.minimumPrimaryRoutes || []) {
    check(`sitemap-route-${route.replaceAll('/', '-')}`, sitemapUrls.has(`${contract.site.canonicalOrigin}${route}`), `sitemap includes canonical route ${route}`);
    const normalized = route.replace(/^\/+|\/+$/g, '');
    const filePath = normalized ? path.join(root, normalized, 'index.html') : path.join(root, 'index.html');
    check(`route-file-${route.replaceAll('/', '-')}`, fs.existsSync(filePath), `route ${route} has a static entrypoint`);
  }

  check('robots-sitemap', robots.includes(`Sitemap: ${contract.site.canonicalOrigin}/sitemap.xml`), 'robots.txt references the canonical sitemap');
  check('release-surface-list', Array.isArray(release.includedSurfaces), 'release manifest has an includedSurfaces list');
  check('fail-closed-policy', contract.governance?.ciMustFailClosed === true && contract.governance?.noProductionPromotionWithoutIndependentEvidence === true, 'contract requires fail-closed CI and independent release evidence');
}

const result = {
  ok: errors.length === 0,
  gate: 'LANDING_PAGE_ARCHITECTURE',
  contract: 'config/landing-page-contract.json',
  checkedAt: new Date().toISOString(),
  summary: { total: checks.length, passed: checks.length - errors.length, failed: errors.length },
  checks,
  errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
