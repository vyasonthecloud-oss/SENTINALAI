export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12 animate-pulse">
      {/* Breadcrumbs skeleton */}
      <div className="h-4 w-48 bg-muted/60 rounded-md mb-8"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 bg-card/60 p-6 sm:p-12 rounded-3xl border border-border/60">
        {/* Left Column: Image Skeleton */}
        <div className="space-y-4">
          <div className="w-full aspect-square bg-muted/40 rounded-2xl border border-border/40"></div>
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-16 h-16 bg-muted/30 rounded-xl border border-border/30"></div>
            ))}
          </div>
        </div>

        {/* Right Column: Details Skeleton */}
        <div className="space-y-6">
          <div className="h-6 w-36 bg-muted/60 rounded-full"></div>
          <div className="h-10 w-3/4 bg-muted/70 rounded-xl"></div>
          <div className="h-4 w-1/3 bg-muted/40 rounded-md"></div>
          <div className="h-24 bg-muted/30 rounded-2xl border border-border/40"></div>
          <div className="flex gap-4">
            <div className="h-14 flex-1 bg-muted/60 rounded-xl"></div>
            <div className="h-14 flex-1 bg-muted/40 rounded-xl"></div>
          </div>
          <div className="space-y-2 pt-4">
            <div className="h-3.5 bg-muted/40 rounded w-full"></div>
            <div className="h-3.5 bg-muted/40 rounded w-5/6"></div>
            <div className="h-3.5 bg-muted/40 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
