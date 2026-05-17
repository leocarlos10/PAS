import { AdminHeader } from "@/components/admin/Layout/AdminHeader"
import { useHistorial } from "@/hooks"
import type { EventoHistorialDTO } from "@/types/requestType/evento/EventoHistorialDTO"
import { useEffect, useState } from "react"

const tipoStyles: Record<string, string> = {
  Intrusion: "bg-danger/15 text-danger-muted border border-danger/30",
  Desactivacion: "bg-neutral/15 text-neutral-muted border border-neutral/30",
  "Fallo Sensor": "bg-warning/15 text-warning-muted border border-warning/30",
  Activacion: "bg-success/15 text-success-muted border border-success/30",
}

const severidadStyles: Record<string, string> = {
  Alta: "bg-danger/15 text-danger-muted border border-danger/30",
  Media: "bg-warning/15 text-warning-muted border border-warning/30",
  Baja: "bg-info/15 text-info-muted border border-info/30",
}

export const HistorialPage = () => {
  const pageSize = 10
  const [currentPage, setCurrentPage] = useState(1)
  const [eventos, setEventos] = useState<EventoHistorialDTO[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [zonaIdInput, setZonaIdInput] = useState("")
  const [severidadFilter, setSeveridadFilter] = useState("")
  const { GetHistorialPage, loading } = useHistorial()

  const zonaIdFilter = zonaIdInput.trim() ? Number(zonaIdInput) : undefined
  const resolvedZonaId =
    zonaIdFilter && Number.isFinite(zonaIdFilter) ? zonaIdFilter : undefined

  const formatFechaHora = (value: string) => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short",
    })
  }

  useEffect(() => {
    let isMounted = true

    const loadHistorial = async () => {
      const response = await GetHistorialPage(
        currentPage - 1,
        pageSize,
        resolvedZonaId,
        severidadFilter || undefined
      )
      if (!isMounted) return

      if (response?.data) {
        setEventos(response.data.content)
        setTotalElements(response.data.totalElements)
        setTotalPages(Math.max(1, response.data.totalPages))
      } else {
        setEventos([])
        setTotalElements(0)
        setTotalPages(1)
      }
    }

    loadHistorial()

    return () => {
      isMounted = false
    }
  }, [GetHistorialPage, currentPage, pageSize, resolvedZonaId, severidadFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [resolvedZonaId, severidadFilter])

  return (
    <div className="p-6">
      <AdminHeader
        title="Historial"
        description="Eventos recientes del sistema."
      />

      <section className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-lg border border-border bg-muted px-3 py-1 text-sm text-muted-foreground">
              <span className="material-symbols-outlined text-[18px]">search</span>
              <input
                type="text"
                placeholder="Buscar eventos..."
                className="h-4 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                aria-label="Buscar eventos"
                disabled
              />
            </div>
            <input
              type="number"
              inputMode="numeric"
              value={zonaIdInput}
              onChange={(event) => setZonaIdInput(event.target.value)}
              placeholder="Zona ID"
              className="h-9 w-28 rounded-lg border border-border bg-muted px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              aria-label="Filtrar por zona"
            />
            <select
              value={severidadFilter}
              onChange={(event) => setSeveridadFilter(event.target.value)}
              className="h-9 rounded-lg border border-border bg-muted px-3 text-xs text-foreground focus:outline-none"
              aria-label="Filtrar por severidad"
            >
              <option value="">Todas las severidades</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="max-h-[360px] overflow-x-auto overflow-y-auto">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-muted/40">
                <tr className="border-b border-border text-xs font-semibold uppercase text-muted-foreground">
                  <th className="px-4 py-3">Fecha y hora</th>
                  <th className="px-4 py-3">Zona</th>
                  <th className="px-4 py-3">Sensor</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Severidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm text-foreground">
                {loading ? (
                  Array.from({ length: pageSize }).map((_, index) => (
                    <tr key={`historial-skeleton-${index}`}>
                      <td className="px-4 py-3">
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                      </td>
                    </tr>
                  ))
                ) : eventos.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                      colSpan={5}
                    >
                      No hay eventos para mostrar.
                    </td>
                  </tr>
                ) : (
                  eventos.map((evento) => {
                    const sensorLabel = evento.sensorNombre
                      ? `${evento.sensorNombre} (${evento.sensorCodigo})`
                      : evento.sensorCodigo

                    return (
                      <tr key={evento.idEvento}>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatFechaHora(evento.fechaHora)}
                        </td>
                        <td className="px-4 py-3">{evento.zonaNombre}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {sensorLabel}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                              tipoStyles[evento.tipoEvento] ??
                              "bg-neutral/15 text-neutral-muted border border-neutral/30"
                            }`}
                          >
                            {evento.tipoEvento}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                              severidadStyles[evento.severidad] ??
                              "bg-neutral/15 text-neutral-muted border border-neutral/30"
                            }`}
                          >
                            {evento.severidad}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            <span>
              Mostrando {eventos.length} de {totalElements} elementos
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1
                const isActive = pageNumber === currentPage
                return (
                  <button
                    key={`historial-page-${pageNumber}`}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`h-8 min-w-8 rounded border px-2 text-xs font-medium transition-colors ${
                      isActive
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
