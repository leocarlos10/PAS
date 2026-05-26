import { API_URL } from "../../Config";
import { getHeaders } from "@/utils";
import { ApiRequest } from "./helpers/ApiRequest";

export async function ConfigurarWifiDispositivo(dispositivoId: number, ssid: string, password: string, token?: string) {
  return ApiRequest(`${API_URL}/dispositivos/${dispositivoId}/config-wifi`, {
    method: "POST",
    headers: getHeaders(token),
    body: { ssid, password },
  });
}

export async function ConfigurarWifiBatch(dispositivoIds: number[] | undefined, ssid: string, password: string, token?: string) {
  return ApiRequest(`${API_URL}/dispositivos/config-wifi-batch`, {
    method: "POST",
    headers: getHeaders(token),
    body: { dispositivoIds, ssid, password },
  });
}

export async function GetDispositivos(token?: string) {
  return ApiRequest(`${API_URL}/dispositivos`, {
    method: "GET",
    headers: getHeaders(token),
  });
}
