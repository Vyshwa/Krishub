const http = require('http');
const url = require('url');
const { MongoClient, ObjectId } = require('mongodb');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');
require('dotenv').config();

// WebAuthn / Passkey config
const RP_NAME = 'KrishHub';
const RP_ID = process.env.WEBAUTHN_RP_ID || 'krishub.in';
const WEBAUTHN_ORIGIN = process.env.WEBAUTHN_ORIGIN || 'https://krishub.in';

// AES-256-GCM encryption for sensitive data (recovery emails etc.)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.createHash('sha256').update('krishub-default-enc-key-change-me').digest();
function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let enc = cipher.update(text, 'utf8', 'hex');
  enc += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return iv.toString('hex') + ':' + enc + ':' + tag;
}
function decrypt(blob) {
  const [ivHex, enc, tagHex] = blob.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  let dec = decipher.update(enc, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

const PORT = process.env.PORT || 1002;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3004/api/v1';
const AUTH_ADMIN_EMAIL = process.env.AUTH_ADMIN_EMAIL || 'info@krishub.in';
const AUTH_ADMIN_PASSWORD = process.env.AUTH_ADMIN_PASSWORD || '';

// Cached super-admin token for auth-service /admin/* endpoints
let _adminToken = null;
let _adminTokenExp = 0;
async function getAdminToken() {
  if (_adminToken && Date.now() < _adminTokenExp) return _adminToken;
  const r = await fetch(`${AUTH_SERVICE_URL}/auth-service-admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: AUTH_ADMIN_EMAIL, password: AUTH_ADMIN_PASSWORD }),
  });
  const d = await r.json();
  const token = d?.data?.accessToken;
  if (!token) throw new Error('Failed to obtain admin token');
  _adminToken = token;
  _adminTokenExp = Date.now() + 14 * 60 * 1000; // cache 14 min (token likely 15 min)
  return _adminToken;
}
const FRONTEND_ORIGINS = [
  'http://localhost:3001', 'http://localhost:3000', 'http://localhost:1001',
  'https://krishub.in', 'https://www.krishub.in',
];

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'krishub';
const PG_DATABASE_URL = process.env.PG_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/krishub';

let db, pgPool;
let JWT_SECRET = null;

/* ------------------------------------------------------------------ */
/*  PostgreSQL                                                         */
/* ------------------------------------------------------------------ */
async function ensurePg() {
  if (pgPool) return pgPool;
  pgPool = new Pool({ connectionString: PG_DATABASE_URL });
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      url TEXT,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  return pgPool;
}

async function loadJwtSecret() {
  const pool = await ensurePg();
  const { rows } = await pool.query(`SELECT value FROM app_settings WHERE key = 'JWT_ACCESS_SECRET'`);
  if (rows.length) JWT_SECRET = rows[0].value;
}

async function seedWorkspaces() {
  const pool = await ensurePg();
  const { rows } = await pool.query('SELECT COUNT(*)::int AS cnt FROM workspaces');
  if (rows[0].cnt > 0) return;
  const seeds = [
    { name: 'Renote', slug: 'renote', icon: '📝', url: 'https://renote.krishub.in', description: 'Invoice & Billing' },
    { name: 'ReGen', slug: 'regen', icon: '🔄', url: 'https://regen.krishub.in', description: 'Resume Generator' },
    { name: 'Reveal', slug: 'reveal', icon: '📊', url: 'https://reveal.krishub.in', description: 'Presentation Builder' },
    { name: 'Reside', slug: 'reside', icon: '🏠', url: '/', description: 'Property Management' },
    { name: 'Reserve', slug: 'reserve', icon: '📅', url: '/', description: 'Booking System' },
    { name: 'Request', slug: 'request', icon: '📬', url: '/', description: 'Service Requests' },
  ];
  for (const s of seeds) {
    await pool.query(
      `INSERT INTO workspaces (name, slug, icon, url, description) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (slug) DO NOTHING`,
      [s.name, s.slug, s.icon, s.url, s.description],
    );
  }
}

/* ------------------------------------------------------------------ */
/*  MongoDB                                                            */
/* ------------------------------------------------------------------ */
async function ensureDb() {
  if (db) return;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
}

async function seedRecoveryEmails() {
  await ensureDb();
  const col = db.collection('recovery_emails');
  const SEED_EMAILS = [
    'admin@krishub.in',
    'info@krishub.in',
    'vyshwa@gmail.com',
    'email2jai@rediffmail.com',
    'priyanka.cbe@gmail.com',
    'yuvamcse@gmail.com',
  ];
  const existing = await col.find({}).toArray();
  const existingPlain = existing.map(d => decrypt(d.emailEncrypted).toLowerCase());
  const missing = SEED_EMAILS.filter(e => !existingPlain.includes(e.toLowerCase()));
  if (missing.length === 0) return;
  const docs = missing.map(e => ({
    emailEncrypted: encrypt(e),
    verified: true,
    createdAt: new Date(),
  }));
  await col.insertMany(docs);
  console.log(`Seeded ${docs.length} recovery email(s) (encrypted)`);
}

async function seedProjects() {
  await ensureDb();
  const Projects = db.collection('projects');
  const count = await Projects.countDocuments();
  if (count > 0) return;
  const defaults = { code: '', gitBranch: 'main', installCommand: 'npm install', buildCommand: 'npm run build', status: 'active', lastDeployedAt: null, createdAt: new Date(), updatedAt: new Date() };
  const seeds = [
    {
      ...defaults, name: 'reNote', code: 'RENOTE', type: 'fullstack',
      frontendPath: '/k_live/renote/frontend', backendPath: '/k_live/renote/backend',
      frontendPort: 6001, backendPort: 6003,
      pm2FrontendName: 'renote-frontend', pm2BackendName: 'renote-backend',
      systemdFrontendName: null, systemdBackendName: null,
      gitFrontend: null, gitBackend: null,
    },
    {
      ...defaults, name: 'ReGen', code: 'REGEN', type: 'fullstack',
      frontendPath: '/k_live/regen/frontend', backendPath: '/k_live/regen/backend',
      frontendPort: 2000, backendPort: 5006,
      pm2FrontendName: null, pm2BackendName: 'regen-backend',
      systemdFrontendName: null, systemdBackendName: null,
      gitFrontend: null, gitBackend: null,
    },
    {
      ...defaults, name: 'KrishHub', code: 'KRISHUB', type: 'fullstack',
      frontendPath: '/k_live/krishub/frontend', backendPath: '/k_live/krishub/backend',
      frontendPort: null, backendPort: 1002,
      pm2FrontendName: null, pm2BackendName: null,
      systemdFrontendName: null, systemdBackendName: 'krishub-backend',
      gitFrontend: 'git@github.com:Vyshwa/Krishub.git', gitBackend: 'git@github.com:Vyshwa/Krishub.git',
    },
    {
      ...defaults, name: 'Auth Service', code: 'AUTH_SERVICE', type: 'backend',
      frontendPath: null, backendPath: '/k_live/auth-service',
      frontendPort: null, backendPort: 3004,
      pm2FrontendName: null, pm2BackendName: 'renote-auth',
      systemdFrontendName: null, systemdBackendName: null,
      buildCommand: 'npx prisma generate && npm run build',
      gitFrontend: null, gitBackend: null,
    },
    {
      ...defaults, name: 'Reveal', code: 'REVEAL', type: 'fullstack',
      frontendPath: '/k_live/reveal/frontend', backendPath: '/k_live/reveal/backend',
      frontendPort: 3000, backendPort: 5001,
      pm2FrontendName: 'reveal-frontend', pm2BackendName: 'reveal-backend',
      systemdFrontendName: null, systemdBackendName: null,
      gitFrontend: 'git@github.com:Vyshwa/reveal-frontend.git', gitBackend: 'git@github.com:Vyshwa/reveal-backend.git',
    },
  ];
  await Projects.insertMany(seeds);
}

/* ------------------------------------------------------------------ */
/*  SSO token                                                          */
/* ------------------------------------------------------------------ */
function makeSsoToken(userId) {
  if (!JWT_SECRET) return null;
  return jwt.sign({ sub: userId, type: 'sso' }, JWT_SECRET, { expiresIn: '7d' });
}

/* ---- Extract userId from Authorization header ---- */
function getUserIdFromAuth(req) {
  const auth = req.headers.authorization;
  if (!auth || !JWT_SECRET) return null;
  try {
    const token = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.sub || decoded.userId || null;
  } catch { return null; }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => resolve(data));
  });
}

function sendJSON(res, status, obj, headers = {}, origin = '') {
  const body = JSON.stringify(obj);
  const acao = FRONTEND_ORIGINS.includes(origin) ? origin : '';
  const h = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  };
  if (acao) {
    h['Access-Control-Allow-Origin'] = acao;
    h['Access-Control-Allow-Credentials'] = 'true';
    h['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }
  res.writeHead(status, h);
  res.end(body);
}

/* ------------------------------------------------------------------ */
/*  Auth-service proxy                                                 */
/* ------------------------------------------------------------------ */
async function proxyAuth(method, authPath, body, cookieHeader, authorizationHeader) {
  const fullUrl = `${AUTH_SERVICE_URL}${authPath}`;
  const headers = { 'Content-Type': 'application/json', 'app-code': 'KRISHUB' };
  if (cookieHeader) headers['Cookie'] = cookieHeader;
  if (authorizationHeader) headers['Authorization'] = authorizationHeader;
  const opts = { method, headers };
  if (body && method !== 'GET') opts.body = body;
  const r = await fetch(fullUrl, opts);
  const setCookie = r.headers.get('set-cookie');
  const ct = r.headers.get('content-type') || '';
  let data = null;
  if (ct.includes('application/json')) {
    data = await r.json();
  } else {
    data = { raw: await r.text() };
  }
  return { status: r.status, data, setCookie };
}

function makeRefreshCookie(refreshToken) {
  const maxAge = 30 * 24 * 60 * 60; // 30 days
  return `krishub_refresh=${refreshToken}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
}

function clearRefreshCookie() {
  return 'krishub_refresh=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure';
}

function getRefreshTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/krishub_refresh=([^;]+)/);
  return match ? match[1] : null;
}

/* ------------------------------------------------------------------ */
/*  Deploy helpers                                                     */
/* ------------------------------------------------------------------ */
function safeExec(cmd, cwd) {
  return new Promise((resolve, reject) => {
    exec(cmd, {
      cwd,
      timeout: 120000,
      env: { ...process.env, HOME: '/home/vyshwa', SSH_AUTH_SOCK: process.env.SSH_AUTH_SOCK || '' },
    }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve(stdout.trim());
    });
  });
}

function findGitRoot(dirPath) {
  let current = dirPath;
  while (current !== '/') {
    if (existsSync(path.join(current, '.git'))) return current;
    current = path.dirname(current);
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  PM2 Metrics History + WebSocket                                    */
/* ------------------------------------------------------------------ */
const METRICS_INTERVAL = 3000;       // collect every 3 s
const METRICS_MAX_POINTS = 1200;     // keep ~1 hour at 3 s intervals
const metricsHistory = {};           // { procName: [ { ts, cpu, mem } ] }
let latestPm2Snapshot = [];          // latest full PM2 snapshot

function collectPm2Metrics() {
  exec('pm2 jlist', { timeout: 10000 }, (err, stdout) => {
    if (err) return;
    try {
      const procs = JSON.parse(stdout);
      const now = Date.now();
      latestPm2Snapshot = procs.map(p => ({
        name: p.name, pid: p.pid, status: p.pm2_env?.status || 'unknown',
        cpu: p.monit?.cpu || 0, memory: p.monit?.memory || 0,
        uptime: p.pm2_env?.pm_uptime || 0,
      }));
      for (const p of latestPm2Snapshot) {
        if (!metricsHistory[p.name]) metricsHistory[p.name] = [];
        const arr = metricsHistory[p.name];
        arr.push({ ts: now, cpu: p.cpu, mem: +(p.memory / 1024 / 1024).toFixed(1) });
        if (arr.length > METRICS_MAX_POINTS) arr.splice(0, arr.length - METRICS_MAX_POINTS);
      }
      // broadcast to subscribed WS clients
      for (const ws of wsClients) {
        if (ws.readyState !== 1) continue;
        if (ws._subAll) {
          ws.send(JSON.stringify({ type: 'snapshot', procs: latestPm2Snapshot }));
        }
        if (ws._subProc) {
          const h = metricsHistory[ws._subProc];
          if (h) {
            const last = h[h.length - 1];
            ws.send(JSON.stringify({ type: 'metrics', name: ws._subProc, point: last }));
          }
        }
      }
    } catch {}
  });
}

const wsClients = new Set();

// Broadcast security settings update to subscribed WS clients
function broadcastSecurityUpdate(type, payload) {
  const msg = JSON.stringify({ type: 'security-update', subType: type, ...(payload || {}), ts: Date.now() });
  for (const ws of wsClients) {
    if (ws.readyState === 1 && ws._subSecurity) ws.send(msg);
  }
}

/* ------------------------------------------------------------------ */
/*  HTTP server                                                        */
/* ------------------------------------------------------------------ */
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const requestOrigin = req.headers.origin || '';

  // CORS preflight
  if (req.method === 'OPTIONS') {
    const acao = FRONTEND_ORIGINS.includes(requestOrigin) ? requestOrigin : '';
    const h = {};
    if (acao) {
      h['Access-Control-Allow-Origin'] = acao;
      h['Access-Control-Allow-Credentials'] = 'true';
      h['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
      h['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }
    res.writeHead(204, h);
    return res.end();
  }

  try {
    /* ---------- AUTH PROXY (/api/auth/*) ---------- */
    if (pathname.startsWith('/api/auth/')) {
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        const raw = await readBody(req);
        const parsed_body = JSON.parse(raw || '{}');
        parsed_body.appCode = parsed_body.appCode || 'KRISHUB';
        const result = await proxyAuth('POST', '/auth/login', JSON.stringify(parsed_body), req.headers.cookie);
        if (result.status !== 200) return sendJSON(res, result.status, result.data, {}, requestOrigin);
        const inner = result.data?.data || result.data;
        const resHeaders = {};
        // Store refreshToken in httpOnly cookie, don't expose to JS
        if (inner.refreshToken) {
          resHeaders['Set-Cookie'] = makeRefreshCookie(inner.refreshToken);
        }
        const payload = {
          accessToken: inner.accessToken,
          user: inner.user,
          role: inner.role,
          app: inner.app,
        };
        if (inner.user?.id) payload.ssoToken = makeSsoToken(inner.user.id);
        return sendJSON(res, 200, payload, resHeaders, requestOrigin);
      }

      if (pathname === '/api/auth/register' && req.method === 'POST') {
        const raw = await readBody(req);
        const parsed_body = JSON.parse(raw || '{}');
        parsed_body.appCode = parsed_body.appCode || 'KRISHUB';
        const result = await proxyAuth('POST', '/auth/register', JSON.stringify(parsed_body), req.headers.cookie);
        if (result.status !== 200 && result.status !== 201) return sendJSON(res, result.status, result.data, {}, requestOrigin);
        const inner = result.data?.data || result.data;
        const resHeaders = {};
        if (inner.refreshToken) {
          resHeaders['Set-Cookie'] = makeRefreshCookie(inner.refreshToken);
        }
        const payload = {
          accessToken: inner.accessToken,
          user: inner.user,
          role: inner.role,
          app: inner.app,
        };
        if (inner.user?.id) payload.ssoToken = makeSsoToken(inner.user.id);
        return sendJSON(res, result.status, payload, resHeaders, requestOrigin);
      }

      if (pathname === '/api/auth/refresh-token' && req.method === 'POST') {
        const refreshToken = getRefreshTokenFromCookie(req.headers.cookie);
        if (!refreshToken) return sendJSON(res, 401, { error: 'No refresh token' }, {}, requestOrigin);
        const body = JSON.stringify({ refreshToken, appCode: 'KRISHUB' });
        const result = await proxyAuth('POST', '/auth/refresh-token', body, req.headers.cookie);
        if (result.status !== 200) {
          // Clear stale cookie on failure
          return sendJSON(res, result.status, result.data, { 'Set-Cookie': clearRefreshCookie() }, requestOrigin);
        }
        const inner = result.data?.data || result.data;
        const resHeaders = {};
        if (inner.refreshToken) {
          resHeaders['Set-Cookie'] = makeRefreshCookie(inner.refreshToken);
        }
        return sendJSON(res, 200, { accessToken: inner.accessToken }, resHeaders, requestOrigin);
      }

      if (pathname === '/api/auth/logout' && req.method === 'POST') {
        const refreshToken = getRefreshTokenFromCookie(req.headers.cookie);
        if (refreshToken) {
          await proxyAuth('POST', '/auth/logout', JSON.stringify({ refreshToken, appCode: 'KRISHUB' }), req.headers.cookie).catch(() => {});
        }
        return sendJSON(res, 200, { message: 'Logged out' }, { 'Set-Cookie': clearRefreshCookie() }, requestOrigin);
      }

      if (pathname === '/api/auth/me' && req.method === 'GET') {
        const result = await proxyAuth('GET', '/users/me', null, req.headers.cookie, req.headers.authorization);
        if (result.status !== 200) return sendJSON(res, result.status, result.data, {}, requestOrigin);
        const inner = result.data?.data || result.data;
        return sendJSON(res, 200, inner, {}, requestOrigin);
      }

      return sendJSON(res, 404, { error: 'Auth route not found' }, {}, requestOrigin);
    }

    /* ---------- WORKSPACES ---------- */
    if (pathname === '/api/workspaces' && req.method === 'GET') {
      const pool = await ensurePg();
      const { rows } = await pool.query('SELECT * FROM workspaces ORDER BY created_at');
      return sendJSON(res, 200, rows, {}, requestOrigin);
    }

    if (pathname === '/api/workspaces' && req.method === 'POST') {
      const pool = await ensurePg();
      const raw = JSON.parse(await readBody(req));
      const { name, code, description, icon, color, url, allowed_origins, status, frontend_port, backend_port, project_path, frontend_path, backend_path } = raw;
      const { rows } = await pool.query(
        `INSERT INTO workspaces (name,code,description,icon,color,url,allowed_origins,status,frontend_port,backend_port,project_path,frontend_path,backend_path)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
        [name, code, description||'', icon||'📦', color||'', url||'', allowed_origins||[], status||'active', frontend_port||null, backend_port||null, project_path||'', frontend_path||'', backend_path||'']
      );
      return sendJSON(res, 201, rows[0], {}, requestOrigin);
    }

    if (pathname.match(/^\/api\/workspaces\/[^/]+$/) && req.method === 'PUT') {
      const pool = await ensurePg();
      const id = pathname.split('/').pop();
      const raw = JSON.parse(await readBody(req));
      const fields = ['name','code','description','icon','color','url','allowed_origins','status','frontend_port','backend_port','project_path','frontend_path','backend_path'];
      const sets = []; const vals = []; let idx = 1;
      for (const f of fields) {
        if (raw[f] !== undefined) { sets.push(`${f}=$${idx++}`); vals.push(raw[f]); }
      }
      if (sets.length === 0) return sendJSON(res, 400, { error: 'No fields to update' }, {}, requestOrigin);
      sets.push(`updated_at=NOW()`);
      vals.push(id);
      const { rows } = await pool.query(`UPDATE workspaces SET ${sets.join(',')} WHERE id=$${idx} RETURNING *`, vals);
      if (!rows.length) return sendJSON(res, 404, { error: 'Not found' }, {}, requestOrigin);
      return sendJSON(res, 200, rows[0], {}, requestOrigin);
    }

    if (pathname.match(/^\/api\/workspaces\/[^/]+$/) && req.method === 'DELETE') {
      const pool = await ensurePg();
      const id = pathname.split('/').pop();
      await pool.query('DELETE FROM workspaces WHERE id=$1', [id]);
      return sendJSON(res, 200, { success: true }, {}, requestOrigin);
    }

    /* ---------- USERS (proxy to auth-service admin API via super-admin token) ---------- */
    if (pathname === '/api/users' && req.method === 'GET') {
      try {
        const adminToken = await getAdminToken();
        const appCodes = ['KRISHUB', 'RENOTE', 'REGEN', 'REVEAL'];
        // id -> merged user record
        const userMap = new Map();
        for (const appCode of appCodes) {
          const r = await fetch(`${AUTH_SERVICE_URL}/admin/users?appCode=${appCode}&limit=1000`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
          if (!r.ok) continue;
          const d = await r.json();
          const items = d?.data?.items || [];
          for (const u of items) {
            const role = u.role?.code || 'USER';
            const existing = userMap.get(u.id);
            if (existing) {
              // Merge: PARAM > ADMIN > others
              if (role === 'PARAM' && existing.role !== 'PARAM') {
                existing.role = 'PARAM';
                existing.app = 'ALL';
              } else if (role === 'ADMIN' && existing.role !== 'PARAM') {
                existing.role = 'ADMIN';
                existing.app = 'ALL';
              }
              if (!existing.apps.includes(appCode)) existing.apps.push(appCode);
            } else {
              userMap.set(u.id, {
                id: u.id,
                name: u.fullName,
                email: u.email,
                phone: u.phone || null,
                app: role === 'PARAM' ? 'ALL' : appCode,
                role,
                status: u.isBlocked ? 'Blocked' : 'Active',
                apps: [appCode],
              });
            }
          }
        }
        // Deduplicate PARAM users that exist as separate auth accounts (same phone or naming pattern)
        const allUsers = [...userMap.values()].map(u => ({
          id: u.id, name: u.name, email: u.email, phone: u.phone,
          app: u.app, role: u.role, status: u.status,
        }));
        return sendJSON(res, 200, allUsers, {}, requestOrigin);
      } catch (e) {
        return sendJSON(res, 500, { error: e.message }, {}, requestOrigin);
      }
    }

    /* PATCH /api/users/:userId — edit user profile or block/unblock */
    if (pathname.match(/^\/api\/users\/[^/]+$/) && req.method === 'PATCH') {
      try {
        const userId = pathname.split('/').pop();
        const adminToken = await getAdminToken();
        const body = await readBody(req);
        const r = await fetch(`${AUTH_SERVICE_URL}/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body,
        });
        const data = await r.json();
        if (!r.ok) return sendJSON(res, r.status, data, {}, requestOrigin);
        return sendJSON(res, 200, data?.data || data, {}, requestOrigin);
      } catch (e) {
        return sendJSON(res, 500, { error: e.message }, {}, requestOrigin);
      }
    }

    /* PATCH /api/users/:userId/role — change user app/role */
    if (pathname.match(/^\/api\/users\/[^/]+\/role$/) && req.method === 'PATCH') {
      try {
        const userId = pathname.split('/').slice(-2, -1)[0];
        const adminToken = await getAdminToken();
        const body = await readBody(req);
        const r = await fetch(`${AUTH_SERVICE_URL}/admin/users/${userId}/access`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body,
        });
        const data = await r.json();
        if (!r.ok) return sendJSON(res, r.status, data, {}, requestOrigin);
        return sendJSON(res, 200, data?.data || data, {}, requestOrigin);
      } catch (e) {
        return sendJSON(res, 500, { error: e.message }, {}, requestOrigin);
      }
    }

    /* DELETE /api/users/:userId — delete user */
    if (pathname.match(/^\/api\/users\/[^/]+$/) && req.method === 'DELETE') {
      try {
        const userId = pathname.split('/').pop();
        const adminToken = await getAdminToken();
        const r = await fetch(`${AUTH_SERVICE_URL}/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const data = await r.json();
        if (!r.ok) return sendJSON(res, r.status, data, {}, requestOrigin);
        return sendJSON(res, 200, data?.data || data, {}, requestOrigin);
      } catch (e) {
        return sendJSON(res, 500, { error: e.message }, {}, requestOrigin);
      }
    }

    /* ================================================================== */
    /*  SECURITY SETTINGS                                                  */
    /* ================================================================== */

    /* GET /api/settings/security — fetch current user's security settings */
    if (pathname === '/api/settings/security' && req.method === 'GET') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      await ensureDb();
      const doc = await db.collection('security_settings').findOne({ userId }) || {};
      const emailDocs = await db.collection('recovery_emails').find({}).toArray();
      const recoveryEmails = emailDocs.map(d => ({
        id: d._id.toString(),
        email: decrypt(d.emailEncrypted),
        verified: !!d.verified,
      }));
      return sendJSON(res, 200, {
        totpEnabled: !!doc.totpEnabled,
        recoveryEmails,
        recoveryEmail: doc.recoveryEmail || null,
        recoveryEmailVerified: !!doc.recoveryEmailVerified,
        trustedDevices: (doc.trustedDevices || []).map(d => ({
          id: d.id, name: d.name, browser: d.browser, os: d.os,
          ip: d.ip, lastUsed: d.lastUsed, trusted: d.trusted, createdAt: d.createdAt,
        })),
        passkeys: (doc.passkeys || []).map(p => ({
          id: p.id, name: p.name, type: p.type || 'unknown',
          createdAt: p.createdAt, lastUsed: p.lastUsed,
        })),
        mobilePairing: doc.mobilePairing ? {
          deviceName: doc.mobilePairing.deviceName,
          linkedAt: doc.mobilePairing.linkedAt,
          os: doc.mobilePairing.os,
          browser: doc.mobilePairing.browser,
        } : null,
        passphrase: doc.passphrase || null,
        loginRestriction: doc.loginRestriction || 'none',
      }, {}, requestOrigin);
    }

    /* POST /api/settings/security/totp/setup — generate TOTP secret + QR */
    if (pathname === '/api/settings/security/totp/setup' && req.method === 'POST') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      await ensureDb();
      const existing = await db.collection('security_settings').findOne({ userId });
      if (existing?.totpEnabled) return sendJSON(res, 400, { error: 'TOTP already enabled. Disable first.' }, {}, requestOrigin);
      const secret = authenticator.generateSecret();
      const otpauth = authenticator.keyuri(userId, 'KrishHub', secret);
      const qrDataUrl = await QRCode.toDataURL(otpauth);
      // Store pending secret (not enabled until verified)
      await db.collection('security_settings').updateOne(
        { userId }, { $set: { totpPendingSecret: secret, updatedAt: new Date() } }, { upsert: true }
      );
      return sendJSON(res, 200, { secret, qrDataUrl }, {}, requestOrigin);
    }

    /* POST /api/settings/security/totp/verify — verify TOTP code to enable */
    if (pathname === '/api/settings/security/totp/verify' && req.method === 'POST') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      const { code } = JSON.parse(await readBody(req));
      await ensureDb();
      const doc = await db.collection('security_settings').findOne({ userId });
      if (!doc?.totpPendingSecret) return sendJSON(res, 400, { error: 'No TOTP setup in progress' }, {}, requestOrigin);
      const valid = authenticator.check(code, doc.totpPendingSecret);
      if (!valid) return sendJSON(res, 400, { error: 'Invalid code. Try again.' }, {}, requestOrigin);
      // Generate backup codes
      const backupCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex'));
      const hashedBackups = backupCodes.map(c => crypto.createHash('sha256').update(c).digest('hex'));
      await db.collection('security_settings').updateOne({ userId }, {
        $set: { totpSecret: doc.totpPendingSecret, totpEnabled: true, totpBackupCodes: hashedBackups, updatedAt: new Date() },
        $unset: { totpPendingSecret: '' },
      });
      broadcastSecurityUpdate('totp-enabled');
      return sendJSON(res, 200, { enabled: true, backupCodes }, {}, requestOrigin);
    }

    /* POST /api/settings/security/totp/disable — disable TOTP */
    if (pathname === '/api/settings/security/totp/disable' && req.method === 'POST') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      const { code } = JSON.parse(await readBody(req));
      await ensureDb();
      const doc = await db.collection('security_settings').findOne({ userId });
      if (!doc?.totpEnabled) return sendJSON(res, 400, { error: 'TOTP is not enabled' }, {}, requestOrigin);
      const valid = authenticator.check(code, doc.totpSecret);
      if (!valid) return sendJSON(res, 400, { error: 'Invalid code' }, {}, requestOrigin);
      await db.collection('security_settings').updateOne({ userId }, {
        $set: { totpEnabled: false, updatedAt: new Date() },
        $unset: { totpSecret: '', totpPendingSecret: '', totpBackupCodes: '' },
      });
      broadcastSecurityUpdate('totp-disabled');
      return sendJSON(res, 200, { enabled: false }, {}, requestOrigin);
    }

    /* POST /api/settings/security/totp/validate — validate a TOTP code (for login flow) */
    if (pathname === '/api/settings/security/totp/validate' && req.method === 'POST') {
      const { userId, code } = JSON.parse(await readBody(req));
      if (!userId) return sendJSON(res, 400, { error: 'userId required' }, {}, requestOrigin);
      await ensureDb();
      const doc = await db.collection('security_settings').findOne({ userId });
      if (!doc?.totpEnabled) return sendJSON(res, 200, { valid: true, required: false }, {}, requestOrigin);
      // Check TOTP code
      let valid = authenticator.check(code, doc.totpSecret);
      // Check backup codes
      if (!valid && code) {
        const hashed = crypto.createHash('sha256').update(code).digest('hex');
        const idx = (doc.totpBackupCodes || []).indexOf(hashed);
        if (idx !== -1) {
          valid = true;
          const updated = [...doc.totpBackupCodes];
          updated.splice(idx, 1);
          await db.collection('security_settings').updateOne({ userId }, { $set: { totpBackupCodes: updated } });
        }
      }
      return sendJSON(res, 200, { valid, required: true }, {}, requestOrigin);
    }

    /* PATCH /api/settings/security/passphrase — set or update passphrase */
    if (pathname === '/api/settings/security/passphrase' && req.method === 'PATCH') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      const { passphrase } = JSON.parse(await readBody(req));
      if (!passphrase || passphrase.length < 4) return sendJSON(res, 400, { error: 'Passphrase must be at least 4 characters' }, {}, requestOrigin);
      await ensureDb();
      const hashed = crypto.createHash('sha256').update(passphrase).digest('hex');
      await db.collection('security_settings').updateOne(
        { userId }, { $set: { passphrase: hashed, updatedAt: new Date() } }, { upsert: true }
      );
      broadcastSecurityUpdate('passphrase-set');
      return sendJSON(res, 200, { success: true }, {}, requestOrigin);
    }

    /* DELETE /api/settings/security/passphrase — remove passphrase */
    if (pathname === '/api/settings/security/passphrase' && req.method === 'DELETE') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      await ensureDb();
      await db.collection('security_settings').updateOne(
        { userId }, { $unset: { passphrase: '' }, $set: { updatedAt: new Date() } }
      );
      broadcastSecurityUpdate('passphrase-removed');
      return sendJSON(res, 200, { success: true }, {}, requestOrigin);
    }

    /* PATCH /api/settings/security/recovery-email — add a recovery email */
    if (pathname === '/api/settings/security/recovery-email' && req.method === 'PATCH') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      const { email } = JSON.parse(await readBody(req));
      if (!email) return sendJSON(res, 400, { error: 'Email required' }, {}, requestOrigin);
      await ensureDb();
      // Check for duplicates by decrypting existing
      const existing = await db.collection('recovery_emails').find({}).toArray();
      const dup = existing.find(d => decrypt(d.emailEncrypted).toLowerCase() === email.toLowerCase());
      if (dup) return sendJSON(res, 409, { error: 'Email already exists' }, {}, requestOrigin);
      const result = await db.collection('recovery_emails').insertOne({
        emailEncrypted: encrypt(email),
        verified: true,
        createdAt: new Date(),
      });
      broadcastSecurityUpdate('recovery-email-added', { id: result.insertedId.toString() });
      return sendJSON(res, 200, { success: true, id: result.insertedId.toString() }, {}, requestOrigin);
    }

    /* DELETE /api/settings/security/recovery-email/:id — remove a recovery email */
    if (pathname.startsWith('/api/settings/security/recovery-email/') && req.method === 'DELETE') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      const emailId = pathname.split('/').pop();
      await ensureDb();
      const count = await db.collection('recovery_emails').countDocuments();
      if (count <= 1) return sendJSON(res, 400, { error: 'Must keep at least one recovery email' }, {}, requestOrigin);
      const result = await db.collection('recovery_emails').deleteOne({ _id: new ObjectId(emailId) });
      if (result.deletedCount === 0) return sendJSON(res, 404, { error: 'Email not found' }, {}, requestOrigin);
      broadcastSecurityUpdate('recovery-email-removed', { id: emailId });
      return sendJSON(res, 200, { success: true }, {}, requestOrigin);
    }

    /* PATCH /api/settings/security/login-restriction — set login restriction */
    if (pathname === '/api/settings/security/login-restriction' && req.method === 'PATCH') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      const { restriction } = JSON.parse(await readBody(req));
      const allowed = ['none', 'verified_mobile'];
      if (!allowed.includes(restriction)) return sendJSON(res, 400, { error: 'Invalid restriction' }, {}, requestOrigin);
      await ensureDb();
      await db.collection('security_settings').updateOne(
        { userId }, { $set: { loginRestriction: restriction, updatedAt: new Date() } }, { upsert: true }
      );
      broadcastSecurityUpdate('login-restriction', { restriction });
      return sendJSON(res, 200, { success: true }, {}, requestOrigin);
    }

    /* POST /api/settings/security/devices/track — track a login device */
    if (pathname === '/api/settings/security/devices/track' && req.method === 'POST') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      const { name, browser, os } = JSON.parse(await readBody(req));
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
      await ensureDb();
      const device = {
        id: crypto.randomBytes(8).toString('hex'),
        name: name || 'Unknown Device',
        browser: browser || 'Unknown',
        os: os || 'Unknown',
        ip,
        trusted: false,
        lastUsed: new Date(),
        createdAt: new Date(),
      };
      await db.collection('security_settings').updateOne(
        { userId }, { $push: { trustedDevices: device }, $set: { updatedAt: new Date() } }, { upsert: true }
      );

      // If mobile is paired, create an alert for the untrusted device
      const userDoc = await db.collection('security_settings').findOne({ userId });
      if (userDoc?.mobilePairing && !device.trusted) {
        const alert = {
          id: crypto.randomBytes(8).toString('hex'),
          deviceId: device.id,
          deviceName: device.name,
          browser: device.browser,
          os: device.os,
          ip: device.ip,
          status: 'pending',
          createdAt: new Date(),
        };
        await db.collection('security_settings').updateOne(
          { userId }, { $push: { mobileAlerts: alert } }
        );
        // Push to any connected mobile WS clients for this user
        const mobileMsg = JSON.stringify({ type: 'mobile-alert', alert, ts: Date.now() });
        for (const ws of wsClients) {
          if (ws.readyState === 1 && ws._mobileUserId === userId) ws.send(mobileMsg);
        }
        broadcastSecurityUpdate('untrusted-device-detected', { deviceName: device.name });
      }

      return sendJSON(res, 200, { device }, {}, requestOrigin);
    }

    /* PATCH /api/settings/security/devices/:deviceId/trust — toggle trust */
    if (pathname.match(/^\/api\/settings\/security\/devices\/[^/]+\/trust$/) && req.method === 'PATCH') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      const deviceId = pathname.split('/').slice(-2, -1)[0];
      const { trusted } = JSON.parse(await readBody(req));
      await ensureDb();
      await db.collection('security_settings').updateOne(
        { userId, 'trustedDevices.id': deviceId },
        { $set: { 'trustedDevices.$.trusted': !!trusted, updatedAt: new Date() } }
      );
      broadcastSecurityUpdate('device-trust-toggled');
      return sendJSON(res, 200, { success: true }, {}, requestOrigin);
    }

    /* DELETE /api/settings/security/devices/:deviceId — revoke a device */
    if (pathname.match(/^\/api\/settings\/security\/devices\/[^/]+$/) && req.method === 'DELETE') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      const deviceId = pathname.split('/').pop();
      await ensureDb();
      await db.collection('security_settings').updateOne(
        { userId }, { $pull: { trustedDevices: { id: deviceId } }, $set: { updatedAt: new Date() } }
      );
      broadcastSecurityUpdate('device-revoked');
      return sendJSON(res, 200, { success: true }, {}, requestOrigin);
    }

    /* DELETE /api/settings/security/devices — revoke all devices */
    if (pathname === '/api/settings/security/devices' && req.method === 'DELETE') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      await ensureDb();
      await db.collection('security_settings').updateOne(
        { userId }, { $set: { trustedDevices: [], updatedAt: new Date() } }
      );
      broadcastSecurityUpdate('devices-revoked-all');
      return sendJSON(res, 200, { success: true }, {}, requestOrigin);
    }

    /* PATCH /api/settings/security/devices/:deviceId/rename — rename a device */
    if (pathname.match(/^\/api\/settings\/security\/devices\/[^/]+\/rename$/) && req.method === 'PATCH') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      const deviceId = pathname.split('/').slice(-2, -1)[0];
      const { name } = JSON.parse(await readBody(req));
      if (!name || name.length > 100) return sendJSON(res, 400, { error: 'Name required (max 100 chars)' }, {}, requestOrigin);
      await ensureDb();
      await db.collection('security_settings').updateOne(
        { userId, 'trustedDevices.id': deviceId },
        { $set: { 'trustedDevices.$.name': name, updatedAt: new Date() } }
      );
      broadcastSecurityUpdate('device-renamed');
      return sendJSON(res, 200, { success: true }, {}, requestOrigin);
    }

    /* ================================================================== */
    /*  PASSKEYS / BIOMETRIC (WebAuthn)                                    */
    /* ================================================================== */

    /* POST /api/settings/security/passkeys/register-options */
    if (pathname === '/api/settings/security/passkeys/register-options' && req.method === 'POST') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      await ensureDb();
      const doc = await db.collection('security_settings').findOne({ userId }) || {};
      const existingCreds = (doc.passkeys || []).map(p => ({
        id: p.credentialId,
        transports: p.transports || [],
      }));
      const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userName: userId,
        attestationType: 'none',
        excludeCredentials: existingCreds,
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
      });
      // Store challenge temporarily
      await db.collection('security_settings').updateOne(
        { userId },
        { $set: { webauthnCurrentChallenge: options.challenge, updatedAt: new Date() } },
        { upsert: true }
      );
      return sendJSON(res, 200, options, {}, requestOrigin);
    }

    /* POST /api/settings/security/passkeys/register-verify */
    if (pathname === '/api/settings/security/passkeys/register-verify' && req.method === 'POST') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      const body = JSON.parse(await readBody(req));
      const { attestation, name: passkeyName } = body;
      await ensureDb();
      const doc = await db.collection('security_settings').findOne({ userId });
      if (!doc?.webauthnCurrentChallenge) return sendJSON(res, 400, { error: 'No registration in progress' }, {}, requestOrigin);
      try {
        const verification = await verifyRegistrationResponse({
          response: attestation,
          expectedChallenge: doc.webauthnCurrentChallenge,
          expectedOrigin: [WEBAUTHN_ORIGIN, 'http://localhost:1001', 'http://localhost:3001'],
          expectedRPID: RP_ID,
        });
        if (!verification.verified || !verification.registrationInfo) {
          return sendJSON(res, 400, { error: 'Verification failed' }, {}, requestOrigin);
        }
        const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
        // Determine type from authenticator attachment / transports
        const transports = attestation.response?.transports || [];
        let type = 'security-key';
        if (transports.includes('internal')) type = 'fingerprint';
        if (transports.includes('hybrid')) type = 'mobile';
        const passkey = {
          id: crypto.randomBytes(8).toString('hex'),
          credentialId: credential.id,
          publicKey: Buffer.from(credential.publicKey).toString('base64url'),
          counter: credential.counter,
          transports,
          name: passkeyName || `Passkey ${(doc.passkeys || []).length + 1}`,
          type,
          deviceType: credentialDeviceType,
          backedUp: !!credentialBackedUp,
          createdAt: new Date(),
          lastUsed: new Date(),
        };
        await db.collection('security_settings').updateOne(
          { userId },
          { $push: { passkeys: passkey }, $unset: { webauthnCurrentChallenge: '' }, $set: { updatedAt: new Date() } }
        );
        broadcastSecurityUpdate('passkey-registered');
        return sendJSON(res, 200, { verified: true, passkey: { id: passkey.id, name: passkey.name, type: passkey.type, createdAt: passkey.createdAt } }, {}, requestOrigin);
      } catch (e) {
        return sendJSON(res, 400, { error: e.message || 'Verification failed' }, {}, requestOrigin);
      }
    }

    /* POST /api/settings/security/passkeys/authenticate-options */
    if (pathname === '/api/settings/security/passkeys/authenticate-options' && req.method === 'POST') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      await ensureDb();
      const doc = await db.collection('security_settings').findOne({ userId }) || {};
      const creds = (doc.passkeys || []).map(p => ({
        id: p.credentialId,
        transports: p.transports || [],
      }));
      if (creds.length === 0) return sendJSON(res, 400, { error: 'No passkeys registered' }, {}, requestOrigin);
      const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        allowCredentials: creds,
        userVerification: 'preferred',
      });
      await db.collection('security_settings').updateOne(
        { userId },
        { $set: { webauthnCurrentChallenge: options.challenge, updatedAt: new Date() } }
      );
      return sendJSON(res, 200, options, {}, requestOrigin);
    }

    /* POST /api/settings/security/passkeys/authenticate-verify */
    if (pathname === '/api/settings/security/passkeys/authenticate-verify' && req.method === 'POST') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      const body = JSON.parse(await readBody(req));
      const { assertion } = body;
      await ensureDb();
      const doc = await db.collection('security_settings').findOne({ userId });
      if (!doc?.webauthnCurrentChallenge) return sendJSON(res, 400, { error: 'No authentication in progress' }, {}, requestOrigin);
      const matchedPasskey = (doc.passkeys || []).find(p => p.credentialId === assertion.id);
      if (!matchedPasskey) return sendJSON(res, 400, { error: 'Unknown credential' }, {}, requestOrigin);
      try {
        const verification = await verifyAuthenticationResponse({
          response: assertion,
          expectedChallenge: doc.webauthnCurrentChallenge,
          expectedOrigin: [WEBAUTHN_ORIGIN, 'http://localhost:1001', 'http://localhost:3001'],
          expectedRPID: RP_ID,
          credential: {
            id: matchedPasskey.credentialId,
            publicKey: Buffer.from(matchedPasskey.publicKey, 'base64url'),
            counter: matchedPasskey.counter,
            transports: matchedPasskey.transports,
          },
        });
        if (verification.verified) {
          // Update counter & lastUsed
          await db.collection('security_settings').updateOne(
            { userId, 'passkeys.credentialId': matchedPasskey.credentialId },
            { $set: { 'passkeys.$.counter': verification.authenticationInfo.newCounter, 'passkeys.$.lastUsed': new Date(), updatedAt: new Date() }, $unset: { webauthnCurrentChallenge: '' } }
          );
        }
        return sendJSON(res, 200, { verified: verification.verified }, {}, requestOrigin);
      } catch (e) {
        return sendJSON(res, 400, { error: e.message || 'Authentication failed' }, {}, requestOrigin);
      }
    }

    /* PATCH /api/settings/security/passkeys/:id/rename — rename a passkey */
    if (pathname.match(/^\/api\/settings\/security\/passkeys\/[^/]+\/rename$/) && req.method === 'PATCH') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      const passkeyId = pathname.split('/').slice(-2, -1)[0];
      const { name } = JSON.parse(await readBody(req));
      if (!name || name.length > 100) return sendJSON(res, 400, { error: 'Name required (max 100 chars)' }, {}, requestOrigin);
      await ensureDb();
      await db.collection('security_settings').updateOne(
        { userId, 'passkeys.id': passkeyId },
        { $set: { 'passkeys.$.name': name, updatedAt: new Date() } }
      );
      broadcastSecurityUpdate('passkey-renamed');
      return sendJSON(res, 200, { success: true }, {}, requestOrigin);
    }

    /* DELETE /api/settings/security/passkeys/:id — remove a passkey */
    if (pathname.match(/^\/api\/settings\/security\/passkeys\/[^/]+$/) && req.method === 'DELETE') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      const passkeyId = pathname.split('/').pop();
      await ensureDb();
      await db.collection('security_settings').updateOne(
        { userId }, { $pull: { passkeys: { id: passkeyId } }, $set: { updatedAt: new Date() } }
      );
      broadcastSecurityUpdate('passkey-deleted');
      return sendJSON(res, 200, { success: true }, {}, requestOrigin);
    }

    /* ================================================================== */
    /*  MOBILE DEVICE PAIRING                                              */
    /* ================================================================== */

    /* POST /api/settings/security/mobile/pair — generate pairing token + QR */
    if (pathname === '/api/settings/security/mobile/pair' && req.method === 'POST') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      await ensureDb();
      const pairToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
      await db.collection('security_settings').updateOne(
        { userId },
        { $set: { mobilePairToken: pairToken, mobilePairExpires: expiresAt, updatedAt: new Date() } },
        { upsert: true }
      );
      const pairUrl = `${WEBAUTHN_ORIGIN}/pair?token=${pairToken}`;
      const qrDataUrl = await QRCode.toDataURL(pairUrl, { width: 280, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
      return sendJSON(res, 200, { pairUrl, qrDataUrl, expiresAt }, {}, requestOrigin);
    }

    /* POST /api/settings/security/mobile/confirm — confirm pairing from mobile */
    if (pathname === '/api/settings/security/mobile/confirm' && req.method === 'POST') {
      const { token, deviceName, os, browser } = JSON.parse(await readBody(req));
      if (!token) return sendJSON(res, 400, { error: 'Token required' }, {}, requestOrigin);
      await ensureDb();
      const doc = await db.collection('security_settings').findOne({ mobilePairToken: token });
      if (!doc) return sendJSON(res, 400, { error: 'Invalid or expired pairing token' }, {}, requestOrigin);
      if (doc.mobilePairExpires && new Date(doc.mobilePairExpires) < new Date()) {
        return sendJSON(res, 400, { error: 'Pairing token expired. Generate a new one.' }, {}, requestOrigin);
      }
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
      const mobileDevice = {
        id: crypto.randomBytes(8).toString('hex'),
        name: deviceName || 'Mobile Device',
        browser: browser || 'Mobile Browser',
        os: os || 'Unknown',
        ip,
        trusted: true,
        mobile: true,
        lastUsed: new Date(),
        createdAt: new Date(),
      };
      const mobileAccessToken = crypto.randomBytes(32).toString('hex');
      await db.collection('security_settings').updateOne(
        { _id: doc._id },
        {
          $set: {
            mobilePairing: { deviceName: mobileDevice.name, os: mobileDevice.os, browser: mobileDevice.browser, linkedAt: new Date() },
            mobileAccessToken,
            mobileAlerts: [],
            updatedAt: new Date(),
          },
          $push: { trustedDevices: mobileDevice },
          $unset: { mobilePairToken: '', mobilePairExpires: '' },
        }
      );
      broadcastSecurityUpdate('mobile-paired');
      return sendJSON(res, 200, { success: true, device: mobileDevice, mobileAccessToken }, {}, requestOrigin);
    }

    /* DELETE /api/settings/security/mobile — unlink mobile */
    if (pathname === '/api/settings/security/mobile' && req.method === 'DELETE') {
      const userId = getUserIdFromAuth(req);
      if (!userId) return sendJSON(res, 401, { error: 'Unauthorized' }, {}, requestOrigin);
      await ensureDb();
      await db.collection('security_settings').updateOne(
        { userId },
        {
          $unset: { mobilePairing: '', mobilePairToken: '', mobilePairExpires: '', mobileAccessToken: '', mobileAlerts: '' },
          $pull: { trustedDevices: { mobile: true } },
          $set: { updatedAt: new Date() },
        }
      );
      broadcastSecurityUpdate('mobile-unlinked');
      return sendJSON(res, 200, { success: true }, {}, requestOrigin);
    }

    /* ================================================================== */
    /*  MOBILE ALERTS — untrusted device notifications                     */
    /* ================================================================== */

    /* GET /api/settings/security/mobile/alerts — get pending alerts (mobile auth via token) */
    if (pathname === '/api/settings/security/mobile/alerts' && req.method === 'GET') {
      const mToken = (req.headers.authorization || '').replace('MobileToken ', '');
      if (!mToken) return sendJSON(res, 401, { error: 'Mobile token required' }, {}, requestOrigin);
      await ensureDb();
      const doc = await db.collection('security_settings').findOne({ mobileAccessToken: mToken });
      if (!doc) return sendJSON(res, 401, { error: 'Invalid mobile token' }, {}, requestOrigin);
      const alerts = (doc.mobileAlerts || []).filter(a => a.status === 'pending');
      return sendJSON(res, 200, { alerts }, {}, requestOrigin);
    }

    /* GET /api/settings/security/mobile/alerts/history — get all alerts including resolved */
    if (pathname === '/api/settings/security/mobile/alerts/history' && req.method === 'GET') {
      const mToken = (req.headers.authorization || '').replace('MobileToken ', '');
      if (!mToken) return sendJSON(res, 401, { error: 'Mobile token required' }, {}, requestOrigin);
      await ensureDb();
      const doc = await db.collection('security_settings').findOne({ mobileAccessToken: mToken });
      if (!doc) return sendJSON(res, 401, { error: 'Invalid mobile token' }, {}, requestOrigin);
      return sendJSON(res, 200, { alerts: doc.mobileAlerts || [] }, {}, requestOrigin);
    }

    /* POST /api/settings/security/mobile/alerts/:alertId/action — trust or block device from mobile */
    if (pathname.match(/^\/api\/settings\/security\/mobile\/alerts\/[^/]+\/action$/) && req.method === 'POST') {
      const mToken = (req.headers.authorization || '').replace('MobileToken ', '');
      if (!mToken) return sendJSON(res, 401, { error: 'Mobile token required' }, {}, requestOrigin);
      const alertId = pathname.split('/').slice(-2, -1)[0];
      const { action } = JSON.parse(await readBody(req));
      if (!['trust', 'block'].includes(action)) return sendJSON(res, 400, { error: 'Action must be trust or block' }, {}, requestOrigin);
      await ensureDb();
      const doc = await db.collection('security_settings').findOne({ mobileAccessToken: mToken });
      if (!doc) return sendJSON(res, 401, { error: 'Invalid mobile token' }, {}, requestOrigin);
      const alert = (doc.mobileAlerts || []).find(a => a.id === alertId);
      if (!alert) return sendJSON(res, 404, { error: 'Alert not found' }, {}, requestOrigin);

      if (action === 'trust') {
        // Mark device as trusted
        await db.collection('security_settings').updateOne(
          { _id: doc._id, 'trustedDevices.id': alert.deviceId },
          { $set: { 'trustedDevices.$.trusted': true, updatedAt: new Date() } }
        );
        // Update alert status
        await db.collection('security_settings').updateOne(
          { _id: doc._id, 'mobileAlerts.id': alertId },
          { $set: { 'mobileAlerts.$.status': 'trusted' } }
        );
        broadcastSecurityUpdate('device-trusted-via-mobile', { deviceName: alert.deviceName });
      } else {
        // Block = revoke the device
        await db.collection('security_settings').updateOne(
          { _id: doc._id },
          { $pull: { trustedDevices: { id: alert.deviceId } }, $set: { updatedAt: new Date() } }
        );
        await db.collection('security_settings').updateOne(
          { _id: doc._id, 'mobileAlerts.id': alertId },
          { $set: { 'mobileAlerts.$.status': 'blocked' } }
        );
        broadcastSecurityUpdate('device-blocked-via-mobile', { deviceName: alert.deviceName });
      }
      return sendJSON(res, 200, { success: true, action }, {}, requestOrigin);
    }

    /* DELETE /api/settings/security/mobile/alerts/:alertId — dismiss alert */
    if (pathname.match(/^\/api\/settings\/security\/mobile\/alerts\/[^/]+$/) && req.method === 'DELETE') {
      const mToken = (req.headers.authorization || '').replace('MobileToken ', '');
      if (!mToken) return sendJSON(res, 401, { error: 'Mobile token required' }, {}, requestOrigin);
      const alertId = pathname.split('/').pop();
      await ensureDb();
      await db.collection('security_settings').updateOne(
        { mobileAccessToken: mToken },
        { $pull: { mobileAlerts: { id: alertId } } }
      );
      return sendJSON(res, 200, { success: true }, {}, requestOrigin);
    }

    /* ---------- DEPLOY PM2 STATUS ---------- */
    if (pathname === '/api/deploy/pm2-status' && req.method === 'GET') {
      return sendJSON(res, 200, latestPm2Snapshot, {}, requestOrigin);
    }

    /* ---------- DEPLOY HEALTH CHECKS ---------- */
    if (pathname === '/api/deploy/health-checks' && req.method === 'GET') {
      await ensureDb();
      const apps = await db.collection('projects').find({ status: 'active' }).toArray();
      const checks = [];
      for (const app of apps) {
        const entry = { name: app.name, frontend: null, backend: null };
        for (const side of ['frontend', 'backend']) {
          const port = app[`${side}Port`];
          if (!port) continue;
          const start = Date.now();
          try {
            await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(3000) });
            entry[side] = Date.now() - start;
          } catch { entry[side] = -1; }
        }
        checks.push(entry);
      }
      return sendJSON(res, 200, checks, {}, requestOrigin);
    }

    /* ---------- CONTACT FORMS ---------- */
    if (pathname === '/api/contact-forms' && req.method === 'POST') {
      await ensureDb();
      const raw = JSON.parse(await readBody(req));
      const doc = { name: raw.name, email: raw.email, message: raw.message, createdAt: new Date() };
      const result = await db.collection('contact_forms').insertOne(doc);
      return sendJSON(res, 201, { id: result.insertedId.toString() }, {}, requestOrigin);
    }

    if (pathname === '/api/contact-forms' && req.method === 'GET') {
      await ensureDb();
      const forms = await db.collection('contact_forms').find().sort({ createdAt: -1 }).toArray();
      return sendJSON(res, 200, forms, {}, requestOrigin);
    }

    /* ---------- AMC ENQUIRIES ---------- */
    if (pathname === '/api/amc-enquiries' && req.method === 'POST') {
      await ensureDb();
      const raw = JSON.parse(await readBody(req));
      const doc = {
        name: String(raw.name || ''),
        email: String(raw.email || ''),
        phone: String(raw.phone || ''),
        plan: String(raw.plan || ''),
        systems: parseInt(raw.systems, 10) || 1,
        message: String(raw.message || ''),
        createdAt: new Date(),
      };
      const result = await db.collection('amc_enquiries').insertOne(doc);
      return sendJSON(res, 201, { id: result.insertedId.toString() }, {}, requestOrigin);
    }

    if (pathname === '/api/amc-enquiries' && req.method === 'GET') {
      await ensureDb();
      const enquiries = await db.collection('amc_enquiries').find().sort({ createdAt: -1 }).toArray();
      return sendJSON(res, 200, enquiries, {}, requestOrigin);
    }

    /* ---------- HIRING APPLICATIONS ---------- */
    if (pathname === '/api/hiring-applications' && req.method === 'POST') {
      await ensureDb();
      const raw = JSON.parse(await readBody(req));
      const doc = {
        name: String(raw.name || ''),
        email: String(raw.email || ''),
        phone: String(raw.phone || ''),
        position: String(raw.position || ''),
        experience: String(raw.experience || ''),
        message: String(raw.message || ''),
        createdAt: new Date(),
      };
      const result = await db.collection('hiring_applications').insertOne(doc);
      return sendJSON(res, 201, { id: result.insertedId.toString() }, {}, requestOrigin);
    }

    if (pathname === '/api/hiring-applications' && req.method === 'GET') {
      await ensureDb();
      const apps = await db.collection('hiring_applications').find().sort({ createdAt: -1 }).toArray();
      return sendJSON(res, 200, apps, {}, requestOrigin);
    }

    /* ---------- RENTAL ENQUIRIES ---------- */
    if (pathname === '/api/rental-enquiries' && req.method === 'POST') {
      await ensureDb();
      const raw = JSON.parse(await readBody(req));
      const doc = {
        name: String(raw.name || ''),
        email: String(raw.email || ''),
        phone: String(raw.phone || ''),
        category: String(raw.category || ''),
        quantity: parseInt(raw.quantity, 10) || 1,
        duration: String(raw.duration || ''),
        message: String(raw.message || ''),
        createdAt: new Date(),
      };
      const result = await db.collection('rental_enquiries').insertOne(doc);
      return sendJSON(res, 201, { id: result.insertedId.toString() }, {}, requestOrigin);
    }

    if (pathname === '/api/rental-enquiries' && req.method === 'GET') {
      await ensureDb();
      const enquiries = await db.collection('rental_enquiries').find().sort({ createdAt: -1 }).toArray();
      return sendJSON(res, 200, enquiries, {}, requestOrigin);
    }

    /* ---------- DEPLOY SYSTEM ---------- */
    if (pathname === '/api/deploy/projects' && req.method === 'GET') {
      await ensureDb();
      const projects = await db.collection('projects').find().toArray();
      return sendJSON(res, 200, projects, {}, requestOrigin);
    }

    if (pathname === '/api/deploy/logs' && req.method === 'GET') {
      await ensureDb();
      const projectId = parsed.query.projectId;
      const filter = projectId ? { projectId } : {};
      const logs = await db.collection('deploy_logs').find(filter).sort({ timestamp: -1 }).limit(50).toArray();
      return sendJSON(res, 200, logs, {}, requestOrigin);
    }

    if (pathname === '/api/deploy/action' && req.method === 'POST') {
      await ensureDb();
      const raw = JSON.parse(await readBody(req));
      const { projectId, action, target } = raw;
      const project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
      if (!project) return sendJSON(res, 404, { error: 'Project not found' }, {}, requestOrigin);

      const targetPath = target === 'project' ? (project.frontendPath || project.backendPath) : project[target === 'frontend' ? 'frontendPath' : 'backendPath'];
      // Resolve service config from DB fields (pm2*Name / systemd*Name)
      const pm2Name = target !== 'project' ? project[target === 'frontend' ? 'pm2FrontendName' : 'pm2BackendName'] : null;
      const systemdName = target !== 'project' ? project[target === 'frontend' ? 'systemdFrontendName' : 'systemdBackendName'] : null;
      const service = pm2Name ? { type: 'pm2', name: pm2Name }
                    : systemdName ? { type: 'systemd', name: systemdName }
                    : null;
      if (!targetPath && target !== 'project') return sendJSON(res, 400, { error: `No ${target} path configured` }, {}, requestOrigin);

      const logEntry = {
        projectId: project._id.toString(),
        projectName: project.name,
        action, target,
        timestamp: new Date(),
        status: 'success',
        output: '',
      };

      try {
        const installCmd = project.installCommand || 'npm install';
        const buildCmd = project.buildCommand || 'npm run build';

        if (action === 'git-pull') {
          const gitRoot = findGitRoot(targetPath);
          if (!gitRoot) throw new Error('Not a git repository');
          logEntry.output = await safeExec('git pull', gitRoot);
        } else if (action === 'install') {
          logEntry.output = await safeExec(installCmd, targetPath);
        } else if (action === 'build') {
          logEntry.output = await safeExec(buildCmd, targetPath);
        } else if (action === 'full-deploy') {
          const gitRoot = findGitRoot(targetPath);
          const parts = [];
          if (gitRoot) parts.push(await safeExec('git pull', gitRoot));
          parts.push(await safeExec(installCmd, targetPath));
          parts.push(await safeExec(buildCmd, targetPath));
          if (service) {
            if (service.type === 'pm2') parts.push(await safeExec(`pm2 restart ${service.name}`, targetPath));
            else if (service.type === 'systemd') parts.push(await safeExec(`sudo systemctl restart ${service.name}`, targetPath));
          }
          logEntry.output = parts.join('\n---\n');
        } else if (action === 'restart') {
          if (service) {
            if (service.type === 'pm2') logEntry.output = await safeExec(`pm2 restart ${service.name}`, targetPath);
            else if (service.type === 'systemd') logEntry.output = await safeExec(`sudo systemctl restart ${service.name}`, targetPath);
          } else {
            logEntry.output = await safeExec('sudo nginx -t && sudo systemctl reload nginx', targetPath);
          }
        } else if (action === 'stop') {
          if (service) {
            if (service.type === 'pm2') logEntry.output = await safeExec(`pm2 stop ${service.name}`, targetPath);
            else if (service.type === 'systemd') logEntry.output = await safeExec(`sudo systemctl stop ${service.name}`, targetPath);
          } else {
            logEntry.output = 'Static frontend — no process to stop. Served by nginx.';
          }
        } else if (action === 'start') {
          if (service) {
            if (service.type === 'pm2') logEntry.output = await safeExec(`pm2 start ${service.name}`, targetPath);
            else if (service.type === 'systemd') logEntry.output = await safeExec(`sudo systemctl start ${service.name}`, targetPath);
          } else {
            logEntry.output = await safeExec('sudo nginx -t && sudo systemctl reload nginx', targetPath);
          }
        } else if (action === 'test') {
          /* ---- Security Test Suite ---- */
          const port = project[target === 'frontend' ? 'frontendPort' : 'backendPort'];
          const domain = project.domain || 'localhost';
          const baseUrl = port ? `http://localhost:${port}` : `https://${domain}`;
          const parts = [];

          // 1. npm audit (dependency / supply-chain risks)
          try { parts.push('=== NPM AUDIT ===\n' + await safeExec('npm audit --production --audit-level=moderate 2>&1 || true', targetPath)); } catch (e) { parts.push('npm audit: ' + e.message); }

          // 2. Outdated packages check
          try { parts.push('=== OUTDATED PACKAGES ===\n' + await safeExec('npm outdated --long 2>&1 || true', targetPath)); } catch (e) { parts.push('outdated: ' + e.message); }

          // 3. HTTP security headers scan
          try { parts.push('=== SECURITY HEADERS ===\n' + await safeExec(`curl -sI "${baseUrl}/" 2>&1 | grep -iE '^(strict-transport|x-content-type|x-frame|x-xss|content-security|referrer-policy|permissions-policy|cross-origin|x-permitted|server:)' || echo 'No security headers found'`, targetPath)); } catch (e) { parts.push('headers: ' + e.message); }

          // 4. SSL/TLS check (if domain configured)
          if (project.domain) {
            try { parts.push('=== SSL/TLS CHECK ===\n' + await safeExec(`echo | openssl s_client -connect ${project.domain}:443 -servername ${project.domain} 2>/dev/null | openssl x509 -noout -dates -subject -issuer 2>&1 || echo 'SSL check failed'`, targetPath)); } catch (e) { parts.push('ssl: ' + e.message); }
          }

          // 5. Open ports scan on project ports
          if (port) {
            try { parts.push('=== PORT CHECK ===\n' + await safeExec(`ss -tlnp 2>/dev/null | grep ':${port} ' || echo 'Port ${port} not listening'`, targetPath)); } catch (e) { parts.push('port: ' + e.message); }
          }

          // 6. Sensitive file exposure check
          const sensitiveFiles = ['.env', '.git/config', 'package.json', '.env.local', 'server.js'];
          const exposureResults = [];
          for (const f of sensitiveFiles) {
            try {
              const code = await safeExec(`curl -s -o /dev/null -w "%{http_code}" "${baseUrl}/${f}" 2>&1`, targetPath);
              if (code === '200') exposureResults.push(`EXPOSED: ${f} (200 OK)`);
            } catch {}
          }
          parts.push('=== SENSITIVE FILE EXPOSURE ===\n' + (exposureResults.length ? exposureResults.join('\n') : 'No sensitive files exposed'));

          // 7. CORS misconfiguration check
          try { parts.push('=== CORS CHECK ===\n' + await safeExec(`curl -sI -H "Origin: https://evil.com" "${baseUrl}/" 2>&1 | grep -i 'access-control' || echo 'No CORS headers for foreign origin (good)'`, targetPath)); } catch (e) { parts.push('cors: ' + e.message); }

          // 8. Rate limiting check (attempt rapid requests)
          if (target === 'backend') {
            try { parts.push('=== RATE LIMIT CHECK ===\n' + await safeExec(`for i in $(seq 1 20); do curl -s -o /dev/null -w "%{http_code} " "${baseUrl}/api/auth/login" -X POST -H "Content-Type: application/json" -d '{}' 2>&1; done; echo`, targetPath)); } catch (e) { parts.push('rate-limit: ' + e.message); }
          }

          // 9. Directory listing check
          try { parts.push('=== DIRECTORY LISTING ===\n' + await safeExec(`curl -s "${baseUrl}/" 2>&1 | grep -i 'index of /' && echo 'WARN: Directory listing enabled' || echo 'Directory listing disabled (good)'`, targetPath)); } catch (e) { parts.push('dirlist: ' + e.message); }

          // 10. Basic injection probes (XSS, SQLi markers in response)
          try {
            const xssPayload = encodeURIComponent('<script>alert(1)</script>');
            const xssResult = await safeExec(`curl -s "${baseUrl}/?q=${xssPayload}" 2>&1 | grep -c '<script>alert(1)</script>' || true`, targetPath);
            parts.push('=== XSS REFLECTION CHECK ===\n' + (parseInt(xssResult) > 0 ? 'WARN: XSS payload reflected in response' : 'No XSS reflection detected (good)'));
          } catch (e) { parts.push('xss: ' + e.message); }

          // 11. Git exposure check
          try { parts.push('=== GIT EXPOSURE ===\n' + await safeExec(`curl -s -o /dev/null -w "%{http_code}" "${baseUrl}/.git/HEAD" 2>&1 | grep -q 200 && echo 'CRITICAL: .git directory exposed!' || echo '.git not exposed (good)'`, targetPath)); } catch (e) { parts.push('git-exposure: ' + e.message); }

          // 12. Cookie security check
          try { parts.push('=== COOKIE SECURITY ===\n' + await safeExec(`curl -sI "${baseUrl}/" 2>&1 | grep -i 'set-cookie' | grep -v -i 'secure\\|httponly\\|samesite' && echo 'WARN: Cookies missing security flags' || echo 'Cookie flags OK or no cookies set'`, targetPath)); } catch (e) { parts.push('cookies: ' + e.message); }

          // 13. Server info leakage
          try { parts.push('=== SERVER INFO LEAKAGE ===\n' + await safeExec(`curl -sI "${baseUrl}/" 2>&1 | grep -iE '^(server:|x-powered-by:)' || echo 'No server info leaked (good)'`, targetPath)); } catch (e) { parts.push('server-info: ' + e.message); }

          logEntry.output = parts.join('\n\n');

        } else if (action === 'ssl-renew') {
          /* ---- SSL Certificate Renewal ---- */
          const domain = project.domain;
          if (!domain) throw new Error('No domain configured for this project');
          logEntry.output = await safeExec(`sudo certbot renew --cert-name ${domain} --force-renewal --non-interactive 2>&1 && sudo systemctl reload nginx`, targetPath || '/tmp');

        } else if (action === 'ssl-new') {
          /* ---- SSL Certificate New Generation ---- */
          const domain = project.domain;
          if (!domain) throw new Error('No domain configured for this project');
          const wwwDomain = `www.${domain}`;
          logEntry.output = await safeExec(`sudo certbot certonly --nginx -d ${domain} -d ${wwwDomain} --non-interactive --agree-tos --email admin@${domain} 2>&1 && sudo systemctl reload nginx`, targetPath || '/tmp');

        } else {
          throw new Error(`Unknown action: ${action}`);
        }
      } catch (e) {
        logEntry.status = 'error';
        logEntry.output = e.message;
      }

      await db.collection('deploy_logs').insertOne(logEntry);
      return sendJSON(res, 200, logEntry, {}, requestOrigin);
    }

    /* ---------- FALLBACK ---------- */
    sendJSON(res, 404, { error: 'Not found' }, {}, requestOrigin);
  } catch (err) {
    console.error('Server error:', err);
    sendJSON(res, 500, { error: 'Internal server error' }, {}, requestOrigin);
  }
});

/* ------------------------------------------------------------------ */
/*  Startup                                                            */
/* ------------------------------------------------------------------ */
(async () => {
  try {
    await ensurePg();
    await loadJwtSecret();
    await seedWorkspaces();
    await ensureDb();
    await seedProjects();
    await seedRecoveryEmails();
    // WebSocket server — handle upgrade only for /ws path
    const wss = new WebSocketServer({ noServer: true });
    server.on('upgrade', (request, socket, head) => {
      const { pathname } = url.parse(request.url);
      if (pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });
    wss.on('connection', (ws) => {
      wsClients.add(ws);
      ws._subAll = false;
      ws._subProc = null;
      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw);
          if (msg.type === 'subscribe-all') {
            ws._subAll = true;
            ws.send(JSON.stringify({ type: 'snapshot', procs: latestPm2Snapshot }));
          } else if (msg.type === 'subscribe-proc') {
            ws._subProc = msg.name;
            const h = metricsHistory[msg.name] || [];
            ws.send(JSON.stringify({ type: 'history', name: msg.name, points: h }));
          } else if (msg.type === 'unsubscribe-proc') {
            ws._subProc = null;
          } else if (msg.type === 'subscribe-security') {
            ws._subSecurity = true;
          } else if (msg.type === 'unsubscribe-security') {
            ws._subSecurity = false;
          } else if (msg.type === 'subscribe-mobile-alerts') {
            // Mobile authenticates with its token to receive push alerts
            if (msg.token) {
              ensureDb().then(() => {
                db.collection('security_settings').findOne({ mobileAccessToken: msg.token }).then(doc => {
                  if (doc) {
                    ws._mobileUserId = doc.userId;
                    ws.send(JSON.stringify({ type: 'mobile-alerts-subscribed', ts: Date.now() }));
                    // Send any pending alerts immediately
                    const pending = (doc.mobileAlerts || []).filter(a => a.status === 'pending');
                    if (pending.length) ws.send(JSON.stringify({ type: 'mobile-alerts-pending', alerts: pending, ts: Date.now() }));
                  } else {
                    ws.send(JSON.stringify({ type: 'mobile-alerts-error', error: 'Invalid token' }));
                  }
                });
              });
            }
          } else if (msg.type === 'unsubscribe-mobile-alerts') {
            ws._mobileUserId = null;
          }
        } catch {}
      });
      ws.on('close', () => wsClients.delete(ws));
    });

    // Start metrics collector
    collectPm2Metrics();
    setInterval(collectPm2Metrics, METRICS_INTERVAL);

    server.listen(PORT, () => console.log(`KrishHub backend listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
})();
