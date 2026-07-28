const fs = require('fs');
const path = require('path');

function loadConfig() {
  const file = path.join(process.cwd(), 'config', 'casino', 'master.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('cache-control', 's-maxage=60, stale-while-revalidate=300');
  response.end(JSON.stringify(body, null, 2));
}

function readOnlyGuard(request, response) {
  if (request.method === 'GET') return false;
  sendJson(response, 501, {
    error: 'Config writes are intentionally disabled in the static foundation.',
    next: 'Wire this route to authenticated admin storage before enabling mutations.'
  });
  return true;
}

module.exports = { loadConfig, sendJson, readOnlyGuard };
