"use client";

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  primaryImage: string;
  images: string[];
  title: string;
  isOutOfStock: boolean;
}

export function ProductGallery({
  primaryImage,
  images,
  title,
  isOutOfStock,
}: ProductGalleryProps) {
  const allImages = Array.from(new Set([primaryImage, ...images].filter(Boolean)));
  const [selectedImage, setSelectedImage] = useState<string>(allImages[0] || '/placeholder.png');

  return (
    <div className="flex flex-col gap-4">
      {/* Main Feature Image Viewport */}
      <div className="flex justify-center items-center bg-muted/40 rounded-2xl p-4 sm:p-8 relative min-h-[300px] sm:min-h-[420px] border border-border/50 overflow-hidden">
        <Image
          src={selectedImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-contain mix-blend-multiply dark:mix-blend-normal p-4 transition-all duration-300 ${
            isOutOfStock ? 'grayscale-[40%] opacity-80' : ''
          }`}
        />
      </div>

      {/* Multiple Thumbnail Selection Strip */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {allImages.map((img, idx) => {
            const isSelected = img === selectedImage;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted/30 border transition-all shrink-0 ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/40 scale-105'
                    : 'border-border/60 hover:border-border opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`${title} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-1.5"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
