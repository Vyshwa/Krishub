import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Code2,
  Cpu,
  Megaphone,
  Send,
  Phone,
  Mail,
  Users,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { useSubmitHiringApplication } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

const departments = [
  {
    name: 'Software',
    icon: Code2,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    positions: [
      'Full Stack Developer',
      'MERN Stack Developer',
      'Flutter Developer',
    ],
  },
  {
    name: 'Hardware',
    icon: Cpu,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    positions: [
      'Hardware Technician',
      'DevOps Engineer',
      'System Assembly',
      'Troubleshooting Specialist',
      'Server Setup Engineer',
    ],
  },
  {
    name: 'Marketing',
    icon: Megaphone,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    positions: [
      'Marketing Executive',
      'Telecalling Executive',
      'Digital Marketing Specialist',
    ],
  },
];

const allPositions = departments.flatMap((d) =>
  d.positions.map((p) => ({ label: p, department: d.name }))
);

export function Hiring() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    message: '',
  });
  const submitMutation = useSubmitHiringApplication();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.position) {
      toast.error('Please fill in your name, phone, and select a position');
      return;
    }
    try {
      await submitMutation.mutateAsync(formData);
      toast.success('Application submitted! We\'ll get back to you shortly.');
      setFormData({ name: '', email: '', phone: '', position: '', experience: '', message: '' });
    } catch {
      toast.error('Failed to submit application. Please try again.');
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
              <Users className="h-3.5 w-3.5 mr-1" /> We're Hiring
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Join Our <span className="text-primary">Team</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              We're looking for talented individuals across Software, Hardware and Marketing.
              Freshers are welcome — positions filled on a first-come, first-served basis.
            </p>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-8 md:py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Open Positions</h2>
            <p className="text-muted-foreground mt-2">Explore opportunities across our departments</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {departments.map((dept) => (
              <Card key={dept.name} className="border-2">
                <CardHeader className="text-center pb-3">
                  <div className={`h-14 w-14 rounded-xl ${dept.bg} flex items-center justify-center mx-auto mb-2`}>
                    <dept.icon className={`h-7 w-7 ${dept.color}`} />
                  </div>
                  <CardTitle className="text-xl">{dept.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {dept.positions.map((pos) => (
                      <li key={pos} className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span>{pos}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full mt-5"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, position: dept.positions[0] }));
                      document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Badge variant="outline" className="text-sm py-1.5 px-4">
              <GraduationCap className="h-3.5 w-3.5 mr-1.5" /> Freshers Welcome
            </Badge>
            <Badge variant="outline" className="text-sm py-1.5 px-4">
              First-come, first-served basis
            </Badge>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply-form" className="py-10 md:py-14 bg-muted/30">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Apply Now</h2>
                <p className="text-lg text-muted-foreground">
                  Submit your application and our HR team will reach out to you. 
                  Walk-in interviews are also available at our office.
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
                  <CardTitle>Why Work at KrisHub?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>• Hands-on experience with real projects</p>
                  <p>• Growth-oriented work culture</p>
                  <p>• Exposure to diverse tech stacks</p>
                  <p>• Competitive compensation</p>
                  <p>• Located in the heart of Coimbatore</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">Job Application</CardTitle>
                  <CardDescription>Fill out the form below to apply for a position.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
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
                        <Label htmlFor="position">Position *</Label>
                        <select
                          id="position"
                          name="position"
                          value={formData.position}
                          onChange={handleChange}
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select a position</option>
                          {departments.map((dept) => (
                            <optgroup key={dept.name} label={dept.name}>
                              {dept.positions.map((pos) => (
                                <option key={pos} value={pos}>{pos}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Experience</Label>
                        <select
                          id="experience"
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select experience</option>
                          <option value="Fresher">Fresher</option>
                          <option value="0-1 years">0–1 years</option>
                          <option value="1-3 years">1–3 years</option>
                          <option value="3-5 years">3–5 years</option>
                          <option value="5+ years">5+ years</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Cover Note / About Yourself</Label>
                      <Textarea id="message" name="message" placeholder="Tell us about your skills, projects, or why you'd like to join..." rows={4} value={formData.message} onChange={handleChange} />
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
                          Submit Application
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
