import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { AppLauncher } from '@/components/AppLauncher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/software', label: 'Software Solutions' },
    { path: '/hardware', label: 'Hardware Services' },
    { path: '/contact', label: 'Contact Us' },
  ];

  const isActive = (path) => currentPath === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Link to="/" className="flex items-center space-x-2">
            <Logo size="md" />
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button variant={isActive(link.path) ? 'default' : 'ghost'} className="font-medium">
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <AppLauncher />
          <AuthActions />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeSwitcher />
          <AppLauncher />
          <MobileLoginButton />
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4 mt-8">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}>
                  <Button variant={isActive(link.path) ? 'default' : 'ghost'} className="w-full justify-start text-lg">
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function AuthActions() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  if (user) {
    return (
      <div className="hidden md:flex items-center gap-2">
        <Link to="/apps" className="text-sm hover:underline">
          {user.name}
        </Link>
        <Button variant="outline" onClick={() => logout.mutate()}>
          Logout
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
