import Link from 'next/link';
import { Search, Home, Cpu, Radio, Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-background relative flex items-center justify-center p-4">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      <div className="max-w-xl w-full glass rounded-3xl p-8 sm:p-12 border border-border/80 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold uppercase tracking-wider">
          <span>Error 404 • Page Not Found</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-foreground font-heading">
          Signal Lost in Transit
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          The component, catalog endpoint, or resource you are looking for has been moved, decommissioned, or does not exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-6 rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            <Home className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
          <Link
            href="/search"
            className="bg-card hover:bg-muted border border-border text-foreground font-bold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            <Search className="w-4 h-4" />
            <span>Search Components</span>
          </Link>
        </div>

        <div className="pt-6 border-t border-border/50 space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Popular Hardware Hubs:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/collections/sensors"
              className="px-3 py-1.5 rounded-lg bg-card/60 hover:bg-primary/10 border border-border/60 hover:border-primary/40 text-xs text-muted-foreground hover:text-primary transition flex items-center gap-1.5 font-mono"
            >
              <Radio className="w-3.5 h-3.5 text-primary" />
              <span>Sensors</span>
            </Link>
            <Link
              href="/collections/microcontroller"
              className="px-3 py-1.5 rounded-lg bg-card/60 hover:bg-primary/10 border border-border/60 hover:border-primary/40 text-xs text-muted-foreground hover:text-primary transition flex items-center gap-1.5 font-mono"
            >
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span>Microcontrollers</span>
            </Link>
            <Link
              href="/collections/power"
              className="px-3 py-1.5 rounded-lg bg-card/60 hover:bg-primary/10 border border-border/60 hover:border-primary/40 text-xs text-muted-foreground hover:text-primary transition flex items-center gap-1.5 font-mono"
            >
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span>Power Modules</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
