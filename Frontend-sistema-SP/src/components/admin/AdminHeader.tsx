
type AdminHeaderProps = {
    title: string;
    description: string;
    showLive?: boolean;
}


export const AdminHeader = ({ title, description, showLive }: AdminHeaderProps) => {
  return (
    <header className="mb-6 flex flex-col gap-2 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {showLive && (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              En vivo
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </header>
  )
}
