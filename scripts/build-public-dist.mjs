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
  if (!contract || contract.contract !== 'LINGO_PUBLIC_SITE_ROUTES' || !Array.isArray(contract.approvedRoutes) || !Array.isArray(contract.assetFiles) || !Array.isArray(contract.candidateRoutes)) {
    throw new Error('Public route contract is missing required structure.');
  }
  const candidates = new Map();
  for (const candidate of contract.candidateRoutes) {
    const candidatePath = normalizeRoute(candidate.path);
    if (candidates.has(candidatePath)) throw new Error(`Duplicate candidate route: ${candidatePath}`);
    candidates.set(candidatePath, candidate);
  }
  const excluded = contract.excludedRoutePrefixes || [];
  const seen = new Set();
  for (const entry of contract.approvedRoutes) {
    const route = normalizeRoute(entry.path);
    if (seen.has(route)) throw new Error(`Duplicate public route: ${route}`);
    seen.add(route);
    if (entry.status !== 'approved') throw new Error(`Route is not approved: ${route}`);
    if (excluded.some(prefix => route.startsWith(prefix))) throw new Error(`Excluded internal route cannot be published: ${route}`);
    const candidate = candidates.get(route);
    if (!candidate) throw new Error(`Public route is missing from candidate inventory: ${route}`);
    if (candidate.status !== 'proposed') throw new Error(`Candidate route is not eligible for publication: ${route} (${candidate.status})`);
    if (candidate.source !== entry.source) throw new Error(`Approved route source does not match candidate inventory: ${route}`);
    if (typeof entry.source !== 'string' || path.isAbsolute(entry.source) || entry.source.split(/[\\/]/).includes('..')) {
      throw new Error(`Invalid source path for ${route}`);
    }
  }
  if (!seen.size) throw new Error('No approved public routes. Publication is blocked pending explicit route approval.');
  if (!seen.has('/')) throw new Error('Approved public route set must include the root route /.');
  const approval = contract.approvalRecord || {};
  if (typeof approval.approvedBy !== 'string' || !approval.approvedBy.trim() ||
      typeof approval.approvedAt !== 'string' || !Number.isFinite(Date.parse(approval.approvedAt)) ||
      typeof approval.changeReference !== 'string' || !approval.changeReference.trim()) {
    throw new Error('Approved routes require a complete approval record: approvedBy, approvedAt, and changeReference.');
  }
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
  for (const match of html.matchAll(/\b(?:href|src|action|poster|data)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) add(match[1] ?? match[2] ?? match[3]);
  for (const match of html.matchAll(/\bsrcset\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    for (const candidate of (match[1] ?? match[2]).split(',')) add(candidate.trim().split(/\s+/)[0]);
  }
  const cssBlocks = [...html.matchAll(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map(m => m[1] ?? m[2]);
  cssBlocks.push(...[...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]));
  for (const css of cssBlocks) {
    for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)|@import\s+["']([^"']+)["']/gi)) add(match[1] ?? match[2]);
  }
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    for (const js of match[1].matchAll(/(?:fetch|import|Worker|SharedWorker|EventSource)\s*\(\s*["']([^"']+)["']/g)) add(js[1]);
    for (const js of match[1].matchAll(/(?:src|href)\s*[:=]\s*["']([^"']+)["']/gi)) add(js[1]);
  }
  for (const raw of references) {
    if (raw.startsWith('#') || /^(?:https?:|mailto:|tel:|data:|blob:)/i.test(raw)) continue;
    if (/^(?:javascript:|file:)/i.test(raw) || raw.startsWith('//')) throw new Error('Unsafe local reference on ' + route + ': ' + raw);
    let target;
    try { target = new URL(raw, base); } catch { throw new Error('Invalid local reference on ' + route + ': ' + raw); }
    if (target.origin !== new URL(origin).origin) continue;
    let pathname;
    try { pathname = decodeURIComponent(target.pathname); } catch { throw new Error('Invalid encoded local reference on ' + route + ': ' + raw); }
    if (pathname.split('/').includes('..')) throw new Error('Traversal reference on ' + route + ': ' + raw);
    const routeCandidate = pathname.endsWith('/') ? pathname : (path.extname(pathname) ? null : pathname + '/');
    if (routeCandidate && allowedRoutes.has(normalizeRoute(routeCandidate))) continue;
    const assetCandidate = pathname.replace(/^\/+/, '');
    if (allowedAssets.has(assetCandidate)) continue;
    throw new Error('Unapproved local destination on ' + route + ': ' + raw);
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
  const sourceRoot = fs.realpathSync(root);
  const outputPath = path.resolve(out);
  if (outputPath === sourceRoot || sourceRoot.startsWith(outputPath + path.sep)) {
    throw new Error('Output path must not contain or replace the source root.');
  }
  const outputParent = path.dirname(outputPath);
  fs.mkdirSync(outputParent, { recursive: true });
  if (fs.existsSync(outputPath) && fs.lstatSync(outputPath).isSymbolicLink()) {
    throw new Error('Output path must not be a symlink.');
  }

  const pageSources = contract.approvedRoutes.map(entry => {
    const route = normalizeRoute(entry.path);
    const source = ensureRegularFile(sourceRoot, entry.source);
    validateHtmlReferences(fs.readFileSync(source, 'utf8'), route, origin.origin, validated.routes, validated.assets);
    return { route, source, destination: route === '/' ? 'index.html' : path.join(route.slice(1), 'index.html') };
  });
  const assetSources = validated.assets.map(asset => ({
    asset,
    source: ensureRegularFile(sourceRoot, asset),
    destination: asset
  }));

  const destinations = new Set(['sitemap.xml', 'robots.txt']);
  for (const item of [...pageSources, ...assetSources]) {
    const normalized = item.destination.split(path.sep).join('/');
    if (destinations.has(normalized)) throw new Error('Publication destination collision: ' + normalized);
    destinations.add(normalized);
  }

  const stage = fs.mkdtempSync(path.join(outputParent, '.dist-public-stage-'));
  const backup = outputPath + '.previous-' + process.pid;
  let movedOldOutput = false;
  try {
    for (const page of pageSources) {
      const destination = path.join(stage, page.destination);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(page.source, destination, fs.constants.COPYFILE_EXCL);
    }
    for (const asset of assetSources) {
      const destination = path.join(stage, asset.destination);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(asset.source, destination, fs.constants.COPYFILE_EXCL);
    }
    const urls = validated.routes.map(route => '  <url><loc>' + origin.origin + route + '</loc></url>').join('\n');
    fs.writeFileSync(path.join(stage, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '\n</urlset>\n', { flag: 'wx' });
    const policy = contract.crawlerPolicy || {};
    const disallowPaths = [...new Set([...(policy.disallow || []), ...(contract.excludedRoutePrefixes || [])])].sort();
    const disallow = disallowPaths.map(p => 'Disallow: ' + p).join('\n');
    const allow = (policy.allow || []).map(p => 'Allow: ' + p).join('\n');
    fs.writeFileSync(path.join(stage, 'robots.txt'), 'User-agent: ' + (policy.userAgent || '*') + '\n' + disallow + '\n' + allow + '\n\nSitemap: ' + origin.origin + (policy.sitemapPath || '/sitemap.xml') + '\n', { flag: 'wx' });

    if (fs.existsSync(outputPath)) {
      if (!fs.lstatSync(outputPath).isDirectory()) throw new Error('Existing output path is not a directory.');
      if (fs.existsSync(backup)) throw new Error('Refusing to overwrite an existing output backup: ' + backup);
      fs.renameSync(outputPath, backup);
      movedOldOutput = true;
    }
    try {
      fs.renameSync(stage, outputPath);
    } catch (error) {
      if (movedOldOutput && !fs.existsSync(outputPath)) fs.renameSync(backup, outputPath);
      movedOldOutput = false;
      throw error;
    }
    if (movedOldOutput) fs.rmSync(backup, { recursive: true, force: true });
    return { routes: validated.routes, assets: validated.assets, output: outputPath };
  } catch (error) {
    if (fs.existsSync(stage)) fs.rmSync(stage, { recursive: true, force: true });
    if (movedOldOutput && !fs.existsSync(outputPath) && fs.existsSync(backup)) fs.renameSync(backup, outputPath);
    throw error;
  }
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
