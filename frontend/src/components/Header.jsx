import { useState } from 'react';
import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { Menu, ExternalLink, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { AppLauncher } from '@/components/AppLauncher';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/software', label: 'Software Solutions' },
    { path: '/hardware', label: 'Hardware Services' },
    { path: '/contact', label: 'Contact Us' },
  ];

  const isAppRoute = currentPath === '/apps' || (currentPath === '/' && user);
  const isActive = (path) => currentPath === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-end h-12">
            <Logo size="md" />
            <span className="text-2xl font-bold tracking-tight text-primary leading-none -ml-3 mb-2">Krishub</span>
          </Link>
        </div>

        {!isAppRoute && (
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button variant={isActive(link.path) ? 'default' : 'ghost'} className="font-medium">
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}

        <div className="hidden md:flex items-center gap-3">
          <AppLauncher />
          <AuthActions />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <AppLauncher />
          <MobileLoginButton />
        </div>
        {!isAppRoute && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-4 mt-8">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}>
                  <Button variant={isActive(link.path) ? 'default' : 'ghost'} className="w-full justify-start text-lg">
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t space-y-2">
                <Link to="/?view=marketing" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-11 px-4 text-muted-foreground hover:text-primary">
                    <ExternalLink size={18} /> Main Website
                  </Button>
                </Link>
                {user && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11 px-4 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setIsOpen(false);
                      logout.mutate(undefined, { onSuccess: () => navigate({ to: '/' }) });
                    }}
                  >
                    <LogOut size={18} className="rotate-180" /> Sign Out
                  </Button>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        )}
      </div>
    </header>
  );
}

function AuthActions() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground hidden lg:inline-block">
          {user.fullName || user.name || 'User'}
        </span>
        <Link to="/apps">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 gap-1.5"
          onClick={() => logout.mutate(undefined, { onSuccess: () => navigate({ to: '/' }) })}
        >
          <LogOut className="h-4 w-4 rotate-180" />
          <span className="hidden lg:inline">Sign Out</span>
        </Button>
      </div>
    );
  }
  return (
    <div className="hidden md:flex items-center gap-2">
      <Link to="/login">
        <Button variant="outline">Login</Button>
      </Link>
      <Link to="/register">
        <Button>Register</Button>
      </Link>
    </div>
  );
}

function MobileLoginButton() {
  const { data: user } = useCurrentUser();
  if (user) return null;
  return (
    <Link to="/login">
      <Button size="sm" variant="outline">Login</Button>
    </Link>
  );
}
