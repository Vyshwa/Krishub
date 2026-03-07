import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRegister } from '@/hooks/useAuth';
import loginHero from '@/assets/LeftRight.png';
import { ShieldCheck, UserPlus, Globe } from 'lucide-react';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useRegister();
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    register.mutate({ name, email, password });
  };

  useEffect(() => {
    if (register.isSuccess) {
      navigate({ to: '/' });
    }
  }, [register.isSuccess, navigate]);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col md:flex-row bg-background">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-primary/5 p-12 flex-col justify-between relative overflow-hidden border-r">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -ml-48 -mb-48" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-primary mb-6 text-balance">Join the KrishTech Ecosystem</h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Quick Onboarding</h3>
                <p className="text-muted-foreground">Register once and gain access to our entire suite of business applications.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Identity</h3>
                <p className="text-muted-foreground">Modern authentication to keep your business data private and secure.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Centralized Workspace</h3>
                <p className="text-muted-foreground">The one-stop destination for your software solutions and hardware services tracking.</p>
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
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-lg">Get started with KrishTech today</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
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
                <Link to="/login" className="text-primary font-bold hover:underline transition-all">
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

