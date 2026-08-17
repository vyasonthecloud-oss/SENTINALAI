import Link from 'next/link';
import { Cpu, ArrowRight, Server, Activity, Database, ShieldCheck } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="w-full py-20 md:py-32 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 dark:bg-primary/20 rounded-full blur-[150px] pointer-events-none opacity-60 animate-pulse"></div>
      
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Column: Text */}
        <div className="flex flex-col items-start text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-mono tracking-widest uppercase text-primary bg-primary/10 rounded-full mb-8 border border-primary/20 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Cpu className="w-4 h-4" />
            <span>Sentinal AI Infrastructure</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 max-w-4xl text-foreground leading-[1.1]">
            Intelligent Hardware for <br className="hidden lg:block" />
            <span className="text-gradient">Next-Gen Builders.</span>
          </h1>
          
          <p className="text-base sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-lg leading-relaxed">
            Equip your team with enterprise-grade sensors, edge computing modules, and AI accelerators. Shipped directly from our secure facilities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto z-10 font-mono text-xs sm:text-[13px] tracking-widest uppercase">
            <Link href="/collections/all" className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-md transition-all h-12 sm:h-14 shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_45px_rgba(16,185,129,0.6)] hover:-translate-y-1 w-full sm:w-auto">
              Explore Catalog <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-card/50 hover:bg-card/80 text-foreground font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-md text-sm sm:text-base border border-border backdrop-blur-sm transition-colors h-12 sm:h-14 w-full sm:w-auto">
              Contact Sales
            </Link>
          </div>
        </div>

        {/* Right Column: Native UI Mockup instead of Image */}
        <div className="relative z-10 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[550px] aspect-square lg:aspect-auto lg:h-[600px] flex items-center justify-center">
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-[100px] opacity-60"></div>
            
            {/* Dashboard Card */}
            <div className="relative w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-8">
              
              {/* Window Header */}
              <div className="h-10 border-b border-border/50 bg-foreground/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/80"></div>
                <div className="w-3 h-3 rounded-full bg-accent/80"></div>
                <div className="w-3 h-3 rounded-full bg-primary/80"></div>
                <div className="ml-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  node-sys-01.sentinal
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Bar */}
                <div className="flex justify-between items-center bg-foreground/5 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-3">
                    <Server className="text-primary w-5 h-5" />
                    <div>
                      <div className="font-bold text-sm">Main Cluster</div>
                      <div className="font-mono text-[10px] text-primary">ONLINE</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  </div>
                </div>

                {/* Grid of metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-foreground/5 border border-border/50 rounded-lg p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <Activity className="w-4 h-4" />
                      <span className="font-mono text-[10px]">CPU</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-foreground">
                      34<span className="text-sm text-primary">%</span>
                    </div>
                    {/* Tiny bar chart */}
                    <div className="flex gap-1 h-6 items-end mt-2">
                      {[40, 70, 45, 90, 65, 34].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }}>
                           <div className="w-full bg-primary rounded-t-sm" style={{ height: '2px' }}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-foreground/5 border border-border/50 rounded-lg p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <Database className="w-4 h-4" />
                      <span className="font-mono text-[10px]">RAM</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-foreground">
                      12<span className="text-sm text-accent">GB</span>
                    </div>
                    {/* Tiny bar chart */}
                    <div className="flex gap-1 h-6 items-end mt-2">
                      {[30, 40, 35, 50, 45, 12].map((h, i) => (
                        <div key={i} className="flex-1 bg-accent/20 rounded-t-sm" style={{ height: `${h}%` }}>
                           <div className="w-full bg-accent rounded-t-sm" style={{ height: '2px' }}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Secure Process */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-primary w-5 h-5" />
                    <span className="text-sm font-semibold text-primary">Hardware Encryption Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative tech floating elements */}
            <div className="absolute top-[10%] -left-8 glass px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest text-primary animate-bounce shadow-lg hidden md:block" style={{ animationDuration: '4s' }}>
              8 TFLOPS Edge AI
            </div>
            <div className="absolute bottom-[10%] -right-4 glass px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest text-accent animate-bounce shadow-lg hidden md:block" style={{ animationDuration: '5s', animationDelay: '1s' }}>
              NPU Integrated
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
