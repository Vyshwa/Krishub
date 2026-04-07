import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import revealImg from '@/assets/Reveal.jpeg';
import renoteImg from '@/assets/renote.png';
import regenImg from '@/assets/regen.jpeg';
import resideLogo from '@/assets/Reside logo.jpg';
import { useAuth } from '@/hooks/useAuth';

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
      {app.iconUrl ? (
        <img
          src={app.iconUrl}
          alt={`${app.name} logo`}
          className="h-10 w-10 rounded-md bg-white object-contain p-1 shadow-sm"
        />
      ) : (
        <span className={`h-10 w-10 rounded-md ${app.color} shadow-sm`} />
      )}
      <span className="text-xs font-medium">{app.name}</span>
    </>
  );

  const cls = 'flex flex-col items-center gap-2 rounded-md p-3 hover:bg-muted transition';

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
    <Link key={app.name} to={app.href} className={cls} onClick={onClose}>
      {inner}
    </Link>
  );
}

export function AppLauncher() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const ssoToken = isAuthenticated ? localStorage.getItem('krishub_sso') : null;

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
          className="absolute right-0 mt-2 w-72 rounded-lg border bg-popover shadow-lg ring-1 ring-black/5 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95"
          data-state="open"
        >
          <div className="p-3 space-y-3">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 px-1">
                  {group.label}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {group.apps.map((app) => (
                    <AppIcon key={app.name} app={app} onClose={() => setOpen(false)} ssoToken={ssoToken} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
