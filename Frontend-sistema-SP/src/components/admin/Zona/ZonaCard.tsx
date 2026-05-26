import { ToggleZonaActivaApi, UpdateProgramacionHorariaApi } from "@/api/zonas.api"
import { useAuthContext } from "@/context/auth.context"
import type { ZonaResponse, ProgramacionHoraria, ProgramacionHorariaRequest } from "@/types"
import { getErrorToastType, handleApiError } from "@/utils/apiErrorHandler"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { ProgramacionModal } from "./ProgramacionModal"

interface SseEvento {
  id: number
  tipoEvento: string
  severidad: string
  fechaHora: string
  zonaId: number
  sensorId: number | null
  payload: string
}

type ZonaCardProps = {
  zona: ZonaResponse
  index: number
  onZonaUpdated: (zona: ZonaResponse) => void
  sseEventos?: SseEvento[]
  sseConnected?: boolean
}

const zoneIcons = ["meeting_room", "desk", "warehouse", "door_front"]

const formatUltimoReporte = (fecha?: string) => {
  if (!fecha) return "Sin reportes"
  const date = new Date(fecha)
  if (Number.isNaN(date.getTime())) return "Sin reportes"
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const ZonaCard = ({ zona, index, onZonaUpdated, sseEventos = [], sseConnected = false }: ZonaCardProps) => {
  const { token } = useAuthContext()
  const [currentZona, setCurrentZona] = useState(zona)
  const [isLoading, setIsLoading] = useState(false)
  const [programacion, setProgramacion] = useState<ProgramacionHoraria | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProgramacionLoading, setIsProgramacionLoading] = useState(false)
  const [eventoActual, setEventoActual] = useState<SseEvento | null>(null)

  useEffect(() => {
    setCurrentZona(zona)
  }, [zona])

  // Filtrar evento más reciente para esta zona
  useEffect(() => {
    if (sseEventos && sseEventos.length > 0) {
      const eventoZona = sseEventos.find(e => e.zonaId === zona.id)
      if (eventoZona) {
        setEventoActual(eventoZona)
      }
    }
  }, [sseEventos, zona.id])

  const isArmada = currentZona.activa
  const icon = zoneIcons[index % zoneIcons.length]

  const handleToggle = async () => {
    if (!token) {
      toast.error("No autorizado: token no disponible")
      return
    }

    try {
      setIsLoading(true)
      const newActiva = !currentZona.activa
      const response = await ToggleZonaActivaApi(currentZona.id, newActiva, token)
      const result = handleApiError(response)

      if (result.success && response.data) {
        setCurrentZona(response.data)
        onZonaUpdated(response.data)
        toast.success(newActiva ? "Zona armada correctamente" : "Zona desarmada correctamente")
      } else {
        const toastType = getErrorToastType(result.statusCode)
        toast[toastType](result.message)
      }
    } catch (error) {
      console.error("Error al cambiar estado de la zona:", error)
      toast.error("Error al cambiar el estado de la zona")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProgramacion = async (nuevaProgramacion: ProgramacionHorariaRequest) => {
    if (!token) {
      toast.error("No autorizado: token no disponible")
      return
    }

    try {
      setIsProgramacionLoading(true)
      const response = await UpdateProgramacionHorariaApi(currentZona.id, nuevaProgramacion, token)
      const result = handleApiError(response)

      if (result.success && response.data) {
        setProgramacion(response.data)
        toast.success("Programación de horarios actualizada correctamente")
      } else {
        const toastType = getErrorToastType(result.statusCode)
        toast[toastType](result.message || "Error al guardar la programación")
      }
    } catch (error) {
      console.error("Error al guardar programación:", error)
      toast.error("Error al guardar la programación")
      throw error
    } finally {
      setIsProgramacionLoading(false)
    }
  }

  return (
    <article className="relative rounded-xl border border-border bg-card p-6 shadow-sm">
      <div
        className={`absolute left-0 top-0 h-1 w-full rounded-t-xl ${
          isArmada ? "bg-success" : "bg-border"
        }`}
      />
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted">
            <span className="material-symbols-outlined text-[28px]">{icon}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold">{currentZona.nombre}</h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold tracking-wide">ZONA {currentZona.id}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>Modo {currentZona.modoControl ?? "Manual"}</span>
            </div>
            {currentZona.ubicacion && (
              <p className="mt-1 text-xs text-muted-foreground">{currentZona.ubicacion}</p>
            )}
          </div>
        </div>
        {isArmada ? (
          <button
            className="flex items-center gap-2 rounded-lg border border-danger px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10 disabled:opacity-50 cursor-pointer"
            onClick={handleToggle}
            disabled={isLoading}
          >
            <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
            Desarmar
          </button>
        ) : (
          <button
            className="flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm text-success-foreground transition-colors hover:bg-success-muted disabled:opacity-50 cursor-pointer"
            onClick={handleToggle}
            disabled={isLoading}
          >
            <span className="material-symbols-outlined text-[20px]">shield</span>
            Armar Zona
          </button>
        )}
      </header>

      <div className={`mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5 ${!isArmada ? "opacity-70" : ""}`}>
        <div className="lg:col-span-3 rounded-lg border border-border bg-background/40 p-4">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <span className="material-symbols-outlined text-[20px] text-muted-foreground">sensors</span>
            Estado de Sensores
          </h3>
          <div className="space-y-3">
            {(currentZona.sensores ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Sin sensores registrados</p>
            )}
            {(currentZona.sensores ?? []).map((sensor) => {
              const eventoSensor = eventoActual?.sensorId === sensor.id
              
              return (
              <div
                key={sensor.id}
                className={`flex items-center justify-between rounded-md border p-3 transition-colors ${
                  eventoSensor
                    ? "border-warning/60 bg-warning/5 animate-pulse"
                    : "border-border/60 bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full transition-colors ${
                      eventoSensor
                        ? "bg-warning animate-pulse"
                        : isArmada && sensor.activo ? "bg-success" : "bg-border"
                    }`}
                  />
                  <div>
                    <div className="text-sm font-medium">
                      {sensor.codigo} - {sensor.tipoSensor}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {eventoSensor
                        ? `🔴 Evento: ${eventoActual.tipoEvento}`
                        : isArmada
                        ? `Ultima vez: ${formatUltimoReporte(sensor.ultimoReporte)}`
                        : "Inactivo (Zona desarmada)"}
                    </div>
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  eventoSensor
                    ? "text-warning"
                    : isArmada ? "text-success" : "text-muted-foreground"
                }`}>
                  {eventoSensor ? eventoActual.tipoEvento : (isArmada ? sensor.estadoActual ?? "Sin novedad" : "-")}
                </span>
              </div>
            )}
            )}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-lg border border-border bg-background/40 p-4">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <span className="material-symbols-outlined text-[20px] text-muted-foreground">history</span>
            Actividad
          </h3>
          {eventoActual ? (
            <div className="space-y-3 rounded-lg border border-warning/50 bg-warning/5 p-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                <span className="font-semibold text-warning">Evento en vivo</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium text-warning">{eventoActual.tipoEvento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sensor ID:</span>
                  <span className="font-medium">
                    {currentZona.sensores?.find(s => s.id === eventoActual.sensorId)?.codigo || `#${eventoActual.sensorId}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Severidad:</span>
                  <span className="font-medium">{eventoActual.severidad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora:</span>
                  <span className="font-medium text-xs">
                    {new Date(eventoActual.fechaHora).toLocaleTimeString('es-CO')}
                  </span>
                </div>
                {eventoActual.payload && (
                  <div className="rounded bg-black/20 p-2 mt-2">
                    <p className="text-xs text-muted-foreground break-all max-h-16 overflow-y-auto">
                      {eventoActual.payload}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <span className="material-symbols-outlined text-[32px]">info</span>
              <span className="text-sm">
                Estado: {currentZona.estadoActual ?? (isArmada ? "ARMADA" : "DESARMADA")}
              </span>
              {currentZona.descripcion && (
                <span className="text-xs">{currentZona.descripcion}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sección de Programación de Horarios */}
      <div className="mt-6 rounded-lg border border-border bg-background/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-muted-foreground">schedule</span>
            <div>
              {programacion ? (
                <div>
                  <p className="text-sm font-medium">
                    Activación automática: <span className="font-semibold">{programacion.horaInicio}</span> — <span className="font-semibold">{programacion.horaFin}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {programacion.diasSemana.includes("lunes") && 
                    programacion.diasSemana.includes("martes") && 
                    programacion.diasSemana.includes("miercoles") && 
                    programacion.diasSemana.includes("jueves") && 
                    programacion.diasSemana.includes("viernes") &&
                    !programacion.diasSemana.includes("sabado") &&
                    !programacion.diasSemana.includes("domingo")
                      ? "LUNES A VIERNES"
                      : programacion.diasSemana.length === 7
                      ? "TODOS LOS DÍAS"
                      : programacion.diasSemana.map((d) => d.toUpperCase()).join(", ")}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">Activación automática</p>
                  <p className="text-xs text-muted-foreground mt-1">Sin programación configurada</p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isProgramacionLoading}
            className="flex items-center gap-2 rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-500 transition-colors hover:bg-cyan-500/20 disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            {programacion ? "Editar horario" : "Configurar"}
          </button>
        </div>
      </div>

      <ProgramacionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        programacionActual={programacion}
        onSave={handleSaveProgramacion}
        isLoading={isProgramacionLoading}
      />
    </article>
  )
}
