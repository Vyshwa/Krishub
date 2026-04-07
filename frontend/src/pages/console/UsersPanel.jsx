import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, RefreshCw, Search, Pencil, Trash2, Ban, KeyRound, X } from 'lucide-react';
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
  ALL: 'bg-green-600',
};

const APP_OPTIONS = ['KRISHUB', 'RENOTE', 'REGEN', 'REVEAL'];

function AddUserDialog({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', appCode: 'KRISHUB' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
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
      onSuccess?.();
      onClose();
      setForm({ fullName: '', email: '', phone: '', password: '', appCode: 'KRISHUB' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-popover border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add User</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="au-name">Full Name *</Label>
            <Input id="au-name" required minLength={3} value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="John Doe" />
          </div>
          <div>
            <Label htmlFor="au-email">Email</Label>
            <Input id="au-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@example.com" />
          </div>
          <div>
            <Label htmlFor="au-phone">Phone</Label>
            <Input id="au-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="9876543210" />
          </div>
          <div>
            <Label htmlFor="au-pass">Password *</Label>
            <Input id="au-pass" type="password" required minLength={8} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" />
          </div>
          <div>
            <Label htmlFor="au-app">App *</Label>
            <select id="au-app" className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" value={form.appCode} onChange={e => setForm(f => ({ ...f, appCode: e.target.value }))}>
              {APP_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Creating...' : 'Create User'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UsersPanel() {
  const { accessToken, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showAddUser, setShowAddUser] = useState(false);

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

  useEffect(() => {
    if (!authLoading && accessToken) fetchUsers();
  }, [authLoading, accessToken, fetchUsers]);

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
          <Button size="sm" onClick={() => setShowAddUser(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add User
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 w-56" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <AddUserDialog open={showAddUser} onClose={() => setShowAddUser(false)} onSuccess={fetchUsers} />

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
                <td className="p-3 text-muted-foreground">{u.status}</td>
                <td className="p-3 text-right">
                  {u.role === 'PARAM' ? (
                    <span className="text-xs text-muted-foreground italic">Super Admin</span>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded hover:bg-muted" title="Edit"><Pencil className="h-4 w-4" /></button>
                      <button className="p-1.5 rounded hover:bg-muted" title="Reset Password"><KeyRound className="h-4 w-4" /></button>
                      <button className="p-1.5 rounded hover:bg-muted text-destructive" title="Block User"><Ban className="h-4 w-4" /></button>
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
    </div>
  );
}
