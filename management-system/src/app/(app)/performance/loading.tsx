/** Skeleton shown while scorecards are calculated. */
export default function PerformanceLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading performance">
      <div className="mb-6 space-y-2">
        <div className="h-4 w-20 rounded bg-mist/70" />
        <div className="h-8 w-56 rounded-lg bg-mist" />
        <div className="h-4 w-full max-w-2xl rounded bg-mist/70" />
      </div>
      <div className="mb-6 h-10 w-48 rounded-xl bg-mist/80" />
      <div className="rounded-card border border-mist bg-white">
        <div className="flex items-center gap-4 border-b border-mist px-6 py-4">
          <div className="size-14 rounded-full bg-mist" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-mist" />
            <div className="h-3 w-28 rounded bg-mist/70" />
          </div>
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <div className="h-64 rounded-xl bg-cloud" />
          <div className="space-y-5">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-1/3 rounded bg-mist/80" />
                <div className="h-2 rounded-full bg-mist/70" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
