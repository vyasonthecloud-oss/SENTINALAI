"use client";

import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, Ban } from 'lucide-react';
import { Product } from '@prisma/client';
import { useState } from 'react';

interface AddToCartButtonProps {
  product: Product;
  fullWidth?: boolean;
}

export function AddToCartButton({ product, fullWidth = true }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.stockQuantity <= 0 || !product.isActive;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      stockQuantity: product.stockQuantity,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (isOutOfStock) {
    return (
      <button 
        disabled
        className={`
          ${fullWidth ? 'w-full h-full' : 'px-8 py-2.5'} 
          bg-muted text-muted-foreground border border-border/60 cursor-not-allowed
          font-bold text-xs sm:text-sm rounded-md flex items-center justify-center gap-2
          opacity-70 select-none
        `}
      >
        <Ban className="w-4 h-4" />
        <span>Out of Stock</span>
      </button>
    );
  }

  return (
    <button 
      onClick={handleAdd}
      className={`
        ${fullWidth ? 'w-full h-full' : 'px-8 py-2.5'} 
        ${isAdded ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'} 
        font-bold text-xs sm:text-sm rounded-md transition-all duration-300 flex items-center justify-center gap-2 
        hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]
      `}
    >
      <ShoppingCart className="w-4 h-4" />
      <span>{isAdded ? 'Added!' : 'Add to Cart'}</span>
    </button>
  );
}
