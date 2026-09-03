"use client";

import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import Link from 'next/link';
import { ShieldCheck, CreditCard, ChevronRight, UserCheck } from 'lucide-react';

import { useIsMounted } from '@/lib/useMounted';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const mounted = useIsMounted();
  const [allowGuestCheckout, setAllowGuestCheckout] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const customerName = formData.name || user?.name || '';
  const customerEmail = formData.email || user?.email || '';

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <CreditCard className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <button 
          onClick={() => router.push('/')}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Create order on our server
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice(),
          customerName: customerName,
          customerEmail: customerEmail,
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
          items: items,
          userId: user?.id || null,
        }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // 2. Check if we're in Simulation Mode (no real API keys provided)
      if (orderData.id.startsWith('order_simulated_')) {
        const verifyRes = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.id,
            razorpay_payment_id: 'pay_simulated_' + Date.now(),
            razorpay_signature: 'simulated_signature',
            orderId: orderData.orderId,
          }),
        });

        if (verifyRes.ok) {
          clearCart();
          alert('Test Mode Payment Successful! Thank you for your order.');
          router.push('/orders/' + orderData.orderId);
        } else {
          const err = await verifyRes.json();
          alert('Payment verification failed: ' + (err.error || 'Unknown error'));
        }
        return;
      }

      // 3. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy_key', // Replace with your public key if you have one
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Sentinel AI',
        description: 'Electronic Components Purchase',
        order_id: orderData.id,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          // 3. Verify payment on server
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.orderId,
            }),
          });

          if (verifyRes.ok) {
            clearCart();
            alert('Payment Successful! Thank you for your order.');
            router.push('/orders/' + orderData.orderId);
          } else {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
        },
        theme: {
          color: '#191970', // primary color
        },
      };

      interface RazorpayInstance {
        on: (event: string, cb: (res: { error: { description: string } }) => void) => void;
        open: () => void;
      }
      const RazorpayConstructor = (window as unknown as { Razorpay: new (opts: unknown) => RazorpayInstance }).Razorpay;
      const rzp = new RazorpayConstructor(options);
      rzp.on('payment.failed', function (response: { error: { description: string } }) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      alert('An error occurred during checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative pt-10 pb-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Secure Checkout</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Cart</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary">Checkout</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Shipping Info */}
          <div className="flex-1 space-y-8">
            <div className="glass rounded-3xl p-8 border border-border/50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-cyan-400"></div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 font-heading">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Shipping & Contact Information
              </h2>
              
              {!user && !allowGuestCheckout ? (
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="font-bold text-foreground font-heading">Sign In to Complete Your Order</h3>
                      <p className="text-xs text-muted-foreground">Sign in to track your delivery live, manage orders, and save shipping details.</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link 
                      href="/login?redirect=/checkout" 
                      className="flex-1 bg-primary text-primary-foreground font-bold text-center py-2.5 rounded-xl hover:bg-primary/90 transition shadow-sm text-sm"
                    >
                      Sign In to Account
                    </Link>
                    <Link 
                      href="/signup?redirect=/checkout" 
                      className="flex-1 bg-card hover:bg-muted border border-border text-foreground font-bold text-center py-2.5 rounded-xl transition text-sm"
                    >
                      Create New Account
                    </Link>
                  </div>
                  <div className="text-center pt-2">
                    <button 
                      type="button" 
                      onClick={() => setAllowGuestCheckout(true)}
                      className="text-xs text-muted-foreground hover:text-foreground underline font-semibold transition"
                    >
                      Or proceed as guest without logging in &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                user && (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-bold mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Logged in as <strong>{user.name}</strong> ({user.email})</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider bg-primary/20 px-2 py-0.5 rounded">Verified Account</span>
                  </div>
                )
              )}

              <form id="checkout-form" onSubmit={handlePayment} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={customerName}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-background/50 border border-foreground/10 rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={customerEmail}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-background/50 border border-foreground/10 rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Street Address</label>
                  <input 
                    type="text" 
                    required
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-background/50 border border-foreground/10 rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="123 Tech Lane, Apt 4B"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">City</label>
                    <input 
                      type="text" 
                      required
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-background/50 border border-foreground/10 rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                      placeholder="Bengaluru"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">PIN / ZIP Code</label>
                    <input 
                      type="text" 
                      required
                      value={formData.zip}
                      onChange={e => setFormData({...formData, zip: e.target.value})}
                      className="w-full bg-background/50 border border-foreground/10 rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                      placeholder="560001"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-[400px]">
            <div className="glass rounded-3xl p-6 border border-border/50 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-6 border-b border-border/50 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-card overflow-hidden shrink-0 border border-border relative">
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill
                        sizes="60px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm line-clamp-1 leading-tight">{item.title}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="font-bold text-sm">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border/50 pt-4 space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-green-500 font-semibold">Free</span>
                </div>
                <div className="flex justify-between items-center border-t border-border/50 pt-4 mt-4">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">₹{totalPrice().toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit"
                form="checkout-form"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay with Razorpay
                  </>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Payments are securely processed by Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
