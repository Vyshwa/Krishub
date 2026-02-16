const http = require('http');
const url = require('url');

const PORT = 5000;
const FRONTEND_ORIGINS = ['http://localhost:3001', 'http://localhost:3000'];

function sendJSON(res, status, obj, headers = {}, origin = '') {
  const body = JSON.stringify(obj);
  const acao = FRONTEND_ORIGINS.includes(origin) ? origin : FRONTEND_ORIGINS[0];
  res.writeHead(status, Object.assign({
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': acao,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
  }, headers));
  res.end(body);
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  // CORS preflight
  const requestOrigin = req.headers.origin || '';
  if (req.method === 'OPTIONS') {
    const acao = FRONTEND_ORIGINS.includes(requestOrigin) ? requestOrigin : FRONTEND_ORIGINS[0];
    res.writeHead(204, {
      'Access-Control-Allow-Origin': acao,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (parsed.pathname === '/api/auth/me' && req.method === 'GET') {
    // return a mock unauthenticated response
    return sendJSON(res, 200, { user: null }, {}, requestOrigin);
  }

  if (parsed.pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        if (payload.email && payload.password) {
          // mock success
          return sendJSON(res, 200, { user: { id: 1, name: 'Dev User', email: payload.email } }, {
            'Set-Cookie': 'session=mock; HttpOnly; Path=/;'
          }, requestOrigin);
        }
      } catch {}
      return sendJSON(res, 400, { error: 'Invalid credentials' }, {}, requestOrigin);
    });
    return;
  }

  if (parsed.pathname === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      return sendJSON(res, 201, { message: 'Registered' }, {}, requestOrigin);
    });
    return;
  }

  if (parsed.pathname === '/api/auth/logout' && req.method === 'POST') {
    return sendJSON(res, 200, { message: 'Logged out' }, {}, requestOrigin);
  }

  // fallback
  sendJSON(res, 404, { error: 'Not found' }, {}, requestOrigin);
});

server.listen(PORT, () => {
  console.log(`Mock backend listening on http://localhost:${PORT}`);
});
