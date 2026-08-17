"use client";

import Link from 'next/link';
import { ShieldAlert, LogIn, Boxes } from 'lucide-react';

interface AdminAccessRequiredProps {
  currentEmail?: string;
}

export function AdminAccessRequired({ currentEmail }: AdminAccessRequiredProps) {
  return (
    <div className="min-h-[80vh] bg-background relative flex items-center justify-center p-4">
      <div className="max-w-md w-full glass rounded-3xl p-8 border border-border/80 text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto text-rose-500 border border-rose-500/20">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-heading text-foreground">Admin Access Required</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentEmail 
              ? `You are currently logged in as ${currentEmail} (Customer Account). Admin privileges are required to access this portal.`
              : 'This area is restricted to authorized Sentinal AI Administrators only.'}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/login?redirect=/admin"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Admin Credentials</span>
          </Link>

          <Link
            href="/collections/all"
            className="w-full bg-card hover:bg-muted border border-border text-foreground font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Boxes className="w-4 h-4 text-primary" />
            <span>Return to Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
