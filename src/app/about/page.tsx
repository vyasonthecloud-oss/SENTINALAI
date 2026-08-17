import { Metadata } from 'next';
import { Shield, Cpu, Zap, Box } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Sentinal AI Store',
  description: 'Learn about Sentinal AI and our mission to provide the best electronic components.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-12 pb-24">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none -z-10"></div>
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
            About <span className="text-primary">Sentinal AI</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We are builders, engineers, and creators. Sentinal AI was founded to bridge the gap between high-end industrial robotics and accessible DIY electronics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="glass p-8 rounded-3xl border border-border/50 card-glow group">
            <Cpu className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-bold mb-3">Premium Quality</h3>
            <p className="text-muted-foreground">Every component is tested in our labs before it reaches your workbench. We don&apos;t settle for subpar parts.</p>
          </div>
          
          <div className="glass p-8 rounded-3xl border border-border/50 card-glow group">
            <Zap className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-bold mb-3">Fast Delivery</h3>
            <p className="text-muted-foreground">From Bangalore to your doorstep in days. Our optimized logistics network ensures your project never stalls.</p>
          </div>
          
          <div className="glass p-8 rounded-3xl border border-border/50 card-glow group">
            <Shield className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-bold mb-3">Secure Platform</h3>
            <p className="text-muted-foreground">Your data and payments are secured using state-of-the-art encryption and industry-leading payment gateways.</p>
          </div>
          
          <div className="glass p-8 rounded-3xl border border-border/50 card-glow group">
            <Box className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-bold mb-3">Vast Inventory</h3>
            <p className="text-muted-foreground">Thousands of microcontrollers, sensors, and actuators in stock. If it exists, we have it or can source it.</p>
          </div>
        </div>

        <div className="glass p-10 rounded-3xl border border-border/50">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            To empower the next generation of engineers in India and beyond by providing reliable, affordable, and cutting-edge electronic components. Whether you&apos;re building a simple Arduino robot or a complex autonomous drone, Sentinal AI is your trusted partner.
          </p>
        </div>
      </div>
    </div>
  );
}
