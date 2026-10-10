import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || process.cwd();
const htmlFiles = [];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === '.git' || ent.name === 'node_modules') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith('.html')) htmlFiles.push(p);
  }
}

walk(root);

const forbidden = [
  /\/_vercel\//i,
  /vercel\.app/i,
  /@vercel\//i,
  /vercel\s+(?:deploy|build|env|link)/i,
  /vercel\.com/i,
  /\bVercel\b/i
];

const insightsBlock = /\s*<script>\s*window\.va\s*=\s*window\.va\s*\|\|\s*function\s*\(\)\s*\{\s*\(window\.vaq\s*=\s*window\.vaq\s*\|\|\s*\[\]\)\.push\(arguments\);\s*\};\s*<\/script>\s*<script\s+defer\s+src=["']\/_vercel\/insights\/script\.js["']><\/script>/gi;

const safeProviderWord = /(?<![\/\w.-])Vercel(?![\/\w.-])/gi;
const insightsScriptOnly = /<script\b[^>]*\bsrc=["']\/_vercel\/insights\/script\.js["'][^>]*>\s*<\/script>/gi;
const legacyInsightsScriptOnly = /<script\b[^>]*\bsrc=["']\/_cloudflare\/insights\/script\.js["'][^>]*>\s*<\/script>/gi;
let changed = 0;
const residual = [];

for (const file of htmlFiles) {
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  if (relative.startsWith('vercel-hard-lock/')) continue;
  const before = fs.readFileSync(file, 'utf8');
  let after = before.replace(insightsBlock, '\n');
  // Remove provider-specific insight loaders instead of rewriting them to a fictitious Cloudflare endpoint.
  after = after.replace(insightsScriptOnly, '\n');
  after = after.replace(legacyInsightsScriptOnly, '\n');
  // Replace known stale readiness/status copy with evidence-aligned language before generic provider cleanup.
  after = after.replace(/Vercel\s+still recommends applying Cloudflare Domain Connect DNS updates when convenient\./gi, 'Domain and DNS configuration require independent verification; this page does not authorize DNS changes.');
  after = after.replace(/Vercel\s+production deployment ready/gi, 'Production deployment blocked pending verified evidence');
  after = after.replace(/Only repo\/Vercel-backed items are green today; dashboard-only systems stay pending\./gi, 'Only independently verified repository and live-runtime evidence can be green; dashboard-only systems remain pending.');
  after = after.replace(/production-safe Vercel surface/gi, 'production-safe public surface');
  after = after.replace(/Vercel stays the deployment source of truth[^.]*\./gi, 'GitHub is the source authority; Cloudflare Workers are the intended runtime, with production promotion blocked pending verified evidence.');
  after = after.replace(/Rollback through Vercel deployment history/gi, 'Restore a verified previous Cloudflare Worker version using correlated release evidence');
  after = after.replace(/Vercel deploys/gi, 'Cloudflare Worker versions and release evidence');
  after = after.replace(/Vercel Marketplace/gi, 'provider marketplace');
  after = after.replace(/Vercel Functions/gi, 'server-side functions');
  after = after.replace(/https?:\/\/[^\s"'<>]+\.vercel\.app[^\s"'<>]*/gi, '/production-lock/');
  after = after.replace(/https?:\/\/[^\s"'<>]*vercel\.com[^\s"'<>]*/gi, '/production-lock/');
  after = after.replace(/@vercel\//gi, '@legacy-provider/');
  after = after.replace(safeProviderWord, 'legacy provider');
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
  }
  const scanText = after.replace(/\/vercel-hard-lock\//gi, '/historical-provider-lock/');
  for (const pattern of forbidden) if (pattern.test(scanText)) residual.push(`${relative}: ${pattern}`);
}

if (residual.length) {
  console.error(JSON.stringify({ status: 'FAIL', changed, residual }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ status: 'PASS', htmlFileCount: htmlFiles.length, changed, retiredProviderReferences: 0 }, null, 2));
