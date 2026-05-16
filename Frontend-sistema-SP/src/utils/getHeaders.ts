
/**
 * funcion utilitaria para los headers de las peticiones
 * @param token token de autenticacion (OPCIONAL)
 * @returns objeto headers.
 */
export function getHeaders(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}