import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, RefreshCw, Plus, Pencil, Trash2, X, ExternalLink } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

export function WorkspaceApps() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editApp, setEditApp] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/workspaces`);
      if (res.ok) setApps(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this workspace app?')) return;
    await fetch(`${API}/api/workspaces/${id}`, { method: 'DELETE' });
    fetchApps();
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6" /> Workspace Apps
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchApps} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => { setShowAdd(true); setEditApp({ name: '', code: '', description: '', icon: '📦', status: 'active', url: '', color: '', allowed_origins: [] }); }}>
            <Plus className="h-4 w-4 mr-1" /> Add App
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => (
          <div key={app.id} className="border rounded-xl p-5 bg-card space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{app.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{app.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{app.code}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${app.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {app.status === 'active' ? 'active' : 'Coming Soon'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{app.description}</p>
            {app.url && (
              <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> {app.url}
              </a>
            )}
            <div className="text-xs text-muted-foreground">
              {(app.allowed_origins || []).length} allowed origin{(app.allowed_origins || []).length !== 1 ? 's' : ''}
              {(app.allowed_origins || []).map((o, i) => (
                <div key={i} className="ml-2">◉ {o}</div>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-2 border-t">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary" onClick={() => { setEditApp({ ...app }); setShowAdd(false); }}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/80" onClick={() => handleDelete(app.id)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Panel */}
      {editApp && (
        <EditPanel
          app={editApp}
          isNew={showAdd}
          onClose={() => { setEditApp(null); setShowAdd(false); }}
          onSaved={() => { setEditApp(null); setShowAdd(false); fetchApps(); }}
        />
      )}
    </div>
  );
}

function EditPanel({ app, isNew, onClose, onSaved }) {
  const [form, setForm] = useState(app);
  const [saving, setSaving] = useState(false);
  const [newOrigin, setNewOrigin] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const url = isNew ? `${API}/api/workspaces` : `${API}/api/workspaces/${form.id}`;
    await fetch(url, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    onSaved();
  };

  const addOrigin = () => {
    if (!newOrigin) return;
    set('allowed_origins', [...(form.allowed_origins || []), newOrigin]);
    setNewOrigin('');
  };

  const removeOrigin = (idx) => {
    set('allowed_origins', (form.allowed_origins || []).filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-background border-l shadow-2xl z-50 overflow-y-auto">
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{isNew ? 'Add Workspace App' : 'Edit Workspace App'}</h2>
            <p className="text-sm text-muted-foreground">{isNew ? 'Create a new app entry.' : 'Update app details and allowed origins.'}</p>
          </div>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Name *</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <Label>Code *</Label>
            <Input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Input value={form.description || ''} onChange={e => set('description', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Icon (emoji)</Label>
            <Input value={form.icon || ''} onChange={e => set('icon', e.target.value)} />
          </div>
          <div>
            <Label>Status</Label>
            <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="coming_soon">Coming Soon</option>
            </select>
          </div>
        </div>

        <div>
          <Label>App URL</Label>
          <Input value={form.url || ''} onChange={e => set('url', e.target.value)} placeholder="https://app.krishub.in" />
        </div>

        <div>
          <Label>Color classes</Label>
          <Input value={form.color || ''} onChange={e => set('color', e.target.value)} placeholder="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400" />
        </div>

        <div>
          <Label>Allowed Origins</Label>
          <div className="space-y-2 mt-1">
            {(form.allowed_origins || []).map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm flex-1 bg-muted rounded px-2 py-1">🌐 {o}</span>
                <button onClick={() => removeOrigin(i)}><X className="h-4 w-4 text-muted-foreground hover:text-destructive" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input value={newOrigin} onChange={e => setNewOrigin(e.target.value)} placeholder="https://example.com" onKeyDown={e => e.key === 'Enter' && addOrigin()} />
              <Button variant="outline" size="sm" onClick={addOrigin}>Add</Button>
            </div>
          </div>
        </div>

        <Button className="w-full" disabled={saving || !form.name || !form.code} onClick={handleSave}>
          {saving ? 'Saving...' : isNew ? 'Create' : 'Update'}
        </Button>
      </div>
    </div>
  );
}
