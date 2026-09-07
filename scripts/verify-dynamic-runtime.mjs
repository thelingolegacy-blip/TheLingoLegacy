import fs from 'node:fs';
const worker=fs.readFileSync('worker.js','utf8');
const wrangler=fs.readFileSync('wrangler.jsonc','utf8');
for(const token of ["url.pathname === '/healthz'","url.pathname === '/api/v1/platform/status'","url.pathname === '/api/v1/site/context'","url.pathname.startsWith('/api/')","renderDynamicHtml","env.ASSETS.fetch(request)"]){if(!worker.includes(token))throw new Error(`Dynamic runtime contract missing: ${token}`)}
if(!wrangler.includes('"main": "worker.js"'))throw new Error('Cloudflare Worker entrypoint is not worker.js');
if(!wrangler.includes('"binding": "ASSETS"'))throw new Error('Cloudflare asset binding is missing');
if(wrangler.toLowerCase().includes('vercel'))throw new Error('Retired Vercel reference remains in Wrangler configuration');
console.log(JSON.stringify({gate:'dynamic-runtime-contract',status:'PASS',worker:'worker.js',api_boundary:'enabled',edge_html_runtime:'enabled',asset_delivery:'worker-controlled',retired_provider:'vercel'},null,2));
