import { useState } from "react";
import { LoginUser } from "@/api/usuarios.api";
import { type LoginRequest, type LoginResponse, type Response } from "@/types";
import { setSecureItem } from "@/utils";

type LoginResult = Response<LoginResponse> | null;

export function useAuth() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const login = async (loginRequest: LoginRequest): Promise<LoginResult> => {
		setLoading(true);
		setError(null);

		try {
            /* 
            1 llamamos al api par el login
            2 obtenemos la data de la respuesta
            3 validamos si existe un accessToken si es asi se guardan los datos 
            en el localStorage cifrados, si no se muestra un error de respuesta invalida

            */
			const response = await LoginUser(loginRequest);
			const authData = response.data;
			if (!authData?.access_token) {
				setError("Respuesta de login invalida");
				return null;
			}

            // guardamos los datos cifrados en localStorage
			setSecureItem("token", authData.access_token);
			setSecureItem("auth", authData);

			return response;
		} catch (err) {
			setError("Error en login");
			return null;
		} finally {
			setLoading(false);
		}
	};

	return { login, loading, error };
}
