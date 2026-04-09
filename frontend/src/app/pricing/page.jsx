'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Building2, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    name: 'Starter',
    icon: Zap,
    price: 'Free',
    period: '',
    description: 'Perfect for individuals and small projects getting started.',
    features: [
      'Basic hardware support',
      'Email support (48h response)',
      'Access to knowledge base',
      'Community forum access',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Business',
    icon: Building2,
    price: '₹9,999',
    period: '/month',
    description: 'Ideal for growing businesses needing reliable IT infrastructure.',
    features: [
      'Everything in Starter',
      'Priority hardware & software support',
      'Dedicated account manager',
      'On-site support (up to 4 visits/month)',
      'Renote Business license',
      'Network setup & maintenance',
      'Monthly health reports',
    ],
    cta: 'Contact Sales',
    popular: true,
  },
  {
    name: 'Enterprise',
    icon: Rocket,
    price: 'Custom',
    period: '',
    description: 'Tailored solutions for large organizations with complex needs.',
    features: [
      'Everything in Business',
      'Unlimited on-site support',
      'Custom software development',
      'Reveal RFID integration',
      '24/7 priority support',
      'SLA-backed uptime guarantee',
      'Dedicated infrastructure team',
      'Custom training programs',
    ],
    cta: 'Get a Quote',
    popular: false,
  },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Choose the plan that fits your business. All plans include our core IT support.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <plan.icon className="h-10 w-10 mx-auto text-primary mb-2" />
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => router.push('/contact')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 text-muted-foreground">
            <p>All prices are exclusive of GST. Annual billing available with 2 months free.</p>
            <p className="mt-1">Need a custom plan? <a href="/contact" className="text-primary hover:underline">Contact us</a></p>
          </div>
        </div>
      </section>
    </div>
  );
}
