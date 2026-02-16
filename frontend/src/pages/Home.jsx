import { Link } from '@tanstack/react-router';
import heroImg from '@/assets/KrishTech Home.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Cpu, HardDrive, Shield, Zap } from 'lucide-react';

export function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-20 md:py-32">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Welcome to <span className="text-primary">KrishTech Computers</span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-2xl">
                Your trusted partner for comprehensive IT hardware and software solutions. 
                We deliver cutting-edge technology and exceptional service to power your business forward.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/software">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explore Software Solutions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </div>
              <div className="relative w-full h-[340px] sm:h-[420px] md:h-[500px] lg:h-[620px] xl:h-[720px] overflow-hidden rounded-xl shadow-2xl lg:self-start lg:justify-self-end">
              <img
                src={heroImg}
                alt="KrishTech Office"
                className="absolute inset-0 w-full h-full object-cover object-[right_top]"
                onError={(e) => {
                  e.currentTarget.src = '/assets/logo.png';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Why Choose KrishTech?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We combine expertise, innovation, and reliability to deliver exceptional IT solutions.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Advanced Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Latest hardware and cutting-edge software solutions tailored to your needs.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Trusted Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Reliable support and maintenance to keep your systems running smoothly.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Fast Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Quick deployment and responsive service to minimize downtime.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <HardDrive className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Complete Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  End-to-end IT services from hardware sales to software development.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive IT solutions designed to meet your business requirements.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src="/assets/Software Solutions.jpg" 
                  alt="Software Solutions" 
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Software Solutions</CardTitle>
                <CardDescription className="text-base">
                  Custom software designed to streamline your business operations and enhance productivity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/software">
                  <Button className="w-full">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src="/assets/hardware.jpg" 
                  alt="Hardware Services" 
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Hardware Services</CardTitle>
                <CardDescription className="text-base">
                  Quality hardware products with professional sales, service, and technical support.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/hardware">
                  <Button className="w-full">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to Transform Your IT Infrastructure?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Contact us today to discuss how we can help your business thrive with our technology solutions.
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary">
              Contact Us Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
