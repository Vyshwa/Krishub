import { Link, useSearch } from '@tanstack/react-router';
import heroImg from '@/assets/KrishTech Home.png';
import softwareImg from '@/assets/Software Solutions.png';
import hardwareImg from '@/assets/hardware.jpg';
import logoImg from '@/assets/TopDown.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Cpu, HardDrive, Shield, Zap } from 'lucide-react';
import { Apps } from './Apps';
import { useCurrentUser } from '@/hooks/useAuth';

export function Home() {
  const { data: user, isLoading } = useCurrentUser();
  const search = useSearch({ strict: false });
  const isMarketingView = search.view === 'marketing';

  if (isLoading) return null;
  if (user && !isMarketingView) {
    return <Apps />;
  }

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
                src={logoImg}
                alt="KrishTech"
                className="absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl -ml-36 -mt-36" />
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Why Choose <span className="text-primary">KrishTech?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We combine hardware excellence with software innovation to deliver exceptional end-to-end IT solutions.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-background/60 backdrop-blur-sm border-primary/10 hover:border-primary/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <CardHeader>
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
                  <Cpu className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Advanced Tech</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg leading-relaxed">
                  Latest hardware and cutting-edge software solutions tailored to your business needs and future growth.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-primary/10 hover:border-primary/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <CardHeader>
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Trusted Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg leading-relaxed">
                  Reliable technical support and proactive maintenance to keep your critical systems running smoothly 24/7.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-primary/10 hover:border-primary/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <CardHeader>
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Fast Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg leading-relaxed">
                  Agile deployment and responsive delivery pipelines to minimize your downtime and maximize efficiency.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-primary/10 hover:border-primary/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <CardHeader>
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
                  <HardDrive className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Full Stack IT</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg leading-relaxed">
                  From custom enterprise software to specialized hardware procurement, we are your one-stop IT shop.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
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
                  src={softwareImg}
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
                  src={hardwareImg}
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

      <section className="py-8 md:py-12 bg-primary text-primary-foreground">
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

