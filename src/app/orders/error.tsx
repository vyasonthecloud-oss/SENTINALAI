"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, ChevronLeft } from 'lucide-react';

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Orders error:', error);
  }, [error]);

  return (
    <div className="min-h-[75vh] bg-background relative flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[350px] bg-destructive/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      <div className="max-w-md w-full glass rounded-3xl p-8 border border-border/80 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto text-destructive border border-destructive/20">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-heading text-foreground">Unable to Load Orders</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We encountered a temporary issue while fetching your order history. Please try again.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full bg-card hover:bg-muted border border-border text-foreground font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
