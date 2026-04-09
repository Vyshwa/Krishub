import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const revealImg = '/assets/Reveal.jpeg';
const renoteImg = '/assets/renote.png';
const regenImg = '/assets/regen.jpeg';
const resideLogo = '/assets/Reside logo.jpg';

const groups = [
  {
    label: 'Business Tools',
    apps: [
      { name: 'Renote', href: 'https://renote.krishub.in', iconUrl: renoteImg, isExternal: true },
      { name: 'ReGen', href: 'https://regen.krishub.in', iconUrl: regenImg, isExternal: true },
      { name: 'Request', href: '/', color: 'bg-orange-500' },
      { name: 'Reside', href: '/', iconUrl: resideLogo },
      { name: 'Reserve', href: '/', color: 'bg-rose-500' },
    ],
  },
  {
    label: 'Enterprise Solutions',
    apps: [
      { name: 'Reveal', href: 'https://reveal.krishub.in', iconUrl: revealImg, isExternal: true },
    ],
  },
  {
    label: 'Games',
    apps: [
      { name: 'React', href: 'https://react.krishub.in', color: 'bg-cyan-500', isExternal: true },
    ],
  },
];

function AppIcon({ app, onClose, ssoToken }) {
  const inner = (
    <>
      <div className="relative rounded-lg p-[2px] overflow-hidden" style={{ animation: 'goldenSpin 3s linear infinite' }}>
        <div className="absolute inset-0 rounded-lg" style={{ background: 'conic-gradient(from var(--golden-angle, 0deg), #d4a017, #f5d060, #fffbe6, #f5d060, #d4a017, #a67c00, #d4a017)', animation: 'goldenSpin 3s linear infinite' }} />
        <div className="relative rounded-[6px] bg-popover">
          {app.iconUrl ? (
            <img
              src={app.iconUrl}
              alt={`${app.name} logo`}
              className="h-10 w-10 rounded-[6px] bg-white object-contain p-1 transition-all duration-300 group-hover:scale-110"
            />
          ) : (
            <span className={`h-10 w-10 rounded-[6px] ${app.color} block transition-all duration-300 group-hover:scale-110`} />
          )}
        </div>
      </div>
      <span className="text-xs font-semibold transition-all duration-300 group-hover:text-primary">{ app.name}</span>
    </>
  );

  const cls = 'group relative flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:shadow-md hover:-translate-y-0.5 active:scale-95';

  if (app.isExternal) {
    // Append sso_token if user is logged into KrishHub
    const href = ssoToken
      ? `${app.href}${app.href.includes('?') ? '&' : '?'}sso_token=${encodeURIComponent(ssoToken)}`
      : app.href;
    return (
      <a key={app.name} href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClose}>
        {inner}
      </a>
    );
  }
  return (
    <Link key={app.name} href={app.href} className={cls} onClick={onClose}>
      {inner}
    </Link>
  );
}

export function AppLauncher() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const [ssoToken, setSsoToken] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      setSsoToken(localStorage.getItem('krishub_sso'));
    } else {
      setSsoToken(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      const target = e.target;
      if (rootRef.current && !rootRef.current.contains(target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        aria-label="Open apps"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center transition"
      >
        <span className="grid grid-cols-3 gap-0.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="h-1 w-1 rounded-full bg-neutral-600" />
          ))}
        </span>
      </button>
      {open && (
        <div
          className="absolute right-1/2 translate-x-1/2 mt-2 w-72 rounded-2xl border border-border/50 bg-gradient-to-br from-blue-50 via-white to-indigo-50/50 dark:bg-popover dark:from-popover dark:via-popover dark:to-popover shadow-2xl shadow-black/10 dark:shadow-black/30 overflow-hidden"
        >
          {/* Aurora gradient layers */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-aurora-1 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,transparent_60%)] [background-size:150%_150%]" />
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-aurora-2 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.06)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.12)_0%,transparent_60%)] [background-size:120%_120%]" />
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-aurora-3 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.05)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.1)_0%,transparent_60%)] [background-size:130%_130%]" />
          </div>
          {/* Shimmer border sweeps */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-border-sweep" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent animate-border-sweep-reverse" />
          {/* Sparkle particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-primary/60 dark:bg-primary/80"
                style={{
                  width: `${1.5 + Math.random() * 2}px`,
                  height: `${1.5 + Math.random() * 2}px`,
                  left: `${8 + Math.random() * 84}%`,
                  top: `${8 + Math.random() * 84}%`,
                  opacity: 0,
                  animation: `sparkle ${1.5 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite`,
                }}
              />
            ))}
          </div>
          <div className="relative p-4 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
            {groups.map((group, gi) => (
              <div key={group.label}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                  {group.label}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {group.apps.map((app, ai) => (
                    <div
                      key={app.name}
                      style={{
                        opacity: 0,
                        transform: 'translateY(16px) scale(0.8) rotateX(10deg)',
                        animation: `appItemIn 0.5s cubic-bezier(0.16,1,0.3,1) ${(gi * 3 + ai) * 60}ms forwards`,
                      }}
                    >
                      <AppIcon app={app} onClose={() => setOpen(false)} ssoToken={ssoToken} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <style>{`
            @property --golden-angle {
              syntax: '<angle>';
              initial-value: 0deg;
              inherits: false;
            }
            @keyframes goldenSpin {
              to { --golden-angle: 360deg; }
            }
            @keyframes appItemIn {
              0% { opacity: 0; transform: translateY(16px) scale(0.8) rotateX(10deg); }
              60% { opacity: 1; transform: translateY(-4px) scale(1.02) rotateX(0deg); }
              100% { opacity: 1; transform: translateY(0) scale(1) rotateX(0deg); }
            }
            @keyframes sparkle {
              0%, 100% { opacity: 0; transform: scale(0); }
              50% { opacity: 1; transform: scale(1); }
            }
            @keyframes iconPulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
              50% { box-shadow: 0 0 12px 2px rgba(99,102,241,0.15); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
