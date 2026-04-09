'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, ExternalLink, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { AppLauncher } from '@/components/AppLauncher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();
  const currentPath = usePathname();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/software', label: 'Software Solutions' },
    { path: '/hardware', label: 'Hardware Services' },
    { path: '/hiring', label: 'Hiring' },
    { path: '/amc', label: 'AMC Warranty' },
    { path: '/rent', label: 'Rent PC' },
  ];

  const isAppRoute = currentPath === '/apps' || (currentPath === '/' && user);
  const isConsole = isAppRoute;
  const isActive = (path) => currentPath === path;

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [currentPath]);

  // Close menu on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-2 md:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-end h-8 md:h-12">
            <Logo className="h-10 md:h-16" />
            <span className="text-lg md:text-2xl font-bold tracking-tight text-primary leading-none -ml-2 md:-ml-3 mb-1 md:mb-2">Krishub</span>
          </Link>
        </div>

        {!isAppRoute && (
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <Button variant={isActive(link.path) ? 'default' : 'ghost'} className="font-medium">
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}

        <div className={`hidden ${isConsole ? 'lg:flex' : 'md:flex'} items-center gap-3`}>
          <ThemeSwitcher />
          <AppLauncher />
          <AuthActions />
        </div>

        <div className={`${isConsole ? 'lg:hidden' : 'md:hidden'} flex items-center gap-1`}>
          <ThemeSwitcher />
          <AppLauncher />
          {isConsole ? <MobileConsoleActions /> : <MobileLoginButton />}
          {!isAppRoute && (
            <>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative z-[110] h-9 w-9 flex items-center justify-center"
                aria-label="Toggle menu"
              >
                <div className="flex flex-col justify-center items-center w-5 h-5">
                  <span
                    className={`block h-0.5 w-5 rounded-full transition-all duration-300 ease-out ${isOpen ? 'bg-red-500' : 'bg-foreground'}`}
                    style={{
                      transform: isOpen ? 'rotate(45deg) translate(0, 0)' : 'rotate(0) translateY(-3px)',
                    }}
                  />
                  <span
                    className={`block h-0.5 w-5 rounded-full transition-all duration-300 ease-out ${isOpen ? 'bg-red-500' : 'bg-foreground'}`}
                    style={{
                      opacity: isOpen ? 0 : 1,
                      transform: isOpen ? 'scaleX(0)' : 'scaleX(1)',
                    }}
                  />
                  <span
                    className={`block h-0.5 w-5 rounded-full transition-all duration-300 ease-out ${isOpen ? 'bg-red-500' : 'bg-foreground'}`}
                    style={{
                      transform: isOpen ? 'rotate(-45deg) translate(0, 0)' : 'rotate(0) translateY(3px)',
                    }}
                  />
                </div>
              </button>

              {/* Full-screen mobile menu */}
              {mounted && createPortal(
              <div
                className={`fixed left-0 right-0 bottom-0 top-16 z-[100] ${isOpen ? 'visible' : 'invisible pointer-events-none'}`}
              >
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-background/95 backdrop-blur-2xl transition-opacity duration-400"
                  style={{ opacity: isOpen ? 1 : 0 }}
                  onClick={() => setIsOpen(false)}
                />

                {/* Subtle gradient accent */}
                <div
                  className="absolute inset-0 overflow-hidden transition-opacity duration-700 pointer-events-none"
                  style={{ opacity: isOpen ? 1 : 0 }}
                >
                  <div
                    className="absolute top-[10%] left-[15%] w-72 h-72 rounded-full bg-primary/20 dark:bg-primary/30 blur-[100px] animate-float"
                  />
                  <div
                    className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/20 blur-[120px] animate-float-delayed"
                  />
                  <div
                    className="absolute top-[50%] left-[50%] w-64 h-64 rounded-full bg-primary/15 dark:bg-primary/25 blur-[80px] animate-float-slow"
                  />
                </div>

                {/* Menu content */}
                <div className="relative z-10 flex items-center justify-center h-full px-6">
                  <nav className="w-full max-w-sm flex flex-col items-center gap-3 bg-card/80 dark:bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl shadow-black/10 dark:shadow-black/30">
                    {navLinks.map((link, i) => (
                      <Link
                        key={link.path}
                        href={link.path}
                        onClick={() => setIsOpen(false)}
                        className="w-full"
                      >
                        <div
                          className={`
                            w-full text-center py-3.5 px-6 rounded-xl text-xl font-semibold
                            transition-all duration-300
                            ${isActive(link.path)
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                              : 'text-foreground hover:bg-primary/15 hover:text-primary'
                            }
                          `}
                          style={{
                            opacity: isOpen ? 1 : 0,
                            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
                            transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.07}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.07}s`,
                          }}
                        >
                          {link.label}
                        </div>
                      </Link>
                    ))}

                    {/* Bottom actions */}
                    <div
                      className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50 w-full justify-center"
                      style={{
                        opacity: isOpen ? 1 : 0,
                        transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                        transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${0.15 + navLinks.length * 0.07}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${0.15 + navLinks.length * 0.07}s`,
                      }}
                    >
                      <Link href="/?view=marketing" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-primary">
                          <ExternalLink size={16} /> Website
                        </Button>
                      </Link>
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setIsOpen(false);
                            logout.mutate(undefined, { onSuccess: () => router.push('/') });
                          }}
                        >
                          <LogOut size={16} className="rotate-180" /> Sign Out
                        </Button>
                      )}
                    </div>
                  </nav>
                </div>
              </div>,
              document.body
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function AuthActions() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground hidden lg:inline-block">
          {user.fullName || user.name || 'User'}
        </span>
        <Link href="/apps">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 gap-1.5"
          onClick={() => logout.mutate(undefined, { onSuccess: () => router.push('/') })}
        >
          <LogOut className="h-4 w-4 rotate-180" />
          <span className="hidden lg:inline">Sign Out</span>
        </Button>
      </div>
    );
  }
  return (
    <div className="hidden md:flex items-center gap-2">
      <Link href="/login">
        <Button variant="outline">Login</Button>
      </Link>
      <Link href="/register">
        <Button>Register</Button>
      </Link>
    </div>
  );
}

function MobileLoginButton() {
  const { data: user } = useCurrentUser();
  if (user) {
    const firstName = (user.fullName || user.name || 'User').split(' ')[0];
    return <span className="text-xs font-semibold text-muted-foreground truncate max-w-[80px]">{firstName}</span>;
  }
  return (
    <Link href="/login">
      <Button size="sm" variant="outline">Login</Button>
    </Link>
  );
}

function MobileConsoleActions() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();
  const [consoleNavOpen, setConsoleNavOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => setConsoleNavOpen(e.detail);
    window.addEventListener('console-nav-state', handler);
    return () => window.removeEventListener('console-nav-state', handler);
  }, []);

  if (!user) return null;
  const firstName = (user.fullName || user.name || 'User').split(' ')[0];
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-semibold text-muted-foreground truncate max-w-[80px]">{firstName}</span>
      <Link href="/apps">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:bg-destructive/10"
        onClick={() => logout.mutate(undefined, { onSuccess: () => router.push('/') })}
      >
        <LogOut className="h-4 w-4 rotate-180" />
      </Button>
      <button
        className="relative z-[110] h-9 w-9 flex items-center justify-center"
        aria-label="Toggle console menu"
        onClick={() => window.dispatchEvent(new Event('toggle-console-nav'))}
      >
        <div className="flex flex-col justify-center items-center w-5 h-5">
          <span
            className={`block h-0.5 w-5 rounded-full transition-all duration-300 ease-out ${consoleNavOpen ? 'bg-red-500' : 'bg-foreground'}`}
            style={{
              transform: consoleNavOpen ? 'rotate(45deg) translate(0, 0)' : 'rotate(0) translateY(-3px)',
            }}
          />
          <span
            className={`block h-0.5 w-5 rounded-full transition-all duration-300 ease-out ${consoleNavOpen ? 'bg-red-500' : 'bg-foreground'}`}
            style={{
              opacity: consoleNavOpen ? 0 : 1,
              transform: consoleNavOpen ? 'scaleX(0)' : 'scaleX(1)',
            }}
          />
          <span
            className={`block h-0.5 w-5 rounded-full transition-all duration-300 ease-out ${consoleNavOpen ? 'bg-red-500' : 'bg-foreground'}`}
            style={{
              transform: consoleNavOpen ? 'rotate(-45deg) translate(0, 0)' : 'rotate(0) translateY(3px)',
            }}
          />
        </div>
      </button>
    </div>
  );
}
