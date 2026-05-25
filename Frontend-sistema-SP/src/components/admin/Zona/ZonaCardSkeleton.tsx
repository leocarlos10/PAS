export const ZonaCardSkeleton = () => {
  return (
    <article className="relative rounded-xl border border-border bg-card p-6 shadow-sm animate-pulse">
      <div className="absolute left-0 top-0 h-1 w-full rounded-t-xl bg-muted" />
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg border border-border bg-muted" />
          <div>
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="mt-2 h-3 w-28 rounded bg-muted/80" />
          </div>
        </div>
        <div className="h-9 w-32 rounded-lg bg-muted" />
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-lg border border-border bg-background/40 p-4">
          <div className="mb-4 h-5 w-36 rounded bg-muted" />
          <div className="space-y-3">
            <div className="h-14 rounded-md border border-border/60 bg-card" />
            <div className="h-14 rounded-md border border-border/60 bg-card" />
          </div>
        </div>
        <div className="lg:col-span-2 rounded-lg border border-border bg-background/40 p-4">
          <div className="mb-4 h-5 w-24 rounded bg-muted" />
          <div className="space-y-4">
            <div className="h-10 rounded bg-muted/80" />
            <div className="h-10 rounded bg-muted/80" />
          </div>
        </div>
      </div>
    </article>
  )
}
