import { RentPc } from '@/views/RentPc';

export const metadata = {
  title: 'Rent IT Equipment',
  description: 'Rent desktops, laptops, monitors, servers and printers from KrishTech — flexible daily, weekly, and monthly rental plans at competitive rates.',
  alternates: { canonical: 'https://krishub.in/rent' },
  openGraph: {
    title: 'Rent IT Equipment — KrishTech Computers',
    description: 'Desktops, laptops, monitors, servers and more — available for short-term and long-term rental.',
    url: 'https://krishub.in/rent',
    images: [{ url: '/favicon.png' }],
  },
};

export default function RentPage() {
  return <RentPc />;
}
