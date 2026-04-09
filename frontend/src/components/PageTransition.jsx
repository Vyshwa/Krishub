import { useEffect, useState, useRef } from 'react';
import { useRouterState } from '@tanstack/react-router';

export function PageTransition({ children }) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState('visible'); // 'visible' | 'fade-out' | 'wipe' | 'fade-in'
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      setPhase('fade-out');
      const t1 = setTimeout(() => {
        setPhase('wipe');
      }, 200);
      const t2 = setTimeout(() => {
        setDisplayChildren(children);
        prevPath.current = pathname;
        window.scrollTo({ top: 0, behavior: 'instant' });
        setPhase('fade-in');
      }, 450);
      const t3 = setTimeout(() => {
        setPhase('visible');
      }, 500);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <>
      {/* Wipe overlay */}
      <div
        className={`fixed inset-0 z-50 pointer-events-none bg-primary/20 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          phase === 'wipe' ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* Content */}
      <div className={`transition-all duration-300 ease-out ${
        phase === 'visible' ? 'opacity-100 translate-y-0 blur-0' :
        phase === 'fade-out' ? 'opacity-0 -translate-y-4 blur-[2px]' :
        phase === 'wipe' ? 'opacity-0 blur-[2px]' :
        'opacity-0 translate-y-6 blur-[2px]'
      }`}>
        {displayChildren}
      </div>
    </>
  );
}
