#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.argv[2] || path.join(HERE, '..'));
const OUT = path.resolve(process.argv[3] || path.join(ROOT, 'dist-public'));
const CONTRACT_PATH = path.join(ROOT, 'config/public/public-routes.json');

export function normalizeRoute(route) {
  if (typeof route !== 'string' || !route.startsWith('/') || route.startsWith('//') || route.includes('\\') || route.includes('..') || /[?#\s]/.test(route)) {
    throw new Error(`Invalid public route: ${String(route)}`);
  }
  return route.endsWith('/') ? route : `${route}/`;
}

export function validatePublicContract(contract) {
  if (!contract || contract.contract !== 'LINGO_PUBLIC_SITE_ROUTES' || !Array.isArray(contract.approvedRoutes) || !Array.isArray(contract.assetFiles)) {
    throw new Error('Public route contract is missing required structure.');
  }
  const excluded = contract.excludedRoutePrefixes || [];
  const seen = new Set();
  for (const entry of contract.approvedRoutes) {
    const route = normalizeRoute(entry.path);
    if (seen.has(route)) throw new Error(`Duplicate public route: ${route}`);
    seen.add(route);
    if (entry.status !== 'approved') throw new Error(`Route is not approved: ${route}`);
    if (excluded.some(prefix => route.startsWith(prefix))) throw new Error(`Excluded internal route cannot be published: ${route}`);
    if (typeof entry.source !== 'string' || path.isAbsolute(entry.source) || entry.source.split(/[\\/]/).includes('..')) {
      throw new Error(`Invalid source path for ${route}`);
    }
  }
  if (!seen.size) throw new Error('No approved public routes. Publication is blocked pending explicit route approval.');
  if (!seen.has('/')) throw new Error('Approved public route set must include the root route /.');
  const assetSeen = new Set();
  for (const asset of contract.assetFiles) {
    if (typeof asset !== 'string' || path.isAbsolute(asset) || asset.split(/[\\/]/).includes('..')) throw new Error(`Invalid asset path: ${String(asset)}`);
    if (assetSeen.has(asset)) throw new Error(`Duplicate asset path: ${asset}`);
    assetSeen.add(asset);
  }
  return { routes: [...seen].sort(), assets: [...assetSeen].sort() };
}


export function validateHtmlReferences(html, route, origin, approvedRoutes, assetFiles) {
  const allowedRoutes = new Set(approvedRoutes.map(normalizeRoute));
  const allowedAssets = new Set(assetFiles);
  const base = new URL(route, origin);
  const references = [];
  const add = value => { if (typeof value === 'string' && value.trim()) references.push(value.trim()); };
  for (const match of html.matchAll(/\\b(?:href|src|action|poster|data)\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))/gi)) add(match[1] ?? match[2] ?? match[3]);
  for (const match of html.matchAll(/\\bsrcset\\s*=\\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    for (const candidate of (match[1] ?? match[2]).split(',')) add(candidate.trim().split(/\\s+/)[0]);
  }
  const cssBlocks = [...html.matchAll(/\\bstyle\\s*=\\s*(?:"([^"]*)"|'([^']*)')/gi)].map(m => m[1] ?? m[2]);
  cssBlocks.push(...[...html.matchAll(/<style\\b[^>]*>([\\s\\S]*?)<\\/style>/gi)].map(m => m[1]));
  for (const css of cssBlocks) {
    for (const match of css.matchAll(/url\\(\\s*["']?([^"')]+)["']?\\s*\\)|@import\\s+["']([^"']+)["']/gi)) add(match[1] ?? match[2]);
  }
  for (const match of html.matchAll(/<script\\b[^>]*>([\\s\\S]*?)<\\/script>/gi)) {
    for (const js of match[1].matchAll(/(?:fetch|import|Worker|SharedWorker|EventSource)\\s*\\(\\s*["']([^"']+)["']/g)) add(js[1]);
    for (const js of match[1].matchAll(/(?:src|href)\\s*[:=]\\s*["']([^"']+)["']/gi)) add(js[1]);
  }
  for (const raw of references) {
    if (raw.startsWith('#') || /^(?:https?:|mailto:|tel:|data:|blob:)/i.test(raw)) continue;
    if (/^(?:javascript:|file:)/i.test(raw) || raw.startsWith('//')) throw new Error(`Unsafe local reference on ${route}: ${raw}`);
    let target;
    try { target = new URL(raw, base); } catch { throw new Error(`Invalid local reference on ${route}: ${raw}`); }
    if (target.origin !== new URL(origin).origin) continue;
    let pathname;
    try { pathname = decodeURIComponent(target.pathname); } catch { throw new Error(`Invalid encoded local reference on ${route}: ${raw}`); }
    if (pathname.split('/').includes('..')) throw new Error(`Traversal reference on ${route}: ${raw}`);
    const routeCandidate = pathname.endsWith('/') ? pathname : (path.extname(pathname) ? null : `${pathname}/`);
    if (routeCandidate && allowedRoutes.has(normalizeRoute(routeCandidate))) continue;
    const assetCandidate = pathname.replace(/^\\/+/, '');
    if (allowedAssets.has(assetCandidate)) continue;
    throw new Error(`Unapproved local destination on ${route}: ${raw}`);
  }
}

function ensureRegularFile(root, relative) {
  const rootReal = fs.realpathSync(root);
  const absolute = path.resolve(rootReal, relative);
  if (!absolute.startsWith(rootReal + path.sep)) throw new Error(`Path escapes source root: ${relative}`);
  let cursor = rootReal;
  for (const part of path.relative(rootReal, absolute).split(path.sep)) {
    cursor = path.join(cursor, part);
    const stat = fs.lstatSync(cursor);
    if (stat.isSymbolicLink()) throw new Error(`Symlink path component is not allowed: ${relative}`);
  }
  const stat = fs.lstatSync(absolute);
  if (!stat.isFile()) throw new Error(`Expected regular file: ${relative}`);
  return absolute;
}
export function buildPublicDist(root, out, contract) {
  const validated = validatePublicContract(contract);
  const origin = new URL(contract.canonicalOrigin);
  for (const entry of contract.approvedRoutes) {
    const route = normalizeRoute(entry.path);
    const source = ensureRegularFile(root, entry.source);
    validateHtmlReferences(fs.readFileSync(source, 'utf8'), route, origin.origin, validated.routes, validated.assets);
  }
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  for (const entry of contract.approvedRoutes) {
    const route = normalizeRoute(entry.path);
    const source = ensureRegularFile(root, entry.source);
    const destination = path.join(out, route.slice(1), 'index.html');
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
  for (const asset of validated.assets) {
    const source = ensureRegularFile(root, asset);
    const destination = path.join(out, asset);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
  const urls = validated.routes.map(route => `  <url><loc>${origin.origin}${route}</loc></url>`).join('\n');
  fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  const policy = contract.crawlerPolicy || {};
  const disallowPaths = [...new Set([...(policy.disallow || []), ...(contract.excludedRoutePrefixes || [])])].sort();
  const disallow = disallowPaths.map(p => `Disallow: ${p}`).join('\n');
  const allow = (policy.allow || []).map(p => `Allow: ${p}`).join('\n');
  fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: ${policy.userAgent || '*'}\n${disallow}\n${allow}\n\nSitemap: ${origin.origin}${policy.sitemapPath || '/sitemap.xml'}\n`);
  return { routes: validated.routes, assets: validated.assets, output: out };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf8'));
    const result = buildPublicDist(ROOT, OUT, contract);
    process.stdout.write(JSON.stringify({ ok: true, ...result }, null, 2) + '\n');
  } catch (error) {
    process.stderr.write(`PUBLIC BUILD BLOCKED: ${error.message}\n`);
    process.exitCode = 1;
  }
}
