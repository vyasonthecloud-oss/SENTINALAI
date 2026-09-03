import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Truck, 
  Package, 
  Clock, 
  ShieldCheck, 
  ChevronLeft, 
  XCircle, 
  AlertCircle, 
  ExternalLink,
  MapPin,
  CreditCard,
  Receipt
} from 'lucide-react';
import { PaymentStatus, OrderStatus, Role } from '@/types/database';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Order #${resolvedParams.id.substring(0, 8)} | Sentinel AI`,
    description: 'Track your Sentinel AI component order status and fulfillment timeline.',
  };
}

function PaymentBadge({ status }: { status: string }) {
  switch (status) {
    case PaymentStatus.PAID:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Payment Paid
        </span>
      );
    case PaymentStatus.FAILED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" />
          Payment Failed
        </span>
      );
    case PaymentStatus.REFUNDED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
          <AlertCircle className="w-3.5 h-3.5" />
          Payment Refunded
        </span>
      );
    case PaymentStatus.PENDING:
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5" />
          Payment Pending
        </span>
      );
  }
}

function FulfillmentBadge({ status }: { status: string }) {
  switch (status) {
    case OrderStatus.DELIVERED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Delivered
        </span>
      );
    case OrderStatus.SHIPPED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <Truck className="w-3.5 h-3.5" />
          In Transit / Shipped
        </span>
      );
    case OrderStatus.PROCESSING:
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <Package className="w-3.5 h-3.5" />
          Processing
        </span>
      );
    case OrderStatus.CANCELLED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" />
          Cancelled
        </span>
      );
    case OrderStatus.PENDING:
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
          <Clock className="w-3.5 h-3.5" />
          Order Placed
        </span>
      );
  }
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getAuthenticatedUser();

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: resolvedParams.id },
        { razorpayOrderId: resolvedParams.id },
      ],
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              image: true,
              handle: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Authorization Check:
  // If order is bound to an account, verify ownership when user is logged in
  if (order.userId && user) {
    const isOwner = user.id === order.userId;
    const isMatchingEmail = user.email.toLowerCase() === order.customerEmail.toLowerCase();
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isMatchingEmail && !isAdmin) {
      notFound();
    }
  }

  // Status checks
  const isPaid = order.paymentStatus === PaymentStatus.PAID;
  const isProcessing = order.orderStatus === OrderStatus.PROCESSING;
  const isShipped = order.orderStatus === OrderStatus.SHIPPED;
  const isDelivered = order.orderStatus === OrderStatus.DELIVERED;
  const isCancelled = order.orderStatus === OrderStatus.CANCELLED;

  let progressPercent = 0;
  if (!isCancelled) {
    if (isDelivered) {
      progressPercent = 100;
    } else if (isShipped) {
      progressPercent = 75;
    } else if (isProcessing || isPaid) {
      progressPercent = 50;
    } else {
      progressPercent = 25;
    }
  }

  return (
    <div className="min-h-screen bg-background relative pt-8 pb-24">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      
      <div className="max-w-5xl mx-auto px-4">
        {/* Navigation Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Link 
              href="/orders" 
              className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to My Orders
            </Link>

            <div className="flex items-center gap-2">
              <PaymentBadge status={order.paymentStatus} />
              <FulfillmentBadge status={order.orderStatus} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground font-heading">
                Order <span className="text-primary font-mono text-2xl md:text-3xl">#{order.id}</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {order.razorpayOrderId && (
              <div className="text-xs font-mono text-muted-foreground bg-card/60 px-3.5 py-2 rounded-xl border border-border/60">
                Payment Ref: <span className="text-foreground font-semibold">{order.razorpayOrderId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cancellation Notice Banner */}
        {isCancelled && (
          <div className="mb-8 p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-start gap-4 shadow-lg shadow-rose-500/5">
            <XCircle className="w-7 h-7 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="font-bold text-lg text-foreground font-heading">This Order Has Been Cancelled</h2>
              <p className="text-sm text-muted-foreground">
                {order.cancelledAt 
                  ? `Order cancellation was processed on ${new Date(order.cancelledAt).toLocaleDateString()}.`
                  : 'Order cancellation was recorded.'} Any debited amounts will be refunded to your original payment method within 5-7 business days.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tracking & Items Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Fulfillment Timeline */}
            {!isCancelled && (
              <div className="glass rounded-3xl p-6 sm:p-8 border border-border/60 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" /> Live Delivery Timeline
                  </h2>
                  <span className="text-xs font-mono text-muted-foreground">
                    {isDelivered ? 'Delivery Complete' : isShipped ? 'In Transit' : isProcessing ? 'In Production' : 'Order Placed'}
                  </span>
                </div>
                
                <div className="relative mb-8">
                  {/* Progress Bar Background */}
                  <div className="absolute top-5 left-8 right-8 h-1 bg-foreground/10 rounded-full"></div>
                  {/* Progress Bar Fill */}
                  <div 
                    className="absolute top-5 left-8 h-1 bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    style={{ width: `calc(${progressPercent}% - 4rem)` }}
                  ></div>

                  {/* 4 Steps */}
                  <div className="relative flex justify-between z-10">
                    {/* Step 1: Placed */}
                    <div className="flex flex-col items-center gap-2.5 text-center max-w-[70px]">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">Placed</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Step 2: Payment Verified */}
                    <div className="flex flex-col items-center gap-2.5 text-center max-w-[70px]">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isPaid ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-foreground/10 text-muted-foreground'}`}>
                        {isPaid ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isPaid ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Payment
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {order.paidAt ? new Date(order.paidAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : (isPaid ? 'Verified' : 'Pending')}
                      </span>
                    </div>

                    {/* Step 3: Processing */}
                    <div className="flex flex-col items-center gap-2.5 text-center max-w-[70px]">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${(isProcessing || isShipped || isDelivered) ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-foreground/10 text-muted-foreground'}`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${(isProcessing || isShipped || isDelivered) ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Processing
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {(isProcessing || isShipped || isDelivered) ? 'Active' : 'Queued'}
                      </span>
                    </div>

                    {/* Step 4: Shipped / Delivered */}
                    <div className="flex flex-col items-center gap-2.5 text-center max-w-[70px]">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDelivered ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(16,185,129,0.4)]' : isShipped ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-foreground/10 text-muted-foreground'}`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${(isShipped || isDelivered) ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {isDelivered ? 'Delivered' : 'Shipped'}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {order.deliveredAt 
                          ? new Date(order.deliveredAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                          : (order.shippedAt ? new Date(order.shippedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '3-5 Days')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
                  <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <h3 className="font-bold text-foreground">
                      {isDelivered ? 'Package Delivered Successfully' : isShipped ? 'Package In Transit' : isPaid ? 'Payment Confirmed — Preparing Dispatch' : 'Awaiting Payment Confirmation'}
                    </h3>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">
                      {isDelivered 
                        ? 'Package has been delivered to your shipping address.'
                        : isShipped
                        ? 'Your component package has been handed over to our express courier partner.'
                        : isPaid 
                        ? 'Your payment was authenticated. Our Bangalore warehouse is packaging and verifying your components.'
                        : 'Your order is placed. Complete payment to initiate component dispatch.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ordered Items List */}
            <div className="glass rounded-3xl p-6 sm:p-8 border border-border/60 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" /> Ordered Items ({order.items.length})
                </h2>
                <span className="text-xs font-mono text-muted-foreground">Snapshot Protected</span>
              </div>

              <div className="divide-y divide-border/40">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                    {/* Item Image */}
                    <div className="relative w-20 h-20 bg-card rounded-2xl border border-border/60 overflow-hidden shrink-0 flex items-center justify-center p-2">
                      {item.product?.image ? (
                        <Image 
                          src={item.product.image} 
                          alt={item.productName} 
                          fill
                          sizes="80px"
                          className="object-contain p-2"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-muted-foreground opacity-40" />
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug">
                            {item.productName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground mt-1">
                            {item.sku && <span>SKU: <strong className="text-foreground">{item.sku}</strong></span>}
                            {item.productId && (
                              <Link 
                                href={`/product/${item.productId}`} 
                                className="text-primary hover:underline inline-flex items-center gap-1"
                              >
                                <span>View in Store</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold text-base sm:text-lg text-primary font-heading">
                            ₹{(item.subtotal || (item.price * item.quantity)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground font-mono bg-background/50 px-3 py-1.5 rounded-lg border border-border/40">
                        <span>Unit Price: ₹{item.price.toFixed(2)}</span>
                        <span>Quantity: <strong className="text-foreground font-bold">{item.quantity}</strong></span>
                        <span>Subtotal: ₹{(item.subtotal || (item.price * item.quantity)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Column: Customer & Cost Summary */}
          <div className="space-y-8">
            
            {/* Customer & Delivery Address */}
            <div className="glass rounded-3xl p-6 border border-border/60 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-border/50 pb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold font-heading text-foreground">Delivery & Contact</h2>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider mb-1">Customer</div>
                  <div className="font-bold text-foreground">{order.customerName}</div>
                  <div className="text-muted-foreground font-mono text-xs mt-0.5">{order.customerEmail}</div>
                  {order.customerPhone && (
                    <div className="text-muted-foreground font-mono text-xs mt-0.5">{order.customerPhone}</div>
                  )}
                </div>

                {order.shippingAddress && (
                  <div className="pt-3 border-t border-border/40">
                    <div className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider mb-1">Shipping Destination</div>
                    <div className="text-foreground font-medium leading-relaxed">{order.shippingAddress}</div>
                  </div>
                )}

                <div className="pt-3 border-t border-border/40 text-xs text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Express Logistics Partner Delivery</span>
                </div>
              </div>
            </div>

            {/* Payment Summary Box */}
            <div className="glass rounded-3xl p-6 border border-border/60 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-border/50 pb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold font-heading text-foreground">Payment Summary</h2>
              </div>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Item Subtotal</span>
                  <span className="font-mono font-semibold text-foreground">₹{order.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Fee</span>
                  <span className={order.shippingAmount === 0 ? "text-emerald-500 font-semibold font-mono" : "font-mono font-semibold text-foreground"}>
                    {order.shippingAmount === 0 ? 'Free Express' : `₹${order.shippingAmount.toFixed(2)}`}
                  </span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount Applied</span>
                    <span className="font-mono font-semibold">-₹{order.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-border/50 pt-4 mt-2">
                  <span className="font-bold text-base text-foreground">Total Paid</span>
                  <span className="font-black text-2xl text-primary font-heading">
                    ₹{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/collections/all"
                  className="w-full bg-card hover:bg-muted border border-border text-foreground font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
