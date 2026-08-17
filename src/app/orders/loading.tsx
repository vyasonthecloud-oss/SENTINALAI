export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-background relative pt-10 pb-24 animate-pulse">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Header Breadcrumbs & Title Skeleton */}
        <div className="mb-10">
          <div className="h-4 w-32 bg-muted/60 rounded-md mb-4"></div>
          <div className="flex justify-between items-end border-b border-border/40 pb-6">
            <div className="space-y-2">
              <div className="h-9 w-64 bg-muted/80 rounded-xl"></div>
              <div className="h-4 w-80 bg-muted/50 rounded-md"></div>
            </div>
            <div className="h-8 w-28 bg-muted/50 rounded-2xl"></div>
          </div>
        </div>

        {/* Skeleton Order Cards */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-3xl p-6 sm:p-8 border border-border/40 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-border/30">
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-muted/70 rounded-md"></div>
                  <div className="h-3.5 w-64 bg-muted/40 rounded-md"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-7 w-20 bg-muted/60 rounded-full"></div>
                  <div className="h-7 w-24 bg-muted/60 rounded-full"></div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-3 flex-wrap">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-16 w-44 bg-muted/40 rounded-2xl"></div>
                  ))}
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                  <div className="h-10 w-28 bg-muted/60 rounded-md"></div>
                  <div className="h-10 w-32 bg-primary/30 rounded-xl"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
