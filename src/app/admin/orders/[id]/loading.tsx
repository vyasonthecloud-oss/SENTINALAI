import { AdminNav } from '@/components/AdminNav';

export default function AdminOrderDetailLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans min-h-screen animate-pulse">
      <AdminNav />

      {/* Header skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-4 w-32 bg-muted/60 rounded"></div>
        <div className="flex justify-between items-end border-b border-border/40 pb-6">
          <div className="h-9 w-64 bg-muted/80 rounded-xl"></div>
          <div className="h-5 w-40 bg-muted/50 rounded"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass rounded-3xl p-8 border border-border/40 space-y-6">
            <div className="h-6 w-48 bg-muted/70 rounded"></div>
            <div className="h-12 bg-muted/40 rounded-xl"></div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-muted/30 rounded-xl"></div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-8 border border-border/40 space-y-4">
            <div className="h-6 w-40 bg-muted/70 rounded"></div>
            {[1, 2].map((j) => (
              <div key={j} className="h-20 bg-muted/30 rounded-2xl"></div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass rounded-3xl p-6 border border-border/40 space-y-4">
            <div className="h-5 w-36 bg-muted/70 rounded"></div>
            <div className="h-24 bg-muted/30 rounded-xl"></div>
          </div>

          <div className="glass rounded-3xl p-6 border border-border/40 space-y-4">
            <div className="h-5 w-36 bg-muted/70 rounded"></div>
            <div className="h-20 bg-muted/30 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
