"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error without exposing credentials
    console.error('Handled application error:', error.message || 'Unknown error');
  }, [error]);

  return (
    <div className="min-h-[75vh] bg-background relative flex items-center justify-center p-4">
      <div className="max-w-md w-full glass rounded-3xl p-8 border border-border/80 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto text-rose-500 border border-rose-500/20">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-foreground font-heading">
            Unexpected System Exception
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Our telemetry caught an unexpected error processing this request. Your session and orders remain secure.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-5 rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="flex-1 bg-card hover:bg-muted border border-border text-foreground font-bold py-3 px-5 rounded-xl transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            <Home className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
