import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Settings, Shield, Smartphone, Monitor, QrCode, KeyRound, Mail,
  Fingerprint, Trash2, ShieldCheck, ShieldAlert, CheckCircle, XCircle,
  Eye, EyeOff, Copy, RefreshCw, X, Globe, Lock, Laptop, AlertTriangle,
  Pencil, ScanFace, Key, Link2, Unlink, Timer, Wifi, WifiOff,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { startRegistration, startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser';

const API = process.env.NEXT_PUBLIC_API_URL || '';

function api(path, opts = {}) {
  return fetch(`${API}${path}`, { credentials: 'include', ...opts });
}

/* ================================================================== */
/*  Section wrapper                                                     */
/* ================================================================== */
function Section({ icon: Icon, title, description, badge, children }) {
  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <div className="p-5 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          {badge}
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function StatusBadge({ active, activeLabel = 'Enabled', inactiveLabel = 'Disabled' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
      active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'
    }`}>
      {active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

/* ================================================================== */
/*  Main component                                                     */
/* ================================================================== */
export function SecuritySettings() {
  const { accessToken, user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState(null); // 'totp-setup' | 'totp-disable' | 'passphrase' | 'recovery-email'

  const fetchSettings = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await api('/api/settings/security', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) setSettings(await res.json());
    } catch {}
    setLoading(false);
  }, [accessToken]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // Live WebSocket updates for security settings
  useEffect(() => {
    if (!accessToken) return;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${window.location.host}/ws`;
    let ws;
    let reconnectTimer;
    const connect = () => {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'subscribe-security' }));
      };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'security-update') fetchSettings();
        } catch {}
      };
      ws.onclose = () => {
        reconnectTimer = setTimeout(connect, 3000);
      };
    };
    connect();
    return () => {
      clearTimeout(reconnectTimer);
      if (ws) { ws.onclose = null; ws.close(); }
    };
  }, [accessToken, fetchSettings]);

  // Also track current device on load
  useEffect(() => {
    if (!accessToken) return;
    const browser = (() => {
      const ua = navigator.userAgent;
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Edg/')) return 'Edge';
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Safari')) return 'Safari';
      return 'Other';
    })();
    const os = (() => {
      const ua = navigator.userAgent;
      if (ua.includes('Win')) return 'Windows';
      if (ua.includes('Mac')) return 'macOS';
      if (ua.includes('Linux')) return 'Linux';
      if (ua.includes('Android')) return 'Android';
      if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
      return 'Unknown';
    })();
    api('/api/settings/security/devices/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ name: `${browser} on ${os}`, browser, os }),
    }).catch(() => {});
  }, [accessToken]);

  if (loading || !settings) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" /> Security Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your account security, authentication methods, and trusted devices.</p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchSettings} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* ---- TOTP / 2FA ---- */}
      <TotpSection
        enabled={settings.totpEnabled}
        accessToken={accessToken}
        onUpdate={fetchSettings}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
      />

      {/* ---- Passphrase ---- */}
      <PassphraseSection
        hasPassphrase={!!settings.passphrase}
        accessToken={accessToken}
        onUpdate={fetchSettings}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
      />

      {/* ---- Recovery Email ---- */}
      <RecoveryEmailSection
        emails={settings.recoveryEmails || []}
        email={settings.recoveryEmail}
        verified={settings.recoveryEmailVerified}
        accessToken={accessToken}
        onUpdate={fetchSettings}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
      />

      {/* ---- Login Restriction ---- */}
      <LoginRestrictionSection
        restriction={settings.loginRestriction}
        accessToken={accessToken}
        onUpdate={fetchSettings}
      />

      {/* ---- Passkeys / Biometrics ---- */}
      <PasskeysSection
        passkeys={settings.passkeys || []}
        accessToken={accessToken}
        onUpdate={fetchSettings}
      />

      {/* ---- Mobile Pairing ---- */}
      <MobilePairingSection
        mobilePairing={settings.mobilePairing}
        accessToken={accessToken}
        onUpdate={fetchSettings}
      />

      {/* ---- Trusted Devices ---- */}
      <DevicesSection
        devices={settings.trustedDevices || []}
        accessToken={accessToken}
        onUpdate={fetchSettings}
      />
    </div>
  );
}

/* ================================================================== */
/*  TOTP Section                                                       */
/* ================================================================== */
function TotpSection({ enabled, accessToken, onUpdate, activePanel, setActivePanel }) {
  const [qrData, setQrData] = useState(null);
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const startSetup = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await api('/api/settings/security/totp/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQrData(data.qrDataUrl);
      setSecret(data.secret);
      setActivePanel('totp-setup');
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const verifyCode = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await api('/api/settings/security/totp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBackupCodes(data.backupCodes);
      onUpdate();
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const disable = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await api('/api/settings/security/totp/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActivePanel(null);
      setCode('');
      onUpdate();
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const closePanel = () => {
    setActivePanel(null);
    setQrData(null);
    setSecret('');
    setCode('');
    setBackupCodes(null);
    setError('');
  };

  return (
    <Section
      icon={QrCode}
      title="Two-Factor Authentication (2FA)"
      description="Add an extra layer of security with authenticator app codes"
      badge={<StatusBadge active={enabled} />}
    >
      {!enabled && activePanel !== 'totp-setup' && (
        <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Two-factor authentication is not enabled yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Protect your account by requiring a second verification step when signing in.</p>
          </div>
          <Button size="sm" onClick={startSetup} disabled={saving}>
            {saving ? 'Setting up...' : 'Enable 2FA'}
          </Button>
        </div>
      )}

      {enabled && activePanel !== 'totp-disable' && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium">2FA is active</p>
              <p className="text-xs text-muted-foreground">Your account is protected with authenticator app verification.</p>
            </div>
          </div>
          <Button size="sm" variant="destructive" onClick={() => setActivePanel('totp-disable')}>
            Disable 2FA
          </Button>
        </div>
      )}

      {/* Setup flow */}
      {activePanel === 'totp-setup' && qrData && !backupCodes && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Set up authenticator app</h4>
            <button onClick={closePanel}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <p className="text-sm text-muted-foreground">Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)</p>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="bg-white rounded-xl p-3 shrink-0">
              <img src={qrData} alt="TOTP QR Code" className="w-48 h-48" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Can't scan? Enter this secret manually:</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-xs font-mono break-all">
                    {showSecret ? secret : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <button onClick={() => setShowSecret(!showSecret)} className="p-1.5 rounded hover:bg-muted">
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(secret)} className="p-1.5 rounded hover:bg-muted">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <Label>Enter the 6-digit code from your app</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-32 font-mono text-center text-lg tracking-[0.3em]"
                    maxLength={6}
                  />
                  <Button onClick={verifyCode} disabled={code.length !== 6 || saving}>
                    {saving ? 'Verifying...' : 'Verify & Enable'}
                  </Button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Backup codes */}
      {backupCodes && (
        <div className="space-y-4 p-4 border rounded-lg border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-emerald-400">2FA Enabled Successfully!</h4>
            <button onClick={closePanel}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <p className="text-sm text-muted-foreground">Save these backup codes in a safe place. Each code can only be used once.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {backupCodes.map((c, i) => (
              <code key={i} className="bg-muted px-3 py-2 rounded text-xs font-mono text-center">{c}</code>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            navigator.clipboard.writeText(backupCodes.join('\n'));
          }}>
            <Copy className="h-3.5 w-3.5 mr-1" /> Copy All
          </Button>
        </div>
      )}

      {/* Disable flow */}
      {activePanel === 'totp-disable' && (
        <div className="space-y-3 p-4 border rounded-lg border-destructive/30">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-destructive">Disable Two-Factor Authentication</h4>
            <button onClick={closePanel}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <p className="text-sm text-muted-foreground">Enter a code from your authenticator app to confirm.</p>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-32 font-mono text-center text-lg tracking-[0.3em]"
              maxLength={6}
            />
            <Button variant="destructive" onClick={disable} disabled={code.length !== 6 || saving}>
              {saving ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}
    </Section>
  );
}

/* ================================================================== */
/*  Passphrase Section                                                 */
/* ================================================================== */
function PassphraseSection({ hasPassphrase, accessToken, onUpdate, activePanel, setActivePanel }) {
  const [passphrase, setPassphrase] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await api('/api/settings/security/passphrase', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ passphrase }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActivePanel(null);
      setPassphrase('');
      onUpdate();
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const remove = async () => {
    setSaving(true);
    try {
      const res = await api('/api/settings/security/passphrase', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) onUpdate();
    } catch {}
    setSaving(false);
  };

  return (
    <Section
      icon={KeyRound}
      title="Security Passphrase"
      description="A memorable phrase used to verify sensitive account actions"
      badge={<StatusBadge active={hasPassphrase} activeLabel="Set" inactiveLabel="Not set" />}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {hasPassphrase
            ? 'Your passphrase is set. It will be requested for critical operations.'
            : 'Set a passphrase to add a verification step for sensitive actions like password changes.'}
        </p>
        <div className="flex gap-2">
          {hasPassphrase && (
            <Button size="sm" variant="ghost" onClick={remove} disabled={saving}>Remove</Button>
          )}
          <Button size="sm" variant={hasPassphrase ? 'outline' : 'default'} onClick={() => setActivePanel('passphrase')}>
            {hasPassphrase ? 'Change' : 'Set Passphrase'}
          </Button>
        </div>
      </div>

      {activePanel === 'passphrase' && (
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{hasPassphrase ? 'Change Passphrase' : 'Set Passphrase'}</h4>
            <button onClick={() => { setActivePanel(null); setPassphrase(''); setError(''); }}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <p className="text-xs text-muted-foreground">Choose a memorable phrase. It should be easy for you to remember but hard for others to guess.</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showPass ? 'text' : 'password'}
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                placeholder="Enter your security passphrase..."
                className="pr-10"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
            <Button onClick={save} disabled={passphrase.length < 4 || saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}
    </Section>
  );
}

/* ================================================================== */
/*  Recovery Email Section                                             */
/* ================================================================== */
function RecoveryEmailSection({ emails, email, verified, accessToken, onUpdate, activePanel, setActivePanel }) {
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [showEmails, setShowEmails] = useState(false);

  const maskEmail = (addr) => {
    const [local, domain] = addr.split('@');
    if (!domain) return addr;
    const visible = local.length <= 2 ? local[0] : local.slice(0, 2);
    return `${visible}${'•'.repeat(Math.max(local.length - 2, 1))}@${domain}`;
  };

  const addEmail = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await api('/api/settings/security/recovery-email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewEmail('');
      setActivePanel(null);
      onUpdate();
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const removeEmail = async (id) => {
    setDeleting(id);
    try {
      const res = await api(`/api/settings/security/recovery-email/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdate();
    } catch (e) { setError(e.message); }
    setDeleting(null);
  };

  const allEmails = emails.length > 0 ? emails : (email ? [{ id: null, email, verified }] : []);
  const verifiedCount = allEmails.filter(e => e.verified).length;

  return (
    <Section
      icon={Mail}
      title="Recovery Email"
      description="Used for account recovery and critical security notifications"
      badge={allEmails.length > 0 ? <StatusBadge active={verifiedCount === allEmails.length} activeLabel={`${verifiedCount} Verified`} inactiveLabel={`${verifiedCount}/${allEmails.length} Verified`} /> : null}
    >
      {allEmails.length > 0 ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{allEmails.length} email{allEmails.length > 1 ? 's' : ''} configured</span>
            <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs text-muted-foreground" onClick={() => setShowEmails(!showEmails)}>
              {showEmails ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showEmails ? 'Hide' : 'Show'}
            </Button>
          </div>
          {allEmails.map((item) => (
            <div key={item.id || item.email} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${item.verified ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                  <Mail className={`h-4 w-4 ${item.verified ? 'text-emerald-400' : 'text-amber-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium font-mono">{showEmails ? item.email : maskEmail(item.email)}</p>
                  <p className="text-xs text-muted-foreground">{item.verified ? 'Verified and active' : 'Pending verification'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.verified && (
                  <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">Verified</span>
                )}
                {item.id && allEmails.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeEmail(item.id)}
                    disabled={deleting === item.id}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div className="pt-2">
            <Button size="sm" variant="outline" onClick={() => { setNewEmail(''); setError(''); setActivePanel('recovery-email'); }}>
              + Add Email
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm font-medium">No recovery email configured</p>
            <p className="text-xs text-muted-foreground">Add one to enable account recovery options.</p>
          </div>
          <Button size="sm" onClick={() => { setNewEmail(''); setActivePanel('recovery-email'); }}>Add Email</Button>
        </div>
      )}

      {activePanel === 'recovery-email' && (
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Add Recovery Email</h4>
            <button onClick={() => { setActivePanel(null); setError(''); }}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <div className="flex gap-2">
            <Input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="email@example.com"
            />
            <Button onClick={addEmail} disabled={!newEmail || saving}>
              {saving ? 'Adding...' : 'Add'}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}
    </Section>
  );
}

/* ================================================================== */
/*  Login Restriction Section                                          */
/* ================================================================== */
function LoginRestrictionSection({ restriction, accessToken, onUpdate }) {
  const [saving, setSaving] = useState(false);

  const toggle = async (value) => {
    setSaving(true);
    try {
      await api('/api/settings/security/login-restriction', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ restriction: value }),
      });
      onUpdate();
    } catch {}
    setSaving(false);
  };

  const isRestricted = restriction === 'verified_mobile';

  return (
    <Section
      icon={Smartphone}
      title="Super Admin Login Restriction"
      description="Require verified mobile number to sign in as super admin"
      badge={<StatusBadge active={isRestricted} activeLabel="Enforced" inactiveLabel="Off" />}
    >
      <div className="space-y-3">
        <div
          className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition ${
            !isRestricted ? 'border-primary/50 bg-primary/5' : 'hover:bg-muted/30'
          }`}
          onClick={() => !saving && toggle('none')}
        >
          <div className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${!isRestricted ? 'border-primary' : 'border-muted-foreground'}`}>
              {!isRestricted && <div className="h-2 w-2 rounded-full bg-primary" />}
            </div>
            <div>
              <p className="text-sm font-medium">No restriction</p>
              <p className="text-xs text-muted-foreground">Any valid credentials can sign in</p>
            </div>
          </div>
        </div>
        <div
          className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition ${
            isRestricted ? 'border-primary/50 bg-primary/5' : 'hover:bg-muted/30'
          }`}
          onClick={() => !saving && toggle('verified_mobile')}
        >
          <div className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${isRestricted ? 'border-primary' : 'border-muted-foreground'}`}>
              {isRestricted && <div className="h-2 w-2 rounded-full bg-primary" />}
            </div>
            <div>
              <p className="text-sm font-medium">Verified mobile only</p>
              <p className="text-xs text-muted-foreground">Only accounts with a verified phone number can sign in as super admin</p>
            </div>
          </div>
          <Smartphone className={`h-4 w-4 ${isRestricted ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </div>
    </Section>
  );
}

/* ================================================================== */
/*  Passkeys / Biometric Auth Section                                  */
/* ================================================================== */
function PasskeysSection({ passkeys, accessToken, onUpdate }) {
  const [registering, setRegistering] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passkeyName, setPasskeyName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const webAuthnSupported = typeof window !== 'undefined' && browserSupportsWebAuthn();

  const registerPasskey = async () => {
    setError('');
    setSuccess('');
    setRegistering(true);
    try {
      // 1. Get registration options from server
      const optRes = await api('/api/settings/security/passkeys/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      });
      const options = await optRes.json();
      if (!optRes.ok) throw new Error(options.error);

      // 2. Trigger browser biometric prompt
      const attestation = await startRegistration({ optionsJSON: options });

      // 3. Verify with server
      const verRes = await api('/api/settings/security/passkeys/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ attestation, name: passkeyName || undefined }),
      });
      const result = await verRes.json();
      if (!verRes.ok) throw new Error(result.error);
      setSuccess(`Passkey "${result.passkey?.name}" registered successfully!`);
      setShowNameInput(false);
      setPasskeyName('');
      onUpdate();
    } catch (e) {
      if (e.name === 'NotAllowedError') {
        setError('Registration was cancelled or timed out.');
      } else {
        setError(e.message || 'Failed to register passkey');
      }
    }
    setRegistering(false);
  };

  const verifyPasskey = async () => {
    setError('');
    setSuccess('');
    setVerifying(true);
    try {
      const optRes = await api('/api/settings/security/passkeys/authenticate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      });
      const options = await optRes.json();
      if (!optRes.ok) throw new Error(options.error);

      const assertion = await startAuthentication({ optionsJSON: options });

      const verRes = await api('/api/settings/security/passkeys/authenticate-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ assertion }),
      });
      const result = await verRes.json();
      if (!verRes.ok) throw new Error(result.error);
      if (result.verified) {
        setSuccess('Biometric verification successful!');
        onUpdate();
      } else {
        setError('Verification failed');
      }
    } catch (e) {
      if (e.name === 'NotAllowedError') {
        setError('Authentication was cancelled or timed out.');
      } else {
        setError(e.message || 'Authentication failed');
      }
    }
    setVerifying(false);
  };

  const removePasskey = async (id) => {
    try {
      await api(`/api/settings/security/passkeys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      onUpdate();
    } catch {}
  };

  const renamePasskey = async (id) => {
    if (!renameValue.trim()) return;
    try {
      await api(`/api/settings/security/passkeys/${id}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      setRenamingId(null);
      setRenameValue('');
      onUpdate();
    } catch {}
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'fingerprint': return Fingerprint;
      case 'mobile': return Smartphone;
      case 'security-key': return Key;
      default: return Fingerprint;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'fingerprint': return 'Fingerprint / Face ID';
      case 'mobile': return 'Mobile Device';
      case 'security-key': return 'Security Key';
      default: return 'Passkey';
    }
  };

  return (
    <Section
      icon={Fingerprint}
      title="Passkeys & Biometrics"
      description="Sign in with fingerprint, Face ID, or security keys using WebAuthn"
      badge={
        <span className="text-xs text-muted-foreground">
          {passkeys.length} passkey{passkeys.length !== 1 ? 's' : ''}
        </span>
      }
    >
      {!webAuthnSupported ? (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">WebAuthn not supported</p>
            <p className="text-xs text-muted-foreground mt-1">Your browser doesn't support passkeys. Use a modern browser like Chrome, Firefox, Safari, or Edge.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Registration */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Register a new passkey</p>
              <p className="text-xs text-muted-foreground">Use your device's fingerprint reader, Face ID, or a hardware security key.</p>
            </div>
            {!showNameInput ? (
              <Button size="sm" onClick={() => setShowNameInput(true)} disabled={registering}>
                <Fingerprint className="h-3.5 w-3.5 mr-1.5" /> Add Passkey
              </Button>
            ) : null}
          </div>

          {showNameInput && (
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/20">
              <Input
                value={passkeyName}
                onChange={e => setPasskeyName(e.target.value)}
                placeholder="Passkey name (e.g. MacBook Fingerprint)"
                className="flex-1"
                maxLength={100}
              />
              <Button size="sm" onClick={registerPasskey} disabled={registering}>
                {registering ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Fingerprint className="h-3.5 w-3.5" />}
                <span className="ml-1.5">{registering ? 'Scanning...' : 'Register'}</span>
              </Button>
              <button onClick={() => { setShowNameInput(false); setPasskeyName(''); setError(''); }}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Verify button */}
          {passkeys.length > 0 && (
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-medium">Test biometric verification</p>
                <p className="text-xs text-muted-foreground">Verify your identity using a registered passkey.</p>
              </div>
              <Button size="sm" variant="outline" onClick={verifyPasskey} disabled={verifying}>
                {verifying ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <ScanFace className="h-3.5 w-3.5 mr-1.5" />}
                {verifying ? 'Verifying...' : 'Verify Now'}
              </Button>
            </div>
          )}

          {(error || success) && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              error ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {error ? <XCircle className="h-4 w-4 shrink-0" /> : <CheckCircle className="h-4 w-4 shrink-0" />}
              {error || success}
            </div>
          )}

          {/* Registered passkeys */}
          {passkeys.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registered Passkeys</p>
              {passkeys.map(p => {
                const TypeIcon = getTypeIcon(p.type);
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TypeIcon className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        {renamingId === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <Input
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              className="h-7 text-sm w-48"
                              maxLength={100}
                              onKeyDown={e => e.key === 'Enter' && renamePasskey(p.id)}
                              autoFocus
                            />
                            <button onClick={() => renamePasskey(p.id)} className="p-1 rounded hover:bg-muted text-primary">
                              <CheckCircle className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => { setRenamingId(null); setRenameValue(''); }} className="p-1 rounded hover:bg-muted">
                              <X className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm font-medium">{p.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {getTypeLabel(p.type)} · Added {new Date(p.createdAt).toLocaleDateString()}
                          {p.lastUsed && ` · Last used ${new Date(p.lastUsed).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    {renamingId !== p.id && (
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                          title="Rename"
                          onClick={() => { setRenamingId(p.id); setRenameValue(p.name); }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-muted text-destructive"
                          title="Remove"
                          onClick={() => removePasskey(p.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {passkeys.length === 0 && !showNameInput && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No passkeys registered. Add one to enable biometric authentication.
            </p>
          )}
        </>
      )}
    </Section>
  );
}

/* ================================================================== */
/*  Mobile Device Pairing Section                                      */
/* ================================================================== */
function MobilePairingSection({ mobilePairing, accessToken, onUpdate }) {
  const [pairing, setPairing] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [pairUrl, setPairUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for QR expiry
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        setQrData(null);
        setPairUrl('');
        setExpiresAt(null);
        setError('Pairing token expired. Generate a new one.');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const generatePairing = async () => {
    setError('');
    setPairing(true);
    try {
      const res = await api('/api/settings/security/mobile/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQrData(data.qrDataUrl);
      setPairUrl(data.pairUrl);
      setExpiresAt(data.expiresAt);
    } catch (e) { setError(e.message); }
    setPairing(false);
  };

  const unlinkMobile = async () => {
    if (!confirm('Unlink mobile device? You will need to pair again.')) return;
    try {
      await api('/api/settings/security/mobile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      onUpdate();
    } catch {}
  };

  const closeQr = () => {
    setQrData(null);
    setPairUrl('');
    setExpiresAt(null);
    setError('');
  };

  const formatCountdown = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <Section
      icon={Smartphone}
      title="Mobile Device Linking"
      description="Link your mobile phone for quick access and push-based verification"
      badge={<StatusBadge active={!!mobilePairing} activeLabel="Linked" inactiveLabel="Not linked" />}
    >
      {mobilePairing ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{mobilePairing.deviceName}</p>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                    <Wifi className="h-2.5 w-2.5" /> LINKED
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {mobilePairing.os} · {mobilePairing.browser} · Linked {new Date(mobilePairing.linkedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={unlinkMobile}>
              <Unlink className="h-3.5 w-3.5 mr-1" /> Unlink
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {!qrData ? (
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-dashed">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <WifiOff className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">No mobile device linked</p>
                  <p className="text-xs text-muted-foreground">Scan a QR code on your phone to pair it with KrishHub.</p>
                </div>
              </div>
              <Button size="sm" onClick={generatePairing} disabled={pairing}>
                {pairing ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Link2 className="h-3.5 w-3.5 mr-1.5" />}
                {pairing ? 'Generating...' : 'Pair Mobile'}
              </Button>
            </div>
          ) : (
            <div className="p-5 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <QrCode className="h-4 w-4" /> Scan with your phone
                </h4>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono flex items-center gap-1 ${countdown <= 30 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                    <Timer className="h-3 w-3" /> {formatCountdown(countdown)}
                  </span>
                  <button onClick={closeQr}><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="bg-white rounded-xl p-3 shrink-0 shadow-lg">
                  <img src={qrData} alt="Mobile Pairing QR" className="w-56 h-56" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">1. Open your phone's camera or QR scanner</p>
                    <p className="text-sm text-muted-foreground">2. Point it at the QR code</p>
                    <p className="text-sm text-muted-foreground">3. Tap the link to confirm pairing</p>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-1">Or open this URL on your mobile:</p>
                    <div className="flex gap-1.5">
                      <code className="flex-1 bg-muted px-3 py-2 rounded text-xs font-mono break-all">{pairUrl}</code>
                      <button onClick={() => navigator.clipboard.writeText(pairUrl)} className="p-2 rounded hover:bg-muted shrink-0">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={generatePairing} disabled={pairing}>
                    <RefreshCw className="h-3 w-3 mr-1" /> New QR Code
                  </Button>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
              <XCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

/* ================================================================== */
/*  Trusted Devices Section                                            */
/* ================================================================== */
function DevicesSection({ devices, accessToken, onUpdate }) {
  const [revoking, setRevoking] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const getDeviceIcon = (device) => {
    if (device.mobile) return Smartphone;
    const os = (device.os || '').toLowerCase();
    if (os.includes('android') || os.includes('ios')) return Smartphone;
    if (os.includes('mac') || os.includes('windows') || os.includes('linux')) return Laptop;
    return Globe;
  };

  const isCurrentDevice = (device) => {
    const ua = navigator.userAgent;
    const browser = ua.includes('Firefox') ? 'Firefox' : ua.includes('Edg/') ? 'Edge' : ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : 'Other';
    const os = ua.includes('Win') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : ua.includes('Android') ? 'Android' : 'Unknown';
    return device.browser === browser && device.os === os;
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

  const revokeDevice = async (deviceId) => {
    setRevoking(deviceId);
    try {
      await api(`/api/settings/security/devices/${deviceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      onUpdate();
    } catch {}
    setRevoking(null);
  };

  const toggleTrust = async (deviceId, trusted) => {
    try {
      await api(`/api/settings/security/devices/${deviceId}/trust`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ trusted }),
      });
      onUpdate();
    } catch {}
  };

  const renameDevice = async (deviceId) => {
    if (!renameValue.trim()) return;
    try {
      await api(`/api/settings/security/devices/${deviceId}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      setRenamingId(null);
      setRenameValue('');
      onUpdate();
    } catch {}
  };

  const revokeAll = async () => {
    if (!confirm('Revoke all devices? You will need to sign in again on each device.')) return;
    try {
      await api('/api/settings/security/devices', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      onUpdate();
    } catch {}
  };

  // Sort: current device first, then by lastUsed desc
  const sorted = [...devices].sort((a, b) => {
    const aCurrent = isCurrentDevice(a);
    const bCurrent = isCurrentDevice(b);
    if (aCurrent && !bCurrent) return -1;
    if (!aCurrent && bCurrent) return 1;
    return new Date(b.lastUsed || 0) - new Date(a.lastUsed || 0);
  });

  return (
    <Section
      icon={Monitor}
      title="Trusted Devices & Sessions"
      description="Manage devices and active sessions that have accessed your account"
      badge={
        <span className="text-xs text-muted-foreground">
          {devices.length} device{devices.length !== 1 ? 's' : ''}
        </span>
      }
    >
      {devices.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No devices recorded yet. They will appear after your next login.</p>
      ) : (
        <>
          <div className="space-y-2">
            {sorted.map(d => {
              const DevIcon = getDeviceIcon(d);
              const current = isCurrentDevice(d);
              return (
                <div key={d.id} className={`flex items-center justify-between p-3 rounded-lg border transition ${
                  current ? 'border-primary/30 bg-primary/5' : 'hover:bg-muted/20'
                }`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      d.trusted ? 'bg-emerald-500/10' : d.mobile ? 'bg-blue-500/10' : 'bg-muted'
                    }`}>
                      <DevIcon className={`h-4.5 w-4.5 ${
                        d.trusted ? 'text-emerald-400' : d.mobile ? 'text-blue-400' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {renamingId === d.id ? (
                          <div className="flex items-center gap-1.5">
                            <Input
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              className="h-7 text-sm w-48"
                              maxLength={100}
                              onKeyDown={e => e.key === 'Enter' && renameDevice(d.id)}
                              autoFocus
                            />
                            <button onClick={() => renameDevice(d.id)} className="p-1 rounded hover:bg-muted text-primary">
                              <CheckCircle className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => { setRenamingId(null); setRenameValue(''); }}>
                              <X className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm font-medium truncate">{d.name || 'Unknown Device'}</p>
                        )}
                        {current && (
                          <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-semibold shrink-0">THIS DEVICE</span>
                        )}
                        {d.trusted && (
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-semibold shrink-0">TRUSTED</span>
                        )}
                        {d.mobile && (
                          <span className="text-[10px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded font-semibold shrink-0">MOBILE</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {d.browser} · {d.os} · {d.ip} · {timeAgo(d.lastUsed)}
                      </p>
                    </div>
                  </div>
                  {renamingId !== d.id && (
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                        title="Rename"
                        onClick={() => { setRenamingId(d.id); setRenameValue(d.name || ''); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className={`p-1.5 rounded hover:bg-muted ${d.trusted ? 'text-emerald-400' : 'text-muted-foreground'}`}
                        title={d.trusted ? 'Remove trust' : 'Mark as trusted'}
                        onClick={() => toggleTrust(d.id, !d.trusted)}
                      >
                        {d.trusted ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                      </button>
                      <button
                        className="p-1.5 rounded hover:bg-muted text-destructive"
                        title="Revoke"
                        disabled={revoking === d.id}
                        onClick={() => revokeDevice(d.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {devices.length > 1 && (
            <div className="pt-2 border-t">
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={revokeAll}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Revoke All Sessions
              </Button>
            </div>
          )}
        </>
      )}
    </Section>
  );
}
