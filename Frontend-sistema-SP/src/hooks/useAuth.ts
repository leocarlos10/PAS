import { useState } from "react";
import { LoginUser } from "@/api/usuarios.api";
import { type LoginRequest, type LoginResponse, type Response } from "@/types";
import { setSecureItem } from "@/utils";
import { useAuthContext } from "@/context/auth.context";

type LoginResult = Response<LoginResponse> | null;

export function useAuth() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { refreshFromStorage } = useAuthContext();

	const login = async (loginRequest: LoginRequest): Promise<LoginResult> => {
		setLoading(true);
		setError(null);

		try {
			const response = await LoginUser(loginRequest);
			
			// Validar si fue login exitoso (2XX)
			if (response.responseCode === 200 && response.data?.access_token) {
				// Guardar los datos cifrados en localStorage
				setSecureItem("token", response.data.access_token);
				setSecureItem("auth", response.data);
				refreshFromStorage();
			} else {
				// Capturar el error pero retornar la respuesta completa
				setError(response.responseMessage || "Error en login");
			}

			// SIEMPRE retornar la respuesta completa (incluyendo errores)
			return response;
		} catch (err) {
			setError("Error en login");
			// Retornar una respuesta nula en caso de error de conexión
			return null;
		} finally {
			setLoading(false);
		}
	};

	return { login, loading, error };
}
