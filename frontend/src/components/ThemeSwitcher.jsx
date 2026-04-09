import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

const cycle = { light: 'dark', dark: 'system', system: 'light' };

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <button
      onClick={() => setTheme(cycle[theme] || 'light')}
      title={`Theme: ${theme}`}
      className="p-1.5 hover:opacity-70 transition-opacity"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

