import { AdminHeader } from "@/components/admin/Layout/AdminHeader"
import { ZonaCard, ZonaCardSkeleton } from "@/components/admin/Zona"
import { useAuthContext } from "@/context/auth.context"
import { useZonas } from "@/hooks/useZonas"
import type { ZonaResponse } from "@/types"
import { useCallback, useEffect, useState } from "react"

export const ZonasPage = () => {
  const { token } = useAuthContext()
  const { GetAllZonas, loading } = useZonas()
  const [zonas, setZonas] = useState<ZonaResponse[]>([])

  const fetchZonas = useCallback(async () => {
    if (!token) return

    const response = await GetAllZonas()
    if (response?.responseCode === 200 && response.data) {
      setZonas(response.data)
    } else if (response?.responseCode !== 401) {
      console.error(response?.responseMessage || "Error al obtener zonas")
    }
  }, [GetAllZonas, token])

  useEffect(() => {
    if (!token) return
    fetchZonas()
  }, [token, fetchZonas])

  const handleZonaUpdated = (updatedZona: ZonaResponse) => {
    setZonas((prev) =>
      prev.map((zona) => (zona.id === updatedZona.id ? updatedZona : zona))
    )
  }

  return (
    <div className="p-6">
      <AdminHeader
        title="Gestion de Zonas"
        description="Monitoreo y control detallado por area."
        showLive={true}
        showWifiButton={true}
      />
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {loading && Array.from({ length: 2 }).map((_, index) => (
          <ZonaCardSkeleton key={`zona-skeleton-${index}`} />
        ))}
        {!loading && zonas.map((zona, index) => (
          <ZonaCard
            key={zona.id}
            zona={zona}
            index={index}
            onZonaUpdated={handleZonaUpdated}
          />
        ))}
        {!loading && zonas.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay zonas registradas.</p>
        )}
      </section>
    </div>
  )
}
