import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, RefreshCw, ChevronDown, ChevronUp, GitBranch, Download, Hammer, Zap, RotateCcw, Square, Play, Wrench, Box, ShieldCheck, Lock, Minimize2, Maximize2, X, FileDown } from 'lucide-react';

export function DeployDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [actionResult, setActionResult] = useState(null);

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

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Rocket className="h-6 w-6" /> Deployment Dashboard
        </h1>
        <Button variant="ghost" size="icon" onClick={fetchProjects} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

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
/*  Test Result Panel – collapsible, categorized, downloadable        */
/* ------------------------------------------------------------------ */
const THREAT_KEYWORDS = ['EXPOSED', 'WARN', 'CRITICAL', 'VULNERABLE', 'FAIL', 'HIGH', 'MODERATE', 'vulnerabilities found', 'XSS payload reflected', 'Directory listing enabled', 'missing security flags', 'server info leaked'];
const PASS_KEYWORDS = ['(good)', 'No sensitive files exposed', 'No CORS headers for foreign origin', 'No XSS reflection', 'Directory listing disabled', 'Cookie flags OK', 'No server info leaked', '.git not exposed', 'found 0 vulnerabilities', 'No security misconfig', 'No open redirects', 'HTTP methods restricted', 'No clickjack', 'DNSSEC', 'No DNS zone', 'TLS version OK'];

function parseTestSections(output) {
  if (!output) return [];
  const raw = output.split(/\n(?==== )/).filter(Boolean);
  return raw.map(block => {
    const lines = block.split('\n');
    const titleLine = lines[0] || '';
    const title = titleLine.replace(/^=+\s*/, '').replace(/\s*=+$/, '').trim();
    const body = lines.slice(1).join('\n').trim();
    const hasThreat = THREAT_KEYWORDS.some(kw => body.toUpperCase().includes(kw.toUpperCase()));
    const isPass = !hasThreat;
    return { title, body, hasThreat, isPass };
  });
}

function TestResultPanel({ result }) {
  const [panelState, setPanelState] = useState('normal'); // 'normal' | 'minimized' | 'maximized' | 'closed'
  const isTestAction = result.key?.includes('-test-');
  const sections = useMemo(() => isTestAction ? parseTestSections(result.output) : [], [result.output, isTestAction]);
  const threats = sections.filter(s => s.hasThreat);
  const passed = sections.filter(s => s.isPass);

  if (panelState === 'closed') return null;

  const handleDownload = () => {
    const text = `Security Test Results\n${'='.repeat(60)}\nDate: ${new Date().toISOString()}\nStatus: ${result.status}\n\n${result.output || 'Done'}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-test-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
          <span className="text-xs text-muted-foreground">{passed.length} passed · {threats.length} failed</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownload} title="Download as TXT">
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
