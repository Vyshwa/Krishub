import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import revealImg from '@/assets/Reveal.jpeg';
import renoteImg from '@/assets/renote.png';
import regenImg from '@/assets/regen.jpeg';
import resideLogo from '@/assets/Reside logo.jpg';

const apps = [
  { name: 'Reside', href: '/apps', iconUrl: resideLogo },
  { name: 'Reveal', href: '/apps', iconUrl: revealImg },
  { name: 'Renote', href: '/apps', iconUrl: renoteImg },
  { name: 'ReGen', href: '/apps', iconUrl: regenImg },
  { name: 'Request', href: '/apps', color: 'bg-orange-500' },
  { name: 'Realm', href: '/apps', color: 'bg-indigo-500' },
  { name: 'Reserve', href: '/apps', color: 'bg-rose-500' }
];

export function AppLauncher() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

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
          <div className="p-3">
            <div className="grid grid-cols-3 gap-3">
              {apps.map((app) => (
                <Link
                  key={app.name}
                  to={app.href}
                  className="flex flex-col items-center gap-2 rounded-md p-3 hover:bg-muted transition"
                  onClick={() => setOpen(false)}
                >
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
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
