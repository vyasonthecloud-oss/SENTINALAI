import Link from 'next/link';
import { Cpu, Zap, Wifi, Wrench, Navigation, Settings } from 'lucide-react';

export function CategoryRibbon() {
  return (
    <div className="bg-card/40 backdrop-blur-md border-t border-foreground/10">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto custom-scrollbar">
        <div className="flex items-center space-x-6 sm:space-x-10 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap justify-start md:justify-center min-w-max">
          <Link href="/collections/microcontroller" className="flex items-center gap-1.5 hover:text-primary transition-colors py-1">
            <Cpu className="w-3.5 h-3.5 text-primary" /> Microcontrollers
          </Link>
          <Link href="/collections/sensors" className="flex items-center gap-1.5 hover:text-primary transition-colors py-1">
            <Wifi className="w-3.5 h-3.5 text-primary" /> Sensors & Modules
          </Link>
          <Link href="/collections/power" className="flex items-center gap-1.5 hover:text-primary transition-colors py-1">
            <Zap className="w-3.5 h-3.5 text-primary" /> Power & Batteries
          </Link>
          <Link href="/collections/tools" className="flex items-center gap-1.5 hover:text-primary transition-colors py-1">
            <Wrench className="w-3.5 h-3.5 text-primary" /> Tools & Soldering
          </Link>
          <Link href="/collections/drone" className="flex items-center gap-1.5 hover:text-primary transition-colors py-1">
            <Navigation className="w-3.5 h-3.5 text-primary" /> Robotics & Drones
          </Link>
          <Link href="/collections/motor" className="flex items-center gap-1.5 hover:text-primary transition-colors py-1">
            <Settings className="w-3.5 h-3.5 text-primary" /> Motors & Actuators
          </Link>
        </div>
      </div>
    </div>
  );
}
