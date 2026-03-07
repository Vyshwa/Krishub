const http = require('http');
const url = require('url');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const PORT = 5000;
const FRONTEND_ORIGINS = ['http://localhost:3001', 'http://localhost:3000'];

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'krishub';

const DEFAULT_USER = { name: 'Default User', email: 'user@gmail.com', password: '1234' };
const SESSIONS = new Map();

let db, Users;

async function ensureDb() {
  if (db) return;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  Users = db.collection('users');
  const existing = await Users.findOne({ email: DEFAULT_USER.email });
  if (!existing) {
    await Users.insertOne({ ...DEFAULT_USER, createdAt: new Date() });
  }
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach((part) => {
    const [k, v] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(v || '');
  });
  return out;
}

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
    ensureDb().then(async () => {
      const cookies = parseCookies(req.headers.cookie || '');
      const token = cookies.session;
      const uid = token ? SESSIONS.get(token) : null;
      let user = null;
      if (uid) {
        const u = await Users.findOne({ _id: new ObjectId(uid) }, { projection: { password: 0 } });
        if (u) user = { id: u._id.toString(), name: u.name, email: u.email };
      }
      sendJSON(res, 200, { user }, {}, requestOrigin);
    });
    return;
  }

  if (parsed.pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        ensureDb().then(async () => {
          const u = await Users.findOne({ email: payload.email, password: payload.password });
          if (u) {
            const token = Math.random().toString(36).slice(2);
            SESSIONS.set(token, u._id.toString());
            return sendJSON(
              res,
              200,
              { user: { id: u._id.toString(), name: u.name, email: u.email } },
              { 'Set-Cookie': `session=${token}; Path=/; HttpOnly; SameSite=Lax` },
              requestOrigin
            );
          }
          sendJSON(res, 401, { error: 'Invalid credentials' }, {}, requestOrigin);
        });
        return;
      } catch {}
      return sendJSON(res, 401, { error: 'Invalid credentials' }, {}, requestOrigin);
    });
    return;
  }

  if (parsed.pathname === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        ensureDb().then(async () => {
          const exists = await Users.findOne({ email: payload.email });
          if (exists) return sendJSON(res, 409, { error: 'Email exists' }, {}, requestOrigin);
          const doc = { name: payload.name || payload.email, email: payload.email, password: payload.password, createdAt: new Date() };
          const r = await Users.insertOne(doc);
          sendJSON(res, 201, { id: r.insertedId.toString() }, {}, requestOrigin);
        });
      } catch {
        sendJSON(res, 400, { error: 'Invalid payload' }, {}, requestOrigin);
      }
    });
    return;
  }

  if (parsed.pathname === '/api/auth/logout' && req.method === 'POST') {
    const cookies = parseCookies(req.headers.cookie || '');
    const token = cookies.session;
    if (token) SESSIONS.delete(token);
    return sendJSON(
      res,
      200,
      { message: 'Logged out' },
      { 'Set-Cookie': 'session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax' },
      requestOrigin
    );
  }

  // fallback
  sendJSON(res, 404, { error: 'Not found' }, {}, requestOrigin);
});

server.listen(PORT, () => {
  console.log(`Mock backend listening on http://localhost:${PORT}`);
});
