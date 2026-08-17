export default function Loading() {
  return (
    <div className="min-h-[70vh] max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center gap-4">
        {/* Glowing circular loader */}
        <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-foreground font-mono uppercase tracking-widest">
            Sentinal AI
          </p>
          <p className="text-xs text-muted-foreground font-mono">Loading telemetry & components...</p>
        </div>
      </div>
    </div>
  );
}
