import type { Response } from "@/types"
import type { HistorialPageResponse } from "@/types/requestType/evento/HistorialPage"
import { ApiRequest } from "./helpers/ApiRequest"
import { getHeaders } from "@/utils"
import { API_ROOT } from "../../Config";


export async function getPageHistorial(
    page = 0,
    size = 10,
    zonaId?: number,
    severidad?: string,
    token?: string
): Promise<Response<HistorialPageResponse>> {
    
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (zonaId) params.append("zonaId", String(zonaId))
    if (severidad) params.append("severidad", severidad)
    
    const response = await ApiRequest<HistorialPageResponse, void>(`${API_ROOT}/api/eventos/historial?${params.toString()}`, {
        method: 'GET',
        headers: getHeaders(token),
    })

    // El endpoint devuelve un Page<> directo (no Response), lo normalizamos aqui.
    const maybePage = response as unknown as HistorialPageResponse
    if (
        response.responseCode === undefined &&
        maybePage &&
        Array.isArray(maybePage.content)
    ) {
        return {
            responseCode: 200,
            responseMessage: "SUCCESS",
            data: maybePage,
            errorList: [],
        }
    }

    return response;
}