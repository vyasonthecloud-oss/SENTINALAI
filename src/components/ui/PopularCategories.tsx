import Link from 'next/link';
import { Cpu, Wifi, Navigation, Settings, Zap, Wrench } from 'lucide-react';

export function PopularCategories() {
  const categories = [
    { name: 'Microcontrollers', path: 'microcontroller', icon: Cpu }, 
    { name: 'Sensors', path: 'sensors', icon: Wifi }, 
    { name: 'Drones', path: 'drone', icon: Navigation }, 
    { name: 'Motors', path: 'motor', icon: Settings }, 
    { name: 'Power Supply', path: 'power', icon: Zap }, 
    { name: 'Tools', path: 'tools', icon: Wrench }
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-4 pb-20 relative z-10">
      <div className="flex items-center justify-between mb-10 border-b border-foreground/10 pb-4">
        <h2 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
          Popular Hardware
          <span className="h-px w-24 bg-gradient-to-r from-primary to-transparent"></span>
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <Link key={cat.path} href={`/collections/${cat.path}`} className="glass glass-hover p-6 rounded-3xl text-center group flex flex-col items-center relative overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-20 h-20 bg-card rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 shadow-inner border border-foreground/5 relative z-10">
                <div className="w-12 h-12 bg-primary/20 rounded-xl group-hover:bg-primary transition-colors duration-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] flex items-center justify-center text-primary group-hover:text-primary-foreground">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors tracking-tight relative z-10">{cat.name}</h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
