import { Hiring } from '@/views/Hiring';

export const metadata = {
  title: 'Careers — We\'re Hiring',
  description: 'Join KrishTech Computers — open positions in Software, Hardware, and Marketing. Freshers welcome. Apply now for Full Stack, Flutter, DevOps, and more.',
  alternates: { canonical: 'https://krishub.in/hiring' },
  openGraph: {
    title: 'Careers — KrishTech Computers',
    description: 'We\'re looking for talented individuals across Software, Hardware and Marketing.',
    url: 'https://krishub.in/hiring',
    images: [{ url: '/favicon.png' }],
  },
};

export default function HiringPage() {
  return <Hiring />;
}
