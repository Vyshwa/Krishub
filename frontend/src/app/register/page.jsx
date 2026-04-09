'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRegister } from '@/hooks/useAuth';
import { ShieldCheck, UserPlus, Globe } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useRegister();
  const router = useRouter();

  const onSubmit = (e) => {
    e.preventDefault();
    register.mutate({ name, email, password });
  };

  useEffect(() => {
    if (register.isSuccess) {
      router.push('/');
    }
  }, [register.isSuccess, router]);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col md:flex-row bg-background">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-12 flex-col items-center justify-center relative overflow-hidden border-r">
        {/* Animated floating blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl animate-float will-change-transform" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[50%] h-[50%] rounded-full bg-secondary/10 blur-3xl animate-float-delayed will-change-transform" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-accent/5 blur-3xl animate-float-slow will-change-transform" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="relative w-full max-w-sm overflow-hidden rounded-xl shadow-2xl group">
            <img
              src="/assets/LeftRight.png"
              alt="KrishTech Platform"
              className="w-full h-full object-contain p-4 transition-all duration-500 hover:scale-105 dark:invert dark:hue-rotate-180 dark:brightness-110 dark:contrast-110 dark:[filter:invert(1)_hue-rotate(180deg)_brightness(1.1)_contrast(1.1)_drop-shadow(0_0_3px_rgba(99,102,241,0.8))_drop-shadow(0_0_10px_rgba(99,102,241,0.4))_drop-shadow(0_0_20px_rgba(56,189,248,0.3))_drop-shadow(0_0_40px_rgba(168,85,247,0.2))]"
            />
            {/* Aurora shimmer overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100">
              <div className="absolute -inset-[25%] animate-aurora-1 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)] will-change-transform" />
              <div className="absolute -inset-[15%] animate-aurora-2 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.12)_0%,transparent_70%)] will-change-transform" />
              <div className="absolute -inset-[20%] animate-aurora-3 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)] will-change-transform" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-border-sweep" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent animate-border-sweep-reverse" />
            </div>
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-primary text-balance">Join the KrishTech Ecosystem</h2>
            <div className="flex items-center justify-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <span className="text-sm">Quick Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm">Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-sm">Centralized</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-muted/10">
        <div className="w-full max-w-md bg-background rounded-2xl shadow-xl border p-8 hover:shadow-2xl transition-shadow duration-500">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-lg">Get started with KrishTech today</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <form action="#" className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-md transition-all focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Email Address</Label>
                <Input
                  id="username"
                  placeholder="name@example.com"
                  type="text"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-md transition-all focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-md transition-all focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20" disabled={register.isPending}>
                {register.isPending ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-muted-foreground text-md">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-bold hover:underline transition-all">
                  Sign in
                </Link>
              </p>
            </div>
            {register.isError && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {register.error instanceof Error ? register.error.message : 'Registration failed. Please try again.'}
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </div>
  );
}
