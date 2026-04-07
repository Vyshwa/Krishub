import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, RefreshCw, ChevronDown, ChevronUp, GitBranch, Download, Hammer, Zap, RotateCcw, Square, Play, Wrench, Activity } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

function formatUptime(ts) {
  if (!ts) return '—';
  const ms = Date.now() - ts;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatMem(bytes) {
  if (!bytes) return '0';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

export function DeployDashboard() {
  const [pm2Procs, setPm2Procs] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [actionResult, setActionResult] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pm2Res, healthRes, projRes] = await Promise.all([
        fetch(`${API}/api/deploy/pm2-status`),
        fetch(`${API}/api/deploy/health-checks`),
        fetch(`${API}/api/deploy/projects`),
      ]);
      if (pm2Res.ok) setPm2Procs(await pm2Res.json());
      if (healthRes.ok) setHealthChecks(await healthRes.json());
      if (projRes.ok) setProjects(await projRes.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const runAction = async (projectId, action, target) => {
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
    fetchAll();
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Rocket className="h-6 w-6" /> Deployment Dashboard
        </h1>
        <Button variant="ghost" size="icon" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* PM2 Processes */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">📦 PM2 Processes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pm2Procs.map(p => (
            <div key={p.name} className="border rounded-lg p-4 bg-card flex items-start gap-3">
              <span className={`h-2.5 w-2.5 rounded-full mt-1.5 ${p.status === 'online' ? 'bg-green-500' : p.status === 'stopped' ? 'bg-red-500' : 'bg-yellow-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold truncate">{p.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'online' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  CPU: {p.cpu}% · RAM: {formatMem(p.memory)} · Up: {formatUptime(p.uptime)}
                </p>
              </div>
            </div>
          ))}
          {pm2Procs.length === 0 && !loading && (
            <p className="text-muted-foreground col-span-full">No PM2 processes found</p>
          )}
        </div>
      </section>

      {/* Health Checks */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Activity className="h-5 w-5" /> Health Checks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {healthChecks.map(h => (
            <div key={h.name} className="border rounded-lg p-4 bg-card">
              <h3 className="font-semibold mb-2">{h.name}</h3>
              {h.frontend !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${h.frontend >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    frontend
                  </span>
                  <span className="text-muted-foreground">{h.frontend >= 0 ? `${h.frontend}ms` : 'down'}</span>
                </div>
              )}
              {h.backend !== null && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${h.backend >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    backend
                  </span>
                  <span className="text-muted-foreground">{h.backend >= 0 ? `${h.backend}ms` : 'down'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

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
                    <span className="text-2xl">⚙️</span>
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
                      return (
                        <div key={target} className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase">{target}</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { action: 'git-pull', label: 'Git Pull', Icon: GitBranch },
                              { action: 'install', label: 'Install', Icon: Download },
                              { action: 'build', label: 'Build', Icon: Hammer },
                              { action: 'full-deploy', label: 'Full Deploy', Icon: Zap, variant: 'default' },
                              { action: 'restart', label: 'Restart', Icon: RotateCcw },
                              { action: 'stop', label: 'Stop', Icon: Square },
                              { action: 'start', label: 'Start', Icon: Play },
                            ].map(({ action, label, Icon, variant }) => {
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

                    {/* Action result */}
                    {actionResult && actionResult.key.startsWith(id) && (
                      <div className={`mt-2 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap max-h-40 overflow-auto ${
                        actionResult.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {actionResult.output || 'Done'}
                      </div>
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
