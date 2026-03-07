import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { LayoutDashboard, ExternalLink, Home, Settings, LogOut, Search, Bell } from 'lucide-react';

export function Apps() {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center bg-background relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -ml-64 -mb-64 animate-pulse" />
        
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-8 p-12 bg-background/40 backdrop-blur-xl border-2 border-dashed rounded-[3rem] shadow-2xl">
            <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <LayoutDashboard size={40} className="text-primary animate-bounce-slow" />
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

  const appList = [
    { name: 'Reside', desc: 'Property & Rental Mgt', icon: '🏠', color: 'bg-emerald-100 text-emerald-700', url: '/', isInternal: true },
    { name: 'Renote', desc: 'Design & Estimations', icon: '🎨', color: 'bg-amber-100 text-amber-700', url: 'https://renote.krishub.in' },
    { name: 'ReGen', desc: 'Workforce & Tasks', icon: '👥', color: 'bg-blue-100 text-blue-700', url: 'https://regen.krishub.in' },
    { name: 'Reveal', desc: 'RFID Stock Verification', icon: '📦', color: 'bg-purple-100 text-purple-700', url: 'https://reveal.krishub.in' },
    { name: 'Request', desc: 'Client Requests', icon: '📞', color: 'bg-orange-100 text-orange-700', url: '/', isComingSoon: true },
    { name: 'Realm', desc: 'Virtual Environment', icon: '🌐', color: 'bg-indigo-100 text-indigo-700', url: '/', isComingSoon: true }
  ];

  const filteredApps = appList.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-white p-6 justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <LayoutDashboard size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight">Console</span>
          </div>
          
          <nav className="space-y-1">
            <Button 
              variant={activeSection === 'dashboard' ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-3 h-11 px-4"
              onClick={() => setActiveSection('dashboard')}
            >
              <Home size={18} /> Dashboard
            </Button>
            <Button 
              variant={activeSection === 'notifications' ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-3 h-11 px-4 text-muted-foreground hover:text-foreground"
              onClick={() => setActiveSection('notifications')}
            >
              <Bell size={18} /> Notifications
            </Button>
            <Button 
              variant={activeSection === 'settings' ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-3 h-11 px-4 text-muted-foreground hover:text-foreground"
              onClick={() => setActiveSection('settings')}
            >
              <Settings size={18} /> Settings
            </Button>

            <div className="pt-4 mt-4 border-t">
              <Link to="/?view=marketing">
                <Button variant="ghost" className="w-full justify-start gap-3 h-11 px-4 text-muted-foreground hover:text-primary">
                  <ExternalLink size={18} /> Main Website
                </Button>
              </Link>
            </div>
          </nav>
        </div>

        <Button 
          variant="ghost" 
          onClick={() => logout.mutate(undefined, { onSuccess: () => navigate({ to: '/' }) })} 
          className="w-full justify-start gap-3 h-11 px-4 text-destructive hover:bg-destructive/10"
        >
          <LogOut size={18} /> Sign Out
        </Button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeSection === 'dashboard' ? (
          <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
            {/* Dashboard Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name.split(' ')[0]}!</h1>
                <p className="text-muted-foreground mt-1 text-lg">Here's your central hub for all KrishTech applications.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search applications..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border rounded-xl pl-10 pr-4 h-11 w-full md:w-64 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  />
                </div>
              </div>
            </header>

            {/* Quick Stats / Feedback bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">4</div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Active Apps</div>
                  <div className="font-bold">Pro Account</div>
                </div>
              </div>
              <div className="bg-white border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">1</div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Internal</div>
                  <div className="font-bold">Reside Ready</div>
                </div>
              </div>
              <div className="bg-white border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-bold">99%</div>
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
              
              {/* App Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApps.length > 0 ? (
                  filteredApps.map((app) => (
                    <div key={app.name} className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className={`p-6 bg-white border rounded-[2rem] h-full shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col items-start ${app.isComingSoon ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}>
                        <div className={`h-14 w-14 rounded-2xl ${app.color} flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                          {app.icon}
                        </div>
                        
                        <div className="space-y-2 mb-6 flex-grow">
                          <h3 className="text-2xl font-bold text-foreground">{app.name}</h3>
                          <p className="text-muted-foreground leading-relaxed">{app.desc}</p>
                        </div>

                        {!app.isComingSoon ? (
                          app.isInternal ? (
                            <Link to={app.url} className="w-full">
                              <Button className="w-full h-11 rounded-xl text-md font-semibold">Launch Tool</Button>
                            </Link>
                          ) : (
                            <a href={app.url} target="_blank" rel="noopener noreferrer" className="w-full">
                              <Button variant="outline" className="w-full h-11 rounded-xl text-md font-semibold border-2 hover:bg-muted group">
                                Explore <ExternalLink size={16} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                              </Button>
                            </a>
                          )
                        ) : (
                          <Button disabled className="w-full h-11 rounded-xl text-md">Coming Soon</Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                      <Search size={32} className="text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-semibold">No applications found</h3>
                    <p className="text-muted-foreground">Try searching for a different keyword or check your spelling.</p>
                    <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeSection === 'notifications' ? (
          <div className="p-6 md:p-10 max-w-6xl mx-auto text-center py-40">
            <Bell size={64} className="mx-auto text-muted-foreground/30 mb-6" />
            <h2 className="text-3xl font-bold mb-2">Notifications</h2>
            <p className="text-muted-foreground text-lg">You're all caught up! No recent activity to show.</p>
          </div>
        ) : (
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
