import type { Response } from "@/types";

/**
 * Tipo para el resultado del manejo de errores API
 */
export type ApiErrorResult = {
  success: boolean;
  statusCode: number;
  message: string;
};

/**
 * Extrae y normaliza mensajes de error de una respuesta API
 * Tolera tanto strings como objetos ValidationErrorDetail en errorList
 * @param response - Respuesta del API
 * @returns Objeto con { success, statusCode, message }
 */
export function handleApiError<T = any>(
  response: Response<T> | null
): ApiErrorResult {
  // Error de conexión o null
  if (!response) {
    return {
      success: false,
      statusCode: 0,
      message: "Error de conexión. Verifica tu red.",
    };
  }

  // Validar si fue exitoso (2xx)
  const isSuccess = response.responseCode >= 200 && response.responseCode < 300;
  if (isSuccess) {
    return {
      success: true,
      statusCode: response.responseCode,
      message: response.responseMessage || "Operación exitosa",
    };
  }

  // Extraer mensaje de error desde errorList o responseMessage
  let errorMessage = extractErrorMessage(response.errorList);

  // Si no hay error en lista, intentar responseMessage
  if (!errorMessage) {
    errorMessage = response.responseMessage || "Error desconocido";
  }

  // Casos especiales: mejorar mensajes genéricos basado en código
  errorMessage = enrichErrorMessage(response.responseCode, errorMessage);

  return {
    success: false,
    statusCode: response.responseCode,
    message: errorMessage,
  };
}

/**
 * Extrae el primer mensaje de error de errorList
 * Tolera tanto strings como objetos con propiedad 'message'
 */
function extractErrorMessage(
  errorList?: Array<string | { message?: string; field?: string }>
): string | null {
  
    if (!errorList || errorList.length === 0) {
    return null;
  }

  const firstError = errorList[0];

  if (typeof firstError === "string") {
    return firstError;
  }

  if (firstError && typeof firstError === "object" && "message" in firstError) {
    return firstError.message || null;
  }

  return null;
}

/**
 * Enriquece mensajes de error genéricos con contexto específico del código HTTP
 */
function enrichErrorMessage(statusCode: number, currentMessage: string): string {
  // Si el mensaje es genérico, reemplazarlo con uno más amigable
  const genericMessages = new Set([
    "Conflict",
    "Not Found",
    "Forbidden",
    "Unauthorized",
    "Bad Request",
    "Internal Server Error",
  ]);

  const isGeneric = genericMessages.has(currentMessage);

  if (!isGeneric) {
    return currentMessage; // Mensaje específico del backend, usarlo tal cual
  }

  // Mapeo de códigos a mensajes amigables
  switch (statusCode) {
    case 400:
      return "Datos inválidos. Por favor revisa el formulario.";
    case 401:
    case 404:
      return "Usuario o contraseña incorrectos.";
    case 403:
      return "Tu cuenta ha sido desactivada. Contacta al administrador del sistema.";
    case 409:
      return "El recurso ya existe. Por favor verifica los datos.";
    case 422:
      return "Datos inválidos. Por favor revisa el formulario.";
    case 500:
      return "Error del servidor. Intenta más tarde.";
    default:
      return currentMessage;
  }
}

/**
 * Determina si se debe mostrar un toast error o warning basado en el código HTTP
 */
export function getErrorToastType(statusCode: number): "error" | "warning" {
  if (statusCode === 403) return "warning";
  return "error";
}
