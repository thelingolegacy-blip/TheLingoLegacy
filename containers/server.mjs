import http from 'node:http';

const host = process.env.HOST || '0.0.0.0';
const port = Number.parseInt(process.env.PORT || '8080', 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'GET' && url.pathname === '/healthz') {
    response.writeHead(200, {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    });
    response.end('ok\n');
    return;
  }

  response.writeHead(404, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify({ ok: false, error: 'Not found' }) + '\n');
});

server.listen(port, host, () => {
  console.log(JSON.stringify({ event: 'server_listening', host, port, mode: 'container-scaffold-only' }));
});

function shutdown(signal) {
  console.log(JSON.stringify({ event: 'server_shutdown', signal }));
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
