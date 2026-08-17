import { prisma } from '@/lib/prisma';
import type { Product } from '@prisma/client';
import { ProductCard } from '@/components/ui/ProductCard';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'All Electronic Components & Modules | Sentinal AI',
  description: 'Explore the complete Sentinal AI catalog of microcontrollers, calibrated sensors, motor drivers, edge AI modules, and robotics power systems in India.',
  alternates: {
    canonical: 'https://sentinalai.com/collections/all',
  },
};

export default async function CollectionsAllPage() {
  let products: Product[] = [];
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.warn('Could not fetch products during page build:', error instanceof Error ? error.message : error);
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none -z-10"></div>
      
      <div className="max-w-[1400px] mx-auto px-4 py-12 relative z-10">
        <div className="flex justify-between items-end mb-10 border-b border-foreground/10 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-3 flex items-center gap-4">
              All Products
              <span className="h-px w-32 bg-gradient-to-r from-primary to-transparent hidden md:block"></span>
            </h1>
            <p className="text-muted-foreground text-lg">Browse our complete collection of electronic components</p>
          </div>
          <div className="glass px-4 py-2 rounded-full hidden md:block">
            <p className="text-sm font-bold text-foreground">{products.length} products</p>
          </div>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-24 glass rounded-3xl p-8 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">No Products Available</h2>
            <p className="text-muted-foreground">New industrial hardware components are currently being cataloged.</p>
            <Link
              href="/"
              className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
