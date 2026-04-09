'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function SsoContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const router = useRouter();

  useEffect(() => {
    const ssoToken = localStorage.getItem('krishub_sso');

    if (!ssoToken || !redirect) {
      router.push('/login');
      return;
    }

    // Validate redirect URL — must be *.krishub.in
    try {
      const url = new URL(redirect);
      if (!url.hostname.endsWith('.krishub.in')) {
        router.push('/');
        return;
      }
      const sep = url.search ? '&' : '?';
      window.location.href = `${redirect}${sep}sso_token=${encodeURIComponent(ssoToken)}`;
    } catch {
      router.push('/');
    }
  }, [redirect, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}

export default function SsoRedirectPage() {
  return <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Redirecting...</p></div>}><SsoContent /></Suspense>;
}
