import { Heart, Activity } from 'lucide-react';

export function HealthSection({ healthChecks }) {
  const allEndpoints = healthChecks.flatMap(h => [
    ...(h.frontend !== null ? [h.frontend] : []),
    ...(h.backend !== null ? [h.backend] : []),
  ]);
  const totalUp = allEndpoints.filter(v => v >= 0).length;
  const totalAll = allEndpoints.length;
  const allSystemsUp = totalUp === totalAll && totalAll > 0;
  const avgMs = totalUp > 0 ? Math.round(allEndpoints.filter(v => v >= 0).reduce((a, b) => a + b, 0) / totalUp) : 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" /> Health Checks
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">avg <b className="text-foreground">{avgMs}ms</b></span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${allSystemsUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${allSystemsUp ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${allSystemsUp ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            {totalUp}/{totalAll} up
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {healthChecks.map((h, idx) => {
          const sides = [
            h.frontend !== null && { label: 'Frontend', ms: h.frontend },
            h.backend !== null && { label: 'Backend', ms: h.backend },
          ].filter(Boolean);
          const allUp = sides.every(s => s.ms >= 0);
          const maxMs = Math.max(...sides.map(s => Math.max(s.ms, 0)), 1);

          return (
            <div
              key={h.name}
              className="group relative border rounded-xl bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-500/30"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className={`h-0.5 w-full ${allUp ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500' : 'bg-gradient-to-r from-red-500 via-orange-500 to-amber-500'}`} />
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`relative h-8 w-8 rounded-lg flex items-center justify-center ${allUp ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      <Heart className={`h-4 w-4 ${allUp ? 'text-emerald-400' : 'text-red-400'}`} style={allUp ? { animation: 'heartbeat 2s ease-in-out infinite' } : {}} />
                    </div>
                    <h3 className="font-semibold">{h.name}</h3>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${allUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {allUp ? 'Healthy' : 'Degraded'}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {sides.map(({ label, ms }) => {
                    const isUp = ms >= 0;
                    const pct = isUp ? Math.min((ms / Math.max(maxMs, 20)) * 100, 100) : 100;
                    const barColor = !isUp ? 'bg-red-500' : ms <= 5 ? 'bg-emerald-500' : ms <= 15 ? 'bg-blue-500' : ms <= 50 ? 'bg-amber-500' : 'bg-orange-500';
                    return (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="relative flex h-1.5 w-1.5">
                              {isUp && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${barColor}`} />}
                              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isUp ? barColor : 'bg-red-500'}`} />
                            </span>
                            <span className="text-muted-foreground">{label}</span>
                          </div>
                          <span className={`text-xs font-mono font-semibold tabular-nums ${isUp ? 'text-foreground' : 'text-red-400'}`}>
                            {isUp ? `${ms}ms` : 'DOWN'}
                          </span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
                            style={{ width: `${pct}%`, animation: 'barGrow 1s ease-out forwards' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.2); }
          28% { transform: scale(1); }
          42% { transform: scale(1.15); }
          56% { transform: scale(1); }
        }
        @keyframes barGrow {
          from { width: 0%; }
        }
      `}</style>
    </section>
  );
}
