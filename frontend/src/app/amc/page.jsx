import { AmcWarranty } from '@/views/AmcWarranty';

export const metadata = {
  title: 'AMC Warranty',
  description: 'Annual Maintenance Contracts by KrishTech — Basic ₹2,599, Standard ₹4,999, Premium ₹7,999 per year. Preventive maintenance, breakdown support, and remote assistance.',
  alternates: { canonical: 'https://krishub.in/amc' },
  openGraph: {
    title: 'AMC Warranty — KrishTech Computers',
    description: 'Keep your systems running at peak performance with our Annual Maintenance Contracts.',
    url: 'https://krishub.in/amc',
    images: [{ url: '/favicon.png' }],
  },
};

export default function AmcPage() {
  return <AmcWarranty />;
}
