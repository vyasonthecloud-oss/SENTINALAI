import { prisma } from '@/lib/prisma';
import type { Product } from '@prisma/client';
import Link from 'next/link';
import { Metadata } from 'next';
import { ProductCard } from '@/components/ui/ProductCard';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const displayTitle = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
  const canonicalUrl = `https://sentinalai.com/collections/${encodeURIComponent(category)}`;

  return {
    title: `${displayTitle} Components & Hardware | Sentinal AI`,
    description: `Shop high-performance ${displayTitle.toLowerCase()}, sensor kits, evaluation modules, and robotic hardware with express delivery across India.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${displayTitle} Components & Hardware | Sentinal AI`,
      description: `Shop high-performance ${displayTitle.toLowerCase()} with express delivery across India.`,
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  
  // Map friendly URL categories to database productType keywords
  const categoryMap: Record<string, string[]> = {
    'sensors': ['SENSOR'],
    'microcontroller': ['MICROCONTROLLER'],
    'drone': ['DRONE', 'FLIGHT CONTROLLER'],
    'motor': ['MOTOR', 'CASTOR WHEEL'],
    'power': ['POWER', 'BATTERY', 'BMS', 'CONVERTOR'],
    'tools': ['TOOL', 'SOLDERING', 'MULTIMETER', 'CRIMPING'],
  };

  const categoryKey = category.toLowerCase();
  const keywords = categoryMap[categoryKey] || [categoryKey.toUpperCase()];

  let products: Product[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: keywords.map(kw => ({
          productType: { contains: kw }
        }))
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.warn(`Could not fetch products for category ${category} during build:`, error instanceof Error ? error.message : error);
  }

  const displayTitle = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1).replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none -z-10"></div>
      
      <div className="max-w-[1400px] mx-auto px-4 py-12 relative z-10">
        <div className="flex justify-between items-end mb-10 border-b border-foreground/10 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-3 flex items-center gap-4">
              {displayTitle}
              <span className="h-px w-32 bg-gradient-to-r from-primary to-transparent hidden md:block"></span>
            </h1>
            <p className="text-muted-foreground text-lg">Browse our {displayTitle.toLowerCase()} collection</p>
          </div>
          <div className="glass px-4 py-2 rounded-full hidden md:block">
            <p className="text-sm font-bold text-foreground">{products.length} products</p>
          </div>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-24 glass rounded-3xl">
            <h2 className="text-2xl font-bold text-foreground mb-3">No products found</h2>
            <p className="text-muted-foreground mb-8">We couldn&apos;t find any products in this category.</p>
            <Link href="/collections/all" className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              Browse All Products
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
