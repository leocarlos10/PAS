import { AdminHeader } from "@/components"

export const ZonasPage = () => {
  return (
    <div className="p-6">
      <AdminHeader 
        title="Gestion de Zonas" 
        description="Monitoreo y control detallado por area." 
        showLive={true} 
      />
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="relative rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="absolute left-0 top-0 h-1 w-full rounded-t-xl bg-success" />
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted">
                <span className="material-symbols-outlined text-[28px]">meeting_room</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Entrada principal</h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold tracking-wide">ZONA 1</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>Modo Manual</span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-danger px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10">
              <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
              Desarmar
            </button>
          </header>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 rounded-lg border border-border bg-background/40 p-4">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                <span className="material-symbols-outlined text-[20px] text-muted-foreground">sensors</span>
                Estado de Sensores
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-border/60 bg-card p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    <div>
                      <div className="text-sm font-medium">S01 - Magnetico Puerta</div>
                      <div className="text-xs text-muted-foreground">Ultima vez: hace 2 min</div>
                    </div>
                  </div>
                  <span className="text-sm text-success">Sin novedad</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-border/60 bg-card p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-warning" />
                    <div>
                      <div className="text-sm font-medium">S02 - Movimiento PIR</div>
                      <div className="text-xs text-muted-foreground">Ultima vez: ahora</div>
                    </div>
                  </div>
                  <span className="text-sm text-warning-muted">Activo</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-lg border border-border bg-background/40 p-4">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                <span className="material-symbols-outlined text-[20px] text-muted-foreground">history</span>
                Actividad
              </h3>
              <div className="relative space-y-4 pl-6">
                <div className="absolute left-2 top-2 h-[calc(100%-16px)] w-px bg-border" />
                <div className="relative flex gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full border-2 border-warning bg-card" />
                  <div>
                    <div className="text-sm">Movimiento detectado S02</div>
                    <div className="text-[10px] uppercase text-muted-foreground">10:42 AM</div>
                  </div>
                </div>
                <div className="relative flex gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full border-2 border-success bg-card" />
                  <div>
                    <div className="text-sm">Zona armada (Manual)</div>
                    <div className="text-[10px] uppercase text-muted-foreground">08:00 AM</div>
                  </div>
                </div>
                <div className="relative flex gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full border-2 border-border bg-card" />
                  <div>
                    <div className="text-sm text-muted-foreground">Mantenimiento S01</div>
                    <div className="text-[10px] uppercase text-muted-foreground">AYER, 22:15 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-6 flex flex-col gap-4 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted">
                <span className="material-symbols-outlined text-[16px] text-muted-foreground">schedule</span>
              </div>
              <div>
                <div className="text-sm">Activacion automatica: 6:00 PM — 6:00 AM</div>
                <div className="text-[10px] uppercase text-muted-foreground">TODOS LOS DIAS</div>
              </div>
            </div>
            <button className="rounded border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted">
              Editar horario
            </button>
          </footer>
        </article>

        <article className="relative rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="absolute left-0 top-0 h-1 w-full rounded-t-xl bg-border" />
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted">
                <span className="material-symbols-outlined text-[28px]">desk</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Area secretaria</h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold tracking-wide">ZONA 2</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>Modo Automatico</span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm text-success-foreground transition-colors hover:bg-success-muted">
              <span className="material-symbols-outlined text-[20px]">shield</span>
              Armar Zona
            </button>
          </header>

          <div className="mt-6 grid grid-cols-1 gap-6 opacity-70 lg:grid-cols-5">
            <div className="lg:col-span-3 rounded-lg border border-border bg-background/40 p-4">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                <span className="material-symbols-outlined text-[20px] text-muted-foreground">sensors</span>
                Estado de Sensores
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-border/60 bg-card p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-border" />
                    <div>
                      <div className="text-sm font-medium">S03 - Ventana Norte</div>
                      <div className="text-xs text-muted-foreground">Inactivo (Zona desarmada)</div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">-</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-border/60 bg-card p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-border" />
                    <div>
                      <div className="text-sm font-medium">S04 - Movimiento PIR</div>
                      <div className="text-xs text-muted-foreground">Inactivo (Zona desarmada)</div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">-</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-lg border border-border bg-background/40 p-4">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                <span className="material-symbols-outlined text-[20px] text-muted-foreground">history</span>
                Actividad
              </h3>
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <span className="material-symbols-outlined text-[32px]">pending</span>
                <span className="text-sm">Sin actividad reciente</span>
              </div>
            </div>
          </div>

          <footer className="mt-6 flex flex-col gap-4 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted">
                <span className="material-symbols-outlined text-[16px] text-muted-foreground">schedule</span>
              </div>
              <div>
                <div className="text-sm">Activacion automatica: 8:00 PM — 7:00 AM</div>
                <div className="text-[10px] uppercase text-muted-foreground">LUNES A VIERNES</div>
              </div>
            </div>
            <button className="rounded border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted">
              Editar horario
            </button>
          </footer>
        </article>
      </section>
    </div>
  )
}
