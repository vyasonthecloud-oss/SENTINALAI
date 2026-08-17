import { AdminNav } from '@/components/AdminNav';

export default function AdminOrdersLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans min-h-screen animate-pulse">
      <AdminNav />

      {/* KPI Skeletons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5 mb-8">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="glass p-4 rounded-2xl border border-border/40 space-y-2">
            <div className="h-3 w-12 bg-muted/60 rounded"></div>
            <div className="h-7 w-16 bg-muted/80 rounded-md"></div>
            <div className="h-2.5 w-20 bg-muted/40 rounded"></div>
          </div>
        ))}
      </div>

      {/* Filter / Search Skeleton */}
      <div className="glass rounded-3xl p-6 border border-border/40 space-y-4 mb-6">
        <div className="h-10 w-full max-w-md bg-muted/50 rounded-xl"></div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((j) => (
            <div key={j} className="h-7 w-20 bg-muted/40 rounded-xl"></div>
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="glass rounded-3xl border border-border/40 overflow-hidden p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((k) => (
          <div key={k} className="flex justify-between items-center py-3 border-b border-border/20 last:border-0">
            <div className="h-5 w-28 bg-muted/60 rounded"></div>
            <div className="h-5 w-36 bg-muted/50 rounded"></div>
            <div className="h-5 w-16 bg-muted/50 rounded"></div>
            <div className="h-6 w-20 bg-muted/60 rounded-full"></div>
            <div className="h-7 w-20 bg-muted/70 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
