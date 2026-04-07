import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, RefreshCw, ChevronDown, ChevronUp, GitBranch, Download, Hammer, Zap, RotateCcw, Square, Play, Wrench, Box } from 'lucide-react';

export function DeployDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [actionResult, setActionResult] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const API = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API}/api/deploy/projects`);
      if (res.ok) setProjects(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const runAction = async (projectId, action, target) => {
    const API = import.meta.env.VITE_API_URL || '';
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
                      const serviceActions = ['restart', 'stop', 'start'];
                      return (
                        <div key={target} className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase">{target}{!hasService && ' (static)'}</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { action: 'git-pull', label: 'Git Pull', Icon: GitBranch },
                              { action: 'install', label: 'Install', Icon: Download },
                              { action: 'build', label: 'Build', Icon: Hammer },
                              { action: 'full-deploy', label: 'Full Deploy', Icon: Zap, variant: 'default' },
                              { action: 'restart', label: 'Restart', Icon: RotateCcw },
                              { action: 'stop', label: 'Stop', Icon: Square },
                              { action: 'start', label: 'Start', Icon: Play },
                            ].filter(({ action }) => hasService || !serviceActions.includes(action))
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
