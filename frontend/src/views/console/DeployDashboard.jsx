import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, RefreshCw, ChevronDown, ChevronUp, GitBranch, Download, Hammer, Zap, RotateCcw, Square, Play, Wrench, Box, ShieldCheck, Lock, Minimize2, Maximize2, X, FileDown } from 'lucide-react';

export function DeployDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [actionResult, setActionResult] = useState(null);
  const [testAllLoading, setTestAllLoading] = useState(false);
  const [testAllResults, setTestAllResults] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API}/api/deploy/projects`);
      if (res.ok) setProjects(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const runAction = async (projectId, action, target) => {
    const API = process.env.NEXT_PUBLIC_API_URL || '';
    const key = `${projectId}-${action}-${target}`;
    setActionLoading(key);
    setActionResult(null);
    try {
      const res = await fetch(`${API}/api/deploy/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, action, target }),
      });
      const data = await res.json();
      setActionResult({ key, ...data });
    } catch (e) {
      setActionResult({ key, status: 'error', output: e.message });
    }
    setActionLoading(null);
    fetchProjects();
  };

  const runTestAll = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || '';
    setTestAllLoading(true);
    setTestAllResults(null);
    const results = [];
    for (const proj of projects) {
      for (const target of ['frontend', 'backend']) {
        const path = proj[target === 'frontend' ? 'frontendPath' : 'backendPath'];
        if (!path) continue;
        try {
          const res = await fetch(`${API}/api/deploy/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: proj._id, action: 'test', target }),
          });
          const data = await res.json();
          results.push({ projectName: proj.name, target, ...data });
        } catch (e) {
          results.push({ projectName: proj.name, target, status: 'error', output: e.message });
        }
      }
    }
    setTestAllResults(results);
    setTestAllLoading(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Rocket className="h-6 w-6" /> Deployment Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={testAllLoading || projects.length === 0}
            onClick={runTestAll}
            className="gap-1 text-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {testAllLoading ? 'Testing All...' : 'Test All Projects'}
          </Button>
          {testAllLoading && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" /> Testing...
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={() => window.location.reload()} title="Hard Reload">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {testAllResults && <AllProjectsTestPanel results={testAllResults} />}

      {/* Projects */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">🔧 Projects</h2>
        <div className="space-y-2">
          {projects.map(proj => {
            const id = proj._id;
            const isOpen = expanded[id];
            const hasFE = !!proj.frontendPath;
            const hasBE = !!proj.backendPath;
            const type = hasFE && hasBE ? 'fullstack' : hasBE ? 'backend' : 'frontend';

            return (
              <div key={id} className="border rounded-xl bg-card overflow-hidden">
                <button className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition" onClick={() => toggle(id)}>
                  <div className="flex items-center gap-3">
                    <Box className="h-7 w-7 text-blue-500" strokeWidth={2} />
                    <div className="text-left">
                      <span className="font-bold">{proj.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{proj.name.toUpperCase().replace(/\s+/g, '_')} · {type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">active</span>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t pt-3">
                    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                      <span>FE Port: <b className="text-foreground">{proj.frontendPort || '—'}</b></span>
                      <span>BE Port: <b className="text-foreground">{proj.backendPort || '—'}</b></span>
                      <span>Branch: <b className="text-foreground">{proj.gitBranch || 'main'}</b></span>
                      <span>Type: <b className="text-foreground">{type}</b></span>
                    </div>
                    {(proj.gitFrontend || proj.gitBackend) && (
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {proj.gitFrontend && <span>FE: <code className="bg-muted px-1 py-0.5 rounded">{proj.gitFrontend}</code></span>}
                        {proj.gitBackend && proj.gitBackend !== proj.gitFrontend && <span>BE: <code className="bg-muted px-1 py-0.5 rounded">{proj.gitBackend}</code></span>}
                      </div>
                    )}

                    {/* Action buttons per target */}
                    {['frontend', 'backend'].map(target => {
                      const path = proj[target === 'frontend' ? 'frontendPath' : 'backendPath'];
                      if (!path) return null;
                      const hasService = !!(
                        proj[target === 'frontend' ? 'pm2FrontendName' : 'pm2BackendName'] ||
                        proj[target === 'frontend' ? 'systemdFrontendName' : 'systemdBackendName']
                      );
                      const isStatic = !hasService;
                      const serviceActions = [];
                      return (
                        <div key={target} className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase">{target}{isStatic && ' (static)'}</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { action: 'git-pull', label: 'Git Pull', Icon: GitBranch },
                              { action: 'test', label: 'Test', Icon: ShieldCheck, variant: 'secondary' },
                              { action: 'install', label: 'Install', Icon: Download },
                              { action: 'build', label: 'Build', Icon: Hammer },
                              { action: 'full-deploy', label: 'Full Deploy', Icon: Zap, variant: 'default' },
                              { action: 'restart', label: isStatic ? 'Reload Nginx' : 'Restart', Icon: RotateCcw },
                              { action: 'stop', label: 'Stop', Icon: Square, hidden: isStatic },
                              { action: 'start', label: isStatic ? 'Reload Nginx' : 'Start', Icon: Play },
                            ].filter(({ action, hidden }) => !hidden && (hasService || !serviceActions.includes(action)))
                            .map(({ action, label, Icon, variant }) => {
                              const key = `${id}-${action}-${target}`;
                              return (
                                <Button
                                  key={action}
                                  size="sm"
                                  variant={variant || 'outline'}
                                  disabled={actionLoading === key}
                                  onClick={() => runAction(id, action, target)}
                                  className="gap-1 text-xs"
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                  {actionLoading === key ? '...' : label}
                                </Button>
                              );
                            })}
                            <Button size="sm" variant="ghost" className="gap-1 text-xs">
                              <Wrench className="h-3.5 w-3.5" /> Maintenance
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Project-level actions */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">project</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { action: 'ssl-renew', label: 'SSL Renew', Icon: Lock },
                          { action: 'ssl-new', label: 'SSL New', Icon: Lock, variant: 'secondary' },
                        ].map(({ action, label, Icon, variant }) => {
                          const key = `${id}-${action}-project`;
                          return (
                            <Button
                              key={action}
                              size="sm"
                              variant={variant || 'outline'}
                              disabled={actionLoading === key}
                              onClick={() => runAction(id, action, 'project')}
                              className="gap-1 text-xs"
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {actionLoading === key ? '...' : label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action result */}
                    {actionResult && actionResult.key.startsWith(id) && (
                      <TestResultPanel result={actionResult} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  All Projects Test Panel – combined results from Test All          */
/* ------------------------------------------------------------------ */
function AllProjectsTestPanel({ results }) {
  const [panelState, setPanelState] = useState('normal');

  const projectGroups = useMemo(() => {
    const groups = {};
    for (const r of results) {
      const key = `${r.projectName} / ${r.target}`;
      const sections = parseTestSections(r.output);
      groups[key] = { ...r, sections, threats: sections.filter(s => s.hasThreat), passed: sections.filter(s => s.isPass), errors: sections.filter(s => s.isError) };
    }
    return groups;
  }, [results]);

  const totalThreats = Object.values(projectGroups).reduce((sum, g) => sum + g.threats.length, 0);
  const totalPassed = Object.values(projectGroups).reduce((sum, g) => sum + g.passed.length, 0);
  const totalErrors = Object.values(projectGroups).reduce((sum, g) => sum + g.errors.length, 0);

  if (panelState === 'closed') return null;

  const handleDownload = () => {
    const blocks = Object.entries(projectGroups).map(([label, g]) => ({
      name: label, sections: g.sections, threats: g.threats.length, passed: g.passed.length, errors: g.errors.length,
    }));
    const html = buildHtml('All Projects Security Test Results', blocks);
    downloadHtml(html, `all-projects-security-test-${new Date().toISOString().slice(0, 10)}.html`);
  };

  return (
    <div className={`rounded-lg border overflow-hidden transition-all ${
      panelState === 'maximized' ? 'fixed inset-4 z-50 bg-card shadow-2xl' : ''
    }`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">All Projects — Security Test Results</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            totalThreats > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          }`}>
            {totalThreats > 0 ? `${totalThreats} threat${totalThreats > 1 ? 's' : ''}` : 'All clear'}
          </span>
          <span className="text-xs text-muted-foreground">{totalPassed} passed · {totalThreats} failed{totalErrors > 0 ? ` · ${totalErrors} error${totalErrors > 1 ? 's' : ''}` : ''} · {Object.keys(projectGroups).length} targets</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownload} title="Download as HTML">
            <FileDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPanelState(s => s === 'minimized' ? 'normal' : 'minimized')} title={panelState === 'minimized' ? 'Restore' : 'Minimize'}>
            <Minimize2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPanelState(s => s === 'maximized' ? 'normal' : 'maximized')} title={panelState === 'maximized' ? 'Restore' : 'Maximize'}>
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPanelState('closed')} title="Close">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Body */}
      {panelState !== 'minimized' && (
        <div className={`p-3 space-y-4 overflow-auto ${panelState === 'maximized' ? 'max-h-[calc(100vh-8rem)]' : 'max-h-[32rem]'}`}>
          {Object.entries(projectGroups).map(([label, g]) => (
            <div key={label} className="space-y-2">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-bold">{label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  g.threats.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {g.threats.length > 0 ? `${g.threats.length} threat${g.threats.length > 1 ? 's' : ''}` : '✓ clear'}
                </span>
                <span className="text-xs text-muted-foreground">{g.passed.length} passed</span>
                {g.errors.length > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">{g.errors.length} error{g.errors.length > 1 ? 's' : ''}</span>}
              </div>

              {g.threats.length > 0 && g.threats.map((s, i) => (
                <div key={`t-${i}`} className="ml-6 p-2 rounded-md bg-red-500/10 border border-red-500/20">
                  <p className="text-xs font-bold text-red-400 mb-1">{s.title}</p>
                  <pre className="text-xs font-mono whitespace-pre-wrap text-red-300/90">{s.body}</pre>
                </div>
              ))}

              {g.errors.length > 0 && g.errors.map((s, i) => (
                <div key={`e-${i}`} className="ml-6 p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs font-bold text-yellow-400 mb-1">{s.title}</p>
                  <pre className="text-xs font-mono whitespace-pre-wrap text-yellow-300/90">{s.body}</pre>
                </div>
              ))}

              {g.passed.length > 0 && g.passed.map((s, i) => (
                <div key={`p-${i}`} className="ml-6 p-2 rounded-md bg-green-500/10 border border-green-500/20">
                  <p className="text-xs font-bold text-green-400 mb-1">{s.title}</p>
                  <pre className="text-xs font-mono whitespace-pre-wrap text-green-300/90">{s.body}</pre>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Test Result Panel – collapsible, categorized, downloadable        */
/* ------------------------------------------------------------------ */
const THREAT_KEYWORDS = ['EXPOSED', 'WARN', 'CRITICAL', 'VULNERABLE', 'FAIL', 'HIGH', 'MODERATE', 'vulnerabilities found', 'XSS payload reflected', 'Directory listing enabled', 'missing security flags', 'server info leaked'];
const PASS_KEYWORDS = ['(good)', 'No sensitive files exposed', 'No CORS headers for foreign origin', 'No XSS reflection', 'Directory listing disabled', 'Cookie flags OK', 'No server info leaked', '.git not exposed', 'found 0 vulnerabilities', 'No security misconfig', 'No open redirects', 'HTTP methods restricted', 'No clickjack', 'DNSSEC', 'No DNS zone', 'TLS version OK'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const HTML_STYLES = `
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #0f0f14; color: #e2e2e8; padding: 2rem; margin: 0; }
  h1 { color: #a0b4ff; border-bottom: 2px solid #333; padding-bottom: .5rem; margin-top: 0; }
  .summary { background: #1a1a24; border: 1px solid #333; border-radius: 8px; padding: 1rem 2rem; margin: 1rem 0; display: flex; gap: 2.5rem; }
  .stat { text-align: center; }
  .stat .num { font-size: 2rem; font-weight: bold; }
  .stat .label { font-size: .75rem; color: #888; text-transform: uppercase; letter-spacing: .05em; }
  .stat.pass .num { color: #4ade80; }
  .stat.fail .num { color: #f87171; }
  .stat.total .num { color: #a0b4ff; }
  .project { margin: 1.5rem 0; border: 1px solid #333; border-radius: 8px; overflow: hidden; }
  .project-header { background: #1a1a24; padding: .75rem 1rem; font-weight: bold; font-size: 1rem; display: flex; align-items: center; gap: .75rem; }
  .badge { font-size: .7rem; padding: 2px 10px; border-radius: 9999px; font-weight: 600; }
  .badge-pass { background: rgba(74,222,128,.15); color: #4ade80; }
  .badge-fail { background: rgba(248,113,113,.15); color: #f87171; }
  .badge-count { background: rgba(160,180,255,.15); color: #a0b4ff; font-size: .7rem; padding: 2px 8px; border-radius: 9999px; }
  .cat { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; padding: .6rem 1rem .2rem; }
  .cat-fail { color: #f87171; }
  .cat-pass { color: #4ade80; }
  .section { margin: .4rem 1rem; padding: .6rem .75rem; border-radius: 6px; }
  .section-pass { background: rgba(74,222,128,.06); border: 1px solid rgba(74,222,128,.18); }
  .section-fail { background: rgba(248,113,113,.06); border: 1px solid rgba(248,113,113,.18); }
  .section-error { background: rgba(250,204,21,.06); border: 1px solid rgba(250,204,21,.18); }
  .section-title { font-weight: 700; font-size: .8rem; margin-bottom: .2rem; }
  .section-pass .section-title { color: #4ade80; }
  .section-fail .section-title { color: #f87171; }
  .section-error .section-title { color: #facc15; }
  .section-body { font-family: 'SF Mono', 'Cascadia Code', 'Consolas', 'Courier New', monospace; font-size: .75rem; white-space: pre-wrap; line-height: 1.5; word-break: break-word; }
  .section-pass .section-body { color: #86efac; }
  .section-fail .section-body { color: #fca5a5; }
  .section-error .section-body { color: #fde68a; }
  .stat.error .num { color: #facc15; }
  .cat-error { color: #facc15; }
  .badge-error { background: rgba(250,204,21,.15); color: #facc15; }
  .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #222; font-size: .7rem; color: #555; text-align: center; }
  .pb { padding-bottom: .5rem; }
  @media print { body { background: #fff; color: #111; } .section-pass .section-title, .cat-pass { color: #16a34a; } .section-fail .section-title, .cat-fail { color: #dc2626; } .section-error .section-title, .cat-error { color: #a16207; } .section-pass .section-body { color: #166534; } .section-fail .section-body { color: #991b1b; } .section-error .section-body { color: #854d0e; } .stat.pass .num { color: #16a34a; } .stat.fail .num { color: #dc2626; } .stat.error .num { color: #a16207; } .project-header, .summary { background: #f3f4f6; border-color: #ddd; } .section-pass { background: #f0fdf4; border-color: #bbf7d0; } .section-fail { background: #fef2f2; border-color: #fecaca; } .section-error { background: #fefce8; border-color: #fef08a; } }
`;

function buildHtml(title, projectBlocks) {
  const date = new Date().toISOString();
  const totalChecks = projectBlocks.reduce((s, p) => s + p.sections.length, 0);
  const totalThreats = projectBlocks.reduce((s, p) => s + p.threats, 0);
  const totalPassed = projectBlocks.reduce((s, p) => s + p.passed, 0);
  const totalErrors = projectBlocks.reduce((s, p) => s + (p.errors || 0), 0);

  let projects = '';
  for (const p of projectBlocks) {
    const fails = p.sections.filter(s => s.hasThreat);
    const errs = p.sections.filter(s => s.isError);
    const passes = p.sections.filter(s => s.isPass);
    projects += `<div class="project"><div class="project-header">${esc(p.name)} <span class="badge ${p.threats > 0 ? 'badge-fail' : 'badge-pass'}">${p.threats > 0 ? p.threats + ' threat' + (p.threats > 1 ? 's' : '') : '\u2713 clear'}</span>${errs.length > 0 ? ` <span class="badge badge-error">${errs.length} error${errs.length > 1 ? 's' : ''}</span>` : ''} <span class="badge-count">${p.sections.length} checks</span></div>`;
    if (fails.length) {
      projects += `<div class="cat cat-fail">\u26a0 Has Vulnerability (${fails.length})</div>`;
      for (const s of fails) projects += `<div class="section section-fail"><div class="section-title">${esc(s.title)}</div><div class="section-body">${esc(s.body)}</div></div>`;
    }
    if (errs.length) {
      projects += `<div class="cat cat-error">\u26a1 Command Error (${errs.length})</div>`;
      for (const s of errs) projects += `<div class="section section-error"><div class="section-title">${esc(s.title)}</div><div class="section-body">${esc(s.body)}</div></div>`;
    }
    if (passes.length) {
      projects += `<div class="cat cat-pass">\u2713 No Vulnerability (${passes.length})</div>`;
      for (const s of passes) projects += `<div class="section section-pass"><div class="section-title">${esc(s.title)}</div><div class="section-body">${esc(s.body)}</div></div>`;
    }
    projects += `<div class="pb"></div></div>`;
  }

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${HTML_STYLES}</style></head><body><h1>${esc(title)}</h1><div class="summary"><div class="stat pass"><div class="num">${totalPassed}</div><div class="label">Passed</div></div><div class="stat fail"><div class="num">${totalThreats}</div><div class="label">Threats</div></div>${totalErrors > 0 ? `<div class="stat error"><div class="num">${totalErrors}</div><div class="label">Errors</div></div>` : ''}<div class="stat total"><div class="num">${totalChecks}</div><div class="label">Total Checks</div></div></div>${projects}<div class="footer">Generated by KrishHub Security Scanner &middot; ${esc(date)}</div></body></html>`;
}

function downloadHtml(html, filename) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseTestSections(output) {
  if (!output) return [];
  const raw = output.split(/\n(?==== )/).filter(Boolean);
  return raw.map(block => {
    const lines = block.split('\n');
    const titleLine = lines[0] || '';
    const title = titleLine.replace(/^=+\s*/, '').replace(/\s*=+$/, '').trim();
    const body = lines.slice(1).join('\n').trim();
    const upper = body.toUpperCase();
    const isError = upper.includes('COMMAND FAILED');
    const isPass = !isError && PASS_KEYWORDS.some(kw => upper.includes(kw.toUpperCase()));
    const hasThreat = !isError && !isPass && THREAT_KEYWORDS.some(kw => upper.includes(kw.toUpperCase()));
    return { title, body, hasThreat, isPass: !hasThreat && !isError, isError };
  });
}

function TestResultPanel({ result }) {
  const [panelState, setPanelState] = useState('normal'); // 'normal' | 'minimized' | 'maximized' | 'closed'
  const isTestAction = result.key?.includes('-test-');
  const sections = useMemo(() => isTestAction ? parseTestSections(result.output) : [], [result.output, isTestAction]);
  const threats = sections.filter(s => s.hasThreat);
  const passed = sections.filter(s => s.isPass);
  const errors = sections.filter(s => s.isError);

  if (panelState === 'closed') return null;

  const handleDownload = () => {
    const blocks = [{ name: 'Security Test', sections, threats: threats.length, passed: passed.length, errors: errors.length }];
    const html = buildHtml('Security Test Results', blocks);
    downloadHtml(html, `security-test-${new Date().toISOString().slice(0, 10)}.html`);
  };

  // Non-test actions: simple output
  if (!isTestAction) {
    return (
      <div className={`mt-2 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap max-h-40 overflow-auto ${
        result.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
      }`}>
        {result.output || 'Done'}
      </div>
    );
  }

  return (
    <div className={`mt-2 rounded-lg border overflow-hidden transition-all ${
      panelState === 'maximized' ? 'fixed inset-4 z-50 bg-card shadow-2xl' : ''
    }`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">Security Test Results</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            threats.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          }`}>
            {threats.length > 0 ? `${threats.length} threat${threats.length > 1 ? 's' : ''}` : 'All clear'}
          </span>
          <span className="text-xs text-muted-foreground">{passed.length} passed · {threats.length} failed{errors.length > 0 ? ` · ${errors.length} error${errors.length > 1 ? 's' : ''}` : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownload} title="Download as HTML">
            <FileDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPanelState(s => s === 'minimized' ? 'normal' : 'minimized')} title={panelState === 'minimized' ? 'Restore' : 'Minimize'}>
            <Minimize2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPanelState(s => s === 'maximized' ? 'normal' : 'maximized')} title={panelState === 'maximized' ? 'Restore' : 'Maximize'}>
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPanelState('closed')} title="Close">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Body */}
      {panelState !== 'minimized' && (
        <div className={`p-3 space-y-3 overflow-auto ${panelState === 'maximized' ? 'max-h-[calc(100vh-8rem)]' : 'max-h-80'}`}>
          {/* Threats category */}
          {threats.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-400 mb-2 uppercase tracking-wide">⚠ Has Vulnerability ({threats.length})</p>
              {threats.map((s, i) => (
                <div key={i} className="mb-2 p-2.5 rounded-md bg-red-500/10 border border-red-500/20">
                  <p className="text-xs font-bold text-red-400 mb-1">{s.title}</p>
                  <pre className="text-xs font-mono whitespace-pre-wrap text-red-300/90">{s.body}</pre>
                </div>
              ))}
            </div>
          )}

          {/* Errors category */}
          {errors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-yellow-400 mb-2 uppercase tracking-wide">⚡ Command Error ({errors.length})</p>
              {errors.map((s, i) => (
                <div key={i} className="mb-2 p-2.5 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs font-bold text-yellow-400 mb-1">{s.title}</p>
                  <pre className="text-xs font-mono whitespace-pre-wrap text-yellow-300/90">{s.body}</pre>
                </div>
              ))}
            </div>
          )}

          {/* Passed category */}
          {passed.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-400 mb-2 uppercase tracking-wide">✓ No Vulnerability ({passed.length})</p>
              {passed.map((s, i) => (
                <div key={i} className="mb-2 p-2.5 rounded-md bg-green-500/10 border border-green-500/20">
                  <p className="text-xs font-bold text-green-400 mb-1">{s.title}</p>
                  <pre className="text-xs font-mono whitespace-pre-wrap text-green-300/90">{s.body}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
