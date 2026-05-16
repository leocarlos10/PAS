import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type LoginResponse } from "@/types";
import { useNavigate } from "react-router-dom";


type AuthContextValue = {
	auth: LoginResponse | null;
	token: string | null;
	logout: () => void;
	refreshFromStorage: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * obtiene los datos de autenticacion del localStorage
 * @returns LoginResponse o null si no hay datos o si ocurre un error al parsear
 */
function readStoredAuth(): LoginResponse | null {
	const rawAuth = localStorage.getItem("auth");
	if (!rawAuth) {
		return null;
	}

	try {
		return JSON.parse(rawAuth) as LoginResponse;
	} catch {
		return null;
	}
}

/**
 * obtiene el token de autenticacion del localStorage
 * @returns token o null si no hay token.
 */
function readStoredToken(): string | null {
	return localStorage.getItem("token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [auth, setAuth] = useState<LoginResponse | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const navigate = useNavigate();

	const refreshFromStorage = () => {
		setAuth(readStoredAuth());
		setToken(readStoredToken());
	};

	useEffect(() => {
		refreshFromStorage();
	}, []);

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("auth");
		setAuth(null);
		setToken(null);
		navigate("/");
	};

	const value = useMemo(
		() => ({ auth, token, logout, refreshFromStorage }),
		[auth, token]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
}
