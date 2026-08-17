import { prisma } from '@/lib/prisma';
import type { Product } from '@prisma/client';
import { HeroSection } from '@/components/ui/HeroSection';
import { FeaturesSection } from '@/components/ui/FeaturesSection';
import { PopularCategories } from '@/components/ui/PopularCategories';
import { ProductCard } from '@/components/ui/ProductCard';
import FUIBentoGridDark from '@/components/ui/bento';

export const revalidate = 3600;

export default async function Home() {
  let products: Product[] = [];
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.warn('Could not fetch products during home page build:', error instanceof Error ? error.message : error);
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      
      <HeroSection />
      <FeaturesSection />

      {/* NEW ARRIVALS GRID */}
      <section className="max-w-[1400px] mx-auto px-4 mb-24 relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-accent absolute inset-0 animate-ping opacity-75"></span>
              <span className="w-3 h-3 rounded-full bg-accent relative block"></span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Live Inventory</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      
      <PopularCategories />

      <FUIBentoGridDark />

    </main>
  );
}
