import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

const lastUpdated = '7 April 2026';

export function Refund() {
  return (
    <div className="flex flex-col">
      <section className="py-8 md:py-12 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Refund <span className="text-primary">Policy</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container max-w-4xl mx-auto">

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <CardTitle className="text-lg">Eligible for Refund</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Defective hardware within warranty period</li>
                  <li>• Software subscription cancelled within 7 days</li>
                  <li>• Service not delivered as agreed</li>
                  <li>• Double or incorrect charges</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <XCircle className="h-6 w-6 text-red-500" />
                <CardTitle className="text-lg">Not Eligible</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Physical damage caused by user</li>
                  <li>• Software subscriptions after 7-day trial</li>
                  <li>• Custom development work already delivered</li>
                  <li>• On-site service visits already completed</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">

            <div>
              <h2 className="text-2xl font-bold mb-3">1. Hardware Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                Hardware products purchased from KrishTech Computers may be returned for a refund within 7 days
                of delivery, provided the product is in its original condition and packaging. Defective items
                covered under manufacturer warranty will be replaced or refunded as per the warranty terms.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">2. Software Subscription Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                For software subscriptions (Renote, Reveal, ReGen), you may request a full refund within 7 days
                of your initial purchase. After the 7-day period, subscriptions are non-refundable but may be
                cancelled at any time to prevent future charges. Unused portions of annual subscriptions are
                not refundable.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">3. Service Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                For IT support and consulting services, refunds are evaluated on a case-by-case basis.
                If the service was not delivered as agreed in the service contract, a partial or full refund
                may be issued. On-site visits that have been completed are non-refundable.
              </p>
            </div>

            <Separator />

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Processing Time</h3>
                <p className="text-sm text-muted-foreground">
                  Approved refunds are processed within 7-10 business days. The refund will be credited to your
                  original payment method. Bank processing times may vary.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold mb-3">4. How to Request a Refund</h2>
              <p className="text-muted-foreground leading-relaxed">
                To request a refund, please contact us with your order/invoice number and reason for the refund:
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
