import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, RefreshCw, Search, Pencil, Trash2, Bell, KeyRound } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const ROLE_COLORS = {
  PARAM: 'bg-amber-500/20 text-amber-400',
  ADMIN: 'bg-purple-500/20 text-purple-400',
  OWNER: 'bg-blue-500/20 text-blue-400',
  STAFF: 'bg-cyan-500/20 text-cyan-400',
  USER: 'bg-slate-500/20 text-slate-400',
};

const APP_COLORS = {
  KRISHUB: 'bg-emerald-600',
  RENOTE: 'bg-amber-600',
  REGEN: 'bg-blue-600',
  REVEAL: 'bg-purple-600',
  ALL: 'bg-green-600',
};

export function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users`);
      if (res.ok) setUsers(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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
          <button onClick={fetchUsers} className="ml-2">
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </h1>
        <div className="flex items-center gap-3">
          <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add User</Button>
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
                <td className="p-3 text-muted-foreground">{u.status}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                    <button className="p-1.5 rounded hover:bg-muted"><Bell className="h-4 w-4" /></button>
                    <button className="p-1.5 rounded hover:bg-muted"><KeyRound className="h-4 w-4" /></button>
                    <button className="p-1.5 rounded hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
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
