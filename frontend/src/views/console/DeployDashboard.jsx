import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, RefreshCw, ChevronDown, ChevronUp, ChevronRight, GitBranch, Download, Hammer, Zap, RotateCcw, Square, Play, Wrench, Box, ShieldCheck, Lock, Minimize2, Maximize2, X, FileDown, ChevronsUpDown } from 'lucide-react';

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
/*  Disclosure – a collapsible section with animated arrow            */
/* ------------------------------------------------------------------ */
function Disclosure({ open: defaultOpen = false, summary, className = '', children }) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => { setOpen(defaultOpen); }, [defaultOpen]);
  return (
    <div className={className} data-disclosure data-open={open || undefined}>
      <button type="button" onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 w-full text-left cursor-pointer select-none">
        <ChevronRight className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform duration-150 ${open ? 'rotate-90' : ''}`} />
        {summary}
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  All Projects Test Panel – combined results from Test All          */
/* ------------------------------------------------------------------ */
function AllProjectsTestPanel({ results }) {
  const [panelState, setPanelState] = useState('normal');
  const [allOpen, setAllOpen] = useState(null); // null = default, true/false = forced
  const bodyRef = useRef(null);

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
  const totalChecks = totalThreats + totalPassed + totalErrors;

  // Reset forced state when results change
  useEffect(() => setAllOpen(null), [results]);

  if (panelState === 'closed') return null;

  const handleDownload = () => {
    const blocks = Object.entries(projectGroups).map(([label, g]) => ({
      name: label, sections: g.sections, threats: g.threats.length, passed: g.passed.length, errors: g.errors.length,
    }));
    const html = buildHtml('All Projects Security Test Results', blocks);
    downloadHtml(html, `all-projects-security-test-${new Date().toISOString().slice(0, 10)}.html`);
  };

  const isOpen = (defaultVal) => allOpen !== null ? allOpen : defaultVal;

  return (
    <div className={`rounded-lg border overflow-hidden transition-all ${
      panelState === 'maximized' ? 'fixed inset-4 z-50 bg-card shadow-2xl' : ''
    }`}>
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-muted/80 backdrop-blur border-b">
        <div className="flex items-center gap-2 flex-wrap">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs font-semibold whitespace-nowrap">All Projects</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">{totalPassed} passed</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold">{totalThreats} threat{totalThreats !== 1 ? 's' : ''}</span>
            {totalErrors > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-semibold">{totalErrors} error{totalErrors !== 1 ? 's' : ''}</span>}
            <span className="text-xs text-muted-foreground">{totalChecks} checks · {Object.keys(projectGroups).length} targets</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAllOpen(true)} title="Expand All">
            <ChevronsUpDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAllOpen(false)} title="Collapse All">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
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
        <div ref={bodyRef} className={`p-3 space-y-3 overflow-auto ${panelState === 'maximized' ? 'max-h-[calc(100vh-8rem)]' : 'max-h-[32rem]'}`}>
          {Object.entries(projectGroups).map(([label, g]) => {
            const hasIssues = g.threats.length > 0 || g.errors.length > 0;
            return (
              <Disclosure key={label} open={isOpen(hasIssues)} className="rounded-lg border overflow-hidden" summary={
                <div className="flex items-center gap-2 py-1 px-1 bg-muted/30 flex-1 rounded">
                  <Box className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span className="text-xs font-bold truncate">{label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${g.threats.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {g.threats.length > 0 ? `${g.threats.length} threat${g.threats.length > 1 ? 's' : ''}` : '✓ clear'}
                  </span>
                  {g.errors.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-semibold">{g.errors.length} err</span>}
                  <span className="text-[10px] text-muted-foreground">{g.sections.length} checks</span>
                </div>
              }>
                <div className="pl-4 space-y-2 pb-1">
                  {/* Threats */}
                  {g.threats.length > 0 && (
                    <Disclosure open={isOpen(true)} className="space-y-1" summary={
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">⚠ Has Vulnerability ({g.threats.length})</span>
                    }>
                      {g.threats.map((s, i) => (
                        <Disclosure key={`t-${i}`} open={isOpen(true)} className="ml-2 p-2 rounded-md bg-red-500/10 border border-red-500/20" summary={
                          <span className="text-xs font-bold text-red-400">{s.title}</span>
                        }>
                          <pre className="text-xs font-mono whitespace-pre-wrap text-red-300/90 mt-1">{s.body}</pre>
                        </Disclosure>
                      ))}
                    </Disclosure>
                  )}

                  {/* Errors */}
                  {g.errors.length > 0 && (
                    <Disclosure open={isOpen(false)} className="space-y-1" summary={
                      <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wide">⚡ Command Error ({g.errors.length})</span>
                    }>
                      {g.errors.map((s, i) => (
                        <Disclosure key={`e-${i}`} open={isOpen(false)} className="ml-2 p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20" summary={
                          <span className="text-xs font-bold text-yellow-400">{s.title}</span>
                        }>
                          <pre className="text-xs font-mono whitespace-pre-wrap text-yellow-300/90 mt-1">{s.body}</pre>
                        </Disclosure>
                      ))}
                    </Disclosure>
                  )}

                  {/* Passed */}
                  {g.passed.length > 0 && (
                    <Disclosure open={isOpen(false)} className="space-y-1" summary={
                      <span className="text-[10px] font-bold text-green-400 uppercase tracking-wide">✓ No Vulnerability ({g.passed.length})</span>
                    }>
                      {g.passed.map((s, i) => (
                        <Disclosure key={`p-${i}`} open={isOpen(false)} className="ml-2 p-2 rounded-md bg-green-500/10 border border-green-500/20" summary={
                          <span className="text-xs font-bold text-green-400">{s.title}</span>
                        }>
                          <pre className="text-xs font-mono whitespace-pre-wrap text-green-300/90 mt-1">{s.body}</pre>
                        </Disclosure>
                      ))}
                    </Disclosure>
                  )}
                </div>
              </Disclosure>
            );
          })}
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
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #0f0f14; color: #e2e2e8; padding: 0; margin: 0; }
  .wrap { max-width: 960px; margin: 0 auto; padding: 1.5rem 2rem 3rem; }
  h1 { color: #a0b4ff; border-bottom: 2px solid #333; padding-bottom: .5rem; margin-top: 0; font-size: 1.3rem; }
  .toolbar { position: sticky; top: 0; z-index: 10; background: #13131a; border-bottom: 1px solid #333; padding: .75rem 0; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .summary { display: flex; gap: 2rem; }
  .stat { text-align: center; }
  .stat .num { font-size: 1.6rem; font-weight: bold; line-height: 1.2; }
  .stat .label { font-size: .65rem; color: #888; text-transform: uppercase; letter-spacing: .05em; }
  .stat.pass .num { color: #4ade80; }
  .stat.fail .num { color: #f87171; }
  .stat.error .num { color: #facc15; }
  .stat.total .num { color: #a0b4ff; }
  .actions { display: flex; gap: .5rem; }
  .btn { background: #1e1e2a; color: #ccc; border: 1px solid #444; border-radius: 6px; padding: .35rem .75rem; font-size: .7rem; cursor: pointer; font-family: inherit; transition: background .15s; }
  .btn:hover { background: #2a2a3a; color: #fff; }
  details { margin: .75rem 0; }
  details > summary { cursor: pointer; list-style: none; }
  details > summary::-webkit-details-marker { display: none; }
  details > summary::before { content: '\\25b6'; display: inline-block; width: 1rem; font-size: .65rem; transition: transform .15s; color: #666; }
  details[open] > summary::before { transform: rotate(90deg); }
  .project { border: 1px solid #333; border-radius: 8px; overflow: hidden; }
  .project > summary { background: #1a1a24; padding: .65rem 1rem; font-weight: bold; font-size: .9rem; display: flex; align-items: center; gap: .6rem; }
  .project-body { padding: .25rem .5rem .5rem; }
  .badge { font-size: .65rem; padding: 2px 8px; border-radius: 9999px; font-weight: 600; }
  .badge-pass { background: rgba(74,222,128,.15); color: #4ade80; }
  .badge-fail { background: rgba(248,113,113,.15); color: #f87171; }
  .badge-error { background: rgba(250,204,21,.15); color: #facc15; }
  .badge-count { background: rgba(160,180,255,.12); color: #a0b4ff; font-size: .65rem; padding: 2px 8px; border-radius: 9999px; }
  .cat { padding: .4rem .75rem; margin: .25rem 0; border-radius: 6px; }
  .cat > summary { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; display: flex; align-items: center; gap: .4rem; }
  .cat-fail > summary { color: #f87171; }
  .cat-pass > summary { color: #4ade80; }
  .cat-error > summary { color: #facc15; }
  .cat-body { padding: .25rem 0; }
  .section { margin: .3rem 0; padding: .5rem .65rem; border-radius: 6px; }
  .section-pass { background: rgba(74,222,128,.05); border: 1px solid rgba(74,222,128,.15); }
  .section-fail { background: rgba(248,113,113,.05); border: 1px solid rgba(248,113,113,.15); }
  .section-error { background: rgba(250,204,21,.05); border: 1px solid rgba(250,204,21,.15); }
  .section > summary { font-weight: 700; font-size: .78rem; }
  .section-pass > summary { color: #4ade80; }
  .section-fail > summary { color: #f87171; }
  .section-error > summary { color: #facc15; }
  .section-body { font-family: 'SF Mono','Cascadia Code','Consolas','Courier New',monospace; font-size: .72rem; white-space: pre-wrap; line-height: 1.5; word-break: break-word; padding-top: .3rem; }
  .section-pass .section-body { color: #86efac; }
  .section-fail .section-body { color: #fca5a5; }
  .section-error .section-body { color: #fde68a; }
  .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #222; font-size: .7rem; color: #555; text-align: center; }
  @media print { body { background: #fff; color: #111; } .toolbar { position: static; background: #fff; border: none; } details { break-inside: avoid; } .project > summary, .toolbar { background: #f3f4f6; } .section-pass { background: #f0fdf4; border-color: #bbf7d0; } .section-fail { background: #fef2f2; border-color: #fecaca; } .section-error { background: #fefce8; border-color: #fef08a; } .section-pass > summary, .cat-pass > summary { color: #16a34a; } .section-fail > summary, .cat-fail > summary { color: #dc2626; } .section-error > summary, .cat-error > summary { color: #a16207; } .section-pass .section-body { color: #166534; } .section-fail .section-body { color: #991b1b; } .section-error .section-body { color: #854d0e; } .stat.pass .num { color: #16a34a; } .stat.fail .num { color: #dc2626; } .stat.error .num { color: #a16207; } .btn { display: none; } }
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

    let inner = '';
    if (fails.length) {
      let items = '';
      for (const s of fails) items += `<details class="section section-fail" open><summary>${esc(s.title)}</summary><div class="section-body">${esc(s.body)}</div></details>`;
      inner += `<details class="cat cat-fail" open><summary>\\u26a0 Has Vulnerability (${fails.length})</summary><div class="cat-body">${items}</div></details>`;
    }
    if (errs.length) {
      let items = '';
      for (const s of errs) items += `<details class="section section-error"><summary>${esc(s.title)}</summary><div class="section-body">${esc(s.body)}</div></details>`;
      inner += `<details class="cat cat-error"><summary>\\u26a1 Command Error (${errs.length})</summary><div class="cat-body">${items}</div></details>`;
    }
    if (passes.length) {
      let items = '';
      for (const s of passes) items += `<details class="section section-pass"><summary>${esc(s.title)}</summary><div class="section-body">${esc(s.body)}</div></details>`;
      inner += `<details class="cat cat-pass"><summary>\\u2713 No Vulnerability (${passes.length})</summary><div class="cat-body">${items}</div></details>`;
    }

    const hasIssues = p.threats > 0 || errs.length > 0;
    projects += `<details class="project"${hasIssues ? ' open' : ''}><summary>${esc(p.name)} <span class="badge ${p.threats > 0 ? 'badge-fail' : 'badge-pass'}">${p.threats > 0 ? p.threats + ' threat' + (p.threats > 1 ? 's' : '') : '\\u2713 clear'}</span>${errs.length > 0 ? ` <span class="badge badge-error">${errs.length} error${errs.length > 1 ? 's' : ''}</span>` : ''} <span class="badge-count">${p.sections.length} checks</span></summary><div class="project-body">${inner}</div></details>`;
  }

  const script = `<script>function toggleAll(open){document.querySelectorAll('details').forEach(d=>d.open=open)}<\/script>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${HTML_STYLES}</style></head><body><div class="wrap"><h1>${esc(title)}</h1><div class="toolbar"><div class="summary"><div class="stat pass"><div class="num">${totalPassed}</div><div class="label">Passed</div></div><div class="stat fail"><div class="num">${totalThreats}</div><div class="label">Threats</div></div>${totalErrors > 0 ? `<div class="stat error"><div class="num">${totalErrors}</div><div class="label">Errors</div></div>` : ''}<div class="stat total"><div class="num">${totalChecks}</div><div class="label">Total</div></div></div><div class="actions"><button class="btn" onclick="toggleAll(true)">\\u25bc Expand All</button><button class="btn" onclick="toggleAll(false)">\\u25b6 Collapse All</button></div></div>${projects}<div class="footer">Generated by KrishHub Security Scanner &middot; ${esc(date)}</div></div>${script}</body></html>`;
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
  const [panelState, setPanelState] = useState('normal');
  const [allOpen, setAllOpen] = useState(null);
  const isTestAction = result.key?.includes('-test-');
  const sections = useMemo(() => isTestAction ? parseTestSections(result.output) : [], [result.output, isTestAction]);
  const threats = sections.filter(s => s.hasThreat);
  const passed = sections.filter(s => s.isPass);
  const errors = sections.filter(s => s.isError);

  useEffect(() => setAllOpen(null), [result.output]);

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

  const isOpen = (defaultVal) => allOpen !== null ? allOpen : defaultVal;

  return (
    <div className={`mt-2 rounded-lg border overflow-hidden transition-all ${
      panelState === 'maximized' ? 'fixed inset-4 z-50 bg-card shadow-2xl' : ''
    }`}>
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-muted/80 backdrop-blur border-b">
        <div className="flex items-center gap-2 flex-wrap">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs font-semibold whitespace-nowrap">Security Test</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">{passed.length} passed</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold">{threats.length} threat{threats.length !== 1 ? 's' : ''}</span>
            {errors.length > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-semibold">{errors.length} error{errors.length !== 1 ? 's' : ''}</span>}
            <span className="text-xs text-muted-foreground">{sections.length} checks</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAllOpen(true)} title="Expand All">
            <ChevronsUpDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAllOpen(false)} title="Collapse All">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
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
          {/* Threats */}
          {threats.length > 0 && (
            <Disclosure open={isOpen(true)} className="space-y-1" summary={
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">⚠ Has Vulnerability ({threats.length})</span>
            }>
              {threats.map((s, i) => (
                <Disclosure key={i} open={isOpen(true)} className="p-2 rounded-md bg-red-500/10 border border-red-500/20" summary={
                  <span className="text-xs font-bold text-red-400">{s.title}</span>
                }>
                  <pre className="text-xs font-mono whitespace-pre-wrap text-red-300/90 mt-1">{s.body}</pre>
                </Disclosure>
              ))}
            </Disclosure>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Disclosure open={isOpen(false)} className="space-y-1" summary={
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wide">⚡ Command Error ({errors.length})</span>
            }>
              {errors.map((s, i) => (
                <Disclosure key={i} open={isOpen(false)} className="p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20" summary={
                  <span className="text-xs font-bold text-yellow-400">{s.title}</span>
                }>
                  <pre className="text-xs font-mono whitespace-pre-wrap text-yellow-300/90 mt-1">{s.body}</pre>
                </Disclosure>
              ))}
            </Disclosure>
          )}

          {/* Passed */}
          {passed.length > 0 && (
            <Disclosure open={isOpen(false)} className="space-y-1" summary={
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-wide">✓ No Vulnerability ({passed.length})</span>
            }>
              {passed.map((s, i) => (
                <Disclosure key={i} open={isOpen(false)} className="p-2 rounded-md bg-green-500/10 border border-green-500/20" summary={
                  <span className="text-xs font-bold text-green-400">{s.title}</span>
                }>
                  <pre className="text-xs font-mono whitespace-pre-wrap text-green-300/90 mt-1">{s.body}</pre>
                </Disclosure>
              ))}
            </Disclosure>
          )}
        </div>
      )}
    </div>
  );
}
