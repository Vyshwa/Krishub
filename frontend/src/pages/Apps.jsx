import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useAuth';

export function Apps() {
  const { data: user } = useCurrentUser();
  if (!user) {
    return (
      <div className="container py-16">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-2">Please login to access apps</h2>
          <p className="text-muted-foreground mb-6">Sign in to access all KrishHub applications under your account.</p>
          <div className="flex justify-center gap-4">
            <Link to="/login"><Button>Login</Button></Link>
            <Link to="/register"><Button variant="outline">Register</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <h1 className="text-3xl font-bold mb-8">Apps</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🏠 Reside</CardTitle>
            <CardDescription>Property & Rental Management Application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Reside is a smart property and rental management platform designed to simplify real estate operations.
              It helps property owners and managers efficiently handle property listings, tenant records, rent tracking,
              and maintenance management — all in one place.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Key Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Property listing & management</li>
                <li>Tenant record management</li>
                <li>Rent tracking & payment history</li>
                <li>Maintenance request handling</li>
                <li>Rental analytics & reports</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🎨 Renote</CardTitle>
            <CardDescription>Business Design & Estimation Platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Renote is an all-in-one business application that allows users to design posters, create professional invoices,
              and generate accurate estimations for their services or products.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Key Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Poster and promotional design</li>
                <li>Invoice generation</li>
                <li>Estimation creation</li>
                <li>Customer management</li>
                <li>Business record tracking</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">👥 ReGen</CardTitle>
            <CardDescription>Staff & Workforce Management System</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              ReGen is a complete employee management solution that helps organizations manage attendance, tasks, payroll,
              and workforce performance efficiently.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Key Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Attendance tracking</li>
                <li>Task assignment & monitoring</li>
                <li>Salary management</li>
                <li>Employee performance tracking</li>
                <li>HR reporting</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">📦 Reveal</CardTitle>
            <CardDescription>RFID-Based Stock Verification System</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Reveal is an advanced stock verification application integrated with RFID technology. It scans sealed boxes using
              RFID devices and displays scanned data in the software to verify stock during import and export operations.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Key Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>RFID scanning integration</li>
                <li>Real-time stock verification</li>
                <li>Import/export tracking</li>
                <li>Inventory validation</li>
                <li>Data logging & reporting</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
