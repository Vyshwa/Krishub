import { useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';

export function SsoRedirect() {
  const { redirect } = useSearch({ strict: false });
  const navigate = useNavigate();

  useEffect(() => {
    const ssoToken = localStorage.getItem('krishub_sso');

    if (!ssoToken || !redirect) {
      navigate({ to: '/login' });
      return;
    }

    // Validate redirect URL — must be *.krishub.in
    try {
      const url = new URL(redirect);
      if (!url.hostname.endsWith('.krishub.in')) {
        navigate({ to: '/' });
        return;
      }
      const sep = url.search ? '&' : '?';
      window.location.href = `${redirect}${sep}sso_token=${encodeURIComponent(ssoToken)}`;
    } catch {
      navigate({ to: '/' });
    }
  }, [redirect, navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
