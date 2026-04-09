import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLogin } from '@/hooks/useAuth';
import loginHero from '@/assets/TopDown.webp';
import { ShieldCheck, Zap, Globe } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const navigate = useNavigate();
  const { redirect } = useSearch({ strict: false });

  const onSubmit = (e) => {
    e.preventDefault();
    login.mutate({ emailOrPhone: email, password });
  };

  useEffect(() => {
    if (login.isSuccess) {
      if (redirect) {
        navigate({ to: '/sso', search: { redirect } });
      } else {
        navigate({ to: '/' });
      }
    }
  }, [login.isSuccess, navigate, redirect]);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col md:flex-row bg-background">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-primary/5 p-12 flex-col justify-between relative overflow-hidden border-r">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -ml-48 -mb-48" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-primary mb-6 text-balance">Empowering Your IT Infrastructure</h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure & Reliable</h3>
                <p className="text-muted-foreground">Your data is protected by industry-standard security protocols and robust architecture.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Instant Access</h3>
                <p className="text-muted-foreground">Seamlessly switch between your professional tools with our integrated app ecosystem.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Cloud-Scale Solutions</h3>
                <p className="text-muted-foreground">Access your workload from anywhere, anytime with our cloud-native applications.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-8 rounded-2xl overflow-hidden border shadow-2xl bg-background p-2 max-w-sm mx-auto">
          <img src={loginHero} alt="KrishTech Platform" className="rounded-xl object-contain aspect-square w-full" />
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/10">
        <div className="w-full max-w-md bg-background rounded-2xl shadow-xl border p-8 hover:shadow-2xl transition-shadow duration-500">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-lg">Please enter your details to sign in</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">Username / Email</Label>
                <Input
                  id="username"
                  placeholder="name@example.com"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-md transition-all focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-md transition-all focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20" disabled={login.isPending}>
                {login.isPending ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-muted-foreground text-md">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-bold hover:underline transition-all">
                  Create an account
                </Link>
              </p>
            </div>
            {login.isError && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {login.error instanceof Error ? login.error.message : 'Invalid credentials. Please try again.'}
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </div>
  );
}

