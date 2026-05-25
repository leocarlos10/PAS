import { API_ROOT } from "../../Config";
import { getHeaders } from "@/utils";
import { ApiRequest } from "./helpers/ApiRequest";
import type { Response, ZonaActivaRequest, ZonaResponse, ProgramacionHorariaRequest, ProgramacionHoraria } from "@/types";

export async function GetAllZonasApi(token: string): Promise<Response<ZonaResponse[]>> {
    const response = await ApiRequest<ZonaResponse[], void>(`${API_ROOT}/api/zonas`, {
        method: "GET",
        headers: getHeaders(token),
    });

    const maybeList = response as unknown as ZonaResponse[];
    if (response.responseCode === undefined && Array.isArray(maybeList)) {
        return {
            responseCode: 200,
            responseMessage: "SUCCESS",
            data: maybeList.map((zona) => ({
                ...zona,
                sensores: zona.sensores ?? [],
            })),
            errorList: [],
        };
    }

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

export async function UpdateProgramacionHorariaApi(
    zonaId: number,
    programacion: ProgramacionHorariaRequest,
    token: string
): Promise<Response<ProgramacionHoraria>> {
    const response = await ApiRequest<ProgramacionHoraria, ProgramacionHorariaRequest>(
        `${API_ROOT}/api/zonas/${zonaId}/programacion`,
        {
            method: "PATCH",
            headers: getHeaders(token),
            body: programacion,
        }
    );

    const maybeProgramacion = response as unknown as ProgramacionHoraria;
    if (response.responseCode === undefined && maybeProgramacion?.id) {
        return {
            responseCode: 200,
            responseMessage: "SUCCESS",
            data: maybeProgramacion,
            errorList: [],
        };
    }

    return response;
}
