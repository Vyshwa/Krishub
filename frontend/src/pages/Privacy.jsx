import { Separator } from '@/components/ui/separator';

const lastUpdated = '7 April 2026';

export function Privacy() {
  return (
    <div className="flex flex-col">
      <section className="py-8 md:py-12 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container max-w-4xl mx-auto">
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">

            <div>
              <h2 className="text-2xl font-bold mb-3">1. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                KrishTech Computers ("we", "our", "us") collects information you provide when using our website and services, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Name, email address, and phone number when you submit our contact form</li>
                <li>Account information when you register for our services (Renote, Reveal, ReGen)</li>
                <li>Usage data through cookies and analytics to improve our services</li>
                <li>Technical data such as IP address, browser type, and device information</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>To provide, maintain, and improve our services</li>
                <li>To respond to your inquiries and support requests</li>
                <li>To send service-related notifications and updates</li>
                <li>To ensure security and prevent fraud</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">3. Data Storage & Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal data.
                Your data is stored securely on our servers located in India. We use encryption for data in
                transit and at rest, and restrict access to authorized personnel only.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">4. Data Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share
                data with trusted service providers who assist in operating our website and services,
                subject to strict confidentiality obligations. We may disclose information when required by law.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">5. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use essential cookies for authentication (including Single Sign-On across our applications)
                and optional analytics cookies to understand how our services are used. You can manage cookie
                preferences through your browser settings.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Access, update, or delete your personal information</li>
                <li>Withdraw consent for data processing</li>
                <li>Request a copy of your data in a portable format</li>
                <li>Lodge a complaint with the relevant data protection authority</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">7. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For privacy-related questions or to exercise your rights, contact us at:
              </p>
              <div className="mt-3 text-muted-foreground space-y-1">
                <p>Email: <a href="mailto:info@krishub.in" className="text-primary hover:underline">info@krishub.in</a></p>
                <p>Phone: +91 909 202 4443, +91 909 202 4444</p>
                <p>Address: #55, Venkataswamy Road (West), R S Puram, Coimbatore, Tamilnadu, India - 641002</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
