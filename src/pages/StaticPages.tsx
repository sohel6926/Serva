import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from '../lib/router.tsx';

function StaticShell({
  title,
  subtitle,
  sections,
}: {
  title: string;
  subtitle: string;
  sections: Array<{ heading: string; body: string }>;
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="serva-card p-6 sm:p-8 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F5C]">{title}</h1>
        <p className="text-sm text-[#5B6B8C]">{subtitle}</p>
      </div>
      <div className="serva-card p-6 sm:p-8 space-y-6">
        {sections.map((s) => (
          <section key={s.heading} className="space-y-1.5">
            <h2 className="text-lg font-bold text-[#0A1F5C]">{s.heading}</h2>
            <p className="text-sm text-[#5B6B8C] leading-relaxed">{s.body}</p>
          </section>
        ))}
        <div className="pt-4 border-t border-[#EAF2FF]">
          <Link to="/services" className="serva-pill-btn text-sm">
            <span>Explore SERVA Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <StaticShell
      title="About SERVA: Multiple Services Provider"
      subtitle="All Your Needs, One Platform — Connecting households, farms, builders, and event hosts with verified specialists."
      sections={[
        {
          heading: 'Five Core Service Pillars',
          body: 'SERVA unifies Home Services, Contractors, Events, Agriculture, and Moving and Shifting into one transparent booking workflow.',
        },
        {
          heading: 'Verified Partners & Fair Quotations',
          body: 'Only identity-verified technicians, cooks, painters, contractors, event vendors, machinery owners, and moving crews can accept requests. Every estimate clearly states Estimated or Confirmed, and revised quotes require customer approval.',
        },
      ]}
    />
  );
}

export function TermsPage() {
  return (
    <StaticShell
      title="Terms of Service"
      subtitle="Clear service rules governing bookings, quotes, and payments on SERVA."
      sections={[
        {
          heading: 'Estimated vs Confirmed Pricing',
          body: 'Upfront prices before inspection or vendor acceptance are labelled Estimated. Scope modifications automatically generate a revised quotation requiring explicit customer approval before work continues.',
        },
        {
          heading: 'Category-Specific Policies',
          body: 'Home Cooking and Wall Painting require online payment only. Moving and Shifting provides skilled crews and packing support only—SERVA provides no vehicles or vehicle charges. Events require advance payment before a confirmed booking ID is issued. Home Construction is a free contractor promotion enquiry area with zero payments.',
        },
      ]}
    />
  );
}

export function PrivacyPage() {
  return (
    <StaticShell
      title="Privacy Policy"
      subtitle="How SERVA protects your addresses, farm coordinates, and personal contact information."
      sections={[
        {
          heading: 'In-App Coordination & Address Privacy',
          body: 'Personal contact details and full street/farm locations are shared strictly with the verified partner assigned to your active booking, and all booking coordination stays logged inside in-app messaging.',
        },
        {
          heading: 'Secure Sessions & Uploads',
          body: 'Passwords are hashed using bcrypt, OTP verification is rate-limited, and uploaded portfolio or complaint photos are validated by MIME type and file size.',
        },
      ]}
    />
  );
}

export function RefundPolicyPage() {
  return (
    <StaticShell
      title="Cancellation & Refund Policy"
      subtitle="Transparent cancellation, rescheduling, and wallet/payment refund schedules shown before checkout."
      sections={[
        {
          heading: 'Home Services',
          body: 'Free cancellation before the technician departs (On the Way). A ₹100 visit fee applies once travel has begun. Eligible online refunds credit to your SERVA Wallet or original payment source.',
        },
        {
          heading: 'Events, Agriculture & Moving',
          body: 'Events: free cancellation up to 7 days prior (5% processing deduction); 100% refund or vendor replacement if cancelled by vendor. Agriculture: free weather rescheduling. Moving: free cancellation before partner acceptance.',
        },
      ]}
    />
  );
}
