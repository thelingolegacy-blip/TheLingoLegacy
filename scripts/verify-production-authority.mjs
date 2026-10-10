import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync('config/production.json', 'utf8'));
const wrangler = fs.readFileSync('wrangler.jsonc', 'utf8');
const worker = fs.readFileSync('worker.js', 'utf8');

const domain = config.canonicalDomain;
const required = ['cloudflare', 'worker_pages', 'api', 'firebase', 'cors', 'websocket', 'live_probes', 'activation_gate'];
const failures = [];

if (!domain || domain.includes('<') || domain.includes('>')) failures.push('canonicalDomain is unresolved');
if (config.authorityChain?.source !== 'canonicalDomain') failures.push('authorityChain source must be canonicalDomain');
if (config.authorityChain?.enforcement !== 'strict') failures.push('authorityChain enforcement must be strict');
if (config.authorityChain?.onMismatch !== 'BLOCK') failures.push('authorityChain onMismatch must be BLOCK');
for (const item of required) if (!config.authorityChain.propagation.includes(item)) failures.push(`authorityChain missing ${item}`);
if (!wrangler.includes('"name": "thelingolegacy"')) failures.push('Worker name mismatch');
if (!wrangler.includes('"main": "worker.js"')) failures.push('Worker entrypoint mismatch');
if (!wrangler.includes('"binding": "ASSETS"')) failures.push('ASSETS binding missing');
if (!worker.includes("url.pathname === '/healthz'")) failures.push('healthz route missing');
if (!worker.includes("url.pathname.startsWith('/api/')")) failures.push('API boundary missing');

const result = {
  gate: 'production-authority',
  status: failures.length ? 'FAIL' : 'PASS',
  canonicalDomain: domain,
  worker: 'thelingolegacy',
  entrypoint: 'worker.js',
  failures,
  rule: 'Any authority-chain mismatch blocks activation.'
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
