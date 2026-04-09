import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bell, BellRing, Shield, ShieldCheck, ShieldAlert, ShieldBan, Smartphone,
  Laptop, Globe, CheckCircle, XCircle, Loader2, Wifi, WifiOff,
  Clock, Monitor, AlertTriangle, Trash2,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

function mobileApi(path, opts = {}) {
  const token = localStorage.getItem('krishub_mobile_token');
  return fetch(`${API}${path}`, {
    ...opts,
    headers: { Authorization: `MobileToken ${token}`, ...(opts.headers || {}) },
  });
}

export function MobileAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [acting, setActing] = useState(null); // alertId being acted on
  const [showHistory, setShowHistory] = useState(false);
  const wsRef = useRef(null);
  const token = localStorage.getItem('krishub_mobile_token');

  const fetchAlerts = useCallback(async () => {
    if (!token) return;
    try {
      const endpoint = showHistory ? '/api/settings/security/mobile/alerts/history' : '/api/settings/security/mobile/alerts';
      const res = await mobileApi(endpoint);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch {}
    setLoading(false);
  }, [token, showHistory]);

  // WebSocket connection for real-time alerts
  useEffect(() => {
    if (!token) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = API ? `${protocol}//${new URL(API).host}/ws` : `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      ws.send(JSON.stringify({ type: 'subscribe-mobile-alerts', token }));
    };
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'mobile-alert') {
          // New alert pushed in real time
          setAlerts(prev => [msg.alert, ...prev]);
          // Vibrate if supported
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        } else if (msg.type === 'mobile-alerts-pending') {
          setAlerts(msg.alerts);
          setLoading(false);
        } else if (msg.type === 'mobile-alerts-subscribed') {
          fetchAlerts();
        }
      } catch {}
    };
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [token]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleAction = async (alertId, action) => {
    setActing(alertId);
    try {
      const res = await mobileApi(`/api/settings/security/mobile/alerts/${alertId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: action === 'trust' ? 'trusted' : 'blocked' } : a));
      }
    } catch {}
    setActing(null);
  };

  const dismissAlert = async (alertId) => {
    try {
      await mobileApi(`/api/settings/security/mobile/alerts/${alertId}`, { method: 'DELETE' });
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch {}
  };

  const timeAgo = (date) => {
    if (!date) return 'Unknown';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getDeviceIcon = (alert) => {
    const os = (alert.os || '').toLowerCase();
    if (os.includes('android') || os.includes('ios')) return Smartphone;
    if (os.includes('mac') || os.includes('windows') || os.includes('linux')) return Laptop;
    return Globe;
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background p-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold">Not Paired</h1>
          <p className="text-sm text-muted-foreground">
            This device is not paired with KrishHub. Scan a QR code from Security Settings to pair your mobile.
          </p>
        </div>
      </div>
    );
  }

  const pending = alerts.filter(a => a.status === 'pending');
  const resolved = alerts.filter(a => a.status !== 'pending');

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center relative">
              {pending.length > 0 ? (
                <BellRing className="h-5 w-5 text-primary animate-pulse" />
              ) : (
                <Bell className="h-5 w-5 text-primary" />
              )}
              {pending.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center font-bold">
                  {pending.length}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-base font-semibold">Device Alerts</h1>
              <p className="text-[11px] text-muted-foreground">
                {wsConnected ? (
                  <span className="flex items-center gap-1"><Wifi className="h-3 w-3 text-emerald-400" /> Live</span>
                ) : (
                  <span className="flex items-center gap-1"><WifiOff className="h-3 w-3 text-muted-foreground" /> Offline</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showHistory ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs h-8"
            >
              <Clock className="h-3 w-3 mr-1" />
              {showHistory ? 'Pending' : 'History'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="font-medium">All Clear</p>
              <p className="text-sm text-muted-foreground mt-1">
                {showHistory ? 'No alert history yet.' : 'No untrusted device alerts.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Pending alerts */}
            {!showHistory && pending.length > 0 && (
              <div className="space-y-2">
                {pending.map(alert => {
                  const DevIcon = getDeviceIcon(alert);
                  return (
                    <div key={alert.id} className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <DevIcon className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <p className="text-sm font-semibold text-amber-400">Untrusted Device</p>
                          </div>
                          <p className="text-sm font-medium mt-1">{alert.deviceName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {alert.browser} · {alert.os} · {alert.ip}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3 inline mr-1" />{timeAgo(alert.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                          disabled={acting === alert.id}
                          onClick={() => handleAction(alert.id, 'trust')}
                        >
                          {acting === alert.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                          )}
                          Trust
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 h-9"
                          disabled={acting === alert.id}
                          onClick={() => handleAction(alert.id, 'block')}
                        >
                          {acting === alert.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <ShieldBan className="h-3.5 w-3.5 mr-1" />
                          )}
                          Block
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Resolved alerts (history view) */}
            {showHistory && resolved.length > 0 && (
              <div className="space-y-2">
                {resolved.map(alert => {
                  const DevIcon = getDeviceIcon(alert);
                  const isTrusted = alert.status === 'trusted';
                  return (
                    <div key={alert.id} className={`border rounded-xl p-3.5 flex items-center gap-3 ${
                      isTrusted ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-destructive/20 bg-destructive/5'
                    }`}>
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isTrusted ? 'bg-emerald-500/10' : 'bg-destructive/10'
                      }`}>
                        <DevIcon className={`h-4.5 w-4.5 ${isTrusted ? 'text-emerald-400' : 'text-destructive'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{alert.deviceName}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            isTrusted ? 'bg-emerald-500/15 text-emerald-400' : 'bg-destructive/15 text-destructive'
                          }`}>
                            {isTrusted ? 'TRUSTED' : 'BLOCKED'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {alert.browser} · {alert.os} · {timeAgo(alert.createdAt)}
                        </p>
                      </div>
                      <button onClick={() => dismissAlert(alert.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Show pending in history mode too */}
            {showHistory && pending.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Pending</p>
                {pending.map(alert => {
                  const DevIcon = getDeviceIcon(alert);
                  return (
                    <div key={alert.id} className="border border-amber-500/20 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <DevIcon className="h-4.5 w-4.5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{alert.deviceName}</p>
                          <span className="text-[10px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded font-semibold">PENDING</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {alert.browser} · {alert.os} · {timeAgo(alert.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
