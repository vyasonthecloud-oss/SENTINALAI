"use client";

import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import Link from 'next/link';
import { ShieldCheck, CreditCard, ChevronRight, UserCheck, CheckCircle2, Zap } from 'lucide-react';

import { useIsMounted } from '@/lib/useMounted';

type PaymentGateway = 'razorpay' | 'payu';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const mounted = useIsMounted();
  const [allowGuestCheckout, setAllowGuestCheckout] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('razorpay');
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const customerName = formData.name || user?.name || '';
  const customerEmail = formData.email || user?.email || '';
  const customerPhone = formData.phone || '';

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

  // --- Razorpay Payment Flow ---
  const handleRazorpayPayment = async () => {
    setIsLoading(true);

    try {
      // 1. Create order on server
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice(),
          customerName: customerName,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
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

      // 2. Simulation Mode (if test dummy keys)
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

      // 3. Live Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Sentinel AI',
        description: 'Electronic Components Purchase',
        order_id: orderData.id,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
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
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: '#191970',
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
      alert(error instanceof Error ? error.message : 'An error occurred during Razorpay checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- PayU Payment Flow ---
  const handlePayUPayment = async () => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/payu/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice(),
          customerName: customerName,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
          items: items,
          userId: user?.id || null,
        }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to initialize PayU payment');
      }

      // Simulation mode in development
      if (orderData.simulated) {
        const verifyRes = await fetch('/api/payu/response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'success',
            txnid: orderData.txnid,
            amount: String(orderData.amount),
            udf1: orderData.orderId,
            simulated: true,
          }),
        });

        if (verifyRes.ok) {
          clearCart();
          alert('Test Mode PayU Payment Successful! Thank you for your order.');
          router.push('/orders/' + orderData.orderId);
        } else {
          alert('PayU test verification failed.');
        }
        return;
      }

      // Live PayU Hosted Checkout redirect via dynamic POST form
      if (orderData.actionUrl && orderData.params) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = orderData.actionUrl;

        Object.entries(orderData.params).forEach(([key, val]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(val);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        clearCart();
        form.submit();
      } else {
        throw new Error('Invalid PayU checkout response from server');
      }

    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'An error occurred during PayU checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGateway === 'razorpay') {
      await handleRazorpayPayment();
    } else {
      await handlePayUPayment();
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
          {/* Left Column: Shipping Info & Payment Gateway Selector */}
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

              <form id="checkout-form" onSubmit={handleFormSubmit} className="space-y-5">
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
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-background/50 border border-foreground/10 rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="9876543210"
                  />
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

            {/* Select Payment Gateway Section */}
            <div className="glass rounded-3xl p-8 border border-border/50 shadow-sm relative overflow-hidden space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-3 font-heading">
                <CreditCard className="w-5 h-5 text-primary" />
                Select Payment Gateway
              </h2>
              <p className="text-xs text-muted-foreground">Choose your preferred secure payment channel</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Razorpay Option Card */}
                <div 
                  onClick={() => setSelectedGateway('razorpay')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
                    selectedGateway === 'razorpay'
                      ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/40'
                      : 'border-border/60 bg-card/40 hover:border-border hover:bg-card/70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-base">Razorpay</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                          Popular
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        UPI (GPay, PhonePe, Paytm), Cards, NetBanking, Wallets
                      </p>
                    </div>
                    {selectedGateway === 'razorpay' ? (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0"></div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Instant Checkout
                  </div>
                </div>

                {/* PayU Option Card */}
                <div 
                  onClick={() => setSelectedGateway('payu')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
                    selectedGateway === 'payu'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-md ring-1 ring-emerald-500/40'
                      : 'border-border/60 bg-card/40 hover:border-border hover:bg-card/70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-base">PayU</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                          Live Gateway
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        UPI, Cards (Visa/Mastercard/RuPay), 40+ NetBanking Banks & Wallets
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        <span className="text-[10px] bg-foreground/5 border border-foreground/10 px-2 py-0.5 rounded-full text-foreground/80 font-medium">
                          UPI Intent
                        </span>
                        <span className="text-[10px] bg-foreground/5 border border-foreground/10 px-2 py-0.5 rounded-full text-foreground/80 font-medium">
                          Debit & Credit Cards
                        </span>
                        <span className="text-[10px] bg-foreground/5 border border-foreground/10 px-2 py-0.5 rounded-full text-foreground/80 font-medium">
                          Net Banking
                        </span>
                        <span className="text-[10px] bg-foreground/5 border border-foreground/10 px-2 py-0.5 rounded-full text-foreground/80 font-medium">
                          Mobikwik / Wallets
                        </span>
                      </div>
                    </div>
                    {selectedGateway === 'payu' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0"></div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Secured
                    </span>
                    <span className="text-[10px] text-muted-foreground/80">
                      Zero Surcharge
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Gateway Checkout Buttons */}
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

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Primary Selected Gateway Button */}
                <button 
                  type="submit"
                  form="checkout-form"
                  disabled={isLoading}
                  className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-white shadow-lg ${
                    selectedGateway === 'razorpay'
                      ? 'bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(25,25,112,0.3)] hover:shadow-[0_0_30px_rgba(25,25,112,0.5)]'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                  }`}
                >
                  {isLoading ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay ₹{totalPrice().toFixed(2)} with {selectedGateway === 'razorpay' ? 'Razorpay' : 'PayU'}
                    </>
                  )}
                </button>

                {/* Quick Toggle Button for Alternate Gateway */}
                <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>Or pay using:</span>
                  {selectedGateway === 'razorpay' ? (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setSelectedGateway('payu');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold underline transition"
                    >
                      Switch to PayU &rarr;
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setSelectedGateway('razorpay');
                      }}
                      className="text-primary hover:text-primary/80 font-semibold underline transition"
                    >
                      Switch to Razorpay &rarr;
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium text-center">
                <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                <span>PCI-DSS Compliant • Secured via {selectedGateway === 'razorpay' ? 'Razorpay' : 'PayU'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
