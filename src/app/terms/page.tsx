import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Sentinel AI Store',
  description: 'Terms and conditions for using the Sentinel AI platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
            Terms & <span className="text-primary">Conditions</span>
          </h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="glass p-10 rounded-3xl border border-border/50 space-y-8 prose prose-invert max-w-none text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              Welcome to Sentinel AI. By accessing our website and purchasing our electronic components, you agree to be bound by these Terms and Conditions. Please read them carefully.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Products & Pricing</h2>
            <p className="leading-relaxed mb-4">
              All prices are listed in Indian Rupees (INR). We reserve the right to modify prices at any time. While we strive to ensure that all details, descriptions, and prices are accurate, errors may occur. If we discover an error in the price of any goods you have ordered, we will inform you of this as soon as possible.
            </p>
            <p className="leading-relaxed">
              Our inventory is live, but occasionally discrepancies occur. If a product becomes unavailable after checkout, you will receive a full refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Shipping & Returns</h2>
            <p className="leading-relaxed mb-4">
              We ship across India using trusted logistics partners. Standard shipping takes 3-5 business days. 
            </p>
            <p className="leading-relaxed">
              Components can be returned within 7 days of delivery only if they are defective upon arrival. Burned or short-circuited components due to user error (e.g., incorrect voltage) are strictly not eligible for return or replacement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Liability</h2>
            <p className="leading-relaxed">
              Sentinel AI is not liable for any direct, indirect, or consequential damages arising from the use of our electronic components. Engineering and robotics involve inherent risks, and it is the user&apos;s responsibility to handle components safely and within their specified ratings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Privacy</h2>
            <p className="leading-relaxed">
              Your privacy is critically important to us. We do not sell your personal information. Payment details are processed securely through Razorpay and are never stored on our servers.
            </p>
          </section>

          <div className="pt-8 border-t border-border/50">
            <p className="text-sm">
              If you have any questions about these Terms, please contact us at <a href="mailto:sentinelaicore@gmail.com" className="text-primary hover:underline">sentinelaicore@gmail.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
