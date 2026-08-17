"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, UserCheck, ArrowRight, Boxes } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface AdminAccessRequiredProps {
  currentEmail?: string;
}

export function AdminAccessRequired({ currentEmail }: AdminAccessRequiredProps) {
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleAdminSwitch = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@sentinalai.com', name: 'Sentinal Admin', asAdmin: true }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user.name, data.user.email, data.user.id, data.user.role);
        window.location.href = '/admin';
      } else {
        window.location.href = '/login?redirect=/admin';
      }
    } catch {
      window.location.href = '/login?redirect=/admin';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-background relative flex items-center justify-center p-4">
      <div className="max-w-md w-full glass rounded-3xl p-8 border border-border/80 text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto text-rose-500 border border-rose-500/20">
          <ShieldCheck className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-heading text-foreground">Admin Access Required</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentEmail 
              ? `You are currently logged in as ${currentEmail} (Customer Account). Admin privileges are required to manage products and orders.`
              : 'This area is restricted to Sentinal AI Administrators.'}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleAdminSwitch}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-70"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating Admin...' : 'Switch to Admin (admin@sentinalai.com)'}</span>
          </button>

          <Link
            href="/collections/all"
            className="w-full bg-card hover:bg-muted border border-border text-foreground font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Boxes className="w-4 h-4 text-primary" />
            <span>Browse Products Catalog</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
}
