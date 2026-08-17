export default function OrderDetailLoading() {
  return (
    <div className="min-h-screen bg-background relative pt-8 pb-24 animate-pulse">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-4 w-36 bg-muted/60 rounded-md"></div>
          <div className="flex justify-between items-end border-b border-border/40 pb-6">
            <div className="space-y-2">
              <div className="h-10 w-72 bg-muted/80 rounded-xl"></div>
              <div className="h-4 w-48 bg-muted/40 rounded-md"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-24 bg-muted/60 rounded-full"></div>
              <div className="h-7 w-28 bg-muted/60 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Area Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline Skeleton */}
            <div className="glass rounded-3xl p-8 border border-border/40 space-y-8">
              <div className="h-6 w-48 bg-muted/70 rounded-md"></div>
              <div className="h-12 bg-muted/30 rounded-2xl"></div>
              <div className="h-16 bg-muted/20 rounded-2xl"></div>
            </div>

            {/* Items Skeleton */}
            <div className="glass rounded-3xl p-8 border border-border/40 space-y-6">
              <div className="h-6 w-40 bg-muted/70 rounded-md"></div>
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 items-center py-4 border-b border-border/20 last:border-0">
                  <div className="w-20 h-20 bg-muted/50 rounded-2xl shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 bg-muted/70 rounded-md"></div>
                    <div className="h-4 w-32 bg-muted/40 rounded-md"></div>
                    <div className="h-6 w-24 bg-muted/50 rounded-md"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-8">
            <div className="glass rounded-3xl p-6 border border-border/40 space-y-4">
              <div className="h-5 w-36 bg-muted/70 rounded-md"></div>
              <div className="h-16 bg-muted/30 rounded-xl"></div>
              <div className="h-16 bg-muted/30 rounded-xl"></div>
            </div>

            <div className="glass rounded-3xl p-6 border border-border/40 space-y-4">
              <div className="h-5 w-36 bg-muted/70 rounded-md"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted/40 rounded-md"></div>
                <div className="h-4 bg-muted/40 rounded-md"></div>
                <div className="h-6 bg-muted/60 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
