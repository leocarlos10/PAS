import { GetAllUsersApi, RegisterUserAPi } from "@/api/usuarios.api";
import { useAuthContext } from "@/context/auth.context";
import type { AdminUserResponse, Response, RegisterRequest, RegisterResponse } from "@/types";
import { useCallback, useState } from "react";

export const useUser = () => {
    
    const { token } = useAuthContext();
    const [loading, setLoading] = useState(false);

    const CreateUser = useCallback(async (registerRequest: RegisterRequest): Promise<Response<RegisterResponse>> => {
        
        if (!token) {
            return {
                responseCode: 401,
                responseMessage: "No autorizado: token no disponible",
                errorList: [],
                data: undefined,
            }
        }

        setLoading(true);
        try {
            const response = await RegisterUserAPi(registerRequest, token);
            return response;
        } catch (error) {
            console.error("Error registering user:", error);
            return {
                responseCode: 500,
                responseMessage: error instanceof Error ? error.message : "Error desconocido al registrar usuario",
                errorList: [],
                data: undefined,
            }
        } finally {
            setLoading(false);
        }
    }, [token]);

    const GetAllUsers = useCallback(async (): Promise<Response<AdminUserResponse[]>> => {
        if (!token) {
            return {
                responseCode: 401,
                responseMessage: "No autorizado: token no disponible",
                errorList: [],
                data: undefined,
            }
        }

        setLoading(true);
        try {
            const response = await GetAllUsersApi(token);
            return response;
        } catch (error) {
            console.error("Error fetching users:", error);
            return {
                responseCode: 500,
                responseMessage: error instanceof Error ? error.message : "Error desconocido al obtener usuarios",
                errorList: [],
                data: undefined,
            }
        } finally {
            setLoading(false);
        }
    }, [token]);

    return { CreateUser, GetAllUsers, loading };
}
