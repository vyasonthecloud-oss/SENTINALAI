import { getAuthenticatedAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AdminNav } from '@/components/AdminNav';
import { StatusUpdater } from '../StatusUpdater';
import { 
  ChevronLeft, 
  CreditCard, 
  Receipt, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';
import { PaymentStatus, OrderStatus } from '@/types/database';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Admin Order #${resolvedParams.id.substring(0, 8)} | Sentinel AI`,
    description: 'Admin order management, customer verification, and logistics fulfillment.',
  };
}

function PaymentBadge({ status }: { status: string }) {
  switch (status) {
    case PaymentStatus.PAID:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Paid
        </span>
      );
    case PaymentStatus.FAILED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" />
          Failed
        </span>
      );
    case PaymentStatus.REFUNDED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
          <AlertCircle className="w-3.5 h-3.5" />
          Refunded
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
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Delivered
        </span>
      );
    case OrderStatus.SHIPPED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <Truck className="w-3.5 h-3.5" />
          Shipped / In Transit
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

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Server-side ADMIN authorization verification
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect('/login?redirect=/admin/orders');
  }

  const resolvedParams = await params;

  // 2. Fetch Order from DB
  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
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

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans min-h-screen">
      <AdminNav />

      {/* Breadcrumbs & Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="inline-flex items-center text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <Link
              href="/admin"
              className="inline-flex items-center text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              Products List
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <PaymentBadge status={order.paymentStatus} />
            <FulfillmentBadge status={order.orderStatus} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Order Reference</span>
              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-bold">
                ID: {order.id}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading mt-1">
              Manage Order <span className="text-primary font-mono">#{order.id.substring(0, 8)}</span>
            </h1>
          </div>

          <div className="font-mono text-xs text-muted-foreground flex flex-col md:items-end gap-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Created: {new Date(order.createdAt).toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[11px]">
              Last Modified: {new Date(order.updatedAt).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Items & Status Control */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Status Workflow Action Box */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-border/60 shadow-sm relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div>
                <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" /> Fulfillment Lifecycle Control
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update logistics state according to strict state-machine transition flow.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <FulfillmentBadge status={order.orderStatus} />
              </div>
            </div>

            {/* Interactive Status Updater */}
            <StatusUpdater orderId={order.id} currentStatus={order.orderStatus} />

            {/* Lifecycle Timestamps Timeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/40 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-background/50 border border-border/40">
                <span className="text-[10px] text-muted-foreground block uppercase">Placed</span>
                <span className="font-semibold text-foreground">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-background/50 border border-border/40">
                <span className="text-[10px] text-muted-foreground block uppercase">Payment Paid</span>
                <span className={order.paidAt ? "font-semibold text-emerald-400" : "text-muted-foreground"}>
                  {order.paidAt ? new Date(order.paidAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Unpaid'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-background/50 border border-border/40">
                <span className="text-[10px] text-muted-foreground block uppercase">Shipped</span>
                <span className={order.shippedAt ? "font-semibold text-cyan-400" : "text-muted-foreground"}>
                  {order.shippedAt ? new Date(order.shippedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Pending'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-background/50 border border-border/40">
                <span className="text-[10px] text-muted-foreground block uppercase">Delivered / Closed</span>
                <span className={order.deliveredAt ? "font-semibold text-emerald-400" : order.cancelledAt ? "font-semibold text-rose-400" : "text-muted-foreground"}>
                  {order.deliveredAt 
                    ? new Date(order.deliveredAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                    : (order.cancelledAt ? 'Cancelled' : 'In Progress')}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Line Items */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-border/60 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" /> Snapshot Order Items ({order.items.length})
              </h2>
              <span className="text-xs font-mono text-muted-foreground">Immutable History</span>
            </div>

            <div className="divide-y divide-border/40">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                  <div className="relative w-16 h-16 bg-card rounded-2xl border border-border/60 overflow-hidden shrink-0 flex items-center justify-center p-2">
                    {item.product?.image ? (
                      <Image 
                        src={item.product.image} 
                        alt={item.productName} 
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-muted-foreground opacity-40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1">
                          {item.productName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground mt-0.5">
                          {item.sku && <span>SKU: <strong className="text-foreground">{item.sku}</strong></span>}
                          {item.productId && <span>Product ID: {item.productId.substring(0, 8)}...</span>}
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className="font-bold text-base text-primary">
                          ₹{(item.subtotal || (item.price * item.quantity)).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground font-mono bg-background/50 px-3 py-1.5 rounded-lg border border-border/40">
                      <span>Unit Price: ₹{item.price.toFixed(2)}</span>
                      <span>Quantity: <strong className="text-foreground font-bold">{item.quantity}</strong></span>
                      <span>Item Subtotal: ₹{(item.subtotal || (item.price * item.quantity)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Customer Details & Financial Breakdown */}
        <div className="space-y-8">
          
          {/* Customer & Delivery Information */}
          <div className="glass rounded-3xl p-6 border border-border/60 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border/50 pb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold font-heading text-foreground">Customer Profile</h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <div className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider mb-1">Customer Name</div>
                <div className="font-bold text-foreground text-base">{order.customerName}</div>
                <div className="text-muted-foreground font-mono text-xs mt-0.5">{order.customerEmail}</div>
                {order.customerPhone && (
                  <div className="text-muted-foreground font-mono text-xs mt-0.5">{order.customerPhone}</div>
                )}
              </div>

              <div className="pt-3 border-t border-border/40">
                <div className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider mb-1">Account Relationship</div>
                {order.user ? (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                      Registered User ({order.user.role})
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground font-mono text-xs">Guest Checkout</span>
                )}
              </div>

              {order.shippingAddress && (
                <div className="pt-3 border-t border-border/40">
                  <div className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider mb-1">Shipping Destination</div>
                  <div className="text-foreground font-medium leading-relaxed bg-background/50 p-3 rounded-xl border border-border/40">
                    {order.shippingAddress}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Gateway Identifiers */}
          <div className="glass rounded-3xl p-6 border border-border/60 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border/50 pb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold font-heading text-foreground">Payment & Razorpay</h2>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div>
                <span className="text-muted-foreground text-[10px] uppercase block mb-1">Payment Status</span>
                <PaymentBadge status={order.paymentStatus} />
              </div>

              {order.razorpayOrderId && (
                <div className="pt-2 border-t border-border/40">
                  <span className="text-muted-foreground text-[10px] uppercase block mb-1">Razorpay Order ID</span>
                  <span className="text-foreground font-bold bg-background/60 px-2.5 py-1 rounded-lg border border-border/50 block truncate">
                    {order.razorpayOrderId}
                  </span>
                </div>
              )}

              {order.razorpayPaymentId && (
                <div className="pt-2 border-t border-border/40">
                  <span className="text-muted-foreground text-[10px] uppercase block mb-1">Razorpay Payment ID</span>
                  <span className="text-emerald-400 font-bold bg-background/60 px-2.5 py-1 rounded-lg border border-border/50 block truncate">
                    {order.razorpayPaymentId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="glass rounded-3xl p-6 border border-border/60 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border/50 pb-4">
              <Receipt className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold font-heading text-foreground">Financial Ledger</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-foreground">₹{order.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-mono font-semibold text-foreground">
                  {order.shippingAmount === 0 ? '₹0.00 (Free)' : `₹${order.shippingAmount.toFixed(2)}`}
                </span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount</span>
                  <span className="font-mono font-semibold">-₹{order.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-border/50 pt-4 mt-2">
                <span className="font-bold text-base text-foreground">Total Revenue</span>
                <span className="font-black text-2xl text-primary font-heading">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
