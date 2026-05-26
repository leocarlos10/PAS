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
                programaciones: zona.programaciones ?? [],
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
                programaciones: maybeZona.programaciones ?? [],
            },
            errorList: [],
        };
    }

    return response;
}

export async function GetProgramacionesApi(
    zonaId: number,
    token: string
): Promise<Response<ProgramacionHoraria[]>> {
    const response = await ApiRequest<ProgramacionHoraria[], void>(
        `${API_ROOT}/api/zonas/${zonaId}/programacion`,
        {
            method: "GET",
            headers: getHeaders(token),
        }
    );

    const maybeList = response as unknown as ProgramacionHoraria[];
    if (response.responseCode === undefined && Array.isArray(maybeList)) {
        return {
            responseCode: 200,
            responseMessage: "SUCCESS",
            data: maybeList,
            errorList: [],
        };
    }

    return response;
}

export async function CreateProgramacionApi(
    zonaId: number,
    programacion: ProgramacionHorariaRequest,
    token: string
): Promise<Response<ProgramacionHoraria>> {
    const response = await ApiRequest<ProgramacionHoraria, ProgramacionHorariaRequest>(
        `${API_ROOT}/api/zonas/${zonaId}/programacion`,
        {
            method: "POST",
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

export async function UpdateProgramacionApi(
    zonaId: number,
    programacionId: number,
    programacion: ProgramacionHorariaRequest,
    token: string
): Promise<Response<ProgramacionHoraria>> {
    const response = await ApiRequest<ProgramacionHoraria, ProgramacionHorariaRequest>(
        `${API_ROOT}/api/zonas/${zonaId}/programacion/${programacionId}`,
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

export async function DeleteProgramacionApi(
    zonaId: number,
    programacionId: number,
    token: string
): Promise<Response<void>> {
    const response = await ApiRequest<void, void>(
        `${API_ROOT}/api/zonas/${zonaId}/programacion/${programacionId}`,
        {
            method: "DELETE",
            headers: getHeaders(token),
        }
    );

    if (response.responseCode === undefined) {
        return {
            responseCode: 204,
            responseMessage: "SUCCESS",
            data: undefined,
            errorList: [],
        };
    }

    return response;
}
