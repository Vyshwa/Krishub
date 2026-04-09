import { useEffect } from 'react';
import { useRouterState } from '@tanstack/react-router';

export function PageTransition({ children }) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return children;
}
