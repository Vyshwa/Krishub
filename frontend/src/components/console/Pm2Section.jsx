import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

function fmtTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function Sparkline({ data, dataKey, color, height = 32 }) {
  if (!data || data.length < 2) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} fill={`url(#spark-${color})`} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MetricsPanel({ name, wsRef }) {
  const [history, setHistory] = useState([]);
  const histRef = useRef([]);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify({ type: 'subscribe-proc', name }));

    function onMsg(e) {
      const msg = JSON.parse(e.data);
      if (msg.type === 'history' && msg.name === name) {
        histRef.current = msg.points.map(p => ({ ...p, time: fmtTime(p.ts) }));
        setHistory([...histRef.current]);
      } else if (msg.type === 'metrics' && msg.name === name) {
        const pt = { ...msg.point, time: fmtTime(msg.point.ts) };
        histRef.current = [...histRef.current, pt];
        if (histRef.current.length > 1200) histRef.current = histRef.current.slice(-1200);
        setHistory([...histRef.current]);
      }
    }
    ws.addEventListener('message', onMsg);
    return () => {
      ws.removeEventListener('message', onMsg);
      if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'unsubscribe-proc' }));
    };
  }, [name, wsRef]);

  const displayData = history.length > 120
    ? history.filter((_, i) => i % Math.ceil(history.length / 120) === 0 || i === history.length - 1)
    : history;

  const latestCpu = displayData.length ? displayData[displayData.length - 1].cpu : 0;
  const latestMem = displayData.length ? displayData[displayData.length - 1].mem : 0;
  const maxCpu = displayData.reduce((m, p) => Math.max(m, p.cpu), 0);
  const maxMem = displayData.reduce((m, p) => Math.max(m, p.mem), 0);

  return (
    <div className="border-t pt-3 mt-2 space-y-4">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Now: <b className="text-foreground">{latestCpu}%</b> CPU</span>
        <span>Peak: <b className="text-foreground">{maxCpu}%</b></span>
        <span className="mx-2">|</span>
        <span>Now: <b className="text-foreground">{latestMem} MB</b> RAM</span>
        <span>Peak: <b className="text-foreground">{maxMem} MB</b></span>
        <span className="ml-auto text-[10px]">{displayData.length} points</span>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">CPU %</p>
        <div className="h-32 bg-muted/30 rounded-lg p-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#888' }} interval="preserveStartEnd" minTickGap={60} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} width={35} domain={[0, 'auto']} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#888' }} />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fill="url(#cpuGrad)" dot={false} isAnimationActive={false} name="CPU %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Memory (MB)</p>
        <div className="h-32 bg-muted/30 rounded-lg p-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#888' }} interval="preserveStartEnd" minTickGap={60} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} width={45} domain={[0, 'auto']} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#888' }} />
              <Area type="monotone" dataKey="mem" stroke="#8b5cf6" strokeWidth={2} fill="url(#memGrad)" dot={false} isAnimationActive={false} name="Memory (MB)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function Pm2Section({ pm2Procs, pm2Sparklines, wsRef }) {
  const [selectedProc, setSelectedProc] = useState(null);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        📦 PM2 Processes
        <span className="text-xs font-normal text-muted-foreground ml-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 mr-1 animate-pulse" />live
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pm2Procs.map(p => {
          const isSelected = selectedProc === p.name;
          return (
            <div key={p.name} className={`border rounded-lg bg-card transition-all cursor-pointer hover:border-blue-500/50 ${isSelected ? 'col-span-full border-blue-500/50 ring-1 ring-blue-500/20' : ''}`} onClick={() => setSelectedProc(isSelected ? null : p.name)}>
              <div className="p-4 flex items-start gap-3">
                <span className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${p.status === 'online' ? 'bg-green-500' : p.status === 'stopped' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold truncate">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'online' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                        {p.status}
                      </span>
                      {isSelected && <X className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    CPU: {p.cpu}% · RAM: {formatMem(p.memory)} · Up: {formatUptime(p.uptime)}
                  </p>
                  {!isSelected && pm2Sparklines[p.name] && (
                    <div className="mt-2 flex gap-2">
                      <div className="flex-1"><Sparkline data={pm2Sparklines[p.name]} dataKey="cpu" color="#3b82f6" /></div>
                      <div className="flex-1"><Sparkline data={pm2Sparklines[p.name]} dataKey="mem" color="#8b5cf6" /></div>
                    </div>
                  )}
                </div>
              </div>
              {isSelected && <div className="px-4 pb-4"><MetricsPanel name={p.name} wsRef={wsRef} /></div>}
            </div>
          );
        })}
        {pm2Procs.length === 0 && (
          <p className="text-muted-foreground col-span-full">No PM2 processes found</p>
        )}
      </div>
    </section>
  );
}
