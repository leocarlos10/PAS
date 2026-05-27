import {
  ToggleZonaActivaApi,
  CreateProgramacionApi,
  UpdateProgramacionApi,
  DeleteProgramacionApi,
} from "@/api/zonas.api"
import { useAuthContext } from "@/context/auth.context"
import type { ZonaResponse, ProgramacionHoraria, ProgramacionHorariaRequest, DiaSemana } from "@/types"
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

const formatDiasSemana = (dias: DiaSemana[]) => {
  if (dias.includes("todos")) return "TODOS LOS DÍAS"
  const entreSemana = ["lunes", "martes", "miercoles", "jueves", "viernes"] as const
  const finDeSemana = ["sabado", "domingo"] as const
  const tieneEntreSemana = entreSemana.every((d) => dias.includes(d))
  const tieneFinDeSemana = finDeSemana.every((d) => dias.includes(d))
  const soloEntreSemana = tieneEntreSemana && !dias.some((d) => (finDeSemana as any).includes(d))
  const soloFinDeSemana = tieneFinDeSemana && !dias.some((d) => (entreSemana as any).includes(d))

  if (soloEntreSemana) return "LUNES A VIERNES"
  if (soloFinDeSemana) return "SÁBADO Y DOMINGO"
  if (dias.length === 7) return "TODOS LOS DÍAS"
  return dias.map((d) => d.toUpperCase()).join(", ")
}

export const ZonaCard = ({ zona, index, onZonaUpdated, sseEventos = [] }: ZonaCardProps) => {
  
  const { token } = useAuthContext()
  const [currentZona, setCurrentZona] = useState(zona)
  const [programaciones, setProgramaciones] = useState<ProgramacionHoraria[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProgramacion, setEditingProgramacion] = useState<ProgramacionHoraria | undefined>(undefined)
  const [isProgramacionLoading, setIsProgramacionLoading] = useState(false)
  const [eventoActual, setEventoActual] = useState<SseEvento | null>(null)

  useEffect(() => {
    setCurrentZona(zona)
    setProgramaciones(zona.programaciones ?? [])
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

  const actualizarZonaLocal = (nuevasProgramaciones: ProgramacionHoraria[]) => {
    const updated: ZonaResponse = {
      ...currentZona,
      modoControl: nuevasProgramaciones.some((p) => p.activa) ? "AUTOMATICO" : "MANUAL",
      programaciones: nuevasProgramaciones,
    }
    setProgramaciones(nuevasProgramaciones)
    setCurrentZona(updated)
    onZonaUpdated(updated)
  }

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

  const handleOpenCreate = () => {
    setEditingProgramacion(undefined)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (programacion: ProgramacionHoraria) => {
    setEditingProgramacion(programacion)
    setIsModalOpen(true)
  }

  const handleSaveProgramacion = async (data: ProgramacionHorariaRequest) => {
    if (!token) {
      toast.error("No autorizado: token no disponible")
      return
    }

    try {
      setIsProgramacionLoading(true)

      if (editingProgramacion?.id) {
        const response = await UpdateProgramacionApi(currentZona.id, editingProgramacion.id, data, token)
        const result = handleApiError(response)
        if (result.success && response.data) {
          const actualizadas = programaciones.map((p) =>
            p.id === editingProgramacion.id ? response.data! : p
          )
          actualizarZonaLocal(actualizadas)
          toast.success("Horario actualizado correctamente")
        } else {
          const toastType = getErrorToastType(result.statusCode)
          toast[toastType](result.message || "Error al actualizar el horario")
        }
      } else {
        const response = await CreateProgramacionApi(currentZona.id, data, token)
        const result = handleApiError(response)
        if (result.success && response.data) {
          actualizarZonaLocal([...programaciones, response.data])
          toast.success("Horario agregado correctamente")
        } else {
          const toastType = getErrorToastType(result.statusCode)
          toast[toastType](result.message || "Error al agregar el horario")
        }
      }
    } catch (error) {
      console.error("Error al guardar programación:", error)
      toast.error("Error al guardar la programación")
      throw error
    } finally {
      setIsProgramacionLoading(false)
    }
  }

  const handleDeleteProgramacion = async (programacionId: number) => {
    if (!token) {
      toast.error("No autorizado: token no disponible")
      return
    }

    if (!confirm("¿Eliminar este horario?")) return

    try {
      setIsProgramacionLoading(true)
      const response = await DeleteProgramacionApi(currentZona.id, programacionId, token)
      const result = handleApiError(response)

      if (result.success) {
        const filtradas = programaciones.filter((p) => p.id !== programacionId)
        actualizarZonaLocal(filtradas)
        toast.success("Horario eliminado correctamente")
      } else {
        const toastType = getErrorToastType(result.statusCode)
        toast[toastType](result.message || "Error al eliminar el horario")
      }
    } catch (error) {
      console.error("Error al eliminar programación:", error)
      toast.error("Error al eliminar la programación")
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
            {(currentZona.sensores ?? []).sort((a, b) => a.id - b.id).map((sensor) => {
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
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium text-warning">{eventoActual.tipoEvento}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Sensor ID:</span>
                  <span className="font-medium break-words">
                    {currentZona.sensores?.find(s => s.id === eventoActual.sensorId)?.codigo || `#${eventoActual.sensorId}`}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Hora:</span>
                  <span className="font-medium text-xs">
                    {new Date(eventoActual.fechaHora).toLocaleTimeString('es-CO')}
                  </span>
                </div>
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

      <div className="mt-6 rounded-lg border border-border bg-background/40 p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-muted-foreground">schedule</span>
            <div>
              <p className="text-sm font-medium">Activación automática</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Horarios recurrentes cada semana
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenCreate}
            disabled={isProgramacionLoading}
            className="flex items-center gap-2 rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-500 transition-colors hover:bg-cyan-500/20 disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Agregar horario
          </button>
        </div>

        {programaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sin horarios configurados
          </p>
        ) : (
          <div className="space-y-3">
            {programaciones.map((prog) => (
              <div
                key={prog.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-card p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    <span className="font-semibold">{prog.horaInicio}</span>
                    {" — "}
                    <span className="font-semibold">{prog.horaFin}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDiasSemana(prog.diasSemana)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(prog)}
                    disabled={isProgramacionLoading}
                    className="rounded-lg border border-border px-2 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50 cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => prog.id && handleDeleteProgramacion(prog.id)}
                    disabled={isProgramacionLoading}
                    className="rounded-lg border border-danger/50 px-2 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50 cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProgramacionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        programacionActual={editingProgramacion}
        onSave={handleSaveProgramacion}
        isLoading={isProgramacionLoading}
      />
    </article>
  )
}
