import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@prisma/client';
import { AddToCartButton } from './AddToCartButton';

export function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.stockQuantity <= 0 || !product.isActive;
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.lowStockThreshold;

  return (
    <div className={`glass glass-hover rounded-2xl group flex flex-col h-full overflow-hidden relative card-glow ${isOutOfStock ? 'opacity-75' : ''}`}>
      <Link href={`/product/${product.id}`} className="block relative aspect-square p-3 sm:p-6 flex-shrink-0 bg-gradient-to-b from-transparent to-black/10 dark:to-white/5">
        <Image 
          src={product.image || '/placeholder.png'} 
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className={`object-contain mix-blend-multiply dark:mix-blend-normal p-2 sm:p-4 opacity-90 group-hover:opacity-100 transition-opacity duration-300 ease-out ${isOutOfStock ? 'grayscale-[50%]' : ''}`}
        />
        
        {/* Badges container */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
          {product.compareAtPrice && product.compareAtPrice > product.price && !isOutOfStock && (
            <div className="bg-accent/90 backdrop-blur-md text-accent-foreground text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded uppercase tracking-widest font-mono shadow-md">
              Sale
            </div>
          )}

          {isOutOfStock ? (
            <div className="bg-rose-500/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded uppercase tracking-widest font-mono shadow-md">
              Out of Stock
            </div>
          ) : isLowStock ? (
            <div className="bg-amber-500/90 backdrop-blur-md text-black text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded uppercase tracking-widest font-mono shadow-md">
              Only {product.stockQuantity} Left
            </div>
          ) : null}
        </div>
      </Link>
      
      <div className="p-3.5 sm:p-6 flex flex-col flex-1 border-t border-border/50 relative z-10 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <p className="tech-label text-primary/80 text-[10px] sm:text-xs">Sentinel AI</p>
          <span className={`text-[10px] font-mono font-semibold ${
            isOutOfStock 
              ? 'text-rose-500' 
              : isLowStock 
              ? 'text-amber-500' 
              : 'text-emerald-500'
          }`}>
            {isOutOfStock ? 'Sold Out' : isLowStock ? `${product.stockQuantity} left` : 'In Stock'}
          </span>
        </div>

        <Link href={`/product/${product.id}`} className="font-bold text-sm sm:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3 sm:mb-4 flex-1 leading-snug">
          {product.title}
        </Link>
        
        <div className="flex flex-col gap-1 mt-auto pt-2 sm:pt-4 border-t border-border/50 font-mono">
          <div className="flex items-baseline gap-2 sm:gap-3">
            <span className="font-bold text-base sm:text-xl text-foreground">₹{product.price.toFixed(0)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through decoration-destructive/50">₹{product.compareAtPrice.toFixed(0)}</span>
            )}
          </div>
        </div>
        
        <div className="mt-3 sm:mt-6 flex items-stretch gap-1.5 sm:gap-2 h-10 sm:h-11">
          <div className="flex-1 h-full">
            <AddToCartButton product={product} fullWidth={true} />
          </div>
          <Link href={`/product/${product.id}`} className="px-2.5 sm:px-4 bg-card/50 text-foreground hover:bg-foreground/5 border border-border font-bold text-xs sm:text-sm rounded-md transition-colors duration-200 flex items-center justify-center h-full shrink-0">
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
