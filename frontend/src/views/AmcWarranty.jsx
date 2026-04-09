'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  Shield,
  Wrench,
  CalendarCheck,
  Bug,
  Wifi,
  Monitor,
  Phone,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  ServerCog,
  Building2,
} from 'lucide-react';
import { useSubmitAmcEnquiry } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

const plans = [
  {
    name: 'Basic',
    icon: Shield,
    price: '₹2,599',
    gst: '+ GST',
    period: '/year per system',
    radius: 'Within 5 km radius',
    description: 'Essential annual maintenance for nearby businesses and homes.',
    features: [
      'Quarterly Preventive Maintenance (4 visits/year)',
      'Hardware & Software Troubleshooting',
      'Virus & Malware Protection',
      'On-site Support',
      'Regular Service Reports',
    ],
    popular: false,
  },
  {
    name: 'Standard',
    icon: ShieldCheck,
    price: '₹4,999',
    gst: '+ GST',
    period: '/year per system',
    radius: 'Within 15 km radius',
    description: 'Comprehensive AMC for growing businesses with extended coverage.',
    features: [
      'Everything in Basic',
      'Preventive & Breakdown Maintenance',
      'Network & Internet Support',
      'Remote Support (priority)',
      'Monthly Health Reports',
      'Dedicated Technician Assignment',
    ],
    popular: true,
  },
  {
    name: 'Premium',
    icon: ServerCog,
    price: '₹7,999',
    gst: '+ GST',
    period: '/year per system',
    radius: 'Citywide Coverage',
    description: 'Full-spectrum IT maintenance for enterprises requiring maximum uptime.',
    features: [
      'Everything in Standard',
      'Unlimited Breakdown Visits',
      'Server & Network Infrastructure Support',
      'Data Backup & Recovery Assistance',
      'Priority Response (within 4 hours)',
      '24/7 Remote Support',
      'Quarterly IT Health Audit',
    ],
    popular: false,
  },
];

const highlights = [
  { icon: CalendarCheck, title: 'Quarterly Preventive Maintenance', desc: '4 scheduled visits per year to keep your systems healthy' },
  { icon: Wrench, title: 'Preventive & Breakdown Maintenance', desc: 'Both proactive care and reactive repairs covered' },
  { icon: Monitor, title: 'Hardware & Software Troubleshooting', desc: 'Expert diagnosis and resolution for all issues' },
  { icon: Bug, title: 'Virus & Malware Protection', desc: 'Keep your systems secure from digital threats' },
  { icon: Wifi, title: 'Network & Internet Support', desc: 'Connectivity setup, maintenance and troubleshooting' },
  { icon: Shield, title: 'On-site & Remote Support', desc: 'Flexible support options — we come to you or help remotely' },
];

export function AmcWarranty() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    plan: '',
    systems: '1',
    message: '',
  });
  const submitMutation = useSubmitAmcEnquiry();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.plan) {
      toast.error('Please fill in your name, phone, and select a plan');
      return;
    }
    try {
      await submitMutation.mutateAsync(formData);
      toast.success('Thank you! Your AMC enquiry has been submitted. We\'ll contact you shortly.');
      setFormData({ name: '', email: '', phone: '', plan: '', systems: '1', message: '' });
    } catch {
      toast.error('Failed to submit enquiry. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col">
      <Toaster />

      {/* Hero */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="text-sm px-4 py-1">
              Annual Maintenance Contract
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              AMC <span className="text-primary">Warranty</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Keep your systems running at peak performance with our Annual Maintenance Contracts.
              Starting at just <span className="font-semibold text-primary">₹2,599 + GST</span> per year.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-8 md:py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Choose Your AMC Plan</h2>
            <p className="text-muted-foreground mt-2">All plans include 1-year warranty with scheduled visits</p>
          </div>
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
                    <span className="text-sm text-muted-foreground ml-1">{plan.gst}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.period}</p>
                  <Badge variant="outline" className="mt-2 mx-auto">
                    <MapPin className="h-3 w-3 mr-1" />
                    {plan.radius}
                  </Badge>
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
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, plan: plan.name }));
                      document.getElementById('amc-enquiry')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Enquire Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center mt-6 text-sm text-muted-foreground">
            All prices are exclusive of GST. Bulk / corporate discounts available.
          </p>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-8 md:py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight">What's Included</h2>
            <p className="text-muted-foreground mt-2">Every AMC plan comes loaded with essential IT maintenance services</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {highlights.map((item) => (
              <Card key={item.title} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section id="amc-enquiry" className="py-10 md:py-14">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Get AMC for Your Systems</h2>
                <p className="text-lg text-muted-foreground">
                  Fill in your details and our team will get in touch with a tailored AMC quote 
                  based on your requirements.
                </p>
              </div>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Call Us</h3>
                      <div className="text-muted-foreground space-y-1">
                        <p>+91 909 202 4443</p>
                        <p>+91 909 202 4444</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground">info@krishub.in</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50 border-2">
                <CardHeader>
                  <CardTitle>Why Choose KrisHub AMC?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Certified technicians with years of experience</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Transparent pricing with no hidden charges</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Same-day response for breakdown calls</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Serving Coimbatore businesses since day one</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">AMC Enquiry</CardTitle>
                  <CardDescription>Fill out the form below and we'll reach out with a detailed quote.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form action="#" onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" name="name" placeholder="Your full name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} required />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="plan">Preferred Plan *</Label>
                        <select
                          id="plan"
                          name="plan"
                          value={formData.plan}
                          onChange={handleChange}
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select a plan</option>
                          <option value="Basic">Basic — ₹2,599 + GST</option>
                          <option value="Standard">Standard — ₹4,999 + GST</option>
                          <option value="Premium">Premium — ₹7,999 + GST</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="systems">No. of Systems</Label>
                        <Input id="systems" name="systems" type="number" min="1" placeholder="1" value={formData.systems} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Requirements</Label>
                      <Textarea id="message" name="message" placeholder="Tell us about your systems, location, any special requirements..." rows={4} value={formData.message} onChange={handleChange} />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={submitMutation.isPending}>
                      {submitMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Enquiry
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
