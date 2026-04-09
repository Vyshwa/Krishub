import { Suspense } from 'react';
import { HomeContent } from '@/views/Home';

export const metadata = {
  alternates: { canonical: 'https://krishub.in' },
};

export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">KrishTech Computers — Enterprise IT &amp; Software Solutions</h1>

      {/* SEO-visible content for crawlers — visually hidden, rendered server-side */}
      <div className="sr-only" role="region" aria-label="About KrishTech Computers">
        <p>
          KrishTech Computers is a Coimbatore-based enterprise IT solutions provider offering a
          complete range of hardware services, custom software development, cloud-ready business
          tools, and professional technology consulting. We serve startups, small and medium
          enterprises, and large organizations across India with reliable, scalable, and
          cost-effective technology solutions.
        </p>
        <h2>Software Solutions</h2>
        <p>
          Our software division builds custom enterprise applications designed to streamline your
          business operations and boost productivity. From inventory management systems and billing
          platforms to customer relationship management tools, our development team creates tailored
          solutions that align with your specific workflows. We specialize in web application
          development, mobile app development, API integration, and cloud migration services. Our
          flagship products include Renote, a powerful invoicing and business management platform,
          ReGen, an intelligent document generation engine, and Reveal, an advanced analytics and
          reporting dashboard for data-driven decision-making.
        </p>
        <h2>Hardware Services</h2>
        <p>
          KrishTech provides comprehensive hardware solutions including desktop and laptop sales,
          server procurement and installation, networking equipment setup, printer and peripheral
          support, and complete IT infrastructure deployment. We partner with leading hardware
          manufacturers to deliver enterprise-grade equipment at competitive prices. Our technicians
          handle everything from initial setup and configuration to ongoing maintenance and repair,
          ensuring your systems operate at peak performance with minimal downtime.
        </p>
        <h2>Annual Maintenance Contracts and Warranty Services</h2>
        <p>
          Protect your IT investments with our flexible Annual Maintenance Contract plans. Our AMC
          packages cover preventive maintenance, on-site repairs, remote troubleshooting, hardware
          replacement, and priority technical support. We offer tiered service levels to match your
          budget and operational requirements, with guaranteed response times and dedicated support
          engineers assigned to your account.
        </p>
        <h2>PC Rental and Leasing</h2>
        <p>
          Need temporary computing resources for a project, event, or seasonal demand? Our PC rental
          service provides high-performance desktops, laptops, workstations, and servers on flexible
          short-term and long-term lease agreements. All rental equipment is professionally
          configured, tested, and delivered with on-site setup support. We handle logistics,
          installation, and pickup so you can focus on your core business activities.
        </p>
        <h2>Why Choose KrishTech Computers</h2>
        <p>
          With years of experience serving businesses in Coimbatore and across Tamil Nadu, KrishTech
          Computers has built a reputation for delivering fast, dependable IT solutions. Our team
          combines deep technical expertise with a customer-first approach, offering personalized
          service and proactive support. We provide end-to-end technology partnerships, meaning you
          get a single trusted vendor for hardware procurement, software development, cloud services,
          networking, security, and ongoing maintenance. Our competitive pricing, quality assurance
          processes, and commitment to client satisfaction set us apart from other IT service
          providers in the region.
        </p>
        <h2>Contact Us</h2>
        <p>
          Ready to upgrade your IT infrastructure or build custom software for your business? Get in
          touch with KrishTech Computers today. We offer free consultations to assess your technology
          needs and recommend the right solutions for your budget and goals. Whether you need a
          single laptop, a full office network, a custom ERP system, or a managed IT support plan,
          our team is here to help you succeed.
        </p>
      </div>

      <Suspense fallback={null}><HomeContent /></Suspense>
    </>
  );
}
