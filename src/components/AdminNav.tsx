"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, ShoppingBag, Plus, ExternalLink, ShieldCheck } from 'lucide-react';

export function AdminNav() {
  const pathname = usePathname();

  const isProducts = pathname === '/admin' || pathname.startsWith('/admin/edit') || pathname.startsWith('/admin/add');
  const isOrders = pathname.startsWith('/admin/orders');

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-border/60 pb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
            Admin <span className="text-gradient">Console</span>
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Sentinel AI Management & Logistics
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {/* Navigation Tabs */}
        <div className="flex bg-muted/80 p-1 rounded-2xl border border-border/60 shadow-xs">
          <Link
            href="/admin"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isProducts 
                ? 'bg-primary text-primary-foreground shadow-md font-extrabold' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products</span>
          </Link>
          <Link
            href="/admin/orders"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isOrders 
                ? 'bg-primary text-primary-foreground shadow-md font-extrabold' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders</span>
          </Link>
        </div>

        <Link
          href="/admin/add"
          className="bg-card hover:bg-muted border border-border text-foreground px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 hover:border-primary/50"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
          <span>Add Product</span>
        </Link>

        <Link
          href="/"
          target="_blank"
          className="text-xs text-muted-foreground hover:text-primary transition flex items-center gap-1 px-2.5 py-2 font-semibold"
        >
          <span>Store</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
