import { GetAllZonasApi, ToggleZonaActivaApi } from "@/api/zonas.api";
import { useAuthContext } from "@/context/auth.context";
import type { Response, ZonaResponse } from "@/types";
import { useCallback, useState } from "react";

export const useZonas = () => {
    const { token } = useAuthContext();
    const [loading, setLoading] = useState(false);

    const GetAllZonas = useCallback(async (): Promise<Response<ZonaResponse[]>> => {
        if (!token) {
            return {
                responseCode: 401,
                responseMessage: "No autorizado: token no disponible",
                errorList: [],
                data: undefined,
            };
        }

        setLoading(true);
        try {
            const response = await GetAllZonasApi(token);
            return response;
        } catch (error) {
            console.error("Error fetching zonas:", error);
            return {
                responseCode: 0,
                responseMessage: error instanceof Error ? error.message : "Error de conexión",
                errorList: [],
                data: undefined,
            };
        } finally {
            setLoading(false);
        }
    }, [token]);

    const ToggleZonaActiva = useCallback(
        async (zonaId: number, activa: boolean): Promise<Response<ZonaResponse>> => {
            if (!token) {
                return {
                    responseCode: 401,
                    responseMessage: "No autorizado: token no disponible",
                    errorList: [],
                    data: undefined,
                };
            }

            setLoading(true);
            try {
                const response = await ToggleZonaActivaApi(zonaId, activa, token);
                return response;
            } catch (error) {
                console.error("Error toggling zona:", error);
                return {
                    responseCode: 0,
                    responseMessage: error instanceof Error ? error.message : "Error de conexión",
                    errorList: [],
                    data: undefined,
                };
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    return { GetAllZonas, ToggleZonaActiva, loading };
};
