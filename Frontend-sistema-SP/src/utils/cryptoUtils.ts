import CryptoJS from "crypto-js";
import { secret_key } from "../../Config";

/**
 * Cifra un objeto/string usando AES-256
 * @param data - El objeto o string a cifrar
 * @return El string cifrado
 */
export const encryptData = (data: any): string => {
  try {
    const jsonString = typeof data === "string" ? data : JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, secret_key).toString();
    return encrypted;
  } catch (error) {
    console.error("❌ Error al cifrar datos:", error);
    throw error;
  }
};

/**
 * Descifra un string y lo convierte de vuelta al objeto original
 * @param encryptedData - El string cifrado a descifrar
 * @template T - El tipo del objeto esperado después de descifrar
 * @return El objeto descifrado o null si ocurre un error
 */
export const decryptData = <T = any>(encryptedData: string): T | null => {
  try {
    // Compatibilidad con valores legacy/planos en localStorage:
    // - JSON (objeto/array) guardado sin cifrar
    // - JWT u otros strings no cifrados
    const trimmed = encryptedData.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return JSON.parse(trimmed) as T;
      } catch {
        return trimmed as unknown as T;
      }
    }

    // Heurística simple para JWT: header.payload.signature (Base64URL)
    // Si luce como JWT, no intentamos AES.
    const jwtParts = trimmed.split(".");
    if (jwtParts.length === 3 && jwtParts.every((p) => /^[A-Za-z0-9_-]+$/.test(p) && p.length > 0)) {
      return trimmed as unknown as T;
    }

    const decrypted = CryptoJS.AES.decrypt(encryptedData, secret_key);
    let jsonString: string;
    try {
      jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.warn("⚠️ No se pudo descifrar: salida no es UTF-8 válido (datos corruptos o clave distinta)", error);
      return null;
    }

    if (!jsonString) {
      console.warn("⚠️ No se pudo descifrar (datos corruptos o clave distinta)");
      return null;
    }

    try {
      return JSON.parse(jsonString) as T;
    } catch {
      return jsonString as unknown as T;
    }
  } catch (error) {
    console.warn("⚠️ Error al descifrar datos (datos corruptos o clave distinta):", error);
    return null;
  }
};

// metodos para almacenar y recuperar datos cifrados en localStorage
/**
 * Guarda datos cifrados en localStorage
 */
export const setSecureItem = (key: string, value: any): void => {
  try {
    const encrypted = encryptData(value);
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error(`❌ Error al guardar ${key} en localStorage:`, error);
  }
};

/**
 * Lee y descifra datos de localStorage
 */
export const getSecureItem = <T = any>(key: string): T | null => {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    const value = decryptData<T>(encrypted);
    if (value === null) {
      // Evita que el app se quede en un loop de errores si el valor quedó corrupto
      localStorage.removeItem(key);
    }
    return value;
  } catch (error) {
    console.error(`❌ Error al leer ${key} de localStorage:`, error);
    return null;
  }
};

/**
 * Elimina item de localStorage
 */
export const removeSecureItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`❌ Error al eliminar ${key} de localStorage:`, error);
  }
};
