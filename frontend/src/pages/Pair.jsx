import { useState, useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import { Smartphone, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API = import.meta.env.VITE_API_URL || '';

export function Pair() {
  const { token } = useSearch({ strict: false });
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No pairing token provided. Please scan the QR code again.');
      return;
    }
    confirmPairing();
  }, [token]);

  const confirmPairing = async () => {
    setStatus('loading');
    try {
      const ua = navigator.userAgent;
      const os = /android/i.test(ua) ? 'Android' : /iphone|ipad/i.test(ua) ? 'iOS' : 'Unknown';
      const browser = /chrome/i.test(ua) ? 'Chrome' : /safari/i.test(ua) ? 'Safari' : /firefox/i.test(ua) ? 'Firefox' : 'Browser';

      const res = await fetch(`${API}/api/settings/security/mobile/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          deviceName: `${os} ${browser}`,
          os,
          browser,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Pairing failed');
      setStatus('success');
      setMessage('Device paired successfully! You can close this page.');
    } catch (e) {
      setStatus('error');
      setMessage(e.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className={`h-20 w-20 mx-auto rounded-2xl flex items-center justify-center ${
          status === 'loading' ? 'bg-primary/10' :
          status === 'success' ? 'bg-emerald-500/10' : 'bg-destructive/10'
        }`}>
          {status === 'loading' && <Loader2 className="h-10 w-10 text-primary animate-spin" />}
          {status === 'success' && <CheckCircle className="h-10 w-10 text-emerald-500" />}
          {status === 'error' && <XCircle className="h-10 w-10 text-destructive" />}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {status === 'loading' ? 'Pairing Device...' :
             status === 'success' ? 'Paired!' : 'Pairing Failed'}
          </h1>
          <p className="text-muted-foreground">
            {status === 'loading' ? 'Connecting your mobile device to KrishHub console...' : message}
          </p>
        </div>

        <div className="flex items-center gap-3 justify-center text-sm text-muted-foreground">
          <Smartphone className="h-4 w-4" />
          <span>KrishHub Mobile Pairing</span>
        </div>

        {status === 'error' && (
          <Button variant="outline" onClick={confirmPairing}>
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
