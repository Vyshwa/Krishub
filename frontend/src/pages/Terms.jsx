import { Separator } from '@/components/ui/separator';

const lastUpdated = '7 April 2026';

export function Terms() {
  return (
    <div className="flex flex-col">
      <section className="py-8 md:py-12 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Terms of <span className="text-primary">Service</span>
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
              <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the services provided by KrishTech Computers ("we", "our", "us"),
                including the website krishub.in and all associated applications (Renote, Reveal, ReGen),
                you accept and agree to be bound by these Terms of Service. If you do not agree, please
                do not use our services.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">2. Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                KrishTech Computers provides IT hardware sales and services, software solutions, and related
                technology consulting. Our software products include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li><strong>Renote</strong> — Business management software for billing, estimation, and poster design</li>
                <li><strong>Reveal</strong> — RFID-based inventory management solution</li>
                <li><strong>ReGen</strong> — Team collaboration and task management platform</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                When you create an account, you are responsible for maintaining the confidentiality of your
                credentials and for all activities under your account. You agree to provide accurate information
                and notify us immediately of any unauthorized use. We use a Single Sign-On (SSO) system across
                our applications — one account gives you access to all our services.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">4. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Use our services for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the integrity of our services</li>
                <li>Upload malicious code or content</li>
                <li>Resell or redistribute our services without authorization</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">5. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, software, trademarks, and materials on our website and applications are the
                property of KrishTech Computers or its licensors, protected by applicable intellectual
                property laws. You may not copy, modify, or distribute any part without prior written consent.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">6. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, KrishTech Computers shall not be liable for any
                indirect, incidental, special, or consequential damages arising from your use of our services.
                Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">7. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may suspend or terminate your access to our services at our discretion if you violate these
                terms. Upon termination, your right to use the services ceases immediately. You may request
                export of your data within 30 days of termination.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">8. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms are governed by and construed in accordance with the laws of India. Any disputes
                shall be subject to the exclusive jurisdiction of the courts in Coimbatore, Tamil Nadu.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">9. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Questions about these terms? Contact us at:
              </p>
              <div className="mt-3 text-muted-foreground space-y-1">
                <p>Email: <a href="mailto:info@krishub.in" className="text-primary hover:underline">info@krishub.in</a></p>
                <p>Phone: 9092024444</p>
                <p>Address: #55, Venkataswamy Road (West), R S Puram, Coimbatore, Tamilnadu, India - 641002</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
