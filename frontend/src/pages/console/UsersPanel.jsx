import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, RefreshCw, Search, Pencil, Trash2, Ban, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const API = import.meta.env.VITE_API_URL || '';

const ROLE_COLORS = {
  PARAM: 'bg-amber-500/20 text-amber-400',
  ADMIN: 'bg-purple-500/20 text-purple-400',
  OWNER: 'bg-blue-500/20 text-blue-400',
  STAFF: 'bg-cyan-500/20 text-cyan-400',
  USER: 'bg-slate-500/20 text-slate-400',
  INTERN: 'bg-teal-500/20 text-teal-400',
};

const APP_COLORS = {
  KRISHUB: 'bg-emerald-600',
  RENOTE: 'bg-amber-600',
  REGEN: 'bg-blue-600',
  REVEAL: 'bg-purple-600',
  REACT: 'bg-cyan-600',
  RESIDE: 'bg-rose-600',
  REQUEST: 'bg-orange-600',
  ALL: 'bg-green-600',
};

const ROLE_OPTIONS = ['USER', 'STAFF', 'OWNER', 'ADMIN'];

/* ---------- Slide-in Edit/Add Panel (like Workspace Apps) ---------- */
function UserPanel({ user, isNew, apps, onClose, onSaved }) {
  const [form, setForm] = useState(
    isNew
      ? { fullName: '', email: '', phone: '', password: '', appCode: apps[0]?.code || 'KRISHUB' }
      : { fullName: user.name || '', email: user.email || '', phone: user.phone || '' }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      if (isNew) {
        const body = { ...form };
        if (!body.email) delete body.email;
        if (!body.phone) delete body.phone;
        const res = await fetch(`${API}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to create user');
      } else {
        const body = {};
        if (form.fullName !== (user.name || '')) body.fullName = form.fullName;
        if (form.email !== (user.email || '')) body.email = form.email;
        if (form.phone !== (user.phone || '')) body.phone = form.phone;
        if (Object.keys(body).length === 0) { onClose(); return; }
        const res = await fetch(`${API}/api/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to update user');
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-background border-l shadow-2xl z-50 overflow-y-auto">
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{isNew ? 'Add User' : 'Edit User'}</h2>
            <p className="text-sm text-muted-foreground">{isNew ? 'Create a new user account.' : `Update ${user.name}'s profile.`}</p>
          </div>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        <div>
          <Label>Full Name *</Label>
          <Input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="John Doe" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@example.com" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" />
          </div>
        </div>

        {isNew && (
          <>
            <div>
              <Label>Password *</Label>
              <Input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" />
            </div>
            <div>
              <Label>App *</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.appCode} onChange={e => set('appCode', e.target.value)}>
                {apps.map(a => (
                  <option key={a.code} value={a.code}>
                    {a.icon} {a.name} ({a.code}){a.status !== 'active' ? ' — Coming Soon' : ''}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {!isNew && (
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs text-muted-foreground">Current: <span className={`inline-block text-xs px-2 py-0.5 rounded font-bold text-white ${APP_COLORS[user.app] || 'bg-gray-600'}`}>{user.app}</span> · <span className={`inline-block text-xs px-2 py-0.5 rounded-md font-medium ${ROLE_COLORS[user.role] || 'bg-muted'}`}>{user.role}</span></p>
          </div>
        )}

        {error && <p className="text-sm text-destructive bg-destructive/10 rounded p-2">{error}</p>}

        <Button className="w-full" disabled={saving || !form.fullName || (isNew && !form.password)} onClick={handleSave}>
          {saving ? 'Saving...' : isNew ? 'Create User' : 'Update User'}
        </Button>
      </div>
    </div>
  );
}

export function UsersPanel() {
  const { accessToken, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [editUser, setEditUser] = useState(null);
  const [isAddNew, setIsAddNew] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.users || data.data || []);
      }
    } catch {}
    setLoading(false);
  }, [accessToken]);

  const fetchApps = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/workspaces`);
      if (res.ok) {
        const data = await res.json();
        setApps(data.map(a => ({ code: a.code, name: a.name, icon: a.icon || '📦', status: a.status })));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!authLoading && accessToken) fetchUsers();
    fetchApps();
  }, [authLoading, accessToken, fetchUsers, fetchApps]);

  const toggleBlock = async (user) => {
    const action = user.status === 'Blocked' ? 'unblock' : 'block';
    if (!confirm(`${action === 'block' ? 'Block' : 'Unblock'} ${user.name}?`)) return;
    setActionLoading(user.id);
    try {
      const res = await fetch(`${API}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: action === 'block' }),
      });
      if (res.ok) fetchUsers();
    } catch {}
    setActionLoading(null);
  };

  const deleteUser = async (user) => {
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    setActionLoading(user.id);
    try {
      await fetch(`${API}/api/users/${user.id}`, { method: 'DELETE' });
      fetchUsers();
    } catch {}
    setActionLoading(null);
  };

  // Get unique app codes for tabs
  const appCounts = {};
  users.forEach(u => {
    const app = u.app || 'UNKNOWN';
    appCounts[app] = (appCounts[app] || 0) + 1;
  });
  const tabs = [{ label: 'All', count: users.length }, ...Object.entries(appCounts).map(([label, count]) => ({ label, count }))];

  const filtered = users.filter(u => {
    const matchesTab = activeTab === 'All' || u.app === activeTab;
    const matchesSearch = !search || [u.name, u.email, u.phone].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" /> Users
          <span className="text-sm bg-muted px-2 py-0.5 rounded-full">{users.length}</span>
        </h1>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => { setIsAddNew(true); setEditUser({}); }}>
            <Plus className="h-4 w-4 mr-1" /> Add User
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 w-56" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.label}
            onClick={() => setActiveTab(t.label)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              activeTab === t.label ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.label ? 'bg-primary-foreground/20' : 'bg-background'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Phone</th>
              <th className="text-left p-3 font-medium">App</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id + '-' + i} className="border-b hover:bg-muted/20 transition">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-muted-foreground">{u.email || '—'}</td>
                <td className="p-3 text-muted-foreground">{u.phone || '—'}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded font-bold text-white ${APP_COLORS[u.app] || 'bg-gray-600'}`}>
                    {u.app || '—'}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${ROLE_COLORS[u.role] || 'bg-muted text-muted-foreground'}`}>
                    {u.role || '—'}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`text-xs font-medium ${u.status === 'Blocked' ? 'text-red-400' : 'text-muted-foreground'}`}>{u.status}</span>
                </td>
                <td className="p-3 text-right">
                  {u.role === 'PARAM' ? (
                    <span className="text-xs text-muted-foreground italic">Super Admin</span>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-muted" title="Edit" onClick={() => { setEditUser(u); setIsAddNew(false); }}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className={`p-1.5 rounded hover:bg-muted ${u.status === 'Blocked' ? 'text-emerald-400' : 'text-destructive'}`}
                        title={u.status === 'Blocked' ? 'Unblock User' : 'Block User'}
                        disabled={actionLoading === u.id}
                        onClick={() => toggleBlock(u)}
                      >
                        {u.status === 'Blocked' ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </button>
                      <button className="p-1.5 rounded hover:bg-muted text-destructive" title="Delete User" disabled={actionLoading === u.id} onClick={() => deleteUser(u)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-in Panel */}
      {editUser && (
        <UserPanel
          user={editUser}
          isNew={isAddNew}
          apps={apps}
          onClose={() => { setEditUser(null); setIsAddNew(false); }}
          onSaved={() => { setEditUser(null); setIsAddNew(false); fetchUsers(); }}
        />
      )}
    </div>
  );
}
