/** Placeholder shown while a timesheet, report or attendance page loads. */
export function PageSkeleton({ label, cards = 4, rows = 6 }: { label: string; cards?: number; rows?: number }) {
  return (
    <div className="mx-auto max-w-7xl animate-pulse" aria-busy="true" aria-label={label}>
      <div className="mb-6 space-y-2">
        <div className="h-8 w-48 rounded-lg bg-mist" />
        <div className="h-4 w-full max-w-xl rounded bg-mist/70" />
      </div>
      <div className="mb-6 h-16 rounded-card border border-mist bg-white shadow-card" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="h-28 rounded-card border border-mist bg-white p-4 shadow-card">
            <div className="h-3 w-24 rounded bg-mist/80" />
            <div className="mt-4 h-7 w-20 rounded bg-mist" />
          </div>
        ))}
      </div>
      <div className="rounded-card border border-mist bg-white shadow-card">
        <div className="h-[4.5rem] border-b border-mist" />
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-mist px-5 py-4 last:border-0">
            <div className="h-4 w-24 rounded bg-mist/80" />
            <div className="h-4 flex-1 rounded bg-mist/60" />
            <div className="hidden h-4 w-28 rounded bg-mist/60 sm:block" />
            <div className="h-6 w-20 rounded-full bg-mist/80" />
          </div>
        ))}
      </div>
    </div>
  );
}
