import '../index.css';

export const metadata = {
  metadataBase: new URL('https://krishub.in'),
  title: {
    default: 'KrishTech Computers — Enterprise IT & Software Solutions',
    template: '%s | KrishTech Computers',
  },
  description:
    'KrishTech Computers offers enterprise IT solutions, custom software, hardware services, and cloud-ready tools for businesses in Coimbatore and beyond.',
  keywords: [
    'KrishTech',
    'IT solutions',
    'software development',
    'hardware services',
    'enterprise tools',
    'Renote',
    'ReGen',
    'Reveal',
    'cloud solutions',
    'Coimbatore',
    'AMC',
    'computer rental',
  ],
  authors: [{ name: 'KrishTech Computers' }],
  alternates: {
    canonical: 'https://krishub.in',
  },
  openGraph: {
    title: 'KrishTech Computers — Enterprise IT Solutions',
    description:
      'Your trusted partner for comprehensive IT hardware and software solutions. Custom enterprise tools, cloud-ready apps, and end-to-end technology services.',
    url: 'https://krishub.in',
    siteName: 'KrishTech Computers',
    images: [{ url: '/favicon.png' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'KrishTech Computers — Enterprise IT Solutions',
    description:
      'Your trusted partner for comprehensive IT hardware and software solutions.',
    images: ['/favicon.png'],
  },
  icons: {
    icon: '/favicon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

import { Providers } from './providers';
import { LayoutShell } from './layout-shell';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
