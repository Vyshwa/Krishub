import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, Award, TrendingUp } from 'lucide-react';

export function About() {
  return (
    <div className="flex flex-col">
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              About <span className="text-primary">KrishTech Computers</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Building trust through technology excellence and exceptional client service.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Who We Are</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  KrishTech Computers is a leading IT solutions provider specializing in both hardware and software services. 
                  With years of experience in the technology sector, we have established ourselves as a trusted partner for 
                  businesses seeking reliable and innovative IT solutions.
                </p>
                <p className="text-lg">
                  Our team of dedicated professionals combines technical expertise with a deep understanding of business needs 
                  to deliver solutions that drive growth and efficiency. We pride ourselves on our commitment to quality, 
                  customer satisfaction, and staying at the forefront of technological advancement.
                </p>
                <p className="text-lg">
                  From small businesses to large enterprises, we provide tailored solutions that meet the unique requirements 
                  of each client, ensuring they have the tools and support needed to succeed in today's digital landscape.
                </p>
              </div>
            </div>
            <div className="relative">
              <img src="/assets/generated/office-building.dim_600x400.jpg" alt="KrishTech Office" className="rounded-lg shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Our Mission & Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Guided by our commitment to excellence and client success.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">To empower businesses with cutting-edge technology solutions that drive innovation and growth.</p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Client Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Building lasting relationships through exceptional service and unwavering commitment to client success.</p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Quality Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Delivering superior products and services that exceed expectations and industry standards.</p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Staying ahead of technology trends to provide forward-thinking solutions for modern challenges.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Technology Meets Trust</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground text-lg">
                <p>
                  At KrishTech Computers, we understand that technology is only as valuable as the trust it's built upon. 
                  That's why we focus not just on delivering state-of-the-art solutions, but on building relationships 
                  that stand the test of time.
                </p>
                <p>
                  Our approach combines technical excellence with transparent communication, reliable support, and a 
                  genuine commitment to understanding and meeting your business objectives. Whether you're looking for 
                  hardware solutions, custom software development, or ongoing IT support, we're here to be your trusted 
                  technology partner.
                </p>
                <p>
                  We believe in empowering our clients with the knowledge and tools they need to make informed decisions 
                  about their IT infrastructure. Our team is always ready to provide guidance, answer questions, and 
                  ensure you get the maximum value from your technology investments.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
