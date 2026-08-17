import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Sentinal AI Store',
  description: 'Find answers to common questions about electronic components, Razorpay payment methods, shipping, and datasheets.',
};

export default function FAQPage() {
  const faqs = [
    {
      q: 'Are your electronic components 100% genuine?',
      a: 'Yes, all microcontrollers, sensors, and ICs are sourced directly from authorized manufacturers and verified distributors with datasheet guarantees.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We process payments securely via Razorpay supporting Credit/Debit cards, UPI (GPay, PhonePe, Paytm), Net Banking, and major digital wallets.',
    },
    {
      q: 'How long does shipping take across India?',
      a: 'Orders are dispatched within 24 hours. Metros receive packages in 2-4 business days while other locations take 4-6 business days.',
    },
    {
      q: 'Do you provide GST invoices for business / college purchases?',
      a: 'Yes, GST compliant tax invoices are generated automatically for every order and attached to your order confirmation email.',
    },
    {
      q: 'Can I track my package live?',
      a: 'Absolutely. Once shipped, you will receive an automated email containing the courier partner name and live AWB tracking link.',
    },
    {
      q: 'What is your return policy for damaged items?',
      a: 'We provide a 7-day replacement warranty for items damaged in transit or manufacturing defects. Please contact support within 7 days of delivery.',
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono tracking-widest uppercase text-primary bg-primary/10 rounded-full mb-6 border border-primary/20 backdrop-blur-md">
            <HelpCircle className="w-4 h-4" />
            <span>Support & Help Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4 font-heading">
            Frequently Asked <span className="text-primary">Questions</span>
          </h1>
          <p className="text-muted-foreground">Find quick answers regarding products, shipping, and payments.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass p-6 md:p-8 rounded-2xl border border-border/80 space-y-3">
              <h3 className="text-lg font-bold text-foreground flex items-center justify-between font-heading">
                <span>{faq.q}</span>
                <ChevronDown className="w-5 h-5 text-primary shrink-0 ml-4" />
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 rounded-3xl glass text-center border border-border/80">
          <h3 className="text-xl font-bold text-foreground mb-2 font-heading">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">Our technical support engineers are available Monday to Saturday.</p>
          <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-md">
            Contact Engineering Support &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
