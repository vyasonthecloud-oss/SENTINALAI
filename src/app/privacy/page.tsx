import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Sentinal AI Store',
  description: 'Privacy policy and data protection commitment for Sentinal AI users in India.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono tracking-widest uppercase text-primary bg-primary/10 rounded-full mb-6 border border-primary/20 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4" />
            <span>Data Protection & Trust</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4 font-heading">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-muted-foreground">Effective Date: August 13, 2026</p>
        </div>

        <div className="glass p-8 md:p-12 rounded-3xl border border-border/80 space-y-10 text-foreground/90">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 font-heading">
              <Lock className="w-6 h-6 text-primary" /> 1. Commitment to Privacy
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Sentinal AI (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) values your privacy. We collect only the minimum necessary information required to process component orders, deliver packages across India, and provide technical assistance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 font-heading">
              <Eye className="w-6 h-6 text-primary" /> 2. Information We Collect
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed pl-2">
              <li><strong className="text-foreground">Order Information:</strong> Name, shipping address, email address, and phone number for delivery updates.</li>
              <li><strong className="text-foreground">Payment Security:</strong> All card, UPI, and net-banking credentials are processed directly through Razorpay&apos;s PCI-DSS compliant checkout. We never store or log your card numbers or UPI PINs on our servers.</li>
              <li><strong className="text-foreground">Technical Analytics:</strong> Anonymized IP addresses and device browser types for security logging and rate-limiting protection.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 font-heading">
              <FileText className="w-6 h-6 text-primary" /> 3. Data Usage & Disclosure
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We strictly do not sell, rent, or trade customer personal data to third parties or marketing brokers. Data is shared exclusively with our delivery logistics partners (e.g., Delhivery, Blue Dart) solely to complete order shipment.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-heading">4. Cookies & Session Storage</h2>
            <p className="leading-relaxed text-muted-foreground">
              Our site uses essential browser local storage to maintain your shopping cart items across visits. No intrusive cross-site tracking cookies are deployed.
            </p>
          </section>

          <div className="pt-8 border-t border-border/60 text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
            <p>For privacy inquiries, contact <a href="mailto:privacy@sentinalai.com" className="text-primary hover:underline font-semibold">privacy@sentinalai.com</a>.</p>
            <Link href="/terms" className="text-primary hover:underline font-semibold">View Terms of Service &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
