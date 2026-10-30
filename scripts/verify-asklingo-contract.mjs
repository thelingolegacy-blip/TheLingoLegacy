import fs from 'node:fs';
const worker = fs.readFileSync('worker.js','utf8');
const portal = fs.readFileSync('studio-sites/index.html','utf8');
const checks = [
  ['chat endpoint',worker.includes("url.pathname === '/api/v1/asklingo/chat'")],
  ['status endpoint',worker.includes("url.pathname === '/api/v1/asklingo/status'")],
  ['origin allowlist',worker.includes('allowedOrigins(env).has(origin.toLowerCase())')],
  ['request size bound',worker.includes('raw.length > 5000')],
  ['message length bound',worker.includes(".slice(0, 1200)")],
  ['rate limit',worker.includes('ASK_RATE_LIMIT = 20') && worker.includes('askRateAllowed(request)')],
  ['safe fallback',worker.includes('function askFallback(message)')],
  ['AI is opt-in',worker.includes("env.ASKLINGO_AI_ENABLED === 'true' && env.AI && env.ASKLINGO_MODEL")],
  ['correlation ID',worker.includes('crypto.randomUUID()')],
  ['L dock present',portal.includes('class="ask-l-dock"')],
  ['accessible chat dialog',portal.includes('role="dialog" aria-modal="false"')],
  ['chat uses textContent',portal.includes("node.textContent=text")],
  ['chat API call',portal.includes("fetch('/api/v1/asklingo/chat'")],
  ['keyboard escape close',portal.includes("e.key==='Escape'")],
  ['reduced motion',portal.includes('@media(prefers-reduced-motion:reduce)')]
];
const failed = checks.filter(([,ok])=>!ok);
if (failed.length) {
  console.error('ASKLINGO CONTRACT FAILED\n- '+failed.map(([name])=>name).join('\n- '));
  process.exit(1);
}
console.log('ASKLINGO_EDGE_CONTRACT=PASS');
console.log('ASKLINGO_SECURITY_CONTRACT=PASS');
console.log('ASKLINGO_UNIVERSAL_WEB_DOCK=PASS');
