import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLogin } from '@/hooks/useAuth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    login.mutate({ email, password });
  };
  if (login.isSuccess) navigate({ to: '/apps' });

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" type="text" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-4">
              New here? <Link to="/register" className="text-primary hover:underline">Create an account</Link>
            </p>
            {login.isError && (
              <p className="text-destructive mt-2">
                {login.error instanceof Error ? login.error.message : 'Invalid credentials'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
