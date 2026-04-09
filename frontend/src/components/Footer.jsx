import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">KrishTech</h2>
            <p className="text-sm text-muted-foreground">
              Your trusted partner for comprehensive IT hardware and software solutions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/software" className="hover:text-primary transition-colors">Software Solutions</Link></li>
              <li><Link href="/hardware" className="hover:text-primary transition-colors">Hardware Services</Link></li>
              <li><Link href="/hiring" className="hover:text-primary transition-colors">Hiring</Link></li>
              <li><Link href="/amc" className="hover:text-primary transition-colors">AMC Warranty</Link></li>
              <li><Link href="/rent" className="hover:text-primary transition-colors">Rent PC</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>info@krishub.in</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span>+91 909 202 4443</span>
                  <span>+91 909 202 4444</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>#55, Venkataswamy Road (West), R S Puram, Coimbatore, Tamilnadu, India - 641002</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            Made with <span className="inline-block animate-heartbeat text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]">❤️</span> by KrisHub
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/refund" className="hover:text-primary transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
