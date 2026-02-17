import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  const display = theme === 'light' ? '🌞' : theme === 'dark' ? '🌙' : 'Theme';

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Theme"
      >
        {display}
      </Button>
      {open && (
        <div
          role="menu"
          className="absolute mt-2 w-40 rounded-md border bg-popover text-popover-foreground shadow-md focus:outline-none z-50"
        >
          <button
            role="menuitem"
            className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setTheme('light');
              setOpen(false);
            }}
          >
            Light
          </button>
          <button
            role="menuitem"
            className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setTheme('dark');
              setOpen(false);
            }}
          >
            Dark
          </button>
          <button
            role="menuitem"
            className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setTheme('system');
              setOpen(false);
            }}
          >
            System
          </button>
        </div>
      )}
    </div>
  );
}

