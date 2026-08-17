"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { PackageX, RefreshCw, ArrowLeft } from 'lucide-react';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Product detail loading error:', error.message || 'Unknown');
  }, [error]);

  return (
    <div className="min-h-[75vh] max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
      <div className="max-w-md w-full glass rounded-3xl p-8 border border-border/80 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20">
          <PackageX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-foreground font-heading">
            Component Unavailable
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We encountered a problem loading this hardware specification sheet.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-5 rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload</span>
          </button>
          <Link
            href="/collections/all"
            className="flex-1 bg-card hover:bg-muted border border-border text-foreground font-bold py-3 px-5 rounded-xl transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
