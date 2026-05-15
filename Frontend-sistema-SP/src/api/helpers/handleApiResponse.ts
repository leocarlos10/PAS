import type { Response } from "@/types";

/**
 * Maneja respuestas de API de forma estandarizada
 * @param {Response} request - Objeto Response de fetch
 * @returns {Promise<Object>} Objeto con success, data/error y message
 */
export const handleApiResponse = async <T = any>(
  request: globalThis.Response,
): Promise<Response<T>> => {
  try {
    const response = (await request.json()) as Response<T>;

    if (!request.ok) {
      return response as Response<T>;
    }

    return response as Response<T>;
  } catch (error) {
    return {
     responseCode: 0,
      responseMessage: error instanceof Error ? error.message : "Error de conexión",
      errorList: [],
      data: undefined,
    } as Response<T>;
  }
};