import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { AddToCartButton } from '@/components/ui/AddToCartButton';
import { Truck, ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Star } from 'lucide-react';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductReviewsSection } from '@/components/product/ProductReviewsSection';
import { getAuthenticatedUser } from '@/lib/auth';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sentinalai.com';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  let product = null;
  try {
    product = await prisma.product.findUnique({
      where: { id: resolvedParams.id }
    });
  } catch {
    product = null;
  }

  if (!product) {
    return { 
      title: 'Product Not Found | Sentinal AI',
      description: 'The requested electronic component could not be found.',
    };
  }

  const plainDescription = product.descriptionHtml 
    ? product.descriptionHtml.replace(/<[^>]*>?/gm, '').trim().substring(0, 160)
    : `Buy ${product.title} for ₹${product.price.toFixed(2)}. ${product.vendor} genuine industrial component. Express delivery across India.`;

  const canonicalUrl = `${APP_URL}/product/${product.id}`;
  const imageUrl = product.image ? (product.image.startsWith('http') ? product.image : `${APP_URL}${product.image}`) : `${APP_URL}/icon.png`;

  return {
    title: `${product.title} | Sentinal AI Store`,
    description: plainDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.title} | Sentinal AI`,
      description: plainDescription,
      url: canonicalUrl,
      siteName: 'Sentinal AI Store',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      type: 'website',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Sentinal AI`,
      description: plainDescription,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  let product = null;
  try {
    product = await prisma.product.findUnique({
      where: { id: resolvedParams.id },
      include: {
        reviews: {
          include: {
            user: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  } catch {
    product = null;
  }

  if (!product) {
    return notFound();
  }

  const authUser = await getAuthenticatedUser();
  const currentUserId = authUser?.id || null;

  const isOutOfStock = product.stockQuantity <= 0 || !product.isActive;
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.lowStockThreshold;

  let extraImages: string[] = [];
  try {
    extraImages = product.images ? JSON.parse(product.images) : [];
  } catch {
    extraImages = [];
  }

  const reviewsCount = product.reviews.length;
  const averageRatingNum = reviewsCount > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
    : null;
  const averageRating = averageRatingNum ? averageRatingNum.toFixed(1) : null;

  const formattedReviews = product.reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    author: r.user.name,
    createdAt: r.createdAt,
  }));

  // Schema.org JSON-LD Structured Data for Rich Snippets
  const allImages = Array.from(new Set([product.image, ...extraImages].filter(Boolean))).map(img => 
    img.startsWith('http') ? img : `${APP_URL}${img}`
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: allImages.length > 0 ? allImages : [`${APP_URL}/placeholder.png`],
    description: product.descriptionHtml ? product.descriptionHtml.replace(/<[^>]*>?/gm, '').trim().substring(0, 300) : product.title,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'Sentinal AI',
    },
    offers: {
      '@type': 'Offer',
      url: `${APP_URL}/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: !isOutOfStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Sentinal AI',
      },
    },
    ...(averageRatingNum ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: averageRatingNum.toFixed(1),
        reviewCount: reviewsCount,
        bestRating: '5',
        worstRating: '1',
      },
    } : {}),
  };

  return (
    <div className="font-sans max-w-7xl mx-auto px-4 py-6 sm:py-12">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-8 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>&gt;</span>
        <Link href="/collections/all" className="hover:text-primary transition-colors">Catalog</Link>
        <span>&gt;</span>
        <span className="text-foreground font-semibold truncate">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 bg-card text-card-foreground p-4 sm:p-8 md:p-12 rounded-3xl shadow-sm border border-border/80">
        {/* Multi-Image Gallery */}
        <div>
          <ProductGallery
            primaryImage={product.image || '/placeholder.png'}
            images={extraImages}
            title={product.title}
            isOutOfStock={isOutOfStock}
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          {/* Dynamic Stock Indicator Badge */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {isOutOfStock ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30 text-xs font-mono font-bold uppercase tracking-wider">
                <XCircle className="w-3.5 h-3.5" />
                <span>Out of Stock • Backorder Queued</span>
              </div>
            ) : isLowStock ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-mono font-bold uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Low Stock • Only {product.stockQuantity} Units Left</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>In Stock ({product.stockQuantity} Units) • Ships in 24 Hours</span>
              </div>
            )}

            {/* Average Rating Stars Badge */}
            {averageRating && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border/80 text-xs font-mono">
                <div className="flex items-center text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </div>
                <span className="font-bold text-foreground">{averageRating}</span>
                <span className="text-muted-foreground">({reviewsCount})</span>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 font-heading leading-tight">
            {product.title}
          </h1>
          
          <div className="text-muted-foreground mb-6 flex space-x-6 text-xs sm:text-sm">
            <span>Vendor: <span className="font-semibold text-primary">{product.vendor || 'Sentinal AI'}</span></span>
            {product.sku && <span>SKU: <span className="font-semibold text-foreground font-mono">{product.sku}</span></span>}
          </div>

          <div className="mb-8 p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-primary font-heading">₹{product.price.toFixed(2)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-lg text-muted-foreground line-through">₹{product.compareAtPrice.toFixed(2)}</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-2 font-mono">Tax included. Free express shipping on orders over ₹999.</div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 h-14">
              <AddToCartButton product={product} fullWidth={true} />
            </div>
            {!isOutOfStock ? (
              <Link 
                href={`/checkout?productId=${product.id}`}
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-center py-4 rounded-md font-bold text-sm uppercase tracking-wider transition border border-border flex items-center justify-center h-14"
              >
                Buy It Now
              </Link>
            ) : (
              <button 
                disabled
                className="flex-1 bg-muted text-muted-foreground cursor-not-allowed text-center py-4 rounded-md font-bold text-sm uppercase tracking-wider border border-border flex items-center justify-center h-14 opacity-60"
              >
                Currently Unavailable
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/40 text-xs text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>100% Genuine Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span>Express Delivery in India</span>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.descriptionHtml) }} />
        </div>
      </div>

      {/* Customer Reviews & Feedback Section */}
      <ProductReviewsSection
        productId={product.id}
        initialReviews={formattedReviews}
        currentUserId={currentUserId}
      />
    </div>
  );
}
