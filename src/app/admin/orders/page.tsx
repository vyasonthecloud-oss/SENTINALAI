import { getAuthenticatedAdmin, getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { AdminNav } from '@/components/AdminNav';
import { AdminAccessRequired } from '@/components/AdminAccessRequired';
import { 
  ShoppingBag, 
  Calendar, 
  IndianRupee, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  ChevronRight, 
  AlertCircle
} from 'lucide-react';
import { Metadata } from 'next';
import { PaymentStatus, OrderStatus } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Orders Dashboard | Sentinel AI',
  description: 'Manage e-commerce orders, delivery fulfillment workflows, and customer transactions.',
};

function PaymentBadge({ status }: { status: string }) {
  switch (status) {
    case PaymentStatus.PAID:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" />
          Paid
        </span>
      );
    case PaymentStatus.FAILED:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/30">
          <XCircle className="w-3 h-3" />
          Failed
        </span>
      );
    case PaymentStatus.REFUNDED:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
          <AlertCircle className="w-3 h-3" />
          Refunded
        </span>
      );
    case PaymentStatus.PENDING:
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
  }
}

function FulfillmentBadge({ status }: { status: string }) {
  switch (status) {
    case OrderStatus.DELIVERED:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" />
          Delivered
        </span>
      );
    case OrderStatus.SHIPPED:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <Truck className="w-3 h-3" />
          Shipped
        </span>
      );
    case OrderStatus.PROCESSING:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <Package className="w-3 h-3" />
          Processing
        </span>
      );
    case OrderStatus.CANCELLED:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/30">
          <XCircle className="w-3 h-3" />
          Cancelled
        </span>
      );
    case OrderStatus.PENDING:
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
          <Clock className="w-3 h-3" />
          Placed
        </span>
      );
  }
}

interface AdminOrdersPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  // 1. Verify Server-Side ADMIN Authorization
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    const user = await getAuthenticatedUser();
    return <AdminAccessRequired currentEmail={user?.email} />;
  }

  const { q = '', status = 'ALL' } = await searchParams;
  const searchQuery = q.trim();
  const filterStatus = status.toUpperCase();

  // 2. Compute Summary Metrics (All Orders in DB)
  const allOrders = await prisma.order.findMany({
    select: {
      id: true,
      totalAmount: true,
      paymentStatus: true,
      orderStatus: true,
      createdAt: true,
    },
  });

  const totalOrdersCount = allOrders.length;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayOrdersCount = allOrders.filter(
    (o) => new Date(o.createdAt) >= startOfToday
  ).length;

  const totalRevenue = allOrders
    .filter((o) => o.paymentStatus === PaymentStatus.PAID)
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const pendingCount = allOrders.filter((o) => o.orderStatus === OrderStatus.PENDING).length;
  const processingCount = allOrders.filter((o) => o.orderStatus === OrderStatus.PROCESSING).length;
  const shippedCount = allOrders.filter((o) => o.orderStatus === OrderStatus.SHIPPED).length;
  const deliveredCount = allOrders.filter((o) => o.orderStatus === OrderStatus.DELIVERED).length;
  const cancelledCount = allOrders.filter((o) => o.orderStatus === OrderStatus.CANCELLED).length;

  // 3. Build Filter & Search Query
  const whereClause: Record<string, unknown> = {};

  if (filterStatus !== 'ALL') {
    whereClause.orderStatus = filterStatus;
  }

  if (searchQuery) {
    whereClause.OR = [
      { id: { contains: searchQuery } },
      { customerName: { contains: searchQuery } },
      { customerEmail: { contains: searchQuery } },
    ];
  }

  // 4. Fetch Filtered Orders
  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
    },
  });

  const filterTabs = [
    { label: 'All', value: 'ALL', count: totalOrdersCount },
    { label: 'Pending', value: OrderStatus.PENDING, count: pendingCount },
    { label: 'Processing', value: OrderStatus.PROCESSING, count: processingCount },
    { label: 'Shipped', value: OrderStatus.SHIPPED, count: shippedCount },
    { label: 'Delivered', value: OrderStatus.DELIVERED, count: deliveredCount },
    { label: 'Cancelled', value: OrderStatus.CANCELLED, count: cancelledCount },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans min-h-screen">
      {/* Navigation Header */}
      <AdminNav />

      {/* 5. Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5 mb-8">
        {/* Total Orders */}
        <div className="glass p-4 rounded-2xl border border-border/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total</span>
            <ShoppingBag className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground font-heading">{totalOrdersCount}</div>
          <div className="text-[10px] text-muted-foreground font-mono">Lifetime Orders</div>
        </div>

        {/* Today's Orders */}
        <div className="glass p-4 rounded-2xl border border-border/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-mono uppercase tracking-wider">Today</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-heading">{todayOrdersCount}</div>
          <div className="text-[10px] text-muted-foreground font-mono">Placed Today</div>
        </div>

        {/* Total Revenue */}
        <div className="glass p-4 rounded-2xl border border-border/60 shadow-sm space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-mono uppercase tracking-wider">Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-heading truncate">
            ₹{totalRevenue.toFixed(0)}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">Paid GMV</div>
        </div>

        {/* Pending Orders */}
        <div className="glass p-4 rounded-2xl border border-border/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-mono uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-heading">{pendingCount}</div>
          <div className="text-[10px] text-muted-foreground font-mono">Awaiting Action</div>
        </div>

        {/* Processing */}
        <div className="glass p-4 rounded-2xl border border-border/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-mono uppercase tracking-wider">Processing</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 font-heading">{processingCount}</div>
          <div className="text-[10px] text-muted-foreground font-mono">In Packaging</div>
        </div>

        {/* Shipped */}
        <div className="glass p-4 rounded-2xl border border-border/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-mono uppercase tracking-wider">Shipped</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-heading">{shippedCount}</div>
          <div className="text-[10px] text-muted-foreground font-mono">In Transit</div>
        </div>

        {/* Delivered */}
        <div className="glass p-4 rounded-2xl border border-border/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-mono uppercase tracking-wider">Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-heading">{deliveredCount}</div>
          <div className="text-[10px] text-muted-foreground font-mono">Completed</div>
        </div>
      </div>

      {/* 6. Controls: Search & Filter Pills */}
      <div className="glass rounded-3xl p-6 border border-border/60 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input Form */}
          <form method="GET" action="/admin/orders" className="relative flex-1 max-w-md">
            <input type="hidden" name="status" value={status} />
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search by Order ID, Customer, or Email..."
              className="w-full bg-background/60 border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </form>

          {/* Quick Stats Indicator */}
          <div className="text-xs font-mono text-muted-foreground flex items-center gap-2">
            <span>Showing <strong className="text-foreground">{orders.length}</strong> of {totalOrdersCount} orders</span>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-border/40">
          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {filterTabs.map((tab) => {
            const isActive = filterStatus === tab.value;
            const queryParams = new URLSearchParams();
            if (searchQuery) queryParams.set('q', searchQuery);
            if (tab.value !== 'ALL') queryParams.set('status', tab.value);
            const href = `/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

            return (
              <Link
                key={tab.value}
                href={href}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/20 text-white' : 'bg-background/80 text-muted-foreground'}`}>
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 7. Orders Table */}
      {orders.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border border-border/60 max-w-lg mx-auto space-y-4 shadow-sm my-12">
          <div className="w-16 h-16 bg-muted/60 rounded-2xl flex items-center justify-center mx-auto text-muted-foreground">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">No matching orders found</h3>
            <p className="text-xs text-muted-foreground">
              {searchQuery || filterStatus !== 'ALL'
                ? 'Try adjusting your search query or status filter.'
                : 'No customer orders have been recorded in the database yet.'}
            </p>
          </div>
          {(searchQuery || filterStatus !== 'ALL') && (
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2"
            >
              <span>Reset all filters</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="glass rounded-3xl border border-border/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4 font-semibold">Order ID</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Items</th>
                  <th className="py-3.5 px-4 font-semibold">Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Payment</th>
                  <th className="py-3.5 px-4 font-semibold">Fulfillment</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {orders.map((order) => {
                  const itemCount = order.items.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors group">
                      {/* Order ID */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono">
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <span>#{order.id.substring(0, 8)}</span>
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-foreground">{order.customerName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[180px]">
                          {order.customerEmail}
                        </div>
                      </td>

                      {/* Item count */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-muted-foreground">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono font-bold text-foreground text-sm">
                        ₹{order.totalAmount.toFixed(2)}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <PaymentBadge status={order.paymentStatus} />
                      </td>

                      {/* Order Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <FulfillmentBadge status={order.orderStatus} />
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-muted-foreground text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="bg-card hover:bg-muted border border-border text-foreground hover:text-primary font-bold px-3 py-1.5 rounded-xl transition-colors text-[11px] inline-flex items-center gap-1"
                          >
                            <span>Manage</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
