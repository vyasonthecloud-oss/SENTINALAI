import { Truck, ShieldCheck, Clock, HeadphonesIcon } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 mb-24 relative z-10">
      <div className="glass rounded-3xl overflow-hidden shadow-2xl border-foreground/10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-foreground/10">
          <div className="flex flex-col md:flex-row items-center gap-4 p-8 hover:bg-foreground/5 transition-colors group">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 group-hover:rotate-6 transition-all">
              <Truck className="w-8 h-8" />
            </div>
            <div className="text-center md:text-left mt-4 md:mt-0">
              <h4 className="font-bold text-lg tracking-tight">Free Shipping</h4>
              <p className="text-sm text-muted-foreground mt-1">On orders over ₹999</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 p-8 hover:bg-foreground/5 transition-colors group">
            <div className="p-4 bg-accent/10 rounded-2xl text-accent group-hover:scale-110 group-hover:-rotate-6 transition-all">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="text-center md:text-left mt-4 md:mt-0">
              <h4 className="font-bold text-lg tracking-tight">100% Secure</h4>
              <p className="text-sm text-muted-foreground mt-1">Safe online payments</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 p-8 hover:bg-foreground/5 transition-colors group">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 group-hover:rotate-6 transition-all">
              <Clock className="w-8 h-8" />
            </div>
            <div className="text-center md:text-left mt-4 md:mt-0">
              <h4 className="font-bold text-lg tracking-tight">Fast Dispatch</h4>
              <p className="text-sm text-muted-foreground mt-1">Ships within 24 hours</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 p-8 hover:bg-foreground/5 transition-colors group">
            <div className="p-4 bg-accent/10 rounded-2xl text-accent group-hover:scale-110 group-hover:-rotate-6 transition-all">
              <HeadphonesIcon className="w-8 h-8" />
            </div>
            <div className="text-center md:text-left mt-4 md:mt-0">
              <h4 className="font-bold text-lg tracking-tight">Expert Support</h4>
              <p className="text-sm text-muted-foreground mt-1">Technical assistance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
