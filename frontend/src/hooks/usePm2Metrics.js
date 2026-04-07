import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;
const API = import.meta.env.VITE_API_URL || '';

export function usePm2Metrics() {
  const [pm2Procs, setPm2Procs] = useState([]);
  const [pm2Sparklines, setPm2Sparklines] = useState({});
  const [healthChecks, setHealthChecks] = useState([]);
  const wsRef = useRef(null);
  const sparkRef = useRef({});

  // WebSocket connection for real-time PM2 data
  useEffect(() => {
    let ws;
    let retryTimer;
    function connect() {
      ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'subscribe-all' }));
      };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'snapshot') {
            setPm2Procs(msg.procs);
            for (const p of msg.procs) {
              if (!sparkRef.current[p.name]) sparkRef.current[p.name] = [];
              const arr = sparkRef.current[p.name];
              arr.push({ ts: Date.now(), cpu: p.cpu, mem: +(p.memory / 1024 / 1024).toFixed(1) });
              if (arr.length > 20) arr.splice(0, arr.length - 20);
            }
            setPm2Sparklines({ ...sparkRef.current });
          }
        } catch {}
      };
      ws.onclose = () => { retryTimer = setTimeout(connect, 3000); };
      ws.onerror = () => ws.close();
    }
    connect();
    return () => { clearTimeout(retryTimer); ws?.close(); };
  }, []);

  // Fetch health checks
  const fetchHealthChecks = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/deploy/health-checks`);
      if (res.ok) setHealthChecks(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchHealthChecks(); }, [fetchHealthChecks]);

  return { pm2Procs, pm2Sparklines, healthChecks, wsRef, fetchHealthChecks };
}
