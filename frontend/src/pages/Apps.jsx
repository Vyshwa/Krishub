import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCurrentUser, useLogout, useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, ExternalLink, Home, Settings, LogOut, Search, Bell, Globe, Users, Rocket } from 'lucide-react';
import { WorkspaceApps } from './console/WorkspaceApps';
import { UsersPanel } from './console/UsersPanel';
import { DeployDashboard } from './console/DeployDashboard';

export function Apps() {
  const { data: user, isLoading } = useCurrentUser();
  const { isAdmin } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -ml-64 -mb-64 animate-pulse" />
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-8 p-12 bg-background/40 backdrop-blur-xl border-2 border-dashed rounded-[3rem] shadow-2xl">
            <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <LayoutDashboard size={40} className="text-primary" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-extrabold tracking-tight">KrishTech Console</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Your enterprise workspace is protected. Please sign in with your enterprise credentials to access your integrated tools and services.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
              <Link to="/login">
                <Button size="lg" className="h-14 px-10 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  Sign into Workspace
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold hover:bg-muted transition-all">
                  Create New ID
                </Button>
              </Link>
            </div>
            <div className="pt-8 border-t">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 font-medium">
                <Home size={18} /> Back to KrishTech Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'workspace', label: 'Workspace', icon: Globe },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'deploy', label: 'Deploy', icon: Rocket },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const appList = [
    { name: 'Reside', desc: 'Property & Rental Mgt', icon: '🏠', color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400', url: '/', isInternal: true },
    { name: 'Renote', desc: 'Design & Estimations', icon: '🎨', color: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400', url: 'https://renote.krishub.in' },
    { name: 'ReGen', desc: 'Workforce & Tasks', icon: '👥', color: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400', url: 'https://regen.krishub.in' },
    { name: 'Reveal', desc: 'RFID Stock Verification', icon: '📦', color: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400', url: 'https://reveal.krishub.in' },
    { name: 'Request', desc: 'Client Requests', icon: '📞', color: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400', url: '/', isComingSoon: true },
    { name: 'React', desc: 'Compound Clash – Chemistry Game', icon: '⚗️', color: 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400', url: 'https://react.krishub.in' },
  ];

  const filteredApps = appList.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-56 flex-col border-r bg-card p-4 justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <LayoutDashboard size={16} />
            </div>
            <span className="font-bold text-lg tracking-tight">Console</span>
          </div>

          <nav className="space-y-0.5">
            {sidebarItems.map(item => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'secondary' : 'ghost'}
                className={`w-full justify-start gap-3 h-10 px-3 text-sm ${activeSection !== item.id ? 'text-muted-foreground hover:text-foreground' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon size={18} /> {item.label}
              </Button>
            ))}

            <div className="pt-3 mt-3 border-t">
              <Link to="/?view=marketing">
                <Button variant="ghost" className="w-full justify-start gap-3 h-10 px-3 text-sm text-muted-foreground hover:text-primary">
                  <ExternalLink size={18} /> Main Website
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {activeSection === 'dashboard' && (
          <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name?.split(' ')[0] || user.fullName?.split(' ')[0]}!</h1>
                <p className="text-muted-foreground mt-1 text-lg">Here's your central hub for all KrishTech applications.</p>
              </div>
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-card border rounded-xl pl-10 pr-4 h-11 w-full md:w-64 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card border rounded-2xl p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">{appList.filter(a => !a.isComingSoon).length}</div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Active Apps</div>
                  <div className="font-bold">Pro Account</div>
                </div>
              </div>
              <div className="bg-card border rounded-2xl p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">{appList.filter(a => a.isInternal).length}</div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Internal</div>
                  <div className="font-bold">Reside Ready</div>
                </div>
              </div>
              <div className="bg-card border rounded-2xl p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold">99%</div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">System Uptime</div>
                  <div className="font-bold">Operational</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'My Workspace'}
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApps.map((app) => (
                  <div key={app.name} className="group">
                    <div className={`p-6 bg-card border rounded-2xl h-full hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col items-start ${app.isComingSoon ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}>
                      <div className={`h-14 w-14 rounded-2xl ${app.color} flex items-center justify-center text-3xl mb-5 group-hover:scale-105 transition-transform`}>
                        {app.icon}
                      </div>
                      <div className="space-y-2 mb-5 flex-grow">
                        <h3 className="text-xl font-bold">{app.name}</h3>
                        <p className="text-muted-foreground text-sm">{app.desc}</p>
                      </div>
                      {!app.isComingSoon ? (
                        app.isInternal ? (
                          <Link to={app.url} className="w-full"><Button className="w-full h-10 rounded-xl text-sm font-semibold">Launch Tool</Button></Link>
                        ) : (
                          <a href={app.url} target="_blank" rel="noopener noreferrer" className="w-full">
                            <Button variant="outline" className="w-full h-10 rounded-xl text-sm font-semibold border-2 hover:bg-muted">
                              Explore <ExternalLink size={14} className="ml-2" />
                            </Button>
                          </a>
                        )
                      ) : (
                        <Button disabled className="w-full h-10 rounded-xl text-sm">Coming Soon</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'workspace' && <WorkspaceApps />}
        {activeSection === 'users' && <UsersPanel />}
        {activeSection === 'deploy' && <DeployDashboard />}

        {activeSection === 'notifications' && (
          <div className="p-6 md:p-10 max-w-6xl mx-auto text-center py-40">
            <Bell size={64} className="mx-auto text-muted-foreground/30 mb-6" />
            <h2 className="text-3xl font-bold mb-2">Notifications</h2>
            <p className="text-muted-foreground text-lg">You're all caught up! No recent activity to show.</p>
          </div>
        )}
        {activeSection === 'settings' && (
          <div className="p-6 md:p-10 max-w-6xl mx-auto text-center py-40">
            <Settings size={64} className="mx-auto text-muted-foreground/30 mb-6" />
            <h2 className="text-3xl font-bold mb-2">Settings</h2>
            <p className="text-muted-foreground text-lg">Console settings and profile management are coming soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}

