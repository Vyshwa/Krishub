const http = require('http');
const url = require('url');
const { MongoClient, ObjectId } = require('mongodb');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 1002;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3004/api/v1';
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

async function seedProjects() {
  await ensureDb();
  const Projects = db.collection('projects');
  const count = await Projects.countDocuments();
  if (count > 0) return;
  const seeds = [
    {
      name: 'reNote',
      frontendPath: '/home/vyshwa/web/reNote/FE',
      backendPath: '/home/vyshwa/web/reNote/BE',
      frontendPort: 6001, backendPort: 6003,
      frontendService: { type: 'pm2', name: 'renote-frontend' },
      backendService: { type: 'pm2', name: 'renote-backend' },
    },
    {
      name: 'ReGen',
      frontendPath: '/home/vyshwa/web/reGen/frontend',
      backendPath: '/home/vyshwa/web/reGen/server',
      frontendPort: null, backendPort: 5006,
      frontendService: null,
      backendService: { type: 'pm2', name: 'regen-backend' },
    },
    {
      name: 'KrishHub',
      frontendPath: '/home/vyshwa/web/krishub/frontend',
      backendPath: '/home/vyshwa/web/krishub/backend',
      frontendPort: 1001, backendPort: 1002,
      frontendService: { type: 'systemd', name: 'krishub-frontend' },
      backendService: { type: 'systemd', name: 'krishub-backend' },
    },
    {
      name: 'Auth Service',
      frontendPath: null,
      backendPath: '/home/vyshwa/web/auth-service-be',
      frontendPort: null, backendPort: 3004,
      frontendService: null,
      backendService: { type: 'pm2', name: 'renote-auth' },
    },
    {
      name: 'Reveal',
      frontendPath: '/home/vyshwa/web/reveal/reveal-frontend',
      backendPath: '/home/vyshwa/web/reveal/reveal-backend',
      frontendPort: 3000, backendPort: 5001,
      frontendService: { type: 'pm2', name: 'reveal-frontend' },
      backendService: { type: 'pm2', name: 'reveal-backend' },
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

    /* ---------- USERS (proxy to auth-service admin API) ---------- */
    if (pathname === '/api/users' && req.method === 'GET') {
      const result = await proxyAuth('GET', '/admin/users', null, req.headers.cookie, req.headers.authorization);
      return sendJSON(res, result.status, result.data, {}, requestOrigin);
    }

    /* ---------- DEPLOY PM2 STATUS ---------- */
    if (pathname === '/api/deploy/pm2-status' && req.method === 'GET') {
      try {
        const raw = await safeExec('pm2 jlist', '/tmp');
        const procs = JSON.parse(raw).map(p => ({
          name: p.name, pid: p.pid, status: p.pm2_env?.status || 'unknown',
          cpu: p.monit?.cpu || 0, memory: p.monit?.memory || 0,
          uptime: p.pm2_env?.pm_uptime || 0,
        }));
        return sendJSON(res, 200, procs, {}, requestOrigin);
      } catch(e) {
        return sendJSON(res, 500, { error: e.message }, {}, requestOrigin);
      }
    }

    /* ---------- DEPLOY HEALTH CHECKS ---------- */
    if (pathname === '/api/deploy/health-checks' && req.method === 'GET') {
      const pool = await ensurePg();
      const { rows: apps } = await pool.query('SELECT name, frontend_port, backend_port FROM workspaces WHERE status=$1', ['active']);
      const checks = [];
      for (const app of apps) {
        const entry = { name: app.name, frontend: null, backend: null };
        for (const side of ['frontend', 'backend']) {
          const port = app[`${side}_port`];
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

      const targetPath = project[target === 'frontend' ? 'frontendPath' : 'backendPath'];
      const service = project[target === 'frontend' ? 'frontendService' : 'backendService'];
      if (!targetPath) return sendJSON(res, 400, { error: `No ${target} path configured` }, {}, requestOrigin);

      const logEntry = {
        projectId: project._id.toString(),
        projectName: project.name,
        action, target,
        timestamp: new Date(),
        status: 'success',
        output: '',
      };

      try {
        if (action === 'git-pull') {
          const gitRoot = findGitRoot(targetPath);
          if (!gitRoot) throw new Error('Not a git repository');
          logEntry.output = await safeExec('git pull', gitRoot);
        } else if (action === 'install') {
          logEntry.output = await safeExec('npm install', targetPath);
        } else if (action === 'build') {
          logEntry.output = await safeExec('npm run build', targetPath);
        } else if (action === 'full-deploy') {
          const gitRoot = findGitRoot(targetPath);
          const parts = [];
          if (gitRoot) parts.push(await safeExec('git pull', gitRoot));
          parts.push(await safeExec('npm install', targetPath));
          parts.push(await safeExec('npm run build', targetPath));
          if (service) {
            if (service.type === 'pm2') parts.push(await safeExec(`pm2 restart ${service.name}`, targetPath));
            else if (service.type === 'systemd') parts.push(await safeExec(`sudo systemctl restart ${service.name}`, targetPath));
          }
          logEntry.output = parts.join('\n---\n');
        } else if (action === 'restart') {
          if (!service) throw new Error('No service configured');
          if (service.type === 'pm2') {
            logEntry.output = await safeExec(`pm2 restart ${service.name}`, targetPath);
          } else if (service.type === 'systemd') {
            logEntry.output = await safeExec(`sudo systemctl restart ${service.name}`, targetPath);
          }
        } else if (action === 'stop') {
          if (!service) throw new Error('No service configured');
          if (service.type === 'pm2') {
            logEntry.output = await safeExec(`pm2 stop ${service.name}`, targetPath);
          } else if (service.type === 'systemd') {
            logEntry.output = await safeExec(`sudo systemctl stop ${service.name}`, targetPath);
          }
        } else if (action === 'start') {
          if (!service) throw new Error('No service configured');
          if (service.type === 'pm2') {
            logEntry.output = await safeExec(`pm2 start ${service.name}`, targetPath);
          } else if (service.type === 'systemd') {
            logEntry.output = await safeExec(`sudo systemctl start ${service.name}`, targetPath);
          }
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
    server.listen(PORT, () => console.log(`KrishHub backend listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
})();
