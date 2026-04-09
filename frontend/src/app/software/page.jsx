import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, BarChart3, FileText, Scan, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Software Solutions',
  description: 'Innovative software solutions by KrishTech — Reveal RFID, Reside housing platform, ReGen task management, and Renote business management tools.',
  alternates: { canonical: 'https://krishub.in/software' },
  openGraph: {
    title: 'Software Solutions — KrishTech Computers',
    description: 'Innovative software designed to streamline operations and drive business growth.',
    url: 'https://krishub.in/software',
    images: [{ url: '/favicon.png' }],
  },
};

export default function SoftwareSolutionsPage() {
  return (
    <div className="flex flex-col">
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Software <span className="text-primary">Solutions</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Innovative software designed to streamline operations and drive business growth.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid gap-12 lg:gap-16">
            <Card className="overflow-hidden border-2 hover:border-primary transition-colors">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative aspect-video lg:aspect-auto">
                  <img
                    src="/assets/Reveal.jpeg"
                    alt="Reveal RFID Software"
                    loading="lazy"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div>
                      <Badge className="mb-4">RFID Technology</Badge>
                      <h2 className="text-3xl font-bold tracking-tight mb-4">Reveal</h2>
                      <p className="text-lg text-muted-foreground mb-6">
                        Advanced RFID-based inventory management solution designed for import/export businesses 
                        requiring real-time visibility and tracking capabilities.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Key Features</h3>
                      <div className="grid gap-4">
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Scan className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">RFID Scanning</h4>
                            <p className="text-sm text-muted-foreground">
                              Scan sealed boxes and containers without opening, ensuring security and efficiency.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <BarChart3 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Real-Time Data</h4>
                            <p className="text-sm text-muted-foreground">
                              Instant visibility into inventory levels, locations, and movement across your supply chain.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Import/Export Tracking</h4>
                            <p className="text-sm text-muted-foreground">
                              Comprehensive tracking for international shipments with customs and compliance support.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground italic">
                        Perfect for logistics companies, warehouses, and businesses managing complex supply chains.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-2 hover:border-primary transition-colors">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative aspect-video lg:aspect-auto order-2 lg:order-1">
                  <img
                    src="/assets/Reside logo.jpg"
                    alt="Reside Housing Platform"
                    loading="lazy"
                    className="object-cover object-center w-full h-full"
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center order-1 lg:order-2">
                  <div className="space-y-6">
                    <div>
                      <Badge className="mb-4">Housing Platform</Badge>
                      <h2 className="text-3xl font-bold tracking-tight mb-4">Reside</h2>
                      <p className="text-lg text-muted-foreground mb-6">
                        A modern housing platform that connects owners and tenants with clear interfaces,
                        automated rent calculations, and accurate payment records.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Key Features</h3>
                      <div className="grid gap-4">
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Owner & Tenant Link</h4>
                            <p className="text-sm text-muted-foreground">
                              Interfaces for owners and tenants to view units, leases, dues, and updates.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Auto Payments & Records</h4>
                            <p className="text-sm text-muted-foreground">
                              Automatic rent calculations with on-time tracking and auditable payment history.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground italic">
                        Ideal for apartment owners, rental agencies, and housing communities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-2 hover:border-primary transition-colors">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative aspect-video lg:aspect-auto">
                  <img
                    src="/assets/regen.jpeg"
                    alt="ReGen Task & Scrum"
                    loading="lazy"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div>
                      <Badge className="mb-4">Team Management</Badge>
                      <h2 className="text-3xl font-bold tracking-tight mb-4">ReGen</h2>
                      <p className="text-lg text-muted-foreground mb-6">
                        Owner and admin staff oriented application for managing tasks, schedules, and scrum ceremonies to keep teams aligned and productive.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Key Features</h3>
                      <div className="grid gap-4">
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Owner & Admin Focus</h4>
                            <p className="text-sm text-muted-foreground">
                              Roles and permissions tailored for owners and administrative staff to manage access and oversight.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Task & Scrum Maintenance</h4>
                            <p className="text-sm text-muted-foreground">
                              Create schedules, manage sprints and scrums, and keep track of progress with structured workflows.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Reporting & Insights</h4>
                            <p className="text-sm text-muted-foreground">
                              Analytics and reporting to help owners track team performance and sprint outcomes.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground italic">
                        Built for teams that need clear scheduling, transparent scrums, and actionable task management.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-2 hover:border-primary transition-colors">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative aspect-video lg:aspect-auto order-2 lg:order-1">
                  <img
                    src="/assets/renote.png"
                    alt="Renote Business Management"
                    loading="lazy"
                    className="object-cover object-center w-full h-full"
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center order-1 lg:order-2">
                  <div className="space-y-6">
                    <div>
                      <Badge className="mb-4">Business Management</Badge>
                      <h2 className="text-3xl font-bold tracking-tight mb-4">Renote</h2>
                      <p className="text-lg text-muted-foreground mb-6">
                        Comprehensive business management software tailored for individuals and SMEs, 
                        combining design tools with financial management capabilities.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Key Features</h3>
                      <div className="grid gap-4">
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Poster Design</h4>
                            <p className="text-sm text-muted-foreground">
                              Built-in design tools for creating professional marketing materials and posters.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Estimation & Quotes</h4>
                            <p className="text-sm text-muted-foreground">
                              Generate accurate estimates and professional quotes quickly and efficiently.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Billing & Invoicing</h4>
                            <p className="text-sm text-muted-foreground">
                              Streamlined billing system with automated invoicing and payment tracking.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground italic">
                        Ideal for freelancers, small businesses, and growing enterprises seeking an all-in-one solution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg text-muted-foreground">
              Contact us to learn more about how our software solutions can streamline your operations 
              and drive growth for your business.
            </p>
            <div className="pt-4">
              <Link href="/contact">
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8">
                  Get in Touch
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
