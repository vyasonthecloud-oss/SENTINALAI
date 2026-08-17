"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Search, ShoppingCart, User, Cpu, Sun, Moon, X, LogOut, Package, Boxes } from 'lucide-react';
import { CategoryRibbon } from './ui/CategoryRibbon';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useIsMounted } from '@/lib/useMounted';

export default function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  const mounted = useIsMounted();
  const cartTotalItems = useCartStore((state) => state.totalItems());
  const cartTotalPrice = useCartStore((state) => state.totalPrice());
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Synchronize client auth store with server-side HTTP session cookie
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          useAuthStore.getState().login(data.user.name, data.user.email, data.user.id, data.user.role);
        } else if (useAuthStore.getState().user) {
          useAuthStore.getState().logout();
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    logout();
    router.push('/');
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border transition-colors">
      {/* Main Header Container */}
      <div className="max-w-[1400px] mx-auto px-4 py-3 md:py-0 md:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group shrink-0">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-black text-lg sm:text-xl tracking-tight uppercase text-foreground group-hover:text-primary transition-colors">
            Sentinal AI
          </span>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg w-full relative group hidden md:block mx-4 lg:mx-8">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by part number, SKU, or keyword..." 
            className="w-full bg-card border border-border rounded-full py-2.5 pl-5 pr-12 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground group-hover:border-border/80"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4 text-sm font-semibold shrink-0">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 rounded-full hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
            title="Search"
          >
            {showMobileSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
            title="Toggle theme"
          >
            {mounted && theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          
          {/* Products / Catalog Quick Link */}
          <Link 
            href="/collections/all" 
            className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-foreground/5 transition-colors"
            title="Browse All Components"
          >
            <Boxes className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Catalog</span>
          </Link>

          {/* User Auth */}
          {mounted && user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link 
                href="/orders" 
                className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-foreground/5 transition-colors"
                title="My Orders"
              >
                <Package className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Orders</span>
              </Link>
              <div className="flex items-center gap-1 text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1.5 sm:px-3 rounded-full border border-primary/20 max-w-[100px] sm:max-w-[140px]">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-xs text-muted-foreground hover:text-destructive p-1.5 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="hover:text-primary transition-all flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-2 py-1">
              <User className="w-4 h-4" />
              <span className="hidden xs:inline">Login</span>
            </Link>
          )}

          {/* Shopping Cart Pill */}
          <button 
            onClick={() => useCartStore.getState().openCart()}
            className="flex items-center space-x-1.5 sm:space-x-2 text-foreground hover:text-primary transition-all bg-primary/10 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full border border-primary/20 hover:border-primary/50 relative"
          >
            <ShoppingCart className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-bold">{mounted ? `₹${cartTotalPrice.toFixed(0)}` : '₹0'}</span>
            {mounted && cartTotalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full animate-in zoom-in shadow-md">
                {cartTotalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Search Drawer */}
      {showMobileSearch && (
        <div className="md:hidden px-4 pb-3 border-t border-border/50 pt-3 animate-in slide-in-from-top-2">
          <form onSubmit={handleSearch} className="relative w-full">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components..." 
              autoFocus
              className="w-full bg-card border border-border rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-primary text-foreground"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary p-1">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
      
      <CategoryRibbon />
    </header>
  );
}
