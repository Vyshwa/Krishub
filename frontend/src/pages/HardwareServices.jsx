import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logoImg from '@/assets/hardware.jpg';
import { Badge } from '@/components/ui/badge';
import { Laptop, Monitor, Mouse, HardDrive, Cpu, Zap, Wrench, Headphones } from 'lucide-react';

export function HardwareServices() {
  const hardwareCategories = [
    { icon: Laptop, title: 'Computers & Laptops', description: 'Wide range of desktops and laptops from leading brands, suitable for personal and business use.', badge: 'Popular' },
    { icon: Mouse, title: 'Peripherals', description: 'Quality speakers, mice, keyboards, and other accessories to enhance your computing experience.', badge: 'Essential' },
    { icon: HardDrive, title: 'Storage Solutions', description: 'SSDs, HDDs, and external storage devices for all your data storage needs.', badge: 'Performance' },
    { icon: Cpu, title: 'Components', description: 'RAM modules, processors, motherboards, and other internal components for upgrades and builds.', badge: 'Upgrade' },
    { icon: Zap, title: 'Power Supplies', description: 'Reliable SMPS and UPS systems to protect your equipment and ensure uninterrupted operation.', badge: 'Protection' },
    { icon: Monitor, title: 'Displays', description: 'Monitors and display solutions for various applications, from office work to gaming.', badge: 'Visual' },
  ];

  const services = [
    { icon: Wrench, title: 'Hardware Service & Repair', description: 'Expert repair and maintenance services for all types of computer hardware.' },
    { icon: Headphones, title: 'Technical Support', description: 'Dedicated support team to assist with installation, troubleshooting, and optimization.' },
  ];

  return (
    <div className="flex flex-col">
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Hardware <span className="text-primary">Services</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Quality hardware products with professional sales, service, and technical support.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container">
            <div className="max-w-4xl mx-auto">
            <img src={logoImg} alt="Hardware Collection" className="rounded-lg shadow-xl w-full" />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Our Hardware Offerings</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive range of computer hardware and accessories for all your technology needs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hardwareCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary">{category.badge}</Badge>
                    </div>
                    <CardTitle>{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {category.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Professional Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Beyond sales, we provide comprehensive support to keep your hardware running optimally.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="border-2">
                  <CardHeader>
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Why Choose Our Hardware Services?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Quality Products</h3>
                    <p className="text-muted-foreground">
                      We source hardware from trusted manufacturers and brands, ensuring reliability and performance.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Competitive Pricing</h3>
                    <p className="text-muted-foreground">
                      Fair and transparent pricing with excellent value for money on all our products.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Expert Guidance</h3>
                    <p className="text-muted-foreground">
                      Our knowledgeable team helps you choose the right hardware for your specific requirements.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">After-Sales Support</h3>
                    <p className="text-muted-foreground">
                      Comprehensive warranty support and ongoing technical assistance for all purchases.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Need Hardware Solutions?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Contact us to discuss your hardware requirements and get expert recommendations.
          </p>
          <a href="/contact">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/90 h-11 px-8">
              Get in Touch
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}
