export const UserCardSkeleton = () => {
  return (
    <article className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm animate-pulse">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full border border-border bg-muted" />
          <div>
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="mt-2 h-3 w-24 rounded bg-muted/80" />
          </div>
        </div>
        <div className="h-6 w-20 rounded-full bg-muted" />
      </header>

      <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4 text-xs">
        <div className="space-y-2">
          <div className="h-3 w-12 rounded bg-muted/80" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-muted/80" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
        <div className="h-9 rounded bg-muted/80" />
        <div className="h-9 rounded bg-muted" />
      </div>
    </article>
  )
}
