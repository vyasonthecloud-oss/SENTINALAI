import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ui/ProductCard';
import { Search, SlidersHorizontal, Package, Sparkles } from 'lucide-react';
import { Product, Prisma } from '@prisma/client';
import Link from 'next/link';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q ? resolvedParams.q.trim() : '';

  return {
    title: q ? `Search results for "${q}" | Sentinal AI` : 'Search Electronic Hardware & Components | Sentinal AI',
    description: 'Search through thousands of high-quality microcontrollers, sensors, drone hardware, motors, and robotics modules with fast shipping in India.',
    alternates: {
      canonical: 'https://sentinalai.com/search',
    },
  };
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
  }>;
}

const CATEGORIES = [
  { label: 'All Categories', value: '' },
  { label: 'Sensors', value: 'SENSOR' },
  { label: 'Microcontrollers', value: 'MICROCONTROLLER' },
  { label: 'Drone & Robotics', value: 'DRONE' },
  { label: 'Motors & Actuators', value: 'MOTOR' },
  { label: 'Power & Batteries', value: 'POWER' },
  { label: 'Engineering Tools', value: 'TOOL' },
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams.q || '').trim();
  const category = (resolvedSearchParams.category || '').trim();
  const minPrice = parseFloat(resolvedSearchParams.minPrice || '');
  const maxPrice = parseFloat(resolvedSearchParams.maxPrice || '');
  const inStockOnly = resolvedSearchParams.inStock === 'true';
  const sort = resolvedSearchParams.sort || 'newest';

  // Build Prisma Where Clause
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (query) {
    where.OR = [
      { title: { contains: query } },
      { descriptionHtml: { contains: query } },
      { tags: { contains: query } },
      { sku: { contains: query } },
      { vendor: { contains: query } },
      { productType: { contains: query } },
    ];
  }

  if (category) {
    where.productType = { contains: category };
  }

  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    where.price = {};
    if (!isNaN(minPrice)) where.price.gte = minPrice;
    if (!isNaN(maxPrice)) where.price.lte = maxPrice;
  }

  if (inStockOnly) {
    where.stockQuantity = { gt: 0 };
  }

  // Sorting
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  if (sort === 'price-low-high') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price-high-low') {
    orderBy = { price: 'desc' };
  } else if (sort === 'newest') {
    orderBy = { createdAt: 'desc' };
  }

  let products: Product[] = [];
  try {
    products = await prisma.product.findMany({
      where,
      orderBy,
    });
  } catch (err) {
    console.error('Search query error:', err);
    products = [];
  }

  return (
    <div className="min-h-screen bg-background relative pt-8 pb-24">
      {/* Ambient background illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Search & Header Banner */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/60">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Component Sourcing Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground font-heading">
                Search Catalog
              </h1>
              {query && (
                <p className="text-muted-foreground text-sm mt-1">
                  Showing matches for <span className="font-bold text-foreground font-mono">&quot;{query}&quot;</span>
                </p>
              )}
            </div>

            <div className="glass px-4 py-2 rounded-2xl border border-border/80 text-xs font-mono self-start md:self-auto">
              <span className="text-muted-foreground">Found: </span>
              <strong className="text-primary font-bold text-sm">{products.length}</strong> items
            </div>
          </div>

          {/* Interactive Search & Multi-Facet Filters Form */}
          <form method="GET" action="/search" className="mt-6 space-y-4">
            {/* Primary Search Input Row */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search sensors, microcontrollers, motors, SKUs, tools..."
                className="w-full bg-card/70 border border-border rounded-2xl py-3.5 pl-12 pr-28 text-foreground text-sm sm:text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition placeholder:text-muted-foreground/50"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition shadow-md"
              >
                Search
              </button>
            </div>

            {/* Filter Pills and Dropdowns Row */}
            <div className="p-4 rounded-2xl bg-card/40 border border-border/60 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground font-mono font-semibold uppercase tracking-wider mr-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                <span>Filters:</span>
              </div>

              {/* Category Select */}
              <select
                name="category"
                defaultValue={category}
                className="bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Price Range */}
              <div className="flex items-center gap-1 bg-background border border-border rounded-xl px-2 py-1">
                <span className="text-muted-foreground font-mono">₹</span>
                <input
                  type="number"
                  name="minPrice"
                  defaultValue={isNaN(minPrice) ? '' : minPrice}
                  placeholder="Min"
                  className="w-16 bg-transparent text-foreground focus:outline-none text-xs font-mono"
                />
                <span className="text-muted-foreground">-</span>
                <span className="text-muted-foreground font-mono">₹</span>
                <input
                  type="number"
                  name="maxPrice"
                  defaultValue={isNaN(maxPrice) ? '' : maxPrice}
                  placeholder="Max"
                  className="w-16 bg-transparent text-foreground focus:outline-none text-xs font-mono"
                />
              </div>

              {/* In Stock Only Checkbox */}
              <label className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="inStock"
                  value="true"
                  defaultChecked={inStockOnly}
                  className="w-3.5 h-3.5 accent-primary rounded"
                />
                <span className="font-medium text-foreground">In Stock Only</span>
              </label>

              {/* Sort Order */}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-muted-foreground font-mono hidden sm:inline">Sort:</span>
                <select
                  name="sort"
                  defaultValue={sort}
                  className="bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary font-medium"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                </select>

                <button
                  type="submit"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold px-3 py-2 rounded-xl transition border border-border text-xs"
                >
                  Apply
                </button>

                {(query || category || !isNaN(minPrice) || !isNaN(maxPrice) || inStockOnly) && (
                  <Link
                    href="/search"
                    className="text-xs text-muted-foreground hover:text-rose-400 font-mono px-2 py-2 transition"
                  >
                    Reset
                  </Link>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Results / Empty States */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-card/30 rounded-3xl border border-border/50 p-8 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border flex items-center justify-center mx-auto text-muted-foreground">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-foreground">No Matching Components Found</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We couldn&apos;t find any hardware matching your current query and filter combination.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-mono uppercase text-muted-foreground tracking-wider">Suggested Searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['ESP32', 'LiDAR', 'Raspberry Pi', 'OLED', 'Servo Motor', 'BMS', 'IMU'].map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1.5 rounded-full bg-card hover:bg-primary/10 border border-border hover:border-primary/40 text-xs text-foreground hover:text-primary transition font-mono"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/collections/all"
              className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md"
            >
              Browse Complete Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 relative z-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
