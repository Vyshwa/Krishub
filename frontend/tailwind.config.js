import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                shimmer: {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' }
                },
                'aurora-1': {
                    '0%, 100%': { transform: 'translate(0%, 0%)', opacity: '0.4' },
                    '25%': { transform: 'translate(-15%, 10%)', opacity: '0.7' },
                    '50%': { transform: 'translate(10%, -10%)', opacity: '0.5' },
                    '75%': { transform: 'translate(-10%, 5%)', opacity: '0.8' }
                },
                'aurora-2': {
                    '0%, 100%': { transform: 'translate(0%, 0%)', opacity: '0.3' },
                    '33%': { transform: 'translate(12%, -12%)', opacity: '0.6' },
                    '66%': { transform: 'translate(-8%, 10%)', opacity: '0.45' }
                },
                'aurora-3': {
                    '0%, 100%': { transform: 'translate(10%, -10%)', opacity: '0.35' },
                    '40%': { transform: 'translate(-15%, 15%)', opacity: '0.7' },
                    '80%': { transform: 'translate(5%, -5%)', opacity: '0.5' }
                },
                'border-sweep': {
                    '0%': { transform: 'translateX(-100%)', opacity: '0' },
                    '50%': { opacity: '1' },
                    '100%': { transform: 'translateX(100%)', opacity: '0' }
                },
                'border-sweep-reverse': {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '50%': { opacity: '1' },
                    '100%': { transform: 'translateX(-100%)', opacity: '0' }
                },
                float: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(30px, -30px) scale(1.05)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.95)' }
                },
                'float-delayed': {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(-25px, 25px) scale(1.08)' },
                    '66%': { transform: 'translate(15px, -15px) scale(0.92)' }
                },
                'float-slow': {
                    '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.5' },
                    '50%': { transform: 'translate(-50%, -50%) scale(1.15)', opacity: '0.8' }
                },
                heartbeat: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '14%': { transform: 'scale(1.3)' },
                    '28%': { transform: 'scale(1)' },
                    '42%': { transform: 'scale(1.3)' },
                    '70%': { transform: 'scale(1)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                shimmer: 'shimmer 4s ease-in-out infinite',
                'aurora-1': 'aurora-1 6s ease-in-out infinite',
                'aurora-2': 'aurora-2 8s ease-in-out infinite',
                'aurora-3': 'aurora-3 10s ease-in-out infinite',
                'border-sweep': 'border-sweep 3s ease-in-out infinite',
                'border-sweep-reverse': 'border-sweep-reverse 3.5s ease-in-out infinite',
                float: 'float 8s ease-in-out infinite',
                'float-delayed': 'float-delayed 10s ease-in-out infinite',
                'float-slow': 'float-slow 12s ease-in-out infinite',
                heartbeat: 'heartbeat 1.5s ease-in-out infinite'
            }
        }
    },
    plugins: [typography, containerQueries, animate]
};
