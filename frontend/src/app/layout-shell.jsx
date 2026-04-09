'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const ParticleBackground = dynamic(
  () => import('@/components/ParticleBackground').then((m) => m.ParticleBackground),
  { ssr: false }
);

export function LayoutShell({ children }) {
  const pathname = usePathname();
  const isAppRoute = pathname === '/apps';
  const isAlertsRoute = pathname === '/alerts';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col relative">
      <ParticleBackground />
      <Header />
      <main className="flex-1 relative z-10">{children}</main>
      {!isAppRoute && !isAlertsRoute && <Footer />}
    </div>
  );
}
