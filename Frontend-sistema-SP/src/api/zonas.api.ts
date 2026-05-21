import { API_ROOT, API_URL } from "../../Config";
import { getHeaders } from "@/utils";
import { ApiRequest } from "./helpers/ApiRequest";
import type { Response, ZonaActivaRequest, ZonaResponse } from "@/types";

export async function GetAllZonasApi(token: string): Promise<Response<ZonaResponse[]>> {
    const response = await ApiRequest<ZonaResponse[], void>(`${API_URL}/zonas`, {
        method: "GET",
        headers: getHeaders(token),
    });

    return response;
}

export async function ToggleZonaActivaApi(
    zonaId: number,
    activa: boolean,
    token: string
): Promise<Response<ZonaResponse>> {
    const response = await ApiRequest<ZonaResponse, ZonaActivaRequest>(
        `${API_ROOT}/api/zonas/${zonaId}/activa`,
        {
            method: "PATCH",
            headers: getHeaders(token),
            body: { activa },
        }
    );

    const maybeZona = response as unknown as ZonaResponse;
    if (response.responseCode === undefined && maybeZona?.id) {
        return {
            responseCode: 200,
            responseMessage: "SUCCESS",
            data: {
                ...maybeZona,
                sensores: maybeZona.sensores ?? [],
            },
            errorList: [],
        };
    }

    return response;
}
