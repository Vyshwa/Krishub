import { Contact } from '@/views/Contact';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with KrishTech Computers — email, phone, or visit our Coimbatore office. We\'re here to help with your IT needs.',
  alternates: { canonical: 'https://krishub.in/contact' },
  openGraph: {
    title: 'Contact Us — KrishTech Computers',
    description: 'Get in touch with our team. We\'re here to help with your IT needs.',
    url: 'https://krishub.in/contact',
    images: [{ url: '/favicon.png' }],
  },
};

export default function ContactPage() {
  return <Contact />;
}
