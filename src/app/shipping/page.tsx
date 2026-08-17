import { Metadata } from 'next';
import Link from 'next/link';
import { Truck, Clock, RefreshCw, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping & Returns Policy | Sentinal AI Store',
  description: 'Nationwide shipping timelines across India, order tracking, and 7-day defective component warranty policy.',
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono tracking-widest uppercase text-primary bg-primary/10 rounded-full mb-6 border border-primary/20 backdrop-blur-md">
            <Truck className="w-4 h-4" />
            <span>Fast Logistics Across India</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4 font-heading">
            Shipping & <span className="text-primary">Returns</span>
          </h1>
          <p className="text-muted-foreground">Transparent delivery timelines and component replacement terms.</p>
        </div>

        <div className="glass p-8 md:p-12 rounded-3xl border border-border/80 space-y-10 text-foreground/90">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 font-heading">
              <Clock className="w-6 h-6 text-primary" /> 1. Dispatch & Delivery Timelines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-5 rounded-2xl bg-card border border-border/60">
                <h3 className="font-bold text-foreground mb-1">Express Dispatch</h3>
                <p className="text-sm text-muted-foreground">Orders confirmed before 2:00 PM IST are dispatched the same business day.</p>
              </div>
              <div className="p-5 rounded-2xl bg-card border border-border/60">
                <h3 className="font-bold text-foreground mb-1">Estimated Transit</h3>
                <p className="text-sm text-muted-foreground">2 to 4 business days for major Indian metros; 4 to 6 days for remote regions.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 font-heading">
              <Truck className="w-6 h-6 text-primary" /> 2. Shipping Charges & Tracking
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Free Express Shipping is automatically applied on all orders over ₹999. Orders below ₹999 carry a flat ₹60 delivery fee. Complete AWB tracking links are emailed upon package dispatch.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 font-heading">
              <RefreshCw className="w-6 h-6 text-primary" /> 3. 7-Day Replacement Policy
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We offer a 7-day replacement guarantee for components received in damaged condition or manufacturing defects. To request a replacement, email support with a video/photo of the delivered item.
            </p>
          </section>

          <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 flex gap-4 items-start">
            <AlertCircle className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div className="space-y-1">
              <h4 className="font-bold text-foreground">Important Note on Electronic Components</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Burned ICs, short-circuited boards, or damaged pins caused by incorrect supply voltage or wiring errors are strictly excluded from warranty coverage.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-border/60 text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
            <p>Need support with an existing shipment?</p>
            <Link href="/contact" className="text-primary hover:underline font-semibold">Contact Customer Service &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
