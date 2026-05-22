/// <reference types="vite/client" />


export const API_URL = import.meta.env.VITE_API_URL as string;
if(!API_URL) {
  throw new Error("VITE_API_URL is not defined in the environment variables.");
}

/** Raiz del servidor (sin /api/v1). Endpoints legacy: /api/zonas, /api/eventos */
export const API_ROOT = API_URL.replace(/\/api\/v1\/?$/, "");

export const secret_key = import.meta.env.VITE_CRYPTO_SECRET_KEY;

if (!secret_key) {
  throw new Error("VITE_CRYPTO_SECRET_KEY no está definida en las variables de entorno");
}
