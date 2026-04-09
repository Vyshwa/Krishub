'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Monitor,
  Laptop,
  Server,
  Tv,
  Printer,
  Send,
  Phone,
  Mail,
  Check,
  Clock,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';
import { useSubmitRentalEnquiry } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

const categories = [
  { value: 'Desktop', label: 'Desktop', icon: Monitor, desc: 'Full desktop setups for offices & events' },
  { value: 'Laptop', label: 'Laptop', icon: Laptop, desc: 'Business & performance laptops' },
  { value: 'Monitor', label: 'Monitor', icon: Tv, desc: 'HD & 4K monitors for productivity' },
  { value: 'Server', label: 'Server', icon: Server, desc: 'Rack & tower servers for infrastructure' },
  { value: 'Printer', label: 'Printer', icon: Printer, desc: 'Laser & inkjet printers' },
  { value: 'Other', label: 'Other', icon: Monitor, desc: 'Networking gear, peripherals & more' },
];

const benefits = [
  { icon: IndianRupee, title: 'Cost-Effective', desc: 'Save capital — pay only for what you use' },
  { icon: Clock, title: 'Flexible Duration', desc: 'Daily, weekly, monthly or long-term rentals' },
  { icon: ShieldCheck, title: 'Maintained & Ready', desc: 'All equipment serviced and ready to deploy' },
  { icon: Server, title: 'Scalable', desc: 'Scale up or down as your needs change' },
];

export function RentPc() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    quantity: '1',
    duration: '',
    message: '',
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const submitMutation = useSubmitRentalEnquiry();

  const handleCategoryClick = (value) => {
    setSelectedCategory(value);
    setFormData((prev) => ({ ...prev, category: value }));
    document.getElementById('rental-enquiry')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.category) {
      toast.error('Please fill in your name, phone, and select an equipment category');
      return;
    }
    try {
      await submitMutation.mutateAsync(formData);
      toast.success('Enquiry submitted! We\'ll get back to you with availability and pricing.');
      setFormData({ name: '', email: '', phone: '', category: '', quantity: '1', duration: '', message: '' });
      setSelectedCategory('');
    } catch {
      toast.error('Failed to submit enquiry. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'category') setSelectedCategory(e.target.value);
  };

  return (
    <div className="flex flex-col">
      <Toaster />

      {/* Hero */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="text-sm px-4 py-1">
              Equipment Rental
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Rent <span className="text-primary">IT Equipment</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Desktops, laptops, monitors, servers and more — available for short-term and long-term rental
              at competitive rates.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 md:py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Choose Equipment</h2>
            <p className="text-muted-foreground mt-2">Select a category to get started with your rental enquiry</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {categories.map((cat) => (
              <Card
                key={cat.value}
                className={`border-2 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md ${
                  selectedCategory === cat.value ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''
                }`}
                onClick={() => handleCategoryClick(cat.value)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <cat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{cat.label}</h3>
                      <p className="text-sm text-muted-foreground">{cat.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {benefits.map((item) => (
              <div key={item.title} className="text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section id="rental-enquiry" className="py-10 md:py-14">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Rental Enquiry</h2>
                <p className="text-lg text-muted-foreground">
                  Tell us what you need and we'll prepare a customised rental quote — 
                  whether for a single laptop or an entire office setup.
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
                  <CardTitle>Why Rent from KrisHub?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Well-maintained, performance-tested equipment</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Free setup and installation support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Replacement guarantee during rental period</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Bulk discounts for corporate & event bookings</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">Get a Quote</CardTitle>
                  <CardDescription>Fill out the form and we'll send you pricing and availability.</CardDescription>
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
                        <Label htmlFor="category">Equipment Category *</Label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" name="quantity" type="number" min="1" placeholder="1" value={formData.quantity} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Rental Duration</Label>
                      <select
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select duration</option>
                        <option value="1-3 days">1–3 days</option>
                        <option value="1 week">1 week</option>
                        <option value="1 month">1 month</option>
                        <option value="3 months">3 months</option>
                        <option value="6 months">6 months</option>
                        <option value="1 year">1 year</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Requirements</Label>
                      <Textarea id="message" name="message" placeholder="Specs, software needs, delivery location, etc." rows={4} value={formData.message} onChange={handleChange} />
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
