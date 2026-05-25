import { AdminHeader } from "@/components/admin/Layout/AdminHeader"
import { useHistorial, useZonas } from "@/hooks"
import type { HistorialFilters } from "@/types/requestType/evento/HistorialFilters"
import type { EventoHistorialDTO } from "@/types/requestType/evento/EventoHistorialDTO"
import { useEffect, useMemo, useState } from "react"

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

type FilterKind = "" | "fecha" | "zona" | "tipo" | "sensor"
type DatePreset = "" | "hoy" | "7d" | "30d" | "custom"

const TIPO_EVENTO_OPTIONS = [
  "PUERTA_ABIERTA",
  "MOVIMIENTO_DETECTADO",
  "INTRUSION",
  "ACTIVACION",
  "ARMADA",
  "DESARMADA",
] as const

const tipoStyles: Record<string, string> = {
  Intrusion: "bg-danger/15 text-danger-muted border border-danger/30",
  INTRUSION: "bg-danger/15 text-danger-muted border border-danger/30",
  Desactivacion: "bg-neutral/15 text-neutral-muted border border-neutral/30",
  DESARMADA: "bg-neutral/15 text-neutral-muted border border-neutral/30",
  "Fallo Sensor": "bg-warning/15 text-warning-muted border border-warning/30",
  Activacion: "bg-success/15 text-success-muted border border-success/30",
  ACTIVACION: "bg-success/15 text-success-muted border border-success/30",
  ARMADA: "bg-success/15 text-success-muted border border-success/30",
}

const severidadStyles: Record<string, string> = {
  Alta: "bg-danger/15 text-danger-muted border border-danger/30",
  ALTA: "bg-danger/15 text-danger-muted border border-danger/30",
  Media: "bg-warning/15 text-warning-muted border border-warning/30",
  MEDIA: "bg-warning/15 text-warning-muted border border-warning/30",
  Baja: "bg-info/15 text-info-muted border border-info/30",
  BAJA: "bg-info/15 text-info-muted border border-info/30",
}

const formatDateInput = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const buildDateRange = (
  preset: DatePreset,
  customDesde: string,
  customHasta: string
): Pick<HistorialFilters, "fechaDesde" | "fechaHasta"> => {
  if (!preset) return {}

  const today = new Date()

  if (preset === "hoy") {
    const value = formatDateInput(today)
    return { fechaDesde: value, fechaHasta: value }
  }

  if (preset === "7d") {
    const desde = new Date(today)
    desde.setDate(desde.getDate() - 6)
    return { fechaDesde: formatDateInput(desde), fechaHasta: formatDateInput(today) }
  }

  if (preset === "30d") {
    const desde = new Date(today)
    desde.setDate(desde.getDate() - 29)
    return { fechaDesde: formatDateInput(desde), fechaHasta: formatDateInput(today) }
  }

  return {
    fechaDesde: customDesde || undefined,
    fechaHasta: customHasta || undefined,
  }
}

export const HistorialPage = () => {
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [eventos, setEventos] = useState<EventoHistorialDTO[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [filterKind, setFilterKind] = useState<FilterKind>("")
  const [datePreset, setDatePreset] = useState<DatePreset>("")
  const [customFechaDesde, setCustomFechaDesde] = useState("")
  const [customFechaHasta, setCustomFechaHasta] = useState("")
  const [zonaFilter, setZonaFilter] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")
  const [sensorFilter, setSensorFilter] = useState("")
  const { GetHistorialPage, loading } = useHistorial()
  const { GetAllZonas } = useZonas()
  const [zonasOptions, setZonasOptions] = useState<{ id: number; nombre: string }[]>([])

  const filters = useMemo<HistorialFilters>(() => {
    if (filterKind === "fecha") {
      return buildDateRange(datePreset, customFechaDesde, customFechaHasta)
    }
    if (filterKind === "zona" && zonaFilter) {
      return { zonaId: Number(zonaFilter) }
    }
    if (filterKind === "tipo" && tipoFilter) {
      return { tipoEvento: tipoFilter }
    }
    if (filterKind === "sensor" && sensorFilter.trim()) {
      return { sensorCodigo: sensorFilter.trim() }
    }
    return {}
  }, [
    filterKind,
    datePreset,
    customFechaDesde,
    customFechaHasta,
    zonaFilter,
    tipoFilter,
    sensorFilter,
  ])

  useEffect(() => {
    const loadZonas = async () => {
      const response = await GetAllZonas()
      if (response?.responseCode === 200 && response.data) {
        setZonasOptions(
          response.data.map((zona) => ({ id: zona.id, nombre: zona.nombre }))
        )
      }
    }
    loadZonas()
  }, [GetAllZonas])

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
      const response = await GetHistorialPage(currentPage - 1, pageSize, filters)
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
  }, [GetHistorialPage, currentPage, pageSize, filters])

  useEffect(() => {
    setCurrentPage(1)
  }, [filterKind, datePreset, customFechaDesde, customFechaHasta, zonaFilter, tipoFilter, sensorFilter])

  const handleFilterKindChange = (value: FilterKind) => {
    setFilterKind(value)
    setDatePreset("")
    setCustomFechaDesde("")
    setCustomFechaHasta("")
    setZonaFilter("")
    setTipoFilter("")
    setSensorFilter("")
  }

  const fromItem = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const toItem = Math.min(currentPage * pageSize, totalElements)

  const filterControlClass =
    "h-9 rounded-lg border border-border bg-muted px-3 text-xs text-foreground focus:outline-none"

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

            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setCurrentPage(1)
              }}
              className={`${filterControlClass} min-w-[140px]`}
              aria-label="Cantidad de registros a mostrar"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} registros
                </option>
              ))}
            </select>

            <select
              value={filterKind}
              onChange={(event) => handleFilterKindChange(event.target.value as FilterKind)}
              className={`${filterControlClass} min-w-[160px]`}
              aria-label="Tipo de filtro"
            >
              <option value="">Todos los eventos</option>
              <option value="fecha">Filtrar por fecha</option>
              <option value="zona">Filtrar por zona</option>
              <option value="tipo">Filtrar por tipo</option>
              <option value="sensor">Filtrar por sensor</option>
            </select>

            {filterKind === "fecha" && (
              <>
                <select
                  value={datePreset}
                  onChange={(event) => setDatePreset(event.target.value as DatePreset)}
                  className={`${filterControlClass} min-w-[160px]`}
                  aria-label="Periodo de fecha"
                >
                  <option value="">Seleccionar periodo</option>
                  <option value="hoy">Hoy</option>
                  <option value="7d">Últimos 7 días</option>
                  <option value="30d">Últimos 30 días</option>
                  <option value="custom">Rango personalizado</option>
                </select>
                {datePreset === "custom" && (
                  <>
                    <input
                      type="date"
                      value={customFechaDesde}
                      onChange={(event) => setCustomFechaDesde(event.target.value)}
                      className={filterControlClass}
                      aria-label="Fecha desde"
                    />
                    <input
                      type="date"
                      value={customFechaHasta}
                      onChange={(event) => setCustomFechaHasta(event.target.value)}
                      className={filterControlClass}
                      aria-label="Fecha hasta"
                    />
                  </>
                )}
              </>
            )}

            {filterKind === "zona" && (
              <select
                value={zonaFilter}
                onChange={(event) => setZonaFilter(event.target.value)}
                className={`${filterControlClass} min-w-[160px]`}
                aria-label="Filtrar por zona"
              >
                <option value="">Todas las zonas</option>
                {zonasOptions.map((zona) => (
                  <option key={zona.id} value={zona.id}>
                    {zona.nombre}
                  </option>
                ))}
              </select>
            )}

            {filterKind === "tipo" && (
              <select
                value={tipoFilter}
                onChange={(event) => setTipoFilter(event.target.value)}
                className={`${filterControlClass} min-w-[180px]`}
                aria-label="Filtrar por tipo de evento"
              >
                <option value="">Todos los tipos</option>
                {TIPO_EVENTO_OPTIONS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            )}

            {filterKind === "sensor" && (
              <input
                type="text"
                value={sensorFilter}
                onChange={(event) => setSensorFilter(event.target.value)}
                placeholder="Ej: Z1-MAG-01"
                className={`${filterControlClass} min-w-[140px] placeholder:text-muted-foreground`}
                aria-label="Filtrar por código de sensor"
              />
            )}
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
                          {sensorLabel ?? "—"}
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
                            {evento.severidad ?? "—"}
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
              Mostrando {fromItem}-{toItem} de {totalElements} elementos
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage <= 1 || loading}
                className="h-8 rounded border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1
                const isActive = pageNumber === currentPage
                return (
                  <button
                    key={`historial-page-${pageNumber}`}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    disabled={loading}
                    className={`h-8 min-w-8 rounded border px-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                      isActive
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage >= totalPages || loading}
                className="h-8 rounded border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
