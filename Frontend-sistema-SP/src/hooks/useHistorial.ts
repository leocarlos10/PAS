import { getPageHistorial } from "@/api/Historial.api"
import { useAuthContext } from "@/context/auth.context"
import type { Response } from "@/types"
import type { HistorialPageResponse } from "@/types/requestType/evento/HistorialPage"
import { useCallback, useState } from "react"

export const useHistorial = () => {
  const { token } = useAuthContext()
  const [loading, setLoading] = useState(false)

  const GetHistorialPage = useCallback(
    async (
      page = 0,
      size = 10,
      zonaId?: number,
      severidad?: string
    ): Promise<Response<HistorialPageResponse>> => {
      if (!token) {
        return {
          responseCode: 401,
          responseMessage: "No autorizado: token no disponible",
          errorList: [],
          data: undefined,
        }
      }

      setLoading(true)
      try {
        const response = await getPageHistorial(
          page,
          size,
          zonaId,
          severidad,
          token
        )
        return response
      } catch (error) {
        console.error("Error fetching historial:", error)
        return {
          responseCode: 0,
          responseMessage:
            error instanceof Error ? error.message : "Error de conexión",
          errorList: [],
          data: undefined,
        }
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  return { GetHistorialPage, loading }
}
