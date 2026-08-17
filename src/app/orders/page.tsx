import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Package, 
  ChevronRight, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  ArrowRight, 
  LogIn, 
  UserCheck, 
  ShieldCheck,
  XCircle,
  Boxes
} from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Orders | Sentinal AI',
  description: 'Track and view your past orders, delivery timeline, and electronic component purchases.',
};

function PaymentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'PAID':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Paid
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" />
          Failed
        </span>
      );
    case 'REFUNDED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
          <AlertCircle className="w-3.5 h-3.5" />
          Refunded
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5" />
          Payment Pending
        </span>
      );
  }
}

function FulfillmentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'DELIVERED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Delivered
        </span>
      );
    case 'SHIPPED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <Truck className="w-3.5 h-3.5" />
          Shipped
        </span>
      );
    case 'PROCESSING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <Package className="w-3.5 h-3.5" />
          Processing
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" />
          Cancelled
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
          <Clock className="w-3.5 h-3.5" />
          Order Placed
        </span>
      );
  }
}

export default async function OrdersPage() {
  const user = await getAuthenticatedUser();

  // 1. Unauthorized State
  if (!user) {
    return (
      <div className="min-h-[80vh] bg-background relative flex items-center justify-center p-4">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>
        
        <div className="max-w-md w-full glass rounded-3xl p-8 border border-border/80 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
          
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20 text-primary">
            <LogIn className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-heading text-foreground">Sign In to View Orders</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Please authenticate to access your personal order history, live dispatch status, and download invoices.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/login?redirect=/orders"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign In to Account</span>
            </Link>

            <Link
              href="/signup?redirect=/orders"
              className="w-full bg-card hover:bg-muted border border-border text-foreground font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>Create New Account</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Encrypted & Verified Session</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Fetch authenticated user's orders directly from Database
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: user.id },
        { customerEmail: user.email.toLowerCase() },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            select: {
              image: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-background relative pt-10 pb-24">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-10">
          <div className="text-xs sm:text-sm text-muted-foreground mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>&gt;</span>
            <Link href="/collections/all" className="hover:text-primary transition-colors">Products Catalog</Link>
            <span>&gt;</span>
            <span className="text-foreground font-semibold">My Orders</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-heading">
                Order <span className="text-gradient">History</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Manage your hardware purchases and track delivery progress in real-time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/collections/all"
                className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground px-3.5 py-2 rounded-2xl border border-primary/20 text-xs font-bold transition-all shadow-sm"
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Browse Products</span>
              </Link>
              <div className="glass px-4 py-2 rounded-2xl border border-border/50 flex items-center gap-3 w-fit">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-mono font-bold text-foreground">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Found
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Empty Orders State */}
        {orders.length === 0 ? (
          <div className="glass rounded-3xl p-12 md:p-16 border border-border/60 text-center space-y-6 max-w-2xl mx-auto shadow-sm">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20">
              <ShoppingBag className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground font-heading">No Orders Yet</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                You haven&apos;t placed any component orders yet. Explore our high-performance electronic components and robotics catalog to get started.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/collections/all"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <span>Browse Components</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* 4. Orders List View */
          <div className="space-y-6">
            {orders.map((order) => {
              const totalItemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

              return (
                <div 
                  key={order.id}
                  className="glass rounded-3xl p-6 sm:p-8 border border-border/60 hover:border-primary/40 transition-all duration-300 shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-accent/40 to-primary/30 group-hover:from-primary group-hover:to-accent transition-all duration-500"></div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/40">
                    {/* Order Metadata */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                          Order ID:
                        </span>
                        <span className="font-mono text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
                          {order.id}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground font-mono pt-1">
                        Shipping to: <span className="text-foreground font-semibold">{order.customerName}</span> ({order.customerEmail})
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center gap-3">
                      <PaymentStatusBadge status={order.paymentStatus} />
                      <FulfillmentStatusBadge status={order.orderStatus} />
                    </div>
                  </div>

                  {/* Order Items Snapshot & Price Breakdown */}
                  <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Item Thumbnails and Names */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                        <Package className="w-4 h-4 text-primary" />
                        <span>{totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {order.items.slice(0, 4).map((item) => (
                          <div 
                            key={item.id}
                            className="relative flex items-center gap-3 bg-background/50 border border-border/50 rounded-2xl p-2 pr-4 hover:border-primary/30 transition-colors"
                          >
                            <div className="relative w-12 h-12 bg-card rounded-xl border border-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.product?.image ? (
                                <Image 
                                  src={item.product.image} 
                                  alt={item.productName} 
                                  fill
                                  sizes="48px"
                                  className="object-contain p-1"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-muted-foreground/50" />
                              )}
                            </div>
                            <div className="max-w-[180px]">
                              <p className="text-xs font-bold text-foreground line-clamp-1 leading-tight">{item.productName}</p>
                              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                Qty: {item.quantity} × ₹{item.price.toFixed(0)}
                              </p>
                            </div>
                          </div>
                        ))}

                        {order.items.length > 4 && (
                          <div className="px-3 py-2 rounded-2xl bg-muted/40 border border-border/50 text-xs font-mono text-muted-foreground flex items-center justify-center">
                            +{order.items.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total and Action */}
                    <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-border/40 shrink-0 gap-4">
                      <div className="text-left md:text-right">
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block">Total Amount</span>
                        <span className="text-2xl font-black text-primary font-heading">
                          ₹{order.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] text-sm group/btn"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
