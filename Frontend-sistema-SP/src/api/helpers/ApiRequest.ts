import type { Options } from "@/types";
import type { Response } from "@/types"
import { handleApiResponse } from "./handleApiResponse";



/**
 * Realiza una petición HTTP y maneja la respuesta
 * @template T - Tipo de datos de la respuesta esperada
 * @template B - Tipo de datos del body/payload que se envía en la petición
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} options - Opciones de fetch (method, body, etc.)
 * @returns {Promise<Response<T>>} Respuesta estandarizada
 */
export const ApiRequest = async <T = any, B = any>(
  endpoint: string,
  options: Options<B>,
): Promise<Response<T>> => {
  try {
    // el segundo parametro del fetch espera un RequestInit
    const request = await fetch(endpoint, {
      method: options.method,
      headers: options.headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      mode: "cors",
    });

    return await handleApiResponse<T>(request);
  } catch (error) {
    return {
      responseCode: 0,
      responseMessage: error instanceof Error ? error.message : "Error de conexión",
      errorList: [],
      data: undefined,
    } as Response<T>;
  }
};
