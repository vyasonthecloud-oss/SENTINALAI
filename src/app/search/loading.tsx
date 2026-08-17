export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-background relative pt-8 pb-24 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8 space-y-4">
          <div className="h-6 w-44 bg-muted/50 rounded-full"></div>
          <div className="h-10 w-72 bg-muted/70 rounded-xl"></div>
          <div className="h-14 w-full bg-muted/40 rounded-2xl"></div>
          <div className="h-12 w-full bg-muted/30 rounded-2xl"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden border border-border/50 flex flex-col h-80">
              <div className="aspect-square bg-muted/30"></div>
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="h-3 w-16 bg-muted/40 rounded"></div>
                  <div className="h-4 w-full bg-muted/60 rounded"></div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                  <div className="h-5 w-16 bg-muted/60 rounded"></div>
                  <div className="h-8 w-20 bg-muted/40 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
